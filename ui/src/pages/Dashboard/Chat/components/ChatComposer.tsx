import { useEffect, useRef, useState } from "react"
import {
  FileText,
  Image as ImageIcon,
  Paperclip,
  Send,
  Smile,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  uploadChatAttachment,
  chatImageAccept,
  chatFileAccept,
  chatAttachmentHint,
} from "@/lib/chat-attachments"
import { useSchoolId } from "@/contexts/SchoolContext"
import type { ChatComposerProps, ChatPendingAttachment } from "@/hooks/chat"

const EMOJIS = ["👍", "❤️", "😊", "🎉", "✅", "👏", "📚", "🙏"]

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function ChatComposer({
  onSend,
  disabled,
  placeholder = "Type a message…",
}: ChatComposerProps) {
  const schoolId = useSchoolId()
  const [draft, setDraft] = useState("")
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [pending, setPending] = useState<ChatPendingAttachment | null>(null)
  // The uploaded URL, once storage has it. Null while the upload is in flight.
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const imageRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (pending?.url.startsWith("blob:")) URL.revokeObjectURL(pending.url)
    }
  }, [pending])

  const clearPending = () => {
    setPending((prev) => {
      if (prev?.url.startsWith("blob:")) URL.revokeObjectURL(prev.url)
      return null
    })
    setUploadedUrl(null)
  }

  /**
   * Shows a local preview immediately, then uploads in the background.
   *
   * The preview uses a blob: URL so the picker feels instant, but a blob URL is only
   * valid inside the tab that created it — sending one would give every recipient a
   * broken attachment. The real storage URL from uploadFileAndGetUrl is what gets sent,
   * and the send button stays disabled until it arrives.
   */
  const pickFile = async (file: File, forceKind?: "image" | "file") => {
    const isImage =
      forceKind === "image" ||
      (forceKind !== "file" && file.type.startsWith("image/"))
    const previewUrl = URL.createObjectURL(file)

    setPending((prev) => {
      if (prev?.url.startsWith("blob:")) URL.revokeObjectURL(prev.url)
      return {
        kind: isImage ? "image" : "file",
        name: file.name,
        url: previewUrl,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
      }
    })
    setUploadedUrl(null)
    setUploading(true)

    try {
      const url = await uploadChatAttachment(file, schoolId)
      setUploadedUrl(url)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload the attachment",
      )
      clearPending()
    } finally {
      setUploading(false)
    }
  }

  const submit = () => {
    if (disabled) return

    if (pending) {
      // Guard rather than fall back to the blob URL: sending an unresolvable attachment
      // is worse than making the user wait a moment.
      if (!uploadedUrl) return

      onSend({
        body: draft.trim(),
        kind: pending.kind,
        attachmentName: pending.name,
        attachmentUrl: uploadedUrl,
      })
      setDraft("")
      clearPending()
      setEmojiOpen(false)
      return
    }

    if (!draft.trim()) return
    onSend({ body: draft, kind: "text" })
    setDraft("")
    setEmojiOpen(false)
  }

  const canSend = pending
    ? Boolean(uploadedUrl) && !uploading
    : Boolean(draft.trim())

  return (
    <div className="border-t border-slate-100 bg-white px-3 py-3">
      {pending && (
        <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
            <p className="text-xs font-semibold text-slate-700">
              {pending.kind === "image" ? "Photo preview" : "Document ready"}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={clearPending}
              title="Remove attachment"
            >
              <X className="size-3.5" />
            </Button>
          </div>
          {pending.kind === "image" ? (
            <div className="bg-black/5 p-2">
              <img
                src={pending.url}
                alt={pending.name}
                className="mx-auto max-h-52 rounded-xl object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {pending.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatBytes(pending.size)} · {pending.mimeType || "File"}
                </p>
              </div>
            </div>
          )}
          <p className="px-3 pb-2 text-[11px] text-slate-500">
            {uploading
              ? "Uploading…"
              : "Add an optional caption below, then tap send."}
          </p>
        </div>
      )}

      {emojiOpen && (
        <div className="mb-2 flex flex-wrap gap-1 rounded-xl border border-slate-100 bg-slate-50 p-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className="rounded-lg px-2 py-1 text-lg hover:bg-white"
              onClick={() => setDraft((d) => d + e)}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => setEmojiOpen((o) => !o)}
          disabled={disabled}
          title="Emoji"
        >
          <Smile className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => imageRef.current?.click()}
          disabled={disabled}
          title="Photo"
        >
          <ImageIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          title="Document / PDF"
        >
          <Paperclip className="size-4" />
        </Button>
        <Input
          className="h-9 flex-1 text-sm"
          placeholder={pending ? "Add a caption (optional)…" : placeholder}
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
        />
        <Button
          type="button"
          size="icon"
          className="size-9 shrink-0"
          aria-label="Send message"
          onClick={submit}
          disabled={disabled || !canSend}
        >
          <Send className="size-3.5" />
        </Button>
      </div>

      {chatAttachmentHint && (
        <p className="mt-2 text-xs text-muted-foreground">
          {chatAttachmentHint}
        </p>
      )}
      <input
        ref={imageRef}
        type="file"
        accept={chatImageAccept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void pickFile(file, "image")
          e.target.value = ""
        }}
      />
      <input
        ref={fileRef}
        type="file"
        accept={chatFileAccept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void pickFile(file, "file")
          e.target.value = ""
        }}
      />
    </div>
  )
}
