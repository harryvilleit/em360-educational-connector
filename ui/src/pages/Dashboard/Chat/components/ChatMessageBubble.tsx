import { AlertCircle, Check, Clock, ExternalLink, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessageBubbleProps } from "@/hooks/chat"

const URL_RE = /(https?:\/\/[^\s]+)/gi

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

function TextWithLinks({
  text,
  isOwn,
}: {
  text: string
  isOwn: boolean
}) {
  const parts = text.split(URL_RE)
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {parts.map((part, i) =>
        /^https?:\/\//i.test(part) ? (
          <a
            key={`${part}-${i}`}
            href={part}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex items-center gap-0.5 break-all underline",
              isOwn ? "text-blue-100" : "text-blue-700"
            )}
          >
            {part}
            <ExternalLink className="size-3 shrink-0" />
          </a>
        ) : (
          <span key={`${part}-${i}`}>{part}</span>
        )
      )}
    </p>
  )
}

/**
 * The small delivery indicator on the sender's own bubbles.
 *
 * Only rendered for messages the current user sent, because it describes *their* send —
 * showing a tick on someone else's message would read as "they have read this", which is a
 * different claim the server does not currently make.
 *
 * Nothing at all is shown for a confirmed message from an older session: `deliveryStatus`
 * is undefined there, and a permanent tick on every historical message is noise. The tick
 * appears only where a clock was, so the transition sending → sent is visible.
 */
function DeliveryIndicator({
  status,
  justSent,
  onRetry,
}: {
  status?: "sending" | "failed"
  justSent: boolean
  onRetry?: () => void
}) {
  if (status === "sending") {
    return (
      <span
        className="inline-flex items-center gap-1 text-blue-200"
        title="Sending…"
        aria-label="Sending"
      >
        <Clock className="size-3 animate-pulse" />
        Sending
      </span>
    )
  }

  if (status === "failed") {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1 text-rose-100 underline decoration-rose-200 underline-offset-2"
        title="This message was not delivered. Tap to try again."
      >
        <AlertCircle className="size-3" />
        Not sent · Retry
      </button>
    )
  }

  if (justSent) {
    return (
      <span
        className="inline-flex items-center gap-1 text-blue-200"
        title="Sent"
        aria-label="Sent"
      >
        <Check className="size-3" />
        Sent
      </span>
    )
  }

  return null
}

export function ChatMessageBubble({
  message,
  isOwn,
  senderName,
  showSender,
  onRetry,
}: ChatMessageBubbleProps) {
  const failed = message.deliveryStatus === "failed"

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] overflow-hidden rounded-2xl transition-opacity",
          isOwn
            ? "rounded-br-sm bg-blue-600 text-white"
            : "rounded-bl-sm bg-slate-100 text-slate-800",
          // Dim while in flight so the difference between "on your screen" and "on the
          // server" is visible without being alarming.
          message.deliveryStatus === "sending" && "opacity-70",
          failed && "ring-1 ring-rose-300"
        )}
      >
        {showSender && !isOwn && senderName && (
          <p className="px-3.5 pt-2 text-[10px] font-semibold text-slate-500">
            {senderName}
          </p>
        )}

        {message.kind === "image" && message.attachmentUrl ? (
          <a
            href={message.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <img
              src={message.attachmentUrl}
              alt={message.attachmentName || "Image"}
              className="max-h-64 w-full object-cover"
            />
          </a>
        ) : null}

        {message.kind === "file" ? (
          <div
            className={cn(
              "m-2 flex items-center gap-2 rounded-xl px-3 py-2",
              isOwn ? "bg-blue-500/40" : "bg-white"
            )}
          >
            <FileText
              className={cn(
                "size-5 shrink-0",
                isOwn ? "text-white" : "text-blue-600"
              )}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {message.attachmentName || message.body}
              </p>
              <p
                className={cn(
                  "text-[10px]",
                  isOwn ? "text-blue-100" : "text-slate-500"
                )}
              >
                Document
              </p>
            </div>
          </div>
        ) : null}

        <div className="px-3.5 py-2">
          {message.kind === "text" ? (
            <TextWithLinks text={message.body} isOwn={isOwn} />
          ) : message.body &&
            message.body !== message.attachmentName ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.body}
            </p>
          ) : null}
          <div
            className={cn(
              "mt-1 flex items-center gap-1.5 text-[10px]",
              isOwn ? "justify-end text-blue-200" : "text-slate-400"
            )}
          >
            <span>{formatTime(message.sentAt)}</span>
            {isOwn && (
              <DeliveryIndicator
                status={message.deliveryStatus}
                // `clientId` survives reconciliation, so a message with one and no status is
                // exactly "sent from this tab, just now" — the only case where confirming
                // delivery tells the user something they did not already know.
                justSent={!message.deliveryStatus && Boolean(message.clientId)}
                onRetry={onRetry}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function extractLinks(text: string): string[] {
  return text.match(URL_RE) ?? []
}
