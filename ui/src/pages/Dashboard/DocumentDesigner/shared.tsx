import { useEffect, useId, useState, type ReactNode } from "react"
import { AlertCircle, FileText, Loader2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type {
  DocumentData,
  DocumentKind,
  DocumentLayout,
} from "@/api/schoolDocuments.api"
import { renderDocument, type RenderedDocument } from "./renderDocument"
import { CanvasCommands } from "./CanvasCommands"
import "./document-fonts.css"

export const input =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60"
export const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
export const errorMessage = (e: unknown) =>
  e instanceof Error
    ? e.message
    : "This document action could not complete. Please try again."
export function Field({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
  maxLength = 200,
  min,
  max,
  disabled = false,
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  type?: string
  multiline?: boolean
  maxLength?: number
  min?: number
  max?: number
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className={input + " min-h-24"}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className={input}
          type={type}
          min={min}
          max={max}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}
export function Select({
  label,
  value,
  onChange,
  children,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: ReactNode
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        aria-label={label}
        className={input}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  )
}
export function Empty({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className={panel + " py-14 text-center"}>
      <FileText className="mx-auto mb-3 size-10 text-indigo-300" />
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <div className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
        {children}
      </div>
    </div>
  )
}
export function Denied() {
  return (
    <Empty title="Document Designer access required">
      Ask your administrator to grant View permission for this menu through your
      access role.
    </Empty>
  )
}
export function Failure({
  error,
  retry,
}: {
  error: unknown
  retry?: () => void
}) {
  return (
    <div
      role="alert"
      className={panel + " flex flex-wrap items-center gap-3 border-red-200"}
    >
      <AlertCircle className="size-5 text-red-600" />
      <p className="flex-1 text-sm">{errorMessage(error)}</p>
      {retry && (
        <Button variant="outline" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  )
}
export function DocumentCanvas({
  kind,
  layout,
  data,
  status = "sample",
  download = false,
}: {
  kind: DocumentKind
  layout: DocumentLayout
  data: DocumentData
  status?: "sample" | "preview" | "issued" | "revoked"
  download?: boolean
}) {
  const [rendered, setRendered] = useState<RenderedDocument | null>(null),
    [error, setError] = useState<unknown>(null),
    [loading, setLoading] = useState(true)
  useEffect(() => {
    let disposed = false
    setLoading(true)
    setError(null)
    const timer = window.setTimeout(() => {
      void renderDocument(kind, layout, data, status)
        .then((r) => {
          if (!disposed) {
            setRendered(r)
            setLoading(false)
          }
        })
        .catch((e) => {
          if (!disposed) {
            setRendered(null)
            setError(e)
            setLoading(false)
          }
        })
    }, 180)
    return () => {
      disposed = true
      window.clearTimeout(timer)
    }
  }, [kind, layout, data, status])
  const save = () => {
    try {
      rendered?.pdf.save(
        `${data.documentNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`
      )
    } catch (e) {
      setError(e)
    }
  }
  return (
    <div className="min-w-0 space-y-3" aria-label="Document preview">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          {layout.paper} · {layout.orientation} ·{" "}
          {rendered?.pages.length ?? "—"} page(s)
        </span>
        {download && (
          <Button
            variant="outline"
            size="sm"
            disabled={loading || !rendered || !!error}
            onClick={save}
          >
            <Download className="size-4" />
            {status === "issued"
              ? "Download PDF"
              : status === "revoked"
                ? "Download revoked copy"
                : "Download preview PDF"}
          </Button>
        )}
      </div>
      {!!error && <Failure error={error} />}
      {loading && (
        <div
          role="status"
          className="flex items-center gap-2 text-sm text-slate-500"
        >
          <Loader2 className="size-4 animate-spin" />
          Updating preview…
        </div>
      )}
      <div className="space-y-5 rounded-2xl bg-slate-100 p-3 sm:p-5">
        {rendered?.pages.map((commands, p) => (
          <svg
            key={p}
            role="img"
            aria-label={`Document page ${p + 1}`}
            viewBox={`0 0 ${rendered.width} ${rendered.height}`}
            className={`mx-auto block h-auto w-full max-w-3xl bg-white shadow-md ${loading ? "opacity-60" : ""}`}
          >
            <CanvasCommands commands={commands} font={rendered.font} />
          </svg>
        ))}
      </div>
    </div>
  )
}
