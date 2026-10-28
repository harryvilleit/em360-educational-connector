import { useMemo, useRef, useState, type ChangeEvent } from "react"
import { Plus, RotateCcw, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ReportCard from "@/components/report-card/ReportCard"
import {
  DEFAULT_REPORT_CARD_CONFIG,
  MAX_SIGNATORIES,
  type ReportCardConfig,
} from "@/components/report-card/config"
import { sampleReportCardData } from "@/components/report-card/sampleData"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useSchoolCardBranding } from "@/hooks/useSchoolCardBranding"
import {
  useReportCardConfig,
  useReportCardConfigStore,
} from "@/store/reportCardConfig.store"

const ACCENT_PRESETS = [
  "#1d4ed8",
  "#0f766e",
  "#15803d",
  "#b45309",
  "#be123c",
  "#7e22ce",
  "#0f172a",
]
const MAX_LOGO_BYTES = 2 * 1024 * 1024
const LOGO_SIZE_PX = 256

// Downscale so the saved logo stays small enough for local storage
function readLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(
        1,
        LOGO_SIZE_PX / Math.max(image.width, image.height)
      )
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext("2d")
      URL.revokeObjectURL(url)
      if (!context) return reject(new Error("Could not read this image."))
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/png"))
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Could not read this image."))
    }
    image.src = url
  })
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-blue-600"
      />
      {label}
    </label>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3 rounded-xl border bg-white p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Field({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      {children}
    </div>
  )
}

