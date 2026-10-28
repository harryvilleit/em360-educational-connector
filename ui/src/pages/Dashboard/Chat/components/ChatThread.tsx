import { useEffect, useMemo, useRef, useState } from "react"
import { Info, MessageCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ChatThreadProps } from "@/hooks/chat"
import { ChatAvatar, ChatRoleBadge } from "./ChatIdentity"
import { ChatMessageBubble } from "./ChatMessageBubble"
import { ChatComposer } from "./ChatComposer"
import { ChatMediaModal } from "./ChatMediaModal"

export function ChatThread({
  thread,
  messages,
  actorId,
  participantsById,
  onSend,
  onRetry,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [mediaOpen, setMediaOpen] = useState(false)

  useEffect(() => {
    // "auto" on a thread switch, "smooth" for a new message in the open thread. Animating a
    // scroll through a whole history when the user simply picked another conversation looks
    // like the app is struggling, and on a long thread it takes visibly longer than the
    // fetch it is reacting to.
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" })
  }, [thread?.conversation.id])

  const members = useMemo(() => {
    if (!thread?.isGroup) return []
    return thread.conversation.participantIds
      .map((id) => participantsById[id])
      .filter(Boolean)
  }, [thread, participantsById])

  if (!thread) {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center bg-slate-50/50 px-6 text-center">
        <MessageCircle className="mb-3 size-12 text-slate-300" />
        <p className="text-sm font-semibold text-slate-700">Select a conversation</p>
        <p className="mt-1 max-w-sm text-xs text-slate-500">
          Choose a class group or direct chat, or start a new message with someone
          your role can contact.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-white">
      <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          onClick={() => setMediaOpen(true)}
          title="View chat info, media, documents and links"
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
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-900">
                {thread.title}
              </p>
              {thread.isGroup ? (
                <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                  Class
                </span>
              ) : thread.peer ? (
                <ChatRoleBadge role={thread.peer.role} />
              ) : null}
            </div>
            <p className="truncate text-xs text-slate-500">
              Tap for chat info ·{" "}
              {thread.isGroup
                ? `${thread.memberCount ?? members.length} members`
                : [
                    thread.peer?.online ? "Online" : "Offline",
                    thread.peer?.classNames?.[0],
                  ]
                    .filter(Boolean)
                    .join(" · ")}
            </p>
          </div>
        </button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 gap-1.5 rounded-xl"
          onClick={() => setMediaOpen(true)}
        >
          <Info className="size-3.5" />
          Chat info
        </Button>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-400">
            {thread.isGroup
              ? "No messages yet — say something to your class."
              : "No messages yet — say hello."}
          </p>
        ) : (
          messages.map((message) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              // An optimistic row may carry no sender id yet. Treating "has a clientId" as
              // own avoids the bubble rendering left-aligned, as if a stranger sent it, and
              // then jumping right when the server's copy replaces it.
              isOwn={message.senderId === actorId || Boolean(message.clientId)}
              senderName={participantsById[message.senderId]?.name}
              showSender={thread.isGroup}
              onRetry={onRetry ? () => onRetry(message) : undefined}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <ChatComposer
        onSend={onSend}
        placeholder={
          thread.isGroup
            ? `Message ${thread.conversation.className ?? "class"}…`
            : undefined
        }
      />

      <ChatMediaModal
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        title={thread.title}
        subtitle={thread.subtitle}
        avatarName={thread.avatarName}
        avatarColor={thread.avatarColor}
        isGroup={thread.isGroup}
        memberCount={thread.memberCount}
        members={members}
        messages={messages}
        participantsById={participantsById}
      />
    </div>
  )
}
