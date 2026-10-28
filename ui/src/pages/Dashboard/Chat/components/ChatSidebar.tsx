import { useMemo, useState } from "react"
import { MessageCircle, Search, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { roleLabel, type ChatSidebarProps } from "@/hooks/chat"
import { ConversationListItem } from "./ConversationListItem"
import { ChatRoleBadge } from "./ChatIdentity"

export function ChatSidebar({
  role,
  threads,
  activeId,
  onSelect,
  onNewChat,
  isLoading = false,
}: ChatSidebarProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return threads
    return threads.filter((t) =>
      [
        t.title,
        t.subtitle,
        t.conversation.className,
        t.peer?.name,
        t.peer?.role,
        ...(t.peer?.classNames ?? []),
        ...(t.peer?.subjects ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [threads, search])

  return (
    <aside className="flex w-full max-w-sm shrink-0 flex-col border-r border-slate-200 bg-white md:w-80">
      <div className="border-b border-slate-100 px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Messages</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              Signed in as <ChatRoleBadge role={role} />
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5"
            onClick={onNewChat}
          >
            <UserPlus className="size-3.5" />
            New
          </Button>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people or classes…"
            className="h-9 rounded-xl pl-9"
          />
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          {role === "parent" &&
            "Parents can message the Super Admin only — not admins, teachers or students."}
          {role === "student" &&
            "Students can message anyone in the school except parents, and get the class room for their class."}
          {role === "teacher" &&
            "Teachers can message anyone in the school except parents, and get the class room for every class they teach."}
          {role === "admin" &&
            "Admins can message anyone in the school except parents. Only the Super Admin can reach parents."}
          {role === "superadmin" &&
            "As Super Admin you can message everyone, and you are the only person parents can reach."}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && threads.length === 0 ? (
          <div className="space-y-3 px-3 py-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="size-10 shrink-0 animate-pulse rounded-full bg-slate-100" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <MessageCircle className="mb-3 size-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No conversations</p>
            <p className="mt-1 text-xs text-slate-400">
              Start a new chat with someone you can message as{" "}
              {roleLabel(role).toLowerCase()}.
            </p>
          </div>
        ) : (
          filtered.map((thread) => (
            <ConversationListItem
              key={thread.conversation.id}
              thread={thread}
              active={activeId === thread.conversation.id}
              onSelect={() => onSelect(thread.conversation.id)}
            />
          ))
        )}
      </div>
    </aside>
  )
}
