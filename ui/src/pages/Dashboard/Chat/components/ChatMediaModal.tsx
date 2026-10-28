import { useMemo, useState } from "react"
import {
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link2,
  MessageCircle,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type {
  ChatMediaFilter,
  ChatMediaModalProps,
  ChatMessage,
} from "@/hooks/chat"
import { ChatAvatar, ChatRoleBadge } from "./ChatIdentity"
import { extractLinks } from "./ChatMessageBubble"

const NAV: {
  id: ChatMediaFilter
  title: string
  sidebarLabel: string
  icon: typeof MessageCircle
}[] = [
  { id: "all", title: "Chat info", sidebarLabel: "Chat info", icon: MessageCircle },
  { id: "media", title: "Media", sidebarLabel: "Media", icon: ImageIcon },
  { id: "documents", title: "Documents", sidebarLabel: "Documents", icon: FileText },
  { id: "links", title: "Links", sidebarLabel: "Links", icon: Link2 },
]

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString([], {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function ChatMediaModal({
  open,
  onOpenChange,
  title,
  subtitle,
  avatarName,
  avatarColor,
  isGroup,
  memberCount,
  members = [],
  messages,
  participantsById,
  initialTab = "all",
}: ChatMediaModalProps) {
  const [tab, setTab] = useState<ChatMediaFilter>(initialTab)

  const mediaMessages = useMemo(
    () => messages.filter((m) => m.kind === "image"),
    [messages]
  )
  const documentMessages = useMemo(
    () => messages.filter((m) => m.kind === "file"),
    [messages]
  )
  const linkItems = useMemo(() => {
    const items: { id: string; url: string; message: ChatMessage }[] = []
    for (const message of messages) {
      if (message.kind !== "text") continue
      for (const url of extractLinks(message.body)) {
        items.push({ id: `${message.id}-${url}`, url, message })
      }
    }
    return items
  }, [messages])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (next) setTab(initialTab)
      }}
    >
      <DialogContent className="flex h-[min(680px,88vh)] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl sm:rounded-2xl">
        <div className="flex min-h-0 w-full flex-1">
          <aside className="flex w-48 shrink-0 flex-col border-r border-slate-100 bg-slate-50 px-3 py-4 sm:w-52">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              This chat
            </p>
            <nav className="flex flex-col gap-1.5">
              {NAV.map((item) => {
                const Icon = item.icon
                const active = tab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors",
                      active
                        ? "bg-white font-medium text-slate-900 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-600 hover:bg-white/80"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate text-sm">{item.sidebarLabel}</span>
                  </button>
                )
              })}
            </nav>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
            <DialogHeader className="shrink-0 space-y-1 border-b border-slate-100 px-6 py-5 pr-14 text-left">
              <DialogTitle className="truncate text-lg font-semibold">
                {NAV.find((n) => n.id === tab)?.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Shared content in {title}
              </DialogDescription>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              {tab === "all" && (
                <div className="mx-auto w-full max-w-md space-y-6">
                  <div className="flex flex-col items-center py-6 text-center">
                    <ChatAvatar
                      name={avatarName}
                      color={avatarColor}
                      size="lg"
                    />
                    <p className="mt-4 text-base font-semibold text-slate-900">
                      {title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isGroup
                        ? `${memberCount ?? members.length} members · ${messages.length} messages`
                        : `${messages.length} message${messages.length === 1 ? "" : "s"} total`}
                    </p>
                    {subtitle && (
                      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setTab("media")}
                      className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 px-2 py-5 hover:bg-slate-100 sm:px-3"
                    >
                      <p className="text-xl font-semibold text-slate-900">
                        {mediaMessages.length}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Media</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab("documents")}
                      className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 px-2 py-5 hover:bg-slate-100 sm:px-3"
                    >
                      <p className="text-xl font-semibold text-slate-900">
                        {documentMessages.length}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        Documents
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab("links")}
                      className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 px-2 py-5 hover:bg-slate-100 sm:px-3"
                    >
                      <p className="text-xl font-semibold text-slate-900">
                        {linkItems.length}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Links</p>
                    </button>
                  </div>

                  {isGroup && members.length > 0 && (
                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <Users className="size-3.5" />
                        Members
                      </p>
                      <div className="max-h-48 space-y-1 overflow-y-auto rounded-2xl border border-slate-100">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 px-3 py-2"
                          >
                            <ChatAvatar
                              name={member.name}
                              color={member.avatarColor}
                              size="sm"
                              online={member.online}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-800">
                                {member.name}
                              </p>
                            </div>
                            <ChatRoleBadge role={member.role} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === "media" && (
                <div>
                  {mediaMessages.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                      No photos in this chat yet
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {mediaMessages.map((msg) => (
                        <a
                          key={msg.id}
                          href={msg.attachmentUrl || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm"
                          title={msg.attachmentName}
                        >
                          {msg.attachmentUrl ? (
                            <img
                              src={msg.attachmentUrl}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center">
                              <ImageIcon className="size-6 text-slate-300" />
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "documents" && (
                <div className="space-y-3">
                  {documentMessages.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                      No documents in this chat yet
                    </p>
                  ) : (
                    documentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                      >
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                          <FileText className="size-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {msg.attachmentName ?? msg.body}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {participantsById[msg.senderId]?.name ?? "Unknown"} ·{" "}
                            {formatWhen(msg.sentAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "links" && (
                <div className="space-y-3">
                  {linkItems.length === 0 ? (
                    <p className="py-16 text-center text-sm text-muted-foreground">
                      No links shared in this chat yet
                    </p>
                  ) : (
                    linkItems.map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 hover:bg-slate-100"
                      >
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                          <ExternalLink className="size-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="break-all text-sm font-medium text-blue-700">
                            {item.url}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {participantsById[item.message.senderId]?.name ??
                              "Unknown"}{" "}
                            · {formatWhen(item.message.sentAt)}
                          </p>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex shrink-0 justify-end border-t border-slate-100 px-6 py-4">
              <Button
                type="button"
                className="h-10 min-w-28 rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
