import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { usePayrollData, type Row } from "./service"
export const input =
  "mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
export const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
export function State({
  query,
  children,
}: {
  query: any
  children: ReactNode
}) {
  return query.isPending ? (
    <p role="status" className="p-5">
      Loading payroll…
    </p>
  ) : query.isError ? (
    <div role="alert" className={card + " text-red-700"}>
      {query.error.message}{" "}
      <Button variant="outline" onClick={() => query.refetch()}>
        Retry
      </Button>
    </div>
  ) : (
    <>{children}</>
  )
}
export function Pager({
  data,
  page,
  setPage,
}: {
  data: any
  page: number
  setPage: (p: number) => void
}) {
  if (!data?.totalItems) return null
  return (
    <div className="flex items-center justify-between gap-3 py-3 text-sm">
      <span>
        {data.totalItems} records · Page {page} of {data.totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={page >= data.totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
export function Table({
  columns,
  rows,
  actions,
}: {
  columns: [string, string | ((r: Row) => ReactNode)][]
  rows: Row[]
  actions?: (r: Row) => ReactNode
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map(([label]) => (
              <th key={label} className="px-4 py-3">
                {label}
              </th>
            ))}
            {actions && <th className="px-4 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.id || r.code || i}
              className="border-t border-slate-100 bg-white"
            >
              {columns.map(([label, value]) => (
                <td key={label} className="px-4 py-3">
                  {typeof value === "function" ? value(r) : (r[value] ?? "—")}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">{actions(r)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <p className="p-8 text-center text-slate-500">No records yet.</p>
      )}
    </div>
  )
}
export type Field = {
  name: string
  label: string
  type?: string
  required?: boolean
  options?: { value: string; label: string }[]
  help?: string
  step?: string
}
export function Fields({
  fields,
  values,
  setValues,
}: {
  fields: Field[]
  values: Row
  setValues: (v: Row) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <label className="block text-sm font-medium" key={f.name}>
          {f.type === "checkbox" ? (
            <>
              <input
                type="checkbox"
                className="mr-2"
                checked={!!values[f.name]}
                onChange={(e) =>
                  setValues({ ...values, [f.name]: e.target.checked })
                }
              />
              {f.label}
            </>
          ) : (
            <>
              {f.label}
              {f.options ? (
                <select
                  aria-label={f.label}
                  className={input}
                  value={values[f.name] ?? ""}
                  required={f.required !== false}
                  onChange={(e) =>
                    setValues({ ...values, [f.name]: e.target.value })
                  }
                >
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  aria-label={f.label}
                  className={input}
                  value={values[f.name] ?? ""}
                  type={f.type || "text"}
                  step={f.step || "0.01"}
                  min={f.type === "number" ? 0 : undefined}
                  required={f.required !== false}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      [f.name]:
                        f.type === "number"
                          ? e.target.value === ""
                            ? ""
                            : Number(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              )}
            </>
          )}
          {f.help && (
            <span className="mt-1 block text-xs font-normal text-slate-500">
              {f.help}
            </span>
          )}
        </label>
      ))}
    </div>
  )
}
export function Editor({
  title,
  description,
  children,
  onClose,
  onSave,
  submit = "Save",
}: {
  title: string
  description: string
  children: ReactNode
  onClose: () => void
  onSave: () => Promise<unknown>
  submit?: string
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("")
  return (
    <Dialog open onOpenChange={(v) => !v && !busy && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            setError("")
            try {
              await onSave()
              onClose()
            } catch (e: any) {
              setError(e.message)
            } finally {
              setBusy(false)
            }
          }}
        >
          <fieldset disabled={busy} className="space-y-5">
            {children}
          </fieldset>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
export const options = (values: string[]) =>
  values.map((value) => ({ value, label: value }))
export const frequencies = [
  { value: "monthly", label: "Monthly" },
  { value: "biweekly", label: "Fortnightly" },
  { value: "weekly", label: "Weekly" },
]
export function StaffSelection({
  selected,
  setSelected,
}: {
  selected: Row
  setSelected: (v: Row) => void
}) {
  const [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    q = usePayrollData("People", { search, page })
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        Find employees
        <input
          className={input}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search staff by name"
        />
      </label>
      <p className="text-xs text-slate-500">
        {Object.keys(selected).length} selected. A salary assignment applies the
        same package to the selected group.
      </p>
      <State query={q}>
        <div className="grid max-h-52 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">
          {(q.data?.items || []).map((s: Row) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!selected[s.id]}
                onChange={(e) => {
                  const next = { ...selected }
                  if (e.target.checked) next[s.id] = s.name
                  else delete next[s.id]
                  setSelected(next)
                }}
              />
              {s.name}
            </label>
          ))}
        </div>
        <Pager data={q.data} page={page} setPage={setPage} />
      </State>
      {Object.entries(selected).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(selected).map(([id, name]) => (
            <Button
              key={id}
              type="button"
              variant="outline"
              onClick={() => {
                const next = { ...selected }
                delete next[id]
                setSelected(next)
              }}
            >
              {name} ×
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
