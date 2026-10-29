import { useEffect, useRef, useState, type ReactNode } from "react"
export type Row = Record<string, any>
export type Request = (
  path: string,
  method?: string,
  body?: unknown,
  params?: Row
) => Promise<any>
export const today = () => new Date().toISOString().slice(0, 10)
export const label = (v: string) =>
  v?.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("-", " ") || "—"
export function useData(
  request: Request,
  path: string,
  params: Row = {},
  tick = 0
) {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true)
  const key = JSON.stringify(params)
  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")
    request(path, "GET", undefined, JSON.parse(key))
      .then((d) => {
        if (active) setData(d)
      })
      .catch((e) => {
        if (active) {
          setError(e.message || "Request failed")
          setData(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [request, path, key, tick])
  return { data, error, loading }
}
export function Field({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <label className="ep-field">
      <span>{title}</span>
      {children}
    </label>
  )
}
export function TextField({
  title,
  value,
  onChange,
  type = "text",
  required = true,
  ...rest
}: {
  title: string
  value: any
  onChange: (v: string) => void
  type?: string
  required?: boolean
  [key: string]: any
}) {
  return (
    <Field title={title}>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        {...rest}
      />
    </Field>
  )
}
export function Check({
  title,
  value,
  onChange,
  disabled = false,
}: {
  title: string
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <label className="ep-check">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {title}
    </label>
  )
}
export function Select({
  title,
  value,
  onChange,
  options,
  required = true,
  disabled = false,
}: {
  title: string
  value: any
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
  required?: boolean
  disabled?: boolean
}) {
  return (
    <Field title={title}>
      <select
        aria-label={title}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
      >
        <option value="">Choose…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
export function Note({
  title,
  value,
  onChange,
  required = false,
}: {
  title: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <Field title={title}>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={3}
        maxLength={4000}
      />
    </Field>
  )
}
export function ErrorBox({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="ep-error">
      {message}
    </p>
  ) : null
}
export function Badge({ value }: { value: string }) {
  return <span className={`ep-badge ep-${value}`}>{label(value)}</span>
}
export function Pager({
  data,
  page,
  setPage,
}: {
  data: Row
  page: number
  setPage: (p: number) => void
}) {
  return (
    <div className="ep-pager">
      <span>
        {data?.total || 0} records · Page {page} of{" "}
        {Math.max(1, Math.ceil((data?.total || 0) / 50))}
      </span>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
      >
        Previous
      </button>
      <button
        type="button"
        disabled={page * 50 >= (data?.total || 0)}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  )
}
export function Modal({
  title,
  children,
  close,
}: {
  title: string
  children: ReactNode
  close: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current!
    d.showModal()
    return () => d.close()
  }, [])
  return (
    <dialog
      ref={ref}
      className="em-perf ep-dialog"
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
      aria-label={title}
    >
      <header className="ep-row">
        <h2>{title}</h2>
        <button type="button" aria-label="Close dialog" onClick={close}>
          ×
        </button>
      </header>
      {children}
    </dialog>
  )
}
export function SaveForm({
  children,
  save,
  text = "Save changes",
}: {
  children: ReactNode
  save: () => Promise<unknown>
  text?: string
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("")
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (busy) return
        setBusy(true)
        setError("")
        try {
          await save()
        } catch (e: any) {
          setError(e.message || "Unable to save")
        } finally {
          setBusy(false)
        }
      }}
    >
      <fieldset disabled={busy}>
        {children}
        <ErrorBox message={error} />
        <footer className="ep-actions">
          <button className="ep-primary" disabled={busy} type="submit">
            {busy ? "Saving…" : text}
          </button>
        </footer>
      </fieldset>
    </form>
  )
}
export function csv(rows: unknown[][]) {
  const escape = (v: unknown) => {
    let s = String(v ?? "")
    if (/^\s*[=+@-]/.test(s)) s = "'" + s
    return '"' + s.replaceAll('"', '""') + '"'
  }
  const url = URL.createObjectURL(
    new Blob(
      ["\ufeff" + rows.map((r) => r.map(escape).join(",")).join("\r\n")],
      { type: "text/csv;charset=utf-8" }
    )
  )
  const a = document.createElement("a")
  a.href = url
  a.download = "performance-report.csv"
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function PersonPicker({
  request,
  title,
  value,
  onChange,
  staff = false,
}: {
  request: Request
  title: string
  value: Row | null
  onChange: (v: Row) => void
  staff?: boolean
}) {
  const [search, setSearch] = useState(""),
    [page, setPage] = useState(1)
  const { data, error, loading } = useData(request, "People", { search, page })
  const options = [
    ...(!staff && data?.owner ? [data.owner] : []),
    ...(data?.items || []),
  ]
  return (
    <div className="ep-person">
      <strong>{title}</strong>
      {value && <p>Selected: {value.name || value.userId || value.staffId}</p>}
      <input
        aria-label={`Search ${title}`}
        placeholder="Search school members…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
      />
      <ErrorBox message={error} />
      {loading ? (
        <p>Loading people…</p>
      ) : (
        <select
          aria-label={title}
          value=""
          onChange={(e) => {
            const v = options.find(
              (x) => (staff ? x.staffId : x.userId) === e.target.value
            )
            if (v) onChange(v)
          }}
        >
          <option value="">Select from results…</option>
          {options.map((x: Row, i: number) => (
            <option key={i} value={staff ? x.staffId : x.userId}>
              {x.name}
            </option>
          ))}
        </select>
      )}
      <Pager data={data} page={page} setPage={setPage} />
    </div>
  )
}
