import { useRef, useState } from "react"
import {
  Circle,
  Eraser,
  Highlighter,
  MousePointer2,
  Pen,
  Redo2,
  Square,
  Trash2,
  Type,
  Undo2,
  Download,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useLiveRoomStore, selectIsHost } from "@/store/liveroom.store"
import type { WhiteboardStroke, WhiteboardTool } from "@/types/liveroom"

const TOOLS: { tool: WhiteboardTool; icon: React.ReactNode; label: string }[] =
  [
    { tool: "pointer", icon: <MousePointer2 />, label: "Select" },
    { tool: "pen", icon: <Pen />, label: "Pen" },
    { tool: "highlighter", icon: <Highlighter />, label: "Highlighter" },
    { tool: "shape", icon: <Square />, label: "Shape" },
    { tool: "text", icon: <Type />, label: "Text" },
    { tool: "eraser", icon: <Eraser />, label: "Eraser" },
  ]

const INK = ["#2563EB", "#111827", "#DC2626", "#059669", "#D97706", "#7C3AED"]

/**
 * Shared whiteboard.
 *
 * Strokes live in the live-room store rather than component state, because the
 * RTM layer applies remote strokes to that same store — see the `wb:*` events
 * in useLiveRoomRtm. Previously every stroke stayed inside this component, so
 * each person drew on a private board while the canvas told them "everyone in
 * the class sees this board live".
 */
