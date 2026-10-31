import { memo, useCallback, useState } from "react"
import { ChevronDown, ChevronUp, MessageSquare, Send, X } from "lucide-react"
import type { BroadcastMessage } from "@/types/parent"

export function BroadcastsPanel() {
  const [messages, setMessages] = useState<BroadcastMessage[]>([])
  const [composing, setComposing] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", body: "", audience: "All Parents" })

  const unreadCount = messages.filter((m) => !m.read).length

  const handleExpand = useCallback((id: string) => {
    setExpanded((prev) => (prev === id ? null : id))
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: true } : m))
    )
  }, [])

  function handleSend() {
    if (!form.title.trim() || !form.body.trim()) return
    const newMsg: BroadcastMessage = {
      id: `m${Date.now()}`,
      title: form.title,
      body: form.body,
      sentAt: "Just now",
      sentBy: "You",
      audience: form.audience as BroadcastMessage["audience"],
      read: false,
    }
    setMessages((prev) => [newMsg, ...prev])
    setForm({ title: "", body: "", audience: "All Parents" })
    setComposing(false)
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {messages.length} messages
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              {unreadCount} unread
            </span>
          )}
        </p>
        <button
          onClick={() => setComposing((p) => !p)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Send size={14} />
          New message
        </button>
      </div>

      {/* Compose panel */}
      {composing && (
        <div className="mb-5 rounded-xl border border-blue-200 bg-white p-5 dark:border-blue-500/30 dark:bg-white/3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              New broadcast message
            </h2>
            <button
              onClick={() => setComposing(false)}
              className="rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
            >
              <X size={15} className="text-gray-400" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Send to
              </label>
              <select
                value={form.audience}
                onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none sm:w-48 dark:border-white/10 dark:bg-white/3 dark:text-gray-100"
              >
                <option>All Parents</option>
                <option>JSS 1 Parents</option>
                <option>JSS 2 Parents</option>
                <option>JSS 3 Parents</option>
                <option>SSS 1 Parents</option>
                <option>SSS 2 Parents</option>
                <option>SSS 3 Parents</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. End of term PTA meeting"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none dark:border-white/10 dark:bg-white/3 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Type your message here..."
                value={form.body}
                onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none dark:border-white/10 dark:bg-white/3 dark:text-gray-100"
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setComposing(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!form.title.trim() || !form.body.trim()}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={13} />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <MessageSquare size={36} className="mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-400 dark:text-gray-500">No messages sent yet</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {messages.map((msg) => (
            <BroadcastItem
              key={msg.id}
              message={msg}
              isExpanded={expanded === msg.id}
              onToggle={handleExpand}
            />
          ))}
        </div>
      )}
    </>
  )
}

const BroadcastItem = memo(function BroadcastItem({
  message,
  isExpanded,
  onToggle,
}: {
  message: BroadcastMessage
  isExpanded: boolean
  onToggle: (id: string) => void
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white transition-all dark:bg-white/3 ${
        !message.read
          ? "border-blue-200 dark:border-blue-500/30"
          : "border-gray-200 dark:border-white/10"
      }`}
    >
      <button
        onClick={() => onToggle(message.id)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/2"
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${!message.read ? "bg-blue-500" : "bg-transparent"}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`truncate text-sm ${!message.read ? "font-semibold text-gray-900 dark:text-gray-100" : "font-medium text-gray-700 dark:text-gray-300"}`}
            >
              {message.title}
            </p>
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 dark:bg-white/10 dark:text-gray-400">
              {message.audience === "Class" ? message.audienceLabel : message.audience}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            {message.sentAt} · {message.sentBy}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp size={15} className="shrink-0 text-gray-400" />
        ) : (
          <ChevronDown size={15} className="shrink-0 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 dark:border-white/5">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {message.body}
          </p>
        </div>
      )}
    </div>
  )
})
