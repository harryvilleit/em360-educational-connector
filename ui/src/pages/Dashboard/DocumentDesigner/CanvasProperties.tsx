import { useState } from "react"
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react"
import type {
  CanvasElement,
  DocumentData,
  DocumentKind,
  DocumentLayout,
  TableColumn,
} from "@/api/schoolDocuments.api"
import { Button } from "@/components/ui/button"
import { Field, Select } from "./shared"
import { fieldNames, resultLabels } from "./renderDocument"

export default function CanvasProperties({
  element: e,
  layout,
  kind,
  data,
  update,
  changeLayout,
  upload,
  disabled,
}: {
  element: CanvasElement
  layout: DocumentLayout
  kind: DocumentKind
  data: DocumentData
  update: (patch: Partial<CanvasElement>) => void
  changeLayout: (patch: Partial<DocumentLayout>) => void
  upload: (file: File | undefined, source: CanvasElement["imageSource"]) => void
  disabled: boolean
}) {
  const [assessmentName, setAssessmentName] = useState("")
  const number = (
    key: keyof CanvasElement,
    value: string,
    min: number,
    max: number
  ) => update({ [key]: Math.max(min, Math.min(max, Number(value) || min)) })
  const changeColumn = (index: number, patch: Partial<TableColumn>) =>
    update({
      columns: e.columns.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    })
  const moveColumn = (index: number, direction: number) => {
    const columns = [...e.columns],
      target = index + direction
    if (target < 0 || target >= columns.length) return
    const [c] = columns.splice(index, 1)
    columns.splice(target, 0, c)
    update({ columns })
  }
  const assessments = [
    ...new Set(
      data.results.flatMap((r) => r.assessmentScores?.map((a) => a.name) ?? [])
    ),
  ]
  const tableKeys = {
    ...resultLabels,
    ...Object.fromEntries(assessments.map((a) => [`assessment:${a}`, a])),
  }
  return (
    <fieldset disabled={disabled || e.locked} className="min-w-0 space-y-4">
      {e.locked && (
        <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
          Unlock this component in Layers to edit it.
        </p>
      )}
      <Field
        label="Component name"
        value={e.label}
        maxLength={100}
        onChange={(v) => update({ label: v })}
      />
      <div className="grid grid-cols-2 gap-2">
        <Field
          label="X (mm)"
          type="number"
          value={e.x}
          min={0}
          onChange={(v) => number("x", v, 0, 297)}
        />
        <Field
          label="Y (mm)"
          type="number"
          value={e.y}
          min={0}
          onChange={(v) => number("y", v, 0, 297)}
        />
        <Field
          label="Width (mm)"
          type="number"
          value={e.width}
          min={4}
          onChange={(v) => number("width", v, 4, 297)}
        />
        <Field
          label="Height (mm)"
          type="number"
          value={e.height}
          min={4}
          onChange={(v) => number("height", v, 4, 297)}
        />
      </div>
      {e.type === "text" && (
        <>
          <Field
            label="Text and data fields"
            multiline
            value={e.text}
            maxLength={1500}
            onChange={(v) => update({ text: v })}
          />
          <Select
            label="Insert data field"
            value=""
            onChange={(v) => {
              if (v) update({ text: e.text + `{{${v}}}` })
            }}
          >
            <option value="">Choose a field…</option>
            {fieldNames
              .filter(
                (f) => kind === "reportCard" || !f.startsWith("Attendance")
              )
              .map((f) => (
                <option key={f}>{f}</option>
              ))}
          </Select>
          <p className="text-xs text-slate-500">
            Fields fill from authorised records. Editing the layout cannot
            change student scores.
          </p>
        </>
      )}
      {e.type === "image" && (
        <>
          <Select
            label="Image source"
            value={e.imageSource}
            onChange={(v) =>
              update({ imageSource: v as CanvasElement["imageSource"] })
            }
          >
            <option value="upload">Uploaded image</option>
            <option value="logo">School logo</option>
            <option value="signature">Signature</option>
            <option value="studentPhoto">Student record photo</option>
          </Select>
          {e.imageSource === "studentPhoto" ? (
            <p className="text-xs text-slate-500">
              Loads the selected student's stored EM360 photo. No photo is shown
              when the record has none. Photos are saved with issued documents.
            </p>
          ) : (
            <>
              <label className="block text-sm font-medium">
                Upload PNG or JPEG
                <input
                  aria-label={`Upload ${e.label}`}
                  className="mt-2 block w-full text-xs"
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(event) => {
                    upload(event.target.files?.[0], e.imageSource)
                    event.target.value = ""
                  }}
                />
              </label>
              <p className="text-xs text-slate-500">
                Up to 500 KB. Images fit inside the box without stretching.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  e.imageSource === "logo"
                    ? changeLayout({ logoDataUrl: null })
                    : e.imageSource === "signature"
                      ? changeLayout({ signatureDataUrl: null })
                      : update({ imageDataUrl: null })
                }
              >
                Remove image
              </Button>
            </>
          )}
        </>
      )}
      {e.type === "shape" && (
        <Select
          label="Shape"
          value={e.shape}
          onChange={(v) => update({ shape: v as CanvasElement["shape"] })}
        >
          <option value="rectangle">Rectangle</option>
          <option value="ellipse">Ellipse</option>
          <option value="line">Line</option>
        </Select>
      )}
      {(e.type === "text" || e.type === "results") && (
        <>
          <Select
            label="Font family"
            value={e.font}
            onChange={(v) => update({ font: v as CanvasElement["font"] })}
          >
            <option value="sans">Sans serif</option>
            <option value="serif">Serif</option>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Font size (pt)"
              type="number"
              min={6}
              max={48}
              value={e.fontSize}
              onChange={(v) => number("fontSize", v, 6, 48)}
            />
            <Field
              label="Line spacing"
              type="number"
              min={1}
              max={2.5}
              value={e.lineHeight}
              onChange={(v) => number("lineHeight", v, 1, 2.5)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={e.bold}
              onChange={(event) => update({ bold: event.target.checked })}
            />
            Bold text
          </label>
          <Field
            label="Text colour"
            type="color"
            value={e.color}
            onChange={(v) => update({ color: v })}
          />
          <Select
            label="Text alignment"
            value={e.align}
            onChange={(v) =>
              update({
                align: v as CanvasElement["align"],
                ...(e.type === "results"
                  ? {
                      columns: e.columns.map((c) => ({
                        ...c,
                        align: v as TableColumn["align"],
                      })),
                    }
                  : {}),
              })
            }
          >
            <option value="left">Left</option>
            <option value="center">Centre</option>
            <option value="right">Right</option>
          </Select>
        </>
      )}
      <Field
        label="Padding (mm)"
        type="number"
        min={0}
        max={10}
        value={e.padding}
        onChange={(v) =>
          number(
            "padding",
            v,
            0,
            Math.min(10, (Math.min(e.width, e.height) - 0.1) / 2)
          )
        }
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!e.fill}
          onChange={(event) =>
            update({ fill: event.target.checked ? "#eef2ff" : null })
          }
        />
        Background fill
      </label>
      {e.fill && (
        <Field
          label="Fill colour"
          type="color"
          value={e.fill}
          onChange={(v) => update({ fill: v })}
        />
      )}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!e.borderColor}
          onChange={(event) =>
            update({ borderColor: event.target.checked ? "#cbd5e1" : null })
          }
        />
        Border
      </label>
      {e.borderColor && (
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Border colour"
            type="color"
            value={e.borderColor}
            onChange={(v) => update({ borderColor: v })}
          />
          <Field
            label="Border (mm)"
            type="number"
            min={0}
            max={3}
            value={e.borderWidth}
            onChange={(v) => number("borderWidth", v, 0, 3)}
          />
        </div>
      )}
      {e.type !== "results" && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={e.repeat}
            onChange={(event) => update({ repeat: event.target.checked })}
          />
          Repeat on table continuation pages
        </label>
      )}
      {e.type === "results" && (
        <>
          <h3 className="border-t pt-4 text-sm font-semibold">Results table</h3>
          <p className="text-xs text-slate-500">
            The box reserves space for results. Overflow continues on new pages
            with repeated headers. Named assessments show score / maximum; a
            missing assessment shows —.
          </p>
          <Field
            label="Minimum row height (mm)"
            type="number"
            min={6}
            max={25}
            value={e.rowHeight}
            onChange={(v) => number("rowHeight", v, 6, 25)}
          />
          <Field
            label="Header background"
            type="color"
            value={e.headerFill}
            onChange={(v) => update({ headerFill: v })}
          />
          <Field
            label="Header text"
            type="color"
            value={e.headerColor}
            onChange={(v) => update({ headerColor: v })}
          />
          <Field
            label="Alternate row fill"
            type="color"
            value={e.alternateFill}
            onChange={(v) => update({ alternateFill: v })}
          />
          {e.columns.map((c, i) => (
            <div
              key={c.key}
              className="space-y-2 rounded-xl border border-slate-200 p-3"
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>{tableKeys[c.key] ?? c.key.slice(11)}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label={`Move ${c.label} column up`}
                    disabled={i === 0}
                    onClick={() => moveColumn(i, -1)}
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${c.label} column down`}
                    disabled={i === e.columns.length - 1}
                    onClick={() => moveColumn(i, 1)}
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${c.label} column`}
                    disabled={["subject", "score"].includes(c.key)}
                    onClick={() =>
                      update({ columns: e.columns.filter((_, n) => n !== i) })
                    }
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <Field
                label={`Heading for ${c.key}`}
                value={c.label}
                maxLength={80}
                onChange={(v) => changeColumn(i, { label: v })}
              />
              <Field
                label={`Width weight for ${c.key}`}
                type="number"
                min={0.5}
                max={10}
                value={c.weight}
                onChange={(v) =>
                  changeColumn(i, {
                    weight: Math.max(0.5, Math.min(10, Number(v) || 0.5)),
                  })
                }
              />
              <Select
                label={`Alignment for ${c.key}`}
                value={c.align}
                onChange={(v) =>
                  changeColumn(i, { align: v as TableColumn["align"] })
                }
              >
                <option value="left">Left</option>
                <option value="center">Centre</option>
                <option value="right">Right</option>
              </Select>
            </div>
          ))}
          <Select
            label="Add results column"
            value=""
            disabled={e.columns.length >= 12}
            onChange={(key) => {
              if (key)
                update({
                  columns: [
                    ...e.columns,
                    { key, label: tableKeys[key], weight: 1, align: "left" },
                  ],
                })
            }}
          >
            <option value="">Choose a column…</option>
            {Object.entries(tableKeys)
              .filter(([key]) => !e.columns.some((c) => c.key === key))
              .map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
          </Select>
          <Field
            label="Named assessment column"
            value={assessmentName}
            maxLength={100}
            onChange={setAssessmentName}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={
              !assessmentName.trim() ||
              e.columns.length >= 12 ||
              e.columns.some(
                (c) => c.key === `assessment:${assessmentName.trim()}`
              )
            }
            onClick={() => {
              const name = assessmentName.trim()
              update({
                columns: [
                  ...e.columns,
                  {
                    key: `assessment:${name}`,
                    label: name,
                    weight: 1,
                    align: "center",
                  },
                ],
              })
              setAssessmentName("")
            }}
          >
            Add named assessment
          </Button>
          <p className="text-xs text-slate-500">
            Use the exact assessment name recorded by your school.
          </p>
        </>
      )}
      <span className="sr-only">{layout.paper}</span>
    </fieldset>
  )
}
