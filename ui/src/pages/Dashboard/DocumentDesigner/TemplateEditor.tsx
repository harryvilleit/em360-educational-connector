import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  Group,
  LayoutTemplate,
  LockKeyhole,
  Plus,
  Redo2,
  Save,
  Send,
  Trash2,
  Type,
  Undo2,
  UnlockKeyhole,
  Users,
  FileImage,
  Table2,
  PenLine,
  Square,
  Circle,
  Minus,
  UserRound,
  CalendarDays,
  MessageSquareText,
  School,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  schoolDocumentApi,
  type CanvasElement,
  type DocumentData,
  type DocumentLayout,
  type DocumentTemplate,
} from "@/api/schoolDocuments.api"
import { DocumentCanvas, Field, Select, errorMessage } from "./shared"
import { fieldNames, renderDocument, sampleData } from "./renderDocument"
import {
  convertLegacy,
  designWarnings,
  overlapWarnings,
  fitElement,
  gallery,
  makeElement,
  paperSize,
  starter,
  uid,
} from "./canvasModel"
import CanvasStage from "./CanvasStage"
import CanvasProperties from "./CanvasProperties"
import DesignRecordDialog from "./DesignRecordDialog"
import LegacyTemplateEditor from "./LegacyTemplateEditor"

const tools = [
  ["text", "Text"],
  ["logo", "School logo"],
  ["photo", "Student photo"],
  ["results", "Results table"],
  ["attendance", "Attendance"],
  ["comment", "Teacher comment"],
  ["signature", "Signature"],
  ["image", "Image"],
  ["rectangle", "Rectangle"],
  ["ellipse", "Ellipse"],
  ["line", "Line"],
]
const toolIcons: Record<string, LucideIcon> = {
  text: Type,
  logo: School,
  photo: UserRound,
  results: Table2,
  attendance: CalendarDays,
  comment: MessageSquareText,
  signature: PenLine,
  image: FileImage,
  rectangle: Square,
  ellipse: Circle,
  line: Minus,
}
function ComponentIcon({ name }: { name: string }) {
  const Icon = toolIcons[name] ?? Type
  return <Icon className="mb-2 size-5 text-indigo-500" />
}
function ToolButton({
  label,
  children,
  onClick,
  disabled = false,
}: {
  label: string
  children: ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-35"
    >
      {children}
    </button>
  )
}
export default function TemplateEditor({
  initial,
  schoolId,
  canEdit,
  onClose,
  onSaved,
}: {
  initial: DocumentTemplate
  schoolId: string
  canEdit: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [visual, setVisual] = useState(
    initial.draft.schemaVersion === 2 ||
      (canEdit && initial.summary.publishedVersion === 0)
  )
  const [template, setTemplate] = useState(initial),
    [name, setName] = useState(initial.summary.name),
    [layout, setLayout] = useState<DocumentLayout>(() =>
      initial.draft.schemaVersion === 2
        ? structuredClone(initial.draft)
        : convertLegacy(initial.draft, initial.summary.kind)
    ),
    [dirty, setDirty] = useState(
      canEdit &&
        initial.draft.schemaVersion === 1 &&
        initial.summary.publishedVersion === 0
    ),
    [busy, setBusy] = useState(false),
    [conflict, setConflict] = useState(false),
    [pageIndex, setPageIndex] = useState(0),
    [selected, setSelected] = useState<string[]>([]),
    [leftTab, setLeftTab] = useState("tools"),
    [mobilePanel, setMobilePanel] = useState("canvas"),
    [zoom, setZoom] = useState(1),
    [snap, setSnap] = useState(true),
    [preview, setPreview] = useState(false),
    [recordPicker, setRecordPicker] = useState(false),
    [recordData, setRecordData] = useState<DocumentData | null>(null),
    [renderError, setRenderError] = useState<string | null>(null)
  const history = useRef<{ past: DocumentLayout[]; future: DocumentLayout[] }>({
    past: [],
    future: [],
  })
  const kind = template.summary.kind,
    sample = useMemo(() => sampleData(kind), [kind]),
    data = recordData ?? sample
  const [w, h] = paperSize(layout),
    page = layout.pages![pageIndex],
    active = page.elements.find((e) => e.id === selected[0]),
    selection = page.elements.filter((e) => selected.includes(e.id)),
    locked = selection.some((e) => e.locked),
    issues = designWarnings(layout, kind),
    overlapNotes = overlapWarnings(layout)
  const change = (next: DocumentLayout) => {
    if (!canEdit || busy) return
    history.current.past.push(layout)
    if (history.current.past.length > 50) history.current.past.shift()
    history.current.future = []
    setLayout(next)
    setDirty(true)
  }
  const patch = (value: Partial<DocumentLayout>) =>
    change({ ...layout, ...value })
  const elements = (value: CanvasElement[]) =>
    patch({
      pages: layout.pages!.map((p, i) =>
        i === pageIndex ? { ...p, elements: value } : p
      ),
    })
  const travel = (redo = false) => {
    if (busy || !canEdit) return
    const from = redo ? history.current.future : history.current.past,
      to = redo ? history.current.past : history.current.future
    if (!from.length) return
    to.push(layout)
    const next = from.pop()!
    setLayout(next)
    setPageIndex((i) => Math.min(i, next.pages!.length - 1))
    setSelected([])
    setDirty(true)
  }
  const update = (value: Partial<CanvasElement>) => {
    if (!active || active.locked) return
    elements(
      page.elements.map((e) =>
        e.id === active.id ? fitElement({ ...e, ...value }, w, h) : e
      )
    )
  }
  const remove = () => {
    if (!selected.length || locked) return
    elements(page.elements.filter((e) => !selected.includes(e.id)))
    setSelected([])
  }
  const duplicate = () => {
    if (
      !selection.length ||
      locked ||
      layout.pages!.flatMap((p) => p.elements).length + selection.length > 100
    )
      return
    if (selection.some((e) => e.type === "results")) {
      toast.error(
        "Use one results table per page. Duplicate its page to reuse the layout."
      )
      return
    }
    const groups = new Map<string, string>(),
      copies = selection.map((e) => {
        if (e.groupId && !groups.has(e.groupId)) groups.set(e.groupId, uid())
        return fitElement(
          {
            ...structuredClone(e),
            id: uid(),
            label: `${e.label} copy`.slice(0, 100),
            x: e.x + 4,
            y: e.y + 4,
            groupId: e.groupId ? groups.get(e.groupId)! : null,
          },
          w,
          h
        )
      })
    elements([...page.elements, ...copies])
    setSelected(copies.map((e) => e.id))
  }
  const group = () => {
    if (locked || selection.length < 2) return
    const common = selection[0].groupId,
      ungroup = !!common && selection.every((e) => e.groupId === common),
      id = ungroup ? null : uid()
    elements(
      page.elements.map((e) =>
        selected.includes(e.id) ? { ...e, groupId: id } : e
      )
    )
  }
  const align = (direction: string) => {
    if (!selection.length || locked) return
    const minX = Math.min(...selection.map((e) => e.x)),
      maxX = Math.max(...selection.map((e) => e.x + e.width)),
      minY = Math.min(...selection.map((e) => e.y)),
      maxY = Math.max(...selection.map((e) => e.y + e.height))
    elements(
      page.elements.map((e) =>
        !selected.includes(e.id)
          ? e
          : fitElement(
              {
                ...e,
                x:
                  direction === "left"
                    ? selection.length === 1
                      ? 16
                      : minX
                    : direction === "center"
                      ? selection.length === 1
                        ? (w - e.width) / 2
                        : (minX + maxX - e.width) / 2
                      : direction === "right"
                        ? selection.length === 1
                          ? w - 16 - e.width
                          : maxX - e.width
                        : e.x,
                y:
                  direction === "top"
                    ? selection.length === 1
                      ? 16
                      : minY
                    : direction === "bottom"
                      ? selection.length === 1
                        ? h - 28 - e.height
                        : maxY - e.height
                      : e.y,
              },
              w,
              h
            )
      )
    )
  }
  const order = (id: string, direction: number) => {
    const list = [...page.elements],
      from = list.findIndex((e) => e.id === id),
      target = from + direction
    if (target < 0 || target >= list.length || list[from].locked) return
    const [item] = list.splice(from, 1)
    list.splice(target, 0, item)
    elements(list)
  }
  const add = (tool: string, x = 16, y = 40) => {
    if (!canEdit || busy) return
    if (layout.pages!.flatMap((p) => p.elements).length >= 100) {
      toast.error("Use at most 100 components per template.")
      return
    }
    let e = makeElement("text", { x, y })
    if (tool.startsWith("field:"))
      e = { ...e, label: tool.slice(6), text: `{{${tool.slice(6)}}}` }
    if (["logo", "photo", "signature", "image"].includes(tool))
      e = makeElement("image", {
        x,
        y,
        label:
          tool === "photo"
            ? "Student photo"
            : tool === "logo"
              ? "School logo"
              : tool === "signature"
                ? "Signature"
                : "Image",
        imageSource:
          tool === "photo"
            ? "studentPhoto"
            : tool === "image"
              ? "upload"
              : (tool as "logo" | "signature"),
        width: 30,
        height: 25,
      })
    if (["rectangle", "ellipse", "line"].includes(tool))
      e = makeElement("shape", {
        x,
        y,
        label: tool[0].toUpperCase() + tool.slice(1),
        shape: tool as CanvasElement["shape"],
        fill: tool === "line" ? null : "#eef2ff",
        borderColor: "#4338ca",
        height: tool === "line" ? 4 : 30,
        padding: 0,
      })
    if (tool === "results") {
      if (page.elements.some((e) => e.type === "results")) {
        toast.error("This page already contains a results table.")
        return
      }
      e = makeElement("results", {
        x,
        y,
        width: w - 32,
        fontSize: 9,
        borderColor: "#dbe2ed",
        padding: 1.5,
      })
    }
    if (tool === "comment")
      e = {
        ...e,
        label: "Teacher comment",
        text: "Teacher's comment: {{Comment}}",
        width: w - 32,
        height: 24,
        fontSize: 9,
      }
    if (tool === "attendance")
      e = {
        ...e,
        label: "Attendance",
        text: "Recorded days: {{AttendanceRecorded}} · Present: {{AttendancePresent}} · Absent: {{AttendanceAbsent}} · Late: {{AttendanceLate}}",
        width: w - 32,
        height: 18,
        fontSize: 9,
      }
    e = fitElement(e, w, h)
    elements([...page.elements, e])
    setSelected([e.id])
    setMobilePanel("properties")
  }
  async function save(): Promise<DocumentTemplate> {
    if (conflict) throw new Error("Reload the latest template before saving.")
    if (!dirty) return template
    const saved = await schoolDocumentApi.save(schoolId, template, name, layout)
    setTemplate(saved)
    setLayout(structuredClone(saved.draft))
    setName(saved.summary.name)
    setDirty(false)
    setConflict(false)
    onSaved()
    return saved
  }
  async function action(publish = false) {
    setBusy(true)
    try {
      if (publish) {
        if (issues.length) throw new Error(issues[0])
        await renderDocument(
          kind,
          layout,
          data,
          recordData ? "preview" : "sample"
        )
      }
      const saved = await save()
      if (publish) {
        setTemplate(await schoolDocumentApi.publish(schoolId, saved))
        onSaved()
      }
      toast.success(
        publish
          ? "Template published. It is ready to issue documents."
          : "Draft saved."
      )
    } catch (e) {
      toast.error(errorMessage(e))
      if ((e as { status?: number }).status === 409) setConflict(true)
    } finally {
      setBusy(false)
    }
  }
  async function reload() {
    if (
      dirty &&
      !window.confirm("Discard unsaved changes and reload the latest template?")
    )
      return
    setBusy(true)
    try {
      const t = await schoolDocumentApi.template(schoolId, template.summary.id)
      setTemplate(t)
      setName(t.summary.name)
      setLayout(
        t.draft.schemaVersion === 2
          ? structuredClone(t.draft)
          : convertLegacy(t.draft, kind)
      )
      setDirty(t.draft.schemaVersion === 1)
      setConflict(false)
      setSelected([])
      setPageIndex(0)
      history.current = { past: [], future: [] }
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  async function upload(
    file: File | undefined,
    source: CanvasElement["imageSource"]
  ) {
    if (!file || !active || !canEdit || active.locked || busy) return
    try {
      if (
        !["image/png", "image/jpeg"].includes(file.type) ||
        file.size > 500_000
      )
        throw new Error("Choose a PNG or JPEG smaller than 500 KB.")
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error("The image could not be read."))
        reader.readAsDataURL(file)
      })
      if (source === "logo") patch({ logoDataUrl: url })
      else if (source === "signature") patch({ signatureDataUrl: url })
      else update({ imageDataUrl: url })
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }
  const close = () => {
    if (
      !busy &&
      (!dirty || window.confirm("Discard your unsaved template changes?"))
    )
      onClose()
  }
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", guard)
    return () => window.removeEventListener("beforeunload", guard)
  }, [dirty])
  const onError = useCallback(
    (value: string | null) => setRenderError(value),
    []
  )
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
      target.isContentEditable ||
      busy ||
      !canEdit
    )
      return
    const command = event.ctrlKey || event.metaKey,
      key = event.key.toLowerCase()
    if (command && key === "z") {
      event.preventDefault()
      travel(event.shiftKey)
      return
    }
    if (command && key === "y") {
      event.preventDefault()
      travel(true)
      return
    }
    if (command && key === "d") {
      event.preventDefault()
      duplicate()
      return
    }
    if (command && key === "s") {
      event.preventDefault()
      void action()
      return
    }
    if (command && key === "a") {
      event.preventDefault()
      setSelected(page.elements.map((e) => e.id))
      return
    }
    if (command && key === "g") {
      event.preventDefault()
      group()
      return
    }
    if (key === "delete" || key === "backspace") {
      event.preventDefault()
      remove()
      return
    }
    if (
      selected.length &&
      !locked &&
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    ) {
      event.preventDefault()
      const delta = event.shiftKey ? 5 : 1
      const dx =
          event.key === "ArrowLeft"
            ? -delta
            : event.key === "ArrowRight"
              ? delta
              : 0,
        dy =
          event.key === "ArrowUp"
            ? -delta
            : event.key === "ArrowDown"
              ? delta
              : 0
      if (
        selection.every(
          (e) =>
            e.x + dx >= 0 &&
            e.x + e.width + dx <= w &&
            e.y + dy >= 0 &&
            e.y + e.height + dy <= h - 12
        )
      )
        elements(
          page.elements.map((e) =>
            selected.includes(e.id) ? { ...e, x: e.x + dx, y: e.y + dy } : e
          )
        )
    }
  }
  if (!visual)
    return (
      <LegacyTemplateEditor
        initial={initial}
        schoolId={schoolId}
        canEdit={canEdit}
        onClose={onClose}
        onSaved={onSaved}
        onUpgrade={(current) => {
          setTemplate(current)
          setName(current.summary.name)
          setLayout(convertLegacy(current.draft, kind))
          setVisual(true)
          setDirty(true)
        }}
      />
    )
  const toolbox = (
    <div className="space-y-4">
      <div className="flex rounded-xl bg-slate-100 p-1">
        {[
          ["tools", "Add"],
          ["templates", "Layouts"],
          ["layers", "Layers"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`flex-1 rounded-lg py-2 text-xs font-semibold ${leftTab === id ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}
            onClick={() => setLeftTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {leftTab === "tools" && (
        <fieldset disabled={!canEdit || busy} className="space-y-4">
          <p className="text-xs text-slate-500">
            Drag onto the page or click to add.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {tools
              .filter(
                ([id]) =>
                  kind === "reportCard" ||
                  !["results", "attendance"].includes(id)
              )
              .map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  draggable={canEdit && !busy}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/x-em360-component", id)
                    e.dataTransfer.effectAllowed = "copy"
                  }}
                  onClick={() => add(id)}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <ComponentIcon name={id} />
                  <span className="block text-xs font-semibold">{label}</span>
                </button>
              ))}
          </div>
          <Select
            label="Add school or student field"
            value=""
            onChange={(v) => {
              if (v) add(`field:${v}`)
            }}
          >
            <option value="">Choose a data field…</option>
            {fieldNames
              .filter(
                (f) => kind === "reportCard" || !f.startsWith("Attendance")
              )
              .map((f) => (
                <option key={f}>{f}</option>
              ))}
          </Select>
        </fieldset>
      )}
      {leftTab === "templates" && (
        <fieldset disabled={!canEdit || busy} className="space-y-3">
          {gallery
            .filter(
              (g) =>
                g.id === "blank" ||
                (kind === "reportCard"
                  ? g.id !== "certificate"
                  : g.id === "certificate")
            )
            .map((g) => (
              <button
                key={g.id}
                type="button"
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-indigo-300"
                onClick={() => {
                  if (
                    page.elements.length &&
                    !window.confirm(
                      "Replace this draft layout? You can undo this change. Published editions are retained."
                    )
                  )
                    return
                  change(starter(layout, kind, g.id))
                  setPageIndex(0)
                  setSelected([])
                  setLeftTab("tools")
                  setMobilePanel("canvas")
                }}
              >
                <div
                  className={`mb-3 flex h-16 items-center justify-center rounded-lg ${g.id === "primary" ? "bg-teal-50 text-teal-600" : g.id === "certificate" ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-indigo-600"}`}
                >
                  <LayoutTemplate className="size-8" />
                </div>
                <span className="block text-sm font-semibold">{g.name}</span>
                <span className="mt-1 block text-xs text-slate-500">
                  {g.detail}
                </span>
              </button>
            ))}
        </fieldset>
      )}
      {leftTab === "layers" && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            Top items appear in front. Groups move together.
          </p>
          {[...page.elements].reverse().map((e, i) => (
            <div
              key={e.id}
              className={`rounded-xl border p-2 ${selected.includes(e.id) ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}
            >
              <button
                type="button"
                className="w-full text-left text-xs font-semibold"
                onClick={() => {
                  setSelected(
                    e.groupId
                      ? page.elements
                          .filter((x) => x.groupId === e.groupId)
                          .map((x) => x.id)
                      : [e.id]
                  )
                  setMobilePanel("properties")
                }}
              >
                {e.label || e.type}
                {e.groupId ? " · Group" : ""}
              </button>
              <div className="mt-2 flex items-center gap-1">
                <ToolButton
                  label={`${e.locked ? "Unlock" : "Lock"} ${e.label}`}
                  disabled={!canEdit || busy}
                  onClick={() =>
                    elements(
                      page.elements.map((x) =>
                        x.id === e.id ? { ...x, locked: !x.locked } : x
                      )
                    )
                  }
                >
                  {e.locked ? (
                    <LockKeyhole className="size-3" />
                  ) : (
                    <UnlockKeyhole className="size-3" />
                  )}
                </ToolButton>
                <ToolButton
                  label={`Bring ${e.label} forward`}
                  disabled={!canEdit || busy || e.locked || i === 0}
                  onClick={() => order(e.id, 1)}
                >
                  <ArrowUp className="size-3" />
                </ToolButton>
                <ToolButton
                  label={`Send ${e.label} backward`}
                  disabled={
                    !canEdit ||
                    busy ||
                    e.locked ||
                    i === page.elements.length - 1
                  }
                  onClick={() => order(e.id, -1)}
                >
                  <ArrowDown className="size-3" />
                </ToolButton>
              </div>
            </div>
          ))}
          {!page.elements.length && (
            <p className="py-8 text-center text-sm text-slate-500">
              Your page is empty. Add a component.
            </p>
          )}
        </div>
      )}
    </div>
  )
  const properties = (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">
        {selected.length > 1
          ? `${selected.length} components selected`
          : active
            ? "Component properties"
            : "Page settings"}
      </h3>
      {active && selected.length === 1 ? (
        <CanvasProperties
          element={active}
          layout={layout}
          kind={kind}
          data={data}
          disabled={!canEdit || busy}
          update={update}
          changeLayout={patch}
          upload={(file, source) => void upload(file, source)}
        />
      ) : selected.length > 1 ? (
        <p className="text-xs text-slate-500">
          Use the toolbar to align, group, duplicate or remove components.
          Select one to edit its properties.
        </p>
      ) : (
        <fieldset disabled={!canEdit || busy} className="space-y-4">
          <Field
            label="Template name"
            value={name}
            maxLength={200}
            onChange={(v) => {
              setName(v)
              setDirty(true)
            }}
          />
          <Select
            label="Paper size"
            value={layout.paper}
            onChange={(v) => patch({ paper: v as DocumentLayout["paper"] })}
          >
            <option>A4</option>
            <option>Letter</option>
          </Select>
          <Select
            label="Orientation"
            value={layout.orientation}
            onChange={(v) =>
              patch({ orientation: v as DocumentLayout["orientation"] })
            }
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </Select>
          <p className="text-xs text-slate-500">
            After changing paper size, reposition components that extend outside
            the new page.
          </p>
          <Field
            label="Page background"
            type="color"
            value={page.background}
            onChange={(background) =>
              patch({
                pages: layout.pages!.map((p, i) =>
                  i === pageIndex ? { ...p, background } : p
                ),
              })
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              elements(page.elements.map((e) => fitElement(e, w, h)))
              toast.success(
                "Components fitted inside the page. Review spacing and overlaps."
              )
            }}
          >
            Fit components inside page
          </Button>
          <Field
            label="Document title for PDF"
            value={layout.heading}
            maxLength={100}
            onChange={(v) => patch({ heading: v })}
          />
        </fieldset>
      )}
    </div>
  )
  const editDisabled = !canEdit || busy || !selection.length || locked
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent
        className="flex max-h-[96vh] w-[98vw] max-w-[98vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[98vw]"
        onKeyDown={keyboard}
        onEscapeKeyDown={(e) => {
          if (busy || dirty) e.preventDefault()
        }}
        onInteractOutside={(e) => {
          if (busy || dirty) e.preventDefault()
        }}
      >
        <DialogHeader className="border-b border-slate-200 px-5 py-4 pr-12">
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="size-5 text-indigo-600" />
            {canEdit ? "Visual Document Designer" : "View document design"}
          </DialogTitle>
          <DialogDescription>
            {name} ·{" "}
            {template.summary.publishedVersion
              ? `Published edition ${template.summary.publishedVersion}`
              : "Draft"}{" "}
            · {dirty ? "Unsaved changes" : "Saved"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-1">
            <ToolButton
              label="Undo"
              disabled={!canEdit || busy || !history.current.past.length}
              onClick={() => travel()}
            >
              <Undo2 className="size-4" />
            </ToolButton>
            <ToolButton
              label="Redo"
              disabled={!canEdit || busy || !history.current.future.length}
              onClick={() => travel(true)}
            >
              <Redo2 className="size-4" />
            </ToolButton>
            <span className="mx-1 h-6 border-l" />
            <ToolButton
              label="Duplicate selection"
              disabled={editDisabled}
              onClick={duplicate}
            >
              <Copy className="size-4" />
            </ToolButton>
            <ToolButton
              label="Group or ungroup selection"
              disabled={editDisabled || selection.length < 2}
              onClick={group}
            >
              <Group className="size-4" />
            </ToolButton>
            <ToolButton
              label="Delete selection"
              disabled={editDisabled}
              onClick={remove}
            >
              <Trash2 className="size-4" />
            </ToolButton>
            <span className="mx-1 h-6 border-l" />
            <ToolButton
              label="Align left"
              disabled={editDisabled}
              onClick={() => align("left")}
            >
              <AlignLeft className="size-4" />
            </ToolButton>
            <ToolButton
              label="Align centre"
              disabled={editDisabled}
              onClick={() => align("center")}
            >
              <AlignCenter className="size-4" />
            </ToolButton>
            <ToolButton
              label="Align right"
              disabled={editDisabled}
              onClick={() => align("right")}
            >
              <AlignRight className="size-4" />
            </ToolButton>
            <ToolButton
              label="Align top"
              disabled={editDisabled}
              onClick={() => align("top")}
            >
              <ArrowUp className="size-4" />
            </ToolButton>
            <ToolButton
              label="Align bottom"
              disabled={editDisabled}
              onClick={() => align("bottom")}
            >
              <ArrowDown className="size-4" />
            </ToolButton>
            <label className="ml-2 flex items-center gap-1 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={snap}
                onChange={(e) => setSnap(e.target.checked)}
              />
              Snap
            </label>
            <select
              aria-label="Canvas zoom"
              value={zoom}
              className="ml-2 rounded-lg border border-slate-200 bg-white p-2 text-xs"
              onChange={(e) => setZoom(Number(e.target.value))}
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((z) => (
                <option key={z} value={z}>
                  {z === 1 ? "Fit width" : `${z * 100}%`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => setRecordPicker(true)}
            >
              <Users className="size-4" />
              School record
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreview(true)}
            >
              <Eye className="size-4" />
              Preview
            </Button>
            {canEdit && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy || !dirty || conflict || !name.trim()}
                  onClick={() => void action()}
                >
                  <Save className="size-4" />
                  Save draft
                </Button>
                <Button
                  size="sm"
                  disabled={
                    busy ||
                    conflict ||
                    issues.length > 0 ||
                    !!renderError ||
                    !name.trim()
                  }
                  onClick={() => void action(true)}
                >
                  <Send className="size-4" />
                  Publish
                </Button>
              </>
            )}
          </div>
        </div>
        {conflict && (
          <div
            role="alert"
            className="flex items-center justify-between bg-amber-50 px-5 py-2 text-sm text-amber-900"
          >
            This template changed. Reload before saving.
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => void reload()}
            >
              Reload latest
            </Button>
          </div>
        )}
        {initial.draft.schemaVersion === 1 && dirty && (
          <p className="bg-indigo-50 px-5 py-2 text-xs text-indigo-800">
            This draft has been converted to editable components. Review its
            pages, then save. Published editions and issued documents retain
            their saved designs.
          </p>
        )}
        <div className="flex gap-2 border-b p-2 xl:hidden">
          {["tools", "canvas", "properties"].map((t) => (
            <button
              key={t}
              type="button"
              className={`flex-1 rounded-lg p-2 text-xs font-semibold capitalize ${mobilePanel === t ? "bg-indigo-50 text-indigo-700" : "text-slate-500"}`}
              onClick={() => setMobilePanel(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid min-h-0 min-w-0 flex-1 gap-0 overflow-y-auto xl:grid-cols-[240px_minmax(0,1fr)_280px]">
          <aside
            aria-label="Component toolbox"
            className={`border-r border-slate-200 bg-white p-4 xl:max-h-[68vh] xl:overflow-y-auto ${mobilePanel === "tools" ? "block" : "hidden"} xl:block`}
          >
            {toolbox}
          </aside>
          <main
            className={`min-w-0 space-y-3 bg-slate-50 p-4 ${mobilePanel === "canvas" ? "block" : "hidden"} xl:block`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {layout.pages!.map((p, i) => (
                  <button
                    type="button"
                    key={p.id}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold ${pageIndex === i ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "bg-white text-slate-500"}`}
                    onClick={() => {
                      setPageIndex(i)
                      setSelected([])
                    }}
                  >
                    Page {i + 1}
                  </button>
                ))}
                <ToolButton
                  label="Add page"
                  disabled={!canEdit || busy || layout.pages!.length >= 10}
                  onClick={() => {
                    patch({
                      pages: [
                        ...layout.pages!,
                        { id: uid(), background: "#ffffff", elements: [] },
                      ],
                    })
                    setPageIndex(layout.pages!.length)
                    setSelected([])
                  }}
                >
                  <Plus className="size-4" />
                </ToolButton>
              </div>
              <div className="flex gap-1">
                <ToolButton
                  label="Duplicate page"
                  disabled={
                    !canEdit ||
                    busy ||
                    layout.pages!.length >= 10 ||
                    layout.pages!.flatMap((p) => p.elements).length +
                      page.elements.length >
                      100
                  }
                  onClick={() => {
                    const groups = new Map<string, string>(),
                      copy = structuredClone(page)
                    copy.id = uid()
                    copy.elements = copy.elements.map((e) => {
                      if (e.groupId && !groups.has(e.groupId))
                        groups.set(e.groupId, uid())
                      return {
                        ...e,
                        id: uid(),
                        groupId: e.groupId ? groups.get(e.groupId)! : null,
                      }
                    })
                    patch({ pages: [...layout.pages!, copy] })
                    setPageIndex(layout.pages!.length)
                    setSelected([])
                  }}
                >
                  <Copy className="size-4" />
                </ToolButton>
                <ToolButton
                  label="Delete page"
                  disabled={!canEdit || busy || layout.pages!.length <= 1}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Remove this page from the draft? You can undo this change."
                      )
                    ) {
                      patch({
                        pages: layout.pages!.filter((_, i) => i !== pageIndex),
                      })
                      setPageIndex(Math.max(0, pageIndex - 1))
                      setSelected([])
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                </ToolButton>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {layout.paper} · {layout.orientation} ·{" "}
                {recordData
                  ? `Preview: ${recordData.recipientName}`
                  : "Fictional sample data"}
              </span>
              {recordData && (
                <button
                  className="text-indigo-700 underline"
                  onClick={() => setRecordData(null)}
                >
                  Use sample data
                </button>
              )}
            </div>
            <CanvasStage
              key={page.id}
              layout={layout}
              pageIndex={pageIndex}
              kind={kind}
              data={data}
              selected={selected}
              onSelect={setSelected}
              onChange={elements}
              onAdd={add}
              canEdit={canEdit && !busy}
              zoom={zoom}
              snap={snap}
              onError={onError}
            />
            {overlapNotes.length > 0 && (
              <details className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
                <summary className="cursor-pointer font-semibold">
                  Check {overlapNotes.length} overlapping component(s)
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {overlapNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </details>
            )}
            {issues.length > 0 && (
              <details className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <summary className="cursor-pointer font-semibold">
                  {issues.length} design check(s) to resolve before publishing
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </details>
            )}
          </main>
          <aside
            aria-label="Design properties"
            className={`border-l border-slate-200 bg-white p-4 xl:max-h-[68vh] xl:overflow-y-auto ${mobilePanel === "properties" ? "block" : "hidden"} xl:block`}
          >
            {properties}
          </aside>
        </div>
        {preview && (
          <Dialog open onOpenChange={setPreview}>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Document preview</DialogTitle>
                <DialogDescription>
                  {recordData
                    ? `School record: ${recordData.recipientName}`
                    : "Fictional sample data"}
                  . Review every page before publishing or issuing.
                </DialogDescription>
              </DialogHeader>
              <DocumentCanvas
                kind={kind}
                layout={layout}
                data={data}
                status={recordData ? "preview" : "sample"}
                download
              />
            </DialogContent>
          </Dialog>
        )}
        {recordPicker && (
          <DesignRecordDialog
            template={template}
            schoolId={schoolId}
            canEdit={canEdit}
            prepare={async () => {
              setBusy(true)
              try {
                return await save()
              } catch (e) {
                if ((e as { status?: number }).status === 409) setConflict(true)
                throw e
              } finally {
                setBusy(false)
              }
            }}
            onClose={() => setRecordPicker(false)}
            onLoaded={(value) => {
              setRecordData(value)
              setMobilePanel("canvas")
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
