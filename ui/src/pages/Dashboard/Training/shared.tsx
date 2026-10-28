import { useId, type ReactNode } from "react"
import { AlertCircle, BookOpen, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
export const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
export const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60"
export function Field({
  label,
  value,
  onChange,
  multiline,
  type = "text",
  min,
  max,
  disabled = false,
  maxLength = 200,
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  multiline?: boolean
  type?: string
  min?: number
  max?: number
  disabled?: boolean
  maxLength?: number
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
          className={input + " min-h-28 leading-relaxed"}
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
export function LoadError({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  return (
    <div
      role="alert"
      className={panel + " flex flex-wrap items-center gap-3 border-red-200"}
    >
      <AlertCircle className="size-5 text-red-600" />
      <p className="flex-1 text-sm">
        {error instanceof Error
          ? error.message
          : "Training could not be loaded."}
      </p>
      <Button variant="outline" onClick={retry}>
        Try again
      </Button>
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
      <BookOpen className="mx-auto mb-4 size-9 text-blue-400" />
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <div className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {children}
      </div>
    </div>
  )
}
export function AccessDenied() {
  return (
    <Empty title="Training access required">
      Ask your administrator to grant View permission for this menu through your
      access role.
    </Empty>
  )
}
export function Status({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${value === "completed" || value === "published" ? "bg-emerald-50 text-emerald-700" : value === "overdue" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}
    >
      {value === "completed" && <CheckCircle2 className="size-3" />}
      {value}
    </span>
  )
}
export function Progress({ value }: { value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-500">
        <span>Progress</span>
        <span>{value}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Training completion"
        className="h-2 overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
export const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "The training action could not be completed."
