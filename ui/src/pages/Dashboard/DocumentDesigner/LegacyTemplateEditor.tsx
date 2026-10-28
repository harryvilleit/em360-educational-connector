import { useMemo, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Plus,
  Save,
  Send,
  Trash2,
  Upload,
  RotateCcw,
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
  type DocumentBlock,
  type DocumentLayout,
  type DocumentTemplate,
} from "@/api/schoolDocuments.api"
import { DocumentCanvas, Field, Select, errorMessage, input } from "./shared"
import { fieldNames, resultLabels, sampleData } from "./renderDocument"

const labels: Record<string, string> = {
  header: "School heading",
  identity: "Student details",
  summary: "Academic summary",
  results: "Subject results",
  award: "Recipient and award",
  text: "Custom message",
  signatures: "Authorised signature",
  footer: "Footer message",
}
export default function TemplateEditor({
  initial,
  schoolId,
  canEdit,
  onClose,
  onSaved,
  onUpgrade,
}: {
  initial: DocumentTemplate
  schoolId: string
  canEdit: boolean
  onClose: () => void
  onSaved: () => void
  onUpgrade: (current: DocumentTemplate) => void
}) {
  const [template, setTemplate] = useState(initial),
    [name, setName] = useState(initial.summary.name),
    [layout, setLayout] = useState(() => structuredClone(initial.draft))
  const [tab, setTab] = useState("layout"),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [conflict, setConflict] = useState(false),
    [dragged, setDragged] = useState<string | null>(null)
  const kind = template.summary.kind,
    sample = useMemo(() => sampleData(kind), [kind])
  const change = (patch: Partial<DocumentLayout>) => {
    setLayout((l) => ({ ...l, ...patch }))
    setDirty(true)
  }
  const blockChange = (id: string, patch: Partial<DocumentBlock>) =>
    change({
      blocks: layout.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    })
  const move = (id: string, to: number) => {
    const blocks = [...layout.blocks],
      from = blocks.findIndex((b) => b.id === id)
    if (from < 0 || to < 0 || to >= blocks.length || from === to) return
    const [block] = blocks.splice(from, 1)
    blocks.splice(to, 0, block)
    change({ blocks })
  }
  const close = () => {
    if (
      !busy &&
      (!dirty || window.confirm("Discard your unsaved template changes?"))
    )
      onClose()
  }
  async function action(publish: boolean) {
    setBusy(true)
    try {
      let saved = template
      if (dirty)
        saved = await schoolDocumentApi.save(schoolId, template, name, layout)
      setTemplate(saved)
      setLayout(structuredClone(saved.draft))
      setName(saved.summary.name)
      setDirty(false)
      setConflict(false)
      onSaved()
      if (publish) {
        saved = await schoolDocumentApi.publish(schoolId, saved)
        setTemplate(saved)
        onSaved()
      }
      toast.success(
        publish
          ? "Template published. It is ready to issue documents."
          : "Draft saved. Published documents keep their current design."
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
      !window.confirm(
        "Reload the latest template and discard your unsaved changes?"
      )
    )
      return
    setBusy(true)
    try {
      const latest = await schoolDocumentApi.template(
        schoolId,
        template.summary.id
      )
      setTemplate(latest)
      setLayout(structuredClone(latest.draft))
      setName(latest.summary.name)
      setDirty(false)
      setConflict(false)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  async function upload(
    file: File | undefined,
    key: "logoDataUrl" | "signatureDataUrl"
  ) {
    if (!file) return
    setBusy(true)
    try {
      if (
        !["image/png", "image/jpeg"].includes(file.type) ||
        file.size > 500_000
      )
        throw new Error("Choose a PNG or JPEG image smaller than 500 KB.")
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error("The image could not be read."))
        reader.readAsDataURL(file)
      })
      change({ [key]: url })
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent
        className="max-h-[94vh] overflow-y-auto sm:max-w-6xl"
        onEscapeKeyDown={(e) => {
          if (busy || dirty) e.preventDefault()
        }}
        onInteractOutside={(e) => {
          if (busy || dirty) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {canEdit ? "Design template" : "View template"}
          </DialogTitle>
          <DialogDescription>
            Customise your school document and check the live page preview.
            Sample data is fictional. Published editions and issued documents
            are retained.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-indigo-50 p-3">
          <span className="text-sm font-medium text-indigo-800">
            {template.summary.publishedVersion
              ? `Published edition ${template.summary.publishedVersion}`
              : "Draft template"}
            {dirty ? " · Unsaved changes" : ""}
          </span>
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Button
                variant="outline"
                disabled={busy || dirty}
                onClick={() => onUpgrade(template)}
              >
                Upgrade draft to visual editor
              </Button>
            )}
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void reload()}
            >
              <RotateCcw className="size-4" />
              Reload latest
            </Button>
            {canEdit && (
              <>
                <Button
                  variant="outline"
                  disabled={busy || !dirty || conflict}
                  onClick={() => void action(false)}
                >
                  <Save className="size-4" />
                  Save draft
                </Button>
                <Button
                  disabled={
                    busy || conflict || !name.trim() || !layout.heading.trim()
                  }
                  onClick={() => void action(true)}
                >
                  <Send className="size-4" />
                  Publish template
                </Button>
              </>
            )}
          </div>
        </div>
        {conflict && (
          <div
            role="alert"
            className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
          >
            This template changed. Reload the latest version before saving.
          </div>
        )}
        <div className="grid min-w-0 gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="min-w-0 space-y-4">
            <div
              role="tablist"
              aria-label="Template settings"
              className="flex rounded-xl bg-slate-100 p-1"
            >
              {["layout", "branding", "blocks"].map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize ${tab === t ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <fieldset disabled={busy || !canEdit} className="min-w-0 space-y-4">
              {tab === "layout" && (
                <>
                  <Field
                    label="Template name"
                    value={name}
                    onChange={(v) => {
                      setName(v)
                      setDirty(true)
                    }}
                  />
                  <Select
                    label="Layout style"
                    value={layout.style}
                    onChange={(v) =>
                      change({ style: v as DocumentLayout["style"] })
                    }
                  >
                    <option value="modern">Modern</option>
                    <option value="classic">Classic border</option>
                    <option value="minimal">Minimal</option>
                  </Select>
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Paper size"
                      value={layout.paper}
                      onChange={(v) =>
                        change({ paper: v as DocumentLayout["paper"] })
                      }
                    >
                      <option>A4</option>
                      <option>Letter</option>
                    </Select>
                    <Select
                      label="Orientation"
                      value={layout.orientation}
                      onChange={(v) =>
                        change({
                          orientation: v as DocumentLayout["orientation"],
                        })
                      }
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </Select>
                  </div>
                  <Select
                    label="Document font"
                    value={layout.font}
                    onChange={(v) =>
                      change({ font: v as DocumentLayout["font"] })
                    }
                  >
                    <option value="sans">Sans serif</option>
                    <option value="serif">Serif</option>
                  </Select>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Text size (points)"
                      type="number"
                      min={9}
                      max={14}
                      value={layout.fontSize}
                      onChange={(v) =>
                        change({
                          fontSize: Math.min(14, Math.max(9, Number(v) || 9)),
                        })
                      }
                    />
                    <Field
                      label="Margins (mm)"
                      type="number"
                      min={12}
                      max={24}
                      value={layout.marginMm}
                      onChange={(v) =>
                        change({
                          marginMm: Math.min(24, Math.max(12, Number(v) || 12)),
                        })
                      }
                    />
                  </div>
                  <Select
                    label="Heading alignment"
                    value={layout.alignment}
                    onChange={(v) =>
                      change({ alignment: v as DocumentLayout["alignment"] })
                    }
                  >
                    <option value="left">Left</option>
                    <option value="center">Centre</option>
                  </Select>
                  {kind === "reportCard" && (
                    <fieldset className="rounded-xl border border-slate-200 p-3">
                      <legend className="px-1 text-sm font-medium">
                        Result columns
                      </legend>
                      {Object.entries(resultLabels).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex items-center gap-2 py-1.5 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={layout.resultColumns.includes(key)}
                            disabled={key === "subject" || key === "score"}
                            onChange={(e) =>
                              change({
                                resultColumns: e.target.checked
                                  ? [...layout.resultColumns, key]
                                  : layout.resultColumns.filter(
                                      (c) => c !== key
                                    ),
                              })
                            }
                          />
                          {label}
                        </label>
                      ))}
                    </fieldset>
                  )}
                </>
              )}
              {tab === "branding" && (
                <>
                  <Field
                    label="Document heading"
                    value={layout.heading}
                    maxLength={100}
                    onChange={(v) => change({ heading: v })}
                  />
                  <Field
                    label="Subtitle"
                    value={layout.subtitle}
                    onChange={(v) => change({ subtitle: v })}
                  />
                  <Field
                    label="Accent colour"
                    type="color"
                    value={layout.accentColor}
                    onChange={(v) => change({ accentColor: v })}
                  />
                  <Field
                    label="Footer message"
                    value={layout.footer}
                    multiline
                    maxLength={300}
                    onChange={(v) => change({ footer: v })}
                  />
                  <Field
                    label="Signatory name"
                    value={layout.signatoryName}
                    maxLength={150}
                    onChange={(v) => change({ signatoryName: v })}
                  />
                  <Field
                    label="Signatory title"
                    value={layout.signatoryTitle}
                    maxLength={100}
                    onChange={(v) => change({ signatoryTitle: v })}
                  />
                  {(["logoDataUrl", "signatureDataUrl"] as const).map((key) => (
                    <div
                      key={key}
                      className="space-y-2 rounded-xl border border-dashed border-slate-300 p-3"
                    >
                      <label className="block text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <Upload className="size-4" />
                          {key === "logoDataUrl"
                            ? "School logo"
                            : "Authorised signature"}
                        </span>
                        <input
                          type="file"
                          aria-label={
                            key === "logoDataUrl"
                              ? "Upload school logo"
                              : "Upload authorised signature"
                          }
                          accept="image/png,image/jpeg"
                          className="mt-2 w-full text-xs"
                          onChange={(e) => {
                            void upload(e.target.files?.[0], key)
                            e.target.value = ""
                          }}
                        />
                      </label>
                      <p className="text-xs text-slate-500">
                        PNG or JPEG, up to 500 KB. Use images your school is
                        authorised to publish.
                      </p>
                      {layout[key] && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => change({ [key]: null })}
                        >
                          Remove image
                        </Button>
                      )}
                    </div>
                  ))}
                </>
              )}
              {tab === "blocks" && (
                <>
                  <p className="text-xs text-slate-500">
                    Drag blocks to reorder them, or use the arrow buttons.
                    Required identity and results blocks remain enabled.
                  </p>
                  {layout.blocks.map((b, index) => {
                    const required =
                      kind === "reportCard"
                        ? ["header", "identity", "results"].includes(b.type)
                        : ["header", "award"].includes(b.type)
                    return (
                      <div
                        key={b.id}
                        draggable={canEdit && !busy}
                        onDragStart={() => setDragged(b.id)}
                        onDragEnd={() => setDragged(null)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          if (dragged) move(dragged, index)
                          setDragged(null)
                        }}
                        className="space-y-3 rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="size-4 shrink-0 text-slate-400" />
                          <span className="flex-1 text-sm font-semibold">
                            {labels[b.type]}
                          </span>
                          <button
                            type="button"
                            aria-label={`Move ${labels[b.type]} up`}
                            disabled={index === 0}
                            onClick={() => move(b.id, index - 1)}
                          >
                            <ArrowUp className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Move ${labels[b.type]} down`}
                            disabled={index === layout.blocks.length - 1}
                            onClick={() => move(b.id, index + 1)}
                          >
                            <ArrowDown className="size-4" />
                          </button>
                          {b.type === "text" && (
                            <button
                              type="button"
                              aria-label="Remove message block"
                              onClick={() =>
                                change({
                                  blocks: layout.blocks.filter(
                                    (x) => x.id !== b.id
                                  ),
                                })
                              }
                            >
                              <Trash2 className="size-4 text-red-500" />
                            </button>
                          )}
                        </div>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={b.enabled}
                            disabled={required}
                            onChange={(e) =>
                              blockChange(b.id, { enabled: e.target.checked })
                            }
                          />
                          {required ? "Required block" : "Include this block"}
                        </label>
                        {(b.type === "text" || b.type === "results") && (
                          <Field
                            label={`${labels[b.type]} label`}
                            value={b.label}
                            maxLength={100}
                            onChange={(v) => blockChange(b.id, { label: v })}
                          />
                        )}
                        {b.type === "text" && (
                          <Field
                            label="Message content"
                            value={b.text}
                            multiline
                            maxLength={800}
                            onChange={(v) => blockChange(b.id, { text: v })}
                          />
                        )}
                      </div>
                    )
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={layout.blocks.length >= 12}
                    onClick={() =>
                      change({
                        blocks: [
                          ...layout.blocks,
                          {
                            id: crypto.randomUUID(),
                            type: "text",
                            label: "Message",
                            text: "{{Comment}}",
                            enabled: true,
                          },
                        ],
                      })
                    }
                  >
                    <Plus className="size-4" />
                    Add message block
                  </Button>
                </>
              )}
            </fieldset>
            <details className="rounded-xl bg-slate-50 p-3 text-xs">
              <summary className="cursor-pointer font-medium">
                Available document fields
              </summary>
              <p className="mt-2 leading-relaxed text-slate-500">
                Use these fields in subtitles, messages and footers:
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {fieldNames.map((f) => (
                  <code
                    key={f}
                    className="rounded bg-white px-1.5 py-1"
                  >{`{{${f}}}`}</code>
                ))}
              </div>
            </details>
          </div>
          <div className="min-w-0">
            <DocumentCanvas
              kind={kind}
              layout={layout}
              data={sample}
              download
            />
            <p className="mt-3 text-xs text-slate-500">
              Page breaks and PDF output use the same layout. A sample preview
              cannot issue a document.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
