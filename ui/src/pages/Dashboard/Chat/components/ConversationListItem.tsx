import { formatDistanceToNow } from "date-fns"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ConversationListItemProps } from "@/hooks/chat"
import { ChatAvatar, ChatRoleBadge } from "./ChatIdentity"

function previewText(thread: ConversationListItemProps["thread"]) {
  const msg = thread.lastMessage
  if (!msg) return "No messages yet"
  if (msg.kind === "file") return `📎 ${msg.attachmentName || "File"}`
  if (msg.kind === "image") return "🖼️ Image"
  return msg.body
}

function timeLabel(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return ""
  }
}

export function ConversationListItem({
  thread,
  active,
  onSelect,
}: ConversationListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 px-3 py-3 text-left transition",
        active ? "bg-blue-50" : "hover:bg-slate-50"
      )}
    >
      <div className="relative shrink-0">
        <ChatAvatar
          name={thread.avatarName}
          color={thread.avatarColor}
          online={thread.isGroup ? undefined : thread.peer?.online}
          size="md"
        />
        {thread.isGroup && (
          <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border-2 border-white bg-slate-700 text-white">
            <Users className="size-2.5" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">
            {thread.title}
          </p>
          <span className="shrink-0 text-[10px] text-slate-400">
            {timeLabel(thread.conversation.updatedAt)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          {thread.isGroup ? (
            <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
              Class
            </span>
          ) : thread.peer ? (
            <ChatRoleBadge role={thread.peer.role} />
          ) : null}
          {thread.subtitle && (
            <span className="truncate text-[10px] text-slate-400">
              {thread.subtitle}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-slate-500">{previewText(thread)}</p>
          {thread.unread > 0 && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {thread.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
