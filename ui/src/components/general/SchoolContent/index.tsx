import { useEffect, useRef, useState } from "react"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Table2,
  Undo2,
  Redo2,
} from "lucide-react"
import { cleanSchoolHtml } from "@/lib/school-public-content"
import "./SchoolContent.css"

export function SchoolRichContent({
  html,
  className = "",
}: {
  html?: string | null
  className?: string
}) {
  return (
    <div
      className={`school-rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanSchoolHtml(html) }}
    />
  )
}

export default function SchoolContentEditor({
  value,
  onChange,
  label = "Content",
  disabled = false,
  maxLength = 50000,
}: {
  value: string
  onChange: (html: string) => void
  label?: string
  disabled?: boolean
  maxLength?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<"visual" | "html">("visual")
  const [message, setMessage] = useState("")
  useEffect(() => {
    if (
      mode === "visual" &&
      ref.current &&
      document.activeElement !== ref.current
    )
      ref.current.innerHTML = cleanSchoolHtml(value)
  }, [value, mode])
  const emit = () => onChange(ref.current?.innerHTML ?? "")
  const command = (name: string, argument?: string) => {
    ref.current?.focus()
    document.execCommand(name, false, argument)
    emit()
  }
  const insertLink = () => {
    const url = window.prompt("Link address (https:// or mailto:)", "https://")
    if (!url) return
    if (!/^(https?:\/\/|mailto:)/i.test(url.trim())) {
      setMessage("Use an https://, http:// or mailto: link.")
      return
    }
    setMessage("")
    command("createLink", url.trim())
  }
  const table = () =>
    command(
      "insertHTML",
      "<table><thead><tr><th>Programme</th><th>Format</th><th>Fee</th></tr></thead><tbody><tr><td>Programme name</td><td>Learning format</td><td>Enter fee</td></tr><tr><td>Programme name</td><td>Learning format</td><td>Enter fee</td></tr></tbody></table><p><br></p>"
    )
  const addRow = () => {
    const node = window.getSelection()?.anchorNode
    const cell = (
      node instanceof Element ? node : node?.parentElement
    )?.closest("td,th")
    const row = cell?.closest("tr")
    if (!row || !ref.current?.contains(row)) {
      setMessage("Place the cursor in a table cell first.")
      return
    }
    const next =
      row.parentElement?.tagName === "THEAD"
        ? row.closest("table")?.querySelector("tbody")?.insertRow(0)
        : (row as HTMLTableRowElement).parentElement?.appendChild(
            document.createElement("tr")
          )
    if (next)
      Array.from(row.children).forEach(() => {
        const td = document.createElement("td")
        td.textContent = "New value"
        next.appendChild(td)
      })
    setMessage("")
    emit()
  }
  const buttons = [
    ["bold", "Bold", Bold],
    ["italic", "Italic", Italic],
    ["underline", "Underline", Underline],
    ["insertUnorderedList", "Bullet list", List],
    ["insertOrderedList", "Numbered list", ListOrdered],
    ["undo", "Undo", Undo2],
    ["redo", "Redo", Redo2],
  ] as const
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        <div className="flex rounded-lg bg-slate-100 p-1">
          {(["visual", "html"] as const).map((item) => (
            <button
              type="button"
              key={item}
              disabled={disabled}
              aria-pressed={mode === item}
              onClick={() => {
                if (item === "visual") onChange(cleanSchoolHtml(value))
                setMode(item)
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === item ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
            >
              {item === "visual" ? "Visual editor" : "HTML"}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {mode === "visual" && (
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
            <select
              aria-label="Text style"
              disabled={disabled}
              className="max-w-28 bg-transparent text-xs"
              defaultValue="p"
              onChange={(e) => command("formatBlock", e.target.value)}
            >
              <option value="p">Paragraph</option>
              <option value="h2">Heading</option>
              <option value="h3">Subheading</option>
            </select>
            {buttons.map(([cmd, title, Icon]) => (
              <button
                type="button"
                key={cmd}
                title={title}
                aria-label={title}
                disabled={disabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => command(cmd)}
                className="rounded p-2 text-slate-600 hover:bg-blue-100 disabled:opacity-40"
              >
                <Icon size={16} />
              </button>
            ))}
            <button
              type="button"
              aria-label="Insert link"
              title="Insert link"
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={insertLink}
              className="rounded p-2 hover:bg-blue-100"
            >
              <Link2 size={16} />
            </button>
            <button
              type="button"
              aria-label="Insert pricing table"
              title="Insert pricing table"
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={table}
              className="rounded p-2 hover:bg-blue-100"
            >
              <Table2 size={16} />
            </button>
            <button
              type="button"
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={addRow}
              className="rounded p-2 text-xs hover:bg-blue-100"
            >
              + Row
            </button>
          </div>
        )}
        {mode === "visual" ? (
          <div
            ref={ref}
            contentEditable={!disabled}
            suppressContentEditableWarning
            role="textbox"
            aria-label={label}
            aria-multiline
            className="school-rich-content min-h-72 p-5 outline-none focus:ring-2 focus:ring-blue-100 focus:ring-inset"
            onInput={emit}
            onBlur={() =>
              onChange(cleanSchoolHtml(ref.current?.innerHTML ?? ""))
            }
            onPaste={(e) => {
              e.preventDefault()
              const html = e.clipboardData.getData("text/html")
              if (html) command("insertHTML", cleanSchoolHtml(html))
              else command("insertText", e.clipboardData.getData("text/plain"))
            }}
          />
        ) : (
          <textarea
            aria-label={`${label} HTML`}
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-72 w-full p-5 font-mono text-sm outline-none"
            spellCheck={false}
          />
        )}
      </div>
      <div className="flex justify-between gap-3 text-xs text-slate-500">
        <span>
          {message || "Format text, add links and tables, or paste your HTML."}
        </span>
        <span className={value.length > maxLength ? "text-red-600" : ""}>
          {value.length.toLocaleString()} / {maxLength.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