export default function ReportCardSettings() {
  const schoolId = useSchoolId()
  const saved = useReportCardConfig(schoolId)
  const setConfig = useReportCardConfigStore((s) => s.setConfig)
  const resetConfig = useReportCardConfigStore((s) => s.resetConfig)
  const { branding, isLoading } = useSchoolCardBranding(schoolId, {
    enabled: true,
    contactEnabled: true,
  })

  const [draft, setDraft] = useState<ReportCardConfig>(saved)
  const fileInput = useRef<HTMLInputElement>(null)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  const sample = useMemo(
    () =>
      sampleReportCardData({
        name: branding?.schoolName ?? "Your School Name",
        logo: branding?.schoolLogo,
        phone: branding?.schoolPhone || "08000000000",
        email: branding?.schoolEmail || "info@yourschool.com",
        address: branding?.schoolAddress || "School address",
      }),
    [branding]
  )

  function update<K extends keyof ReportCardConfig>(
    key: K,
    value: ReportCardConfig[K]
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function updateSignatory(id: string, field: "label" | "name", value: string) {
    update(
      "signatories",
      draft.signatories.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  function addSignatory() {
    if (draft.signatories.length >= MAX_SIGNATORIES) return
    update("signatories", [
      ...draft.signatories,
      { id: crypto.randomUUID(), label: "Signatory", name: "" },
    ])
  }

  async function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file (PNG, JPG or SVG).")
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Choose an image smaller than 2 MB.")
      return
    }
    try {
      const customLogo = await readLogo(file)
      setDraft((current) => ({ ...current, customLogo, logoMode: "custom" }))
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not read this image."
      )
    }
  }

  function save() {
    if (draft.logoMode === "custom" && !draft.customLogo) {
      toast.error("Upload a logo, or switch to the school logo.")
      return
    }
    setConfig(schoolId, draft)
    toast.success("Report card design saved in this browser.")
  }

  function reset() {
    resetConfig(schoolId)
    setDraft(DEFAULT_REPORT_CARD_CONFIG)
    toast.success("Report card design reset to the default.")
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Report Card</h2>
        <p className="text-sm text-muted-foreground">
          Preview and customise report-card printing in this browser. This design preference is saved on this device; it does not update other staff or parent devices.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-4">
          <Section title="Branding">
            <Field id="rc-logo-mode" label="Logo">
              <select
                id="rc-logo-mode"
                value={draft.logoMode}
                onChange={(event) =>
                  update(
                    "logoMode",
                    event.target.value as ReportCardConfig["logoMode"]
                  )
                }
                className="h-9 w-full rounded-md border bg-white px-2 text-sm"
              >
                <option value="school">Use the school logo</option>
                <option value="custom">Upload a different logo</option>
                <option value="none">No logo</option>
              </select>
            </Field>
            {draft.logoMode === "custom" && (
              <div className="flex items-center gap-3">
                {draft.customLogo && (
                  <img
                    src={draft.customLogo}
                    alt="Uploaded logo"
                    className="size-12 rounded border object-contain"
                  />
                )}
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleLogo(event)}
                  className="sr-only"
                  aria-label="Upload logo"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInput.current?.click()}
                >
                  <Upload className="mr-1.5 size-4" />
                  {draft.customLogo ? "Replace logo" : "Upload logo"}
                </Button>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Accent colour</Label>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => update("accentColor", color)}
                    aria-label={`Use colour ${color}`}
                    aria-pressed={draft.accentColor === color}
                    style={{ backgroundColor: color }}
                    className={`size-7 rounded-full border-2 ${
                      draft.accentColor === color
                        ? "border-gray-900"
                        : "border-white ring-1 ring-gray-200"
                    }`}
                  />
                ))}
                <input
                  type="color"
                  value={draft.accentColor}
                  onChange={(event) =>
                    update("accentColor", event.target.value)
                  }
                  aria-label="Custom accent colour"
                  className="size-7 cursor-pointer rounded border bg-white p-0"
                />
              </div>
            </div>
          </Section>

          <Section title="Content">
            <Field id="rc-title" label="Card title">
              <Input
                id="rc-title"
                value={draft.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="Student Report Card"
              />
            </Field>
            <Checkbox
              label="Show school address, phone and email"
              checked={draft.showContact}
              onChange={(value) => update("showContact", value)}
            />
            <Checkbox
              label="Show each assessment (CA, Exam) column"
              checked={draft.showAssessmentColumns}
              onChange={(value) => update("showAssessmentColumns", value)}
            />
            <Checkbox
              label="Show class position"
              checked={draft.showPosition}
              onChange={(value) => update("showPosition", value)}
            />
            <Field id="rc-footer" label="Footer text (optional)">
              <Input
                id="rc-footer"
                value={draft.footerText}
                onChange={(event) => update("footerText", event.target.value)}
                placeholder="Defaults to the school name"
              />
            </Field>
          </Section>

          <Section title="Remark">
            <Checkbox
              label="Show a remark box"
              checked={draft.showRemark}
              onChange={(value) => update("showRemark", value)}
            />
            {draft.showRemark && (
              <>
                <Field id="rc-remark-label" label="Remark heading">
                  <Input
                    id="rc-remark-label"
                    value={draft.remarkLabel}
                    onChange={(event) =>
                      update("remarkLabel", event.target.value)
                    }
                  />
                </Field>
                <Field
                  id="rc-remark-default"
                  label="Default remark (used when a student has none)"
                >
                  <textarea
                    id="rc-remark-default"
                    value={draft.defaultRemark}
                    onChange={(event) =>
                      update("defaultRemark", event.target.value)
                    }
                    rows={3}
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                  />
                </Field>
              </>
            )}
          </Section>

          <Section title="Signatories">
            <p className="text-xs text-muted-foreground">
              Add the name (for example the Principal&apos;s) to print it above
              the signature line.
            </p>
            {draft.signatories.map((signatory) => (
              <div key={signatory.id} className="flex items-end gap-2">
                <Field id={`rc-sign-label-${signatory.id}`} label="Role">
                  <Input
                    id={`rc-sign-label-${signatory.id}`}
                    value={signatory.label}
                    onChange={(event) =>
                      updateSignatory(signatory.id, "label", event.target.value)
                    }
                  />
                </Field>
                <Field id={`rc-sign-name-${signatory.id}`} label="Name">
                  <Input
                    id={`rc-sign-name-${signatory.id}`}
                    value={signatory.name}
                    onChange={(event) =>
                      updateSignatory(signatory.id, "name", event.target.value)
                    }
                    placeholder="Optional"
                  />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${signatory.label || "signatory"}`}
                  onClick={() =>
                    update(
                      "signatories",
                      draft.signatories.filter(
                        (item) => item.id !== signatory.id
                      )
                    )
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSignatory}
              disabled={draft.signatories.length >= MAX_SIGNATORIES}
            >
              <Plus className="mr-1.5 size-4" />
              Add signatory
            </Button>
          </Section>

          <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t bg-white/90 py-3 backdrop-blur">
            <Button onClick={save} disabled={!dirty}>
              Save design
            </Button>
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="mr-1.5 size-4" />
              Reset to default
            </Button>
            {dirty && (
              <span className="text-xs text-amber-700">Unsaved changes</span>
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <h2 className="text-sm font-semibold">Live preview</h2>
          <p className="text-xs text-muted-foreground">
            This uses a sample student. Real report cards use each
            student&apos;s actual results.
          </p>
          {isLoading ? (
            <p role="status" className="text-sm text-muted-foreground">
              Loading school details...
            </p>
          ) : null}
          <div className="overflow-auto rounded-xl border bg-gray-100 p-3">
            <div style={{ zoom: 0.62 }} className="mx-auto w-fit shadow-sm">
              <ReportCard data={sample} config={draft} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
