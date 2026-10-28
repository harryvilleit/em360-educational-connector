import { useEffect, useRef, useState } from "react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eraser,
  Eye,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react"
import { cn } from "@/lib/utils"

type RichHtmlEditorProps = {
  value: string
  onChange: (html: string) => void
  minHeight?: number
  className?: string
  placeholder?: string
}

type EditorMode = "visual" | "html"

export function RichHtmlEditor({
  value,
  onChange,
  minHeight = 360,
  className,
  placeholder = "Write your article…",
}: RichHtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const selectionRef = useRef<Range | null>(null)
  const [mode, setMode] = useState<EditorMode>("visual")
  const isEmpty = !value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .trim()

  useEffect(() => {
    if (mode !== "visual" || !editorRef.current) return
    if (editorRef.current.innerHTML !== value)
      editorRef.current.innerHTML = value
  }, [mode, value])

  function rememberSelection() {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return
    const range = selection.getRangeAt(0)
    if (editorRef.current.contains(range.commonAncestorContainer)) {
      selectionRef.current = range.cloneRange()
    }
  }

  function restoreSelection() {
    editorRef.current?.focus()
    if (!selectionRef.current) return
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(selectionRef.current)
  }

  function emitVisualValue() {
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  function runCommand(command: string, commandValue?: string) {
    restoreSelection()
    document.execCommand(command, false, commandValue)
    emitVisualValue()
    rememberSelection()
  }

  function addLink() {
    const url = window
      .prompt("Enter the full link URL, for example https://example.com")
      ?.trim()
    if (!url) return
    if (!/^(https?:\/\/|mailto:)/i.test(url)) {
      window.alert("Use a valid http, https or mailto link.")
      return
    }
    runCommand("createLink", url)
  }

  function switchMode(nextMode: EditorMode) {
    if (nextMode === mode) return
    if (mode === "visual") emitVisualValue()
    setMode(nextMode)
  }

  const toolbarButtons = [
    { label: "Bold", icon: Bold, command: "bold" },
    { label: "Italic", icon: Italic, command: "italic" },
    { label: "Underline", icon: Underline, command: "underline" },
    { label: "Strikethrough", icon: Strikethrough, command: "strikeThrough" },
    { label: "Bulleted list", icon: List, command: "insertUnorderedList" },
    { label: "Numbered list", icon: ListOrdered, command: "insertOrderedList" },
    {
      label: "Block quote",
      icon: Quote,
      command: "formatBlock",
      value: "blockquote",
    },
    { label: "Align left", icon: AlignLeft, command: "justifyLeft" },
    { label: "Align centre", icon: AlignCenter, command: "justifyCenter" },
    { label: "Align right", icon: AlignRight, command: "justifyRight" },
    { label: "Undo", icon: Undo2, command: "undo" },
    { label: "Redo", icon: Redo2, command: "redo" },
    { label: "Clear formatting", icon: Eraser, command: "removeFormat" },
  ]

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-2 py-2">
        <div className="flex flex-wrap items-center gap-1">
          <select
            aria-label="Text style"
            className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 outline-none"
            defaultValue="p"
            onMouseDown={rememberSelection}
            onChange={(event) => runCommand("formatBlock", event.target.value)}
            disabled={mode === "html"}
          >
            <option value="p">Paragraph</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="pre">Code block</option>
          </select>

          <span className="mx-1 h-6 w-px bg-gray-200" />
          {toolbarButtons.map(
            ({ label, icon: Icon, command, value: commandValue }) => (
              <button
                key={label}
                type="button"
                title={label}
                aria-label={label}
                disabled={mode === "html"}
                onMouseDown={(event) => {
                  event.preventDefault()
                  runCommand(command, commandValue)
                }}
                className="grid size-8 place-items-center rounded-md text-gray-600 hover:bg-white hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Icon className="size-4" />
              </button>
            )
          )}
          <button
            type="button"
            title="Add link"
            aria-label="Add link"
            disabled={mode === "html"}
            onMouseDown={(event) => {
              event.preventDefault()
              addLink()
            }}
            className="grid size-8 place-items-center rounded-md text-gray-600 hover:bg-white hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Link2 className="size-4" />
          </button>
          <button
            type="button"
            title="Remove link"
            aria-label="Remove link"
            disabled={mode === "html"}
            onMouseDown={(event) => {
              event.preventDefault()
              runCommand("unlink")
            }}
            className="grid size-8 place-items-center rounded-md text-gray-600 hover:bg-white hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Unlink className="size-4" />
          </button>
        </div>

        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
          <ModeButton
            active={mode === "visual"}
            onClick={() => switchMode("visual")}
            icon={Eye}
          >
            Visual
          </ModeButton>
          <ModeButton
            active={mode === "html"}
            onClick={() => switchMode("html")}
            icon={Code2}
          >
            HTML
          </ModeButton>
        </div>
      </div>

      {mode === "visual" ? (
        <div className="relative">
          {isEmpty && (
            <span className="pointer-events-none absolute top-3 left-4 text-sm text-gray-400">
              {placeholder}
            </span>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="Article content rich text editor"
            onInput={emitVisualValue}
            onBlur={rememberSelection}
            onKeyUp={rememberSelection}
            onMouseUp={rememberSelection}
            style={{ minHeight }}
            className="prose prose-gray prose-sm prose-headings:text-gray-950 prose-a:text-blue-600 max-w-none overflow-y-auto px-4 py-3 text-gray-800 outline-none"
          />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Article HTML source"
          spellCheck={false}
          style={{ minHeight }}
          className="block w-full resize-y bg-gray-950 px-4 py-3 font-mono text-sm leading-6 text-emerald-300 outline-none"
          placeholder="<p>Write your article HTML here…</p>"
        />
      )}
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition",
        active ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
      )}
    >
      <Icon className="size-3.5" /> {children}
    </button>
  )
}