export default function Whiteboard() {
  const isHost = useLiveRoomStore(selectIsHost)
  const canAnnotate = useLiveRoomStore((s) => s.policy.participantsCanAnnotate)
  const participants = useLiveRoomStore((s) => s.participants)
  const strokes = useLiveRoomStore((s) => s.whiteboardStrokes)
  const addStroke = useLiveRoomStore((s) => s.addStroke)
  const removeStroke = useLiveRoomStore((s) => s.removeStroke)
  const clearBoard = useLiveRoomStore((s) => s.clearBoard)

  const [tool, setTool] = useState<WhiteboardTool>("pen")
  const [colour, setColour] = useState(INK[0])
  const [width, setWidth] = useState(3)
  const [redoStack, setRedoStack] = useState<WhiteboardStroke[]>([])
  const [drawing, setDrawing] = useState<WhiteboardStroke | null>(null)
  const [saving, setSaving] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const readOnly = !isHost && !canAnnotate

  const point = (e: React.PointerEvent) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const start = (e: React.PointerEvent) => {
    if (readOnly || tool === "pointer" || tool === "text" || tool === "shape")
      return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrawing({
      // Unique across peers — two people drawing in the same millisecond
      // would otherwise collide once strokes are shared.
      id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      points: [point(e)],
      color: tool === "eraser" ? "#FFFFFF" : colour,
      width: tool === "highlighter" ? 14 : tool === "eraser" ? 20 : width,
      authorId: "self",
    })
  }

  const move = (e: React.PointerEvent) => {
    if (!drawing) return
    setDrawing({ ...drawing, points: [...drawing.points, point(e)] })
  }

  const end = () => {
    if (!drawing) return
    addStroke(drawing)
    setRedoStack([])
    setDrawing(null)
  }

  /**
   * Undo removes MY last stroke, not simply the newest one on the board.
   * On a shared surface "undo" pulling back whatever a colleague just drew is
   * the wrong behaviour, and it was only ever correct while the board was
   * single-user.
   */
  const undo = () => {
    const mine = [...strokes].reverse().find((st) => st.authorId === "self")
    if (!mine) return
    setRedoStack((r) => [...r, mine])
    removeStroke(mine.id)
  }

  const redo = () => {
    setRedoStack((r) => {
      if (r.length === 0) return r
      addStroke(r[r.length - 1])
      return r.slice(0, -1)
    })
  }

  const toPath = (s: WhiteboardStroke) =>
    s.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")

  /**
   * Rasterise the board and download it locally. Live-class file sharing has
   * been removed, so saving never uploads or publishes the image to students.
   */
  const handleSaveBoard = async () => {
    const svg = svgRef.current
    if (!svg || strokes.length === 0) return

    setSaving(true)
    try {
      const { width: w, height: h } = svg.getBoundingClientRect()
      const clone = svg.cloneNode(true) as SVGSVGElement
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
      clone.setAttribute("width", String(w))
      clone.setAttribute("height", String(h))

      const blob = new Blob([new XMLSerializer().serializeToString(clone)], {
        type: "image/svg+xml;charset=utf-8",
      })
      const url = URL.createObjectURL(blob)

      const png = await new Promise<Blob | null>((resolve) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext("2d")
          if (!ctx) return resolve(null)
          // Flatten onto white — the board is transparent, and a transparent
          // PNG of dark ink is unreadable in most viewers.
          ctx.fillStyle = "#FFFFFF"
          ctx.fillRect(0, 0, w, h)
          ctx.drawImage(img, 0, 0)
          canvas.toBlob((b) => resolve(b), "image/png")
        }
        img.onerror = () => resolve(null)
        img.src = url
      })

      URL.revokeObjectURL(url)
      if (!png) throw new Error("Couldn't render the board")

      const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")
      const fileName = `whiteboard-${stamp}.png`
      const localUrl = URL.createObjectURL(png)
      const a = document.createElement("a")
      a.href = localUrl
      a.download = fileName
      a.click()
      URL.revokeObjectURL(localUrl)
      toast.success("Board downloaded")
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : "Couldn't save the board"
      )
    } finally {
      setSaving(false)
    }
  }

  const annotators = participants.filter((p) => p.role !== "participant").length

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white">
      {/* Tool rail */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-gray-200 px-3 py-2">
        <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5">
          {TOOLS.map((t) => (
            <button
              key={t.tool}
              type="button"
              title={t.label}
              aria-label={t.label}
              aria-pressed={tool === t.tool}
              disabled={readOnly}
              onClick={() => setTool(t.tool)}
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition [&_svg]:size-4",
                tool === t.tool
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900",
                readOnly && "cursor-not-allowed opacity-40"
              )}
            >
              {t.icon}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {INK.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Ink colour ${c}`}
              disabled={readOnly}
              onClick={() => setColour(c)}
              style={{ backgroundColor: c }}
              className={cn(
                "size-5 rounded-full ring-offset-1 transition",
                colour === c ? "ring-2 ring-gray-900" : "ring-1 ring-black/10"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {[2, 4, 8].map((w) => (
            <button
              key={w}
              type="button"
              aria-label={`Stroke width ${w}`}
              disabled={readOnly}
              onClick={() => setWidth(w)}
              className={cn(
                "flex size-7 items-center justify-center rounded-md hover:bg-gray-100",
                width === w && "bg-gray-100"
              )}
            >
              <Circle
                style={{ width: w + 4, height: w + 4 }}
                className="fill-gray-700 text-gray-700"
              />
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={readOnly || strokes.length === 0}
            aria-label="Undo"
            className="flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={readOnly || redoStack.length === 0}
            aria-label="Redo"
            className="flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30"
          >
            <Redo2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              clearBoard()
              setRedoStack([])
            }}
            // Clearing wipes everyone's board, so it stays with the host.
            disabled={!isHost || strokes.length === 0}
            aria-label="Clear board"
            className="flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
          >
            <Trash2 className="size-4" />
          </button>
          <span className="mx-1 h-5 w-px bg-gray-200" />
          <button
            type="button"
            onClick={handleSaveBoard}
            disabled={saving || strokes.length === 0}
            aria-label="Download board"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40"
          >
            <Download className="size-3.5" />
            {saving ? "Saving…" : "Save board"}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden">
        <svg
          ref={svgRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className={cn(
            "h-full w-full touch-none",
            readOnly ? "cursor-default" : "cursor-crosshair"
          )}
          style={{
            backgroundImage:
              "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        >
          {[...strokes, ...(drawing ? [drawing] : [])].map((s) => (
            <path
              key={s.id}
              d={toPath(s)}
              fill="none"
              stroke={s.color}
              strokeWidth={s.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={s.width === 14 ? 0.35 : 1}
            />
          ))}
        </svg>

        {strokes.length === 0 && !drawing && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-gray-400">
              {readOnly
                ? "Your teacher hasn't opened the board for annotation yet."
                : "Start writing — everyone in the class sees this board live."}
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-gray-600 shadow-sm ring-1 ring-gray-200">
          <Users className="size-3" />
          {readOnly ? "View only" : `${annotators} can edit`}
        </div>
      </div>
    </div>
  )
}
