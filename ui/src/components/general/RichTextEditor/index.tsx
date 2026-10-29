import { useEffect, useRef, useState } from "react"
import { Bold, Code, Eye, Italic, Link2, List, Underline } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import LessonMediaPreviewModal from "@/pages/Dashboard/Lms/components/LessonMediaPreviewModal"

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  label?: string
  placeholder?: string
  minHeight?: number
  height?: number
  showEmbed?: boolean
  embedUrl?: string
  onEmbedUrlChange?: (url: string) => void
}

function runCommand(command: string, commandValue?: string) {
  document.execCommand(command, false, commandValue)
}

export default function RichTextEditor({
  value,
  onChange,
  label,
  placeholder = "Write here…",
  minHeight = 200,
  height,
  showEmbed = false,
  embedUrl = "",
  onEmbedUrlChange,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<"visual" | "source">("visual")
  const [embedPreviewOpen, setEmbedPreviewOpen] = useState(false)

  useEffect(() => {
    const el = editorRef.current
    if (!el || mode !== "visual") return
    if (document.activeElement === el) return
    if (el.innerHTML !== (value || "")) {
      el.innerHTML = value || ""
    }
  }, [value, mode])

  const emitHtml = () => {
    onChange(editorRef.current?.innerHTML ?? "")
  }

  const apply = (command: string, commandValue?: string) => {
    editorRef.current?.focus()
    runCommand(command, commandValue)
    emitHtml()
  }

  const applyCode = () => {
    editorRef.current?.focus()
    const selection = window.getSelection()
    const text = selection?.toString() || "code"
    runCommand("insertHTML", `<code>${text}</code>`)
    emitHtml()
  }

  const applyLink = () => {
    editorRef.current?.focus()
    const url = window.prompt("Enter link URL", "https://")
    if (!url) return
    runCommand("createLink", url)
    emitHtml()
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-gray-200 bg-gray-50 px-2 py-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => apply("bold")}
          title="Bold"
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => apply("italic")}
          title="Italic"
        >
          <Italic className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => apply("underline")}
          title="Underline"
        >
          <Underline className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => apply("insertUnorderedList")}
          title="List"
        >
          <List className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={applyCode}
          title="Code"
        >
          <Code className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={applyLink}
          title="Link"
        >
          <Link2 className="size-4" />
        </Button>
        <div className="ml-auto flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={mode === "visual"}
            className={cn(
              "h-8 rounded-md px-3 text-xs font-semibold transition-colors",
              mode === "visual"
                ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:text-white"
                : "text-gray-600 hover:bg-white hover:text-gray-900"
            )}
            onClick={() => setMode("visual")}
          >
            Write
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={mode === "source"}
            className={cn(
              "h-8 rounded-md px-3 text-xs font-semibold transition-colors",
              mode === "source"
                ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:text-white"
                : "text-gray-600 hover:bg-white hover:text-gray-900"
            )}
            onClick={() => setMode("source")}
          >
            HTML
          </Button>
        </div>
      </div>

      {mode === "visual" ? (
        <div className="relative">
          {!value && (
            <p className="pointer-events-none absolute top-3 left-3 text-sm text-muted-foreground">
              {placeholder}
            </p>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline
            onInput={emitHtml}
            onBlur={emitHtml}
            className={cn(
              "min-h-[200px] rounded-b-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none",
              "prose prose-sm max-w-none overflow-y-auto focus:ring-2 focus:ring-blue-100",
              "[&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_em]:italic [&_strong]:font-bold [&_u]:underline"
            )}
            style={{ height, minHeight: height ?? minHeight }}
          />
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] resize-none overflow-y-auto rounded-t-none font-mono text-sm"
          style={{ height, minHeight: height ?? minHeight }}
        />
      )}

      {showEmbed && onEmbedUrlChange && (
        <div className="space-y-2 pt-2">
          <Label>Embed URL (iframe / YouTube / external)</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={embedUrl}
              onChange={(e) => onEmbedUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or /embed/..."
              className="h-9"
            />
            <Button
              type="button"
              variant="outline"
              className="h-9 shrink-0 gap-2 rounded-md"
              disabled={!embedUrl.trim()}
              onClick={() => setEmbedPreviewOpen(true)}
            >
              <Eye className="size-4" />
              Preview
            </Button>
          </div>
          <LessonMediaPreviewModal
            open={embedPreviewOpen}
            onClose={() => setEmbedPreviewOpen(false)}
            media={
              embedUrl.trim()
                ? {
                    title: "Embed preview",
                    url: embedUrl.trim(),
                    kind: "embed",
                  }
                : null
            }
          />
        </div>
      )}
    </div>
  )
}
