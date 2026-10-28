import { useEffect, useMemo, useRef } from "react"
import { Loader2, Search, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { NewChatDialogProps } from "@/hooks/chat"
import { ChatAvatar, ChatRoleBadge } from "./ChatIdentity"

/**
 * Picks someone to start a thread with.
 *
 * The list is a *page*, not the directory. It previously received every reachable person in
 * the school and filtered them in the browser, which meant a school with a few thousand
 * students paid a full-directory query and transfer to render ten rows — and paid it on
 * every mount of the chat page, whether or not anyone opened this dialog.
 *
 * Now the parent fetches only while the dialog is open, asks for `pageSize` rows, and sends
 * the search term to the server. This component therefore does NOT filter: what it receives
 * is what it shows. Re-filtering here would silently hide rows the server deliberately
 * returned, and make the result depend on which page happened to be cached.
 */
export function NewChatDialog({
  open,
  onOpenChange,
  contacts,
  onPick,
  search,
  onSearchChange,
  isLoading,
  isFetching,
  pageSize = 10,
  pendingPeerId,
  classes = [],
  onPickClass,
  pendingClassId,
}: NewChatDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * Classes are filtered here, unlike people.
   *
   * That looks inconsistent, and it is deliberate: the class list is everything the person
   * belongs to — a handful of rows, all of them already fetched — so there is nothing for
   * the server to page through. People are a server-side page out of the whole school, which
   * is why that list must not be touched client-side.
   */
  const visibleClasses = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return classes
    return classes.filter((c) => c.className.toLowerCase().includes(q))
  }, [classes, search])

  const showClasses = Boolean(onPickClass) && visibleClasses.length > 0

  // Focus the search box on open. With only ten rows showing, typing is the primary way to
  // find someone, so it should not need a click first.
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(id)
  }, [open])

  const showEmpty = !isLoading && contacts.length === 0
  const atPageLimit = contacts.length >= pageSize

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) onSearchChange("")
      }}
    >
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b border-slate-100 px-4 py-4">
          <DialogTitle>New chat</DialogTitle>
          <DialogDescription>
            Only people your role is allowed to message are listed.
          </DialogDescription>
        </DialogHeader>

        <div className="border-b border-slate-100 px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by first or last name…"
              className="h-9 rounded-xl pl-9 pr-9"
            />
            {isFetching && (
              <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate-300" />
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto py-1">
          {showClasses && (
            <>
              <p className="px-4 pt-2 pb-1 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                Your classes
              </p>
              {visibleClasses.map((option) => {
                const isPending = pendingClassId === option.schoolClassId

                return (
                  <button
                    key={option.schoolClassId}
                    type="button"
                    disabled={Boolean(pendingClassId) || Boolean(pendingPeerId)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 disabled:cursor-progress disabled:opacity-60"
                    onClick={() => onPickClass?.(option.schoolClassId)}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <Users className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {option.className} Class
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {option.studentCount} student
                        {option.studentCount === 1 ? "" : "s"} ·{" "}
                        {option.teacherCount} teacher
                        {option.teacherCount === 1 ? "" : "s"}
                        {/*
                          Said plainly. Someone opening a class group for the first time is
                          creating it for their whole class, and it is fairer to tell them
                          that than to have the room silently appear for everyone.
                        */}
                        {!option.conversationId && " · Not started yet"}
                      </p>
                    </div>
                    {isPending && (
                      <Loader2 className="size-4 shrink-0 animate-spin text-slate-400" />
                    )}
                  </button>
                )
              })}
              <div className="my-1 border-t border-slate-100" />
              <p className="px-4 pt-1 pb-1 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                People
              </p>
            </>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-slate-300" />
            </div>
          ) : showEmpty ? (
            <p className="px-4 py-8 text-center text-xs text-slate-500">
              {search.trim()
                ? `No one matching "${search.trim()}".`
                : "No contacts available for your role."}
            </p>
          ) : (
            contacts.map((contact) => {
              const isPending = pendingPeerId === contact.id

              return (
                <button
                  key={contact.id}
                  type="button"
                  disabled={Boolean(pendingPeerId) || Boolean(pendingClassId)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 disabled:cursor-progress disabled:opacity-60"
                  onClick={() => onPick(contact.id)}
                >
                  <ChatAvatar
                    name={contact.name}
                    color={contact.avatarColor}
                    online={contact.online}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {contact.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <ChatRoleBadge role={contact.role} />
                      {contact.subjects?.slice(0, 2).map((s) => (
                        <span key={s} className="text-[10px] text-slate-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  {isPending && (
                    <Loader2 className="size-4 shrink-0 animate-spin text-slate-400" />
                  )}
                </button>
              )
            })
          )}
        </div>

        {/*
          Stated plainly rather than paginated. The answer to "my person is not in these
          ten" is to type their name, not to walk a directory — and offering paging would
          invite exactly the full-directory scrolling this change removes.
        */}
        {atPageLimit && (
          <p className="border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-400">
            Showing the first {pageSize}. Type a name to find someone else.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
