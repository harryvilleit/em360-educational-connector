import { useEffect, useRef, useState, type PointerEvent } from "react"
import type {
  CanvasElement,
  DocumentData,
  DocumentKind,
  DocumentLayout,
} from "@/api/schoolDocuments.api"
import { renderDocument, type RenderedDocument } from "./renderDocument"
import { CanvasCommands } from "./CanvasCommands"
import { paperSize } from "./canvasModel"
import "./document-fonts.css"

interface Drag {
  mode: string
  ids: string[]
  originX: number
  originY: number
  originals: CanvasElement[]
  dx: number
  dy: number
  width?: number
  height?: number
}
export default function CanvasStage({
  layout,
  pageIndex,
  kind,
  data,
  selected,
  onSelect,
  onChange,
  onAdd,
  canEdit,
  zoom,
  snap,
  onError,
}: {
  layout: DocumentLayout
  pageIndex: number
  kind: DocumentKind
  data: DocumentData
  selected: string[]
  onSelect: (ids: string[]) => void
  onChange: (elements: CanvasElement[]) => void
  onAdd: (tool: string, x: number, y: number) => void
  canEdit: boolean
  zoom: number
  snap: boolean
  onError: (error: string | null) => void
}) {
  const svg = useRef<SVGSVGElement>(null),
    scroll = useRef<HTMLDivElement>(null),
    dragRef = useRef<Drag | null>(null)
  const [rendered, setRendered] = useState<RenderedDocument | null>(null),
    [error, setError] = useState<string | null>(null),
    [drag, setDrag] = useState<Drag | null>(null),
    [guides, setGuides] = useState<{ axis: "x" | "y"; position: number }[]>([]),
    [editing, setEditing] = useState<string | null>(null),
    [text, setText] = useState(""),
    [fit, setFit] = useState(1)
  const [w, h] = paperSize(layout),
    page = layout.pages![pageIndex],
    elements = page.elements
  useEffect(() => {
    const observer = new ResizeObserver((entries) =>
      setFit(
        Math.min(
          1,
          Math.max(0.25, (entries[0].contentRect.width - 44) / (w * 3.2))
        )
      )
    )
    if (scroll.current) observer.observe(scroll.current)
    return () => observer.disconnect()
  }, [w])
  useEffect(() => {
    let stopped = false
    const timer = setTimeout(
      () =>
        void renderDocument(kind, { ...layout, pages: [page] }, data, "sample")
          .then((r) => {
            if (!stopped) {
              setRendered(r)
              setError(null)
              onError(null)
            }
          })
          .catch((e) => {
            if (!stopped) {
              const message =
                e instanceof Error ? e.message : "The page could not be drawn."
              setError(message)
              onError(message)
            }
          }),
      100
    )
    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }, [layout, page, kind, data, onError])
  const point = (clientX: number, clientY: number) => {
    const b = svg.current!.getBoundingClientRect()
    return {
      x: ((clientX - b.left) * w) / b.width,
      y: ((clientY - b.top) * h) / b.height,
    }
  }
  const start = (
    event: PointerEvent<SVGElement>,
    e: CanvasElement,
    mode = "move"
  ) => {
    event.stopPropagation()
    if (editing) return
    let ids = selected.includes(e.id)
      ? selected
      : e.groupId
        ? elements.filter((x) => x.groupId === e.groupId).map((x) => x.id)
        : [e.id]
    if (mode === "move" && event.shiftKey) {
      onSelect(
        selected.includes(e.id)
          ? selected.filter((id) => !ids.includes(id))
          : [...new Set([...selected, ...ids])]
      )
      return
    }
    onSelect(ids)
    if (!canEdit || ids.some((id) => elements.find((x) => x.id === id)?.locked))
      return
    if (mode !== "move") ids = [e.id]
    const p = point(event.clientX, event.clientY)
    dragRef.current = {
      mode,
      ids,
      originX: p.x,
      originY: p.y,
      originals: elements.filter((x) => ids.includes(x.id)),
      dx: 0,
      dy: 0,
    }
    setDrag(dragRef.current)
    if (mode !== "move") svg.current?.setPointerCapture(event.pointerId)
  }
  const move = (event: PointerEvent<SVGSVGElement>) => {
    const current = dragRef.current
    if (!current) return
    const p = point(event.clientX, event.clientY),
      first = current.originals[0],
      next = {
        ...current,
        dx: p.x - current.originX,
        dy: p.y - current.originY,
      }
    if (Math.abs(next.dx) + Math.abs(next.dy) > 0.5)
      svg.current?.setPointerCapture(event.pointerId)
    const gs: { axis: "x" | "y"; position: number }[] = []
    if (current.mode === "move") {
      const left = Math.min(...current.originals.map((e) => e.x)),
        top = Math.min(...current.originals.map((e) => e.y)),
        right = Math.max(...current.originals.map((e) => e.x + e.width)),
        bottom = Math.max(...current.originals.map((e) => e.y + e.height))
      if (snap && !event.altKey) {
        const targetsX = [0, 16, w / 2, w - 16, w],
          targetsY = [0, 16, h / 2, h - 28, h - 12]
        elements
          .filter((e) => !current.ids.includes(e.id))
          .forEach((e) => {
            targetsX.push(e.x, e.x + e.width / 2, e.x + e.width)
            targetsY.push(e.y, e.y + e.height / 2, e.y + e.height)
          })
        const adjust = (
          values: number[],
          targets: number[],
          delta: number,
          axis: "x" | "y"
        ) => {
          let best = 1.5,
            correction = 0,
            target: number | undefined
          for (const v of values)
            for (const t of targets) {
              const diff = t - (v + delta)
              if (Math.abs(diff) < best) {
                best = Math.abs(diff)
                correction = diff
                target = t
              }
            }
          if (target !== undefined) {
            gs.push({ axis, position: target })
            return delta + correction
          }
          return Math.round((values[0] + delta) / 2) * 2 - values[0]
        }
        next.dx = adjust(
          [left, (left + right) / 2, right],
          targetsX,
          next.dx,
          "x"
        )
        next.dy = adjust(
          [top, (top + bottom) / 2, bottom],
          targetsY,
          next.dy,
          "y"
        )
      }
      next.dx = Math.max(-left, Math.min(next.dx, w - right))
      next.dy = Math.max(-top, Math.min(next.dy, h - 12 - bottom))
    } else {
      const min = Math.max(4, first.padding * 2 + 0.2)
      if (current.mode.includes("w")) {
        next.dx = Math.max(-first.x, Math.min(next.dx, first.width - min))
        next.width = first.width - next.dx
      } else {
        next.dx = 0
        next.width = Math.max(
          min,
          Math.min(first.width + p.x - current.originX, w - first.x)
        )
      }
      if (current.mode.includes("n")) {
        next.dy = Math.max(-first.y, Math.min(next.dy, first.height - min))
        next.height = first.height - next.dy
      } else {
        next.dy = 0
        next.height = Math.max(
          min,
          Math.min(first.height + p.y - current.originY, h - 12 - first.y)
        )
      }
    }
    dragRef.current = next
    setDrag(next)
    setGuides(gs)
  }
  const finish = (cancel = false) => {
    const current = dragRef.current
    if (
      current &&
      !cancel &&
      (Math.abs(current.dx) + Math.abs(current.dy) > 0.01 ||
        current.width !== undefined)
    )
      onChange(
        elements.map((e) =>
          current.ids.includes(e.id)
            ? {
                ...e,
                x: Math.round((e.x + current.dx) * 100) / 100,
                y: Math.round((e.y + current.dy) * 100) / 100,
                width:
                  current.width === undefined
                    ? e.width
                    : Math.round(current.width * 100) / 100,
                height:
                  current.height === undefined
                    ? e.height
                    : Math.round(current.height * 100) / 100,
              }
            : e
        )
      )
    dragRef.current = null
    setDrag(null)
    setGuides([])
  }
  const display = (e: CanvasElement) =>
    drag?.ids.includes(e.id)
      ? {
          ...e,
          x: e.x + drag.dx,
          y: e.y + drag.dy,
          width: drag.width ?? e.width,
          height: drag.height ?? e.height,
        }
      : e
  const commitText = () => {
    if (editing)
      onChange(
        elements.map((e) =>
          e.id === editing && !e.locked ? { ...e, text } : e
        )
      )
    setEditing(null)
  }
  return (
    <div className="min-w-0 space-y-2">
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900"
        >
          {error}
        </p>
      )}
      <div
        ref={scroll}
        className="max-h-[65vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-5"
      >
        <svg
          ref={svg}
          data-testid="design-canvas"
          aria-label="Editable document page"
          tabIndex={0}
          role="application"
          viewBox={`0 0 ${w} ${h}`}
          style={{
            width: w * 3.2 * fit * zoom,
            height: h * 3.2 * fit * zoom,
            touchAction: "none",
          }}
          className="mx-auto block shrink-0 bg-white shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          onPointerMove={move}
          onPointerUp={() => finish()}
          onPointerCancel={() => finish(true)}
          onLostPointerCapture={() => finish(true)}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              onSelect([])
              event.currentTarget.focus()
            }
          }}
          onDragOver={(e) => {
            if (canEdit) e.preventDefault()
          }}
          onDrop={(e) => {
            e.preventDefault()
            if (!canEdit) return
            const tool = e.dataTransfer.getData("application/x-em360-component")
            if (tool) {
              const p = point(e.clientX, e.clientY)
              onAdd(tool, p.x, p.y)
            }
          }}
        >
          <rect
            width={w}
            height={h}
            fill={page.background}
            pointerEvents="none"
          />
          <g pointerEvents="none">
            {rendered?.pages[0]?.map((c, i) => (
              <g
                key={i}
                transform={
                  drag?.mode === "move" &&
                  c.elementId &&
                  drag.ids.includes(c.elementId)
                    ? `translate(${drag.dx} ${drag.dy})`
                    : undefined
                }
              >
                <CanvasCommands commands={[c]} />
              </g>
            ))}
          </g>
          <line
            x1={0}
            y1={h - 12}
            x2={w}
            y2={h - 12}
            stroke="#cbd5e1"
            strokeWidth={0.2}
            strokeDasharray="2 2"
            pointerEvents="none"
          />
          {elements.map((item) => {
            const e = display(item),
              active = selected.includes(e.id)
            return (
              <g key={e.id} data-element-id={e.id}>
                <rect
                  aria-label={`Select ${e.label}`}
                  role="button"
                  tabIndex={0}
                  x={e.x}
                  y={e.y}
                  width={e.width}
                  height={e.height}
                  fill="transparent"
                  stroke={active ? "#4f46e5" : "transparent"}
                  strokeWidth={active ? 0.5 : 0}
                  strokeDasharray={e.locked ? "1 1" : undefined}
                  style={{
                    cursor: e.locked ? "default" : canEdit ? "move" : "pointer",
                  }}
                  onPointerDown={(event) => start(event, item)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      onSelect([e.id])
                    }
                  }}
                  onDoubleClick={() => {
                    if (e.type === "text" && canEdit && !e.locked) {
                      setEditing(e.id)
                      setText(e.text)
                    }
                  }}
                />
              </g>
            )
          })}
          {selected.length === 1 &&
            canEdit &&
            !editing &&
            (() => {
              const item = elements.find((e) => e.id === selected[0])
              if (!item || item.locked) return null
              const e = display(item)
              return ["nw", "ne", "sw", "se"].map((handle) => {
                const x = handle.includes("w") ? e.x : e.x + e.width,
                  y = handle.includes("n") ? e.y : e.y + e.height
                return (
                  <rect
                    key={handle}
                    data-resize={handle}
                    aria-label={`Resize ${e.label} ${handle}`}
                    x={x - 1.2}
                    y={y - 1.2}
                    width={2.4}
                    height={2.4}
                    fill="#ffffff"
                    stroke="#4f46e5"
                    strokeWidth={0.5}
                    style={{
                      cursor:
                        handle === "nw" || handle === "se"
                          ? "nwse-resize"
                          : "nesw-resize",
                    }}
                    onPointerDown={(event) => start(event, item, handle)}
                  />
                )
              })
            })()}
          {guides.map((g, i) => (
            <line
              key={i}
              x1={g.axis === "x" ? g.position : 0}
              y1={g.axis === "y" ? g.position : 0}
              x2={g.axis === "x" ? g.position : w}
              y2={g.axis === "y" ? g.position : h}
              stroke="#ec4899"
              strokeWidth={0.3}
              strokeDasharray="1 1"
              pointerEvents="none"
            />
          ))}
          {editing &&
            (() => {
              const e = elements.find((e) => e.id === editing)
              return (
                e && (
                  <foreignObject
                    x={e.x}
                    y={e.y}
                    width={e.width}
                    height={e.height}
                  >
                    <textarea
                      aria-label="Edit text on page"
                      autoFocus
                      value={text}
                      maxLength={1500}
                      style={{
                        fontSize: e.fontSize * mm,
                        width: "100%",
                        height: "100%",
                        resize: "none",
                        border: ".5px solid #4f46e5",
                        padding: e.padding,
                      }}
                      onChange={(event) => setText(event.target.value)}
                      onBlur={commitText}
                      onKeyDown={(event) => {
                        event.stopPropagation()
                        if (event.key === "Escape") setEditing(null)
                        if (
                          event.key === "Enter" &&
                          (event.ctrlKey || event.metaKey)
                        )
                          commitText()
                      }}
                    />
                  </foreignObject>
                )
              )
            })()}
        </svg>
      </div>
      <p className="text-xs text-slate-500">
        Click to select · Shift-click selects multiple · Drag to move · Corner
        handles resize · Double-click text to edit · Hold Alt to bypass snapping
      </p>
      {rendered && rendered.pages.length > 1 && (
        <p className="text-xs text-indigo-700">
          Results continue onto {rendered.pages.length - 1} additional page(s).
          Use Preview to inspect every page.
        </p>
      )}
    </div>
  )
}
const mm = 25.4 / 72
