import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
export type Row = Record<string, any>
export type Request = (
  path: string,
  method?: string,
  body?: unknown,
  query?: Record<string, unknown>
) => Promise<any>
export class HealthHttpError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
export function camel(value: any): any {
  if (Array.isArray(value)) return value.map(camel)
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k[0].toLowerCase() + k.slice(1),
        camel(v),
      ])
    )
  return value
}
// The resource identity excludes refreshes: keep the current screen while revalidating.
// Changing a student, school, filter or page always starts with an empty result.
export function useData(
  request: Request,
  path: string | null,
  query: Row,
  revision = 0
) {
  const key = JSON.stringify([path, query])
  const [state, setState] = useState<{
    key: string
    data: any
    error: HealthHttpError | null
    loading: boolean
    refreshing: boolean
  }>({ key: "", data: null, error: null, loading: true, refreshing: false })
  useEffect(() => {
    let live = true
    if (!path) {
      setState({
        key,
        data: null,
        error: null,
        loading: false,
        refreshing: false,
      })
      return
    }
    setState((previous) => {
      const data = previous.key === key ? previous.data : null
      return {
        key,
        data,
        error: null,
        loading: data == null,
        refreshing: data != null,
      }
    })
    request(path, "GET", undefined, query)
      .then((data) => {
        if (live)
          setState({
            key,
            data,
            error: null,
            loading: false,
            refreshing: false,
          })
      })
      .catch((error) => {
        if (!live) return
        setState((previous) => ({
          key,
          // Do not keep protected records after access loss, logout or deletion.
          data:
            [401, 403, 404].includes(error.status) || previous.key !== key
              ? null
              : previous.data,
          error,
          loading: false,
          refreshing: false,
        }))
      })
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, key, revision])
  return state.key === key
    ? state
    : { key, data: null, error: null, loading: !!path, refreshing: false }
}

export function useHealthRefresh() {
  const [revision, setRevision] = useState(0)
  const lastRefresh = useRef(Date.now())
  const refresh = useCallback(() => {
    lastRefresh.current = Date.now()
    setRevision((value) => value + 1)
  }, [])
  useEffect(() => {
    const background = () => {
      if (
        document.visibilityState === "hidden" ||
        !navigator.onLine ||
        Date.now() - lastRefresh.current < 15000
      )
        return
      refresh()
    }
    window.addEventListener("focus", background)
    document.addEventListener("visibilitychange", background)
    const timer = setInterval(background, 60000)
    return () => {
      clearInterval(timer)
      window.removeEventListener("focus", background)
      document.removeEventListener("visibilitychange", background)
    }
  }, [refresh])
  return [revision, refresh] as const
}

export function healthMenuPath(path: string) {
  const tail =
    path.split("/health")[1]?.split("?")[0]?.split("/").filter(Boolean) ?? []
  return "/dashboard/health" + (tail[0] ? "/" + tail[0] : "")
}
export const time = (v?: string | null) =>
  v ? new Date(v).toLocaleString() : "—"
export const date = (v?: string | null) =>
  v ? new Date(v + "T12:00:00").toLocaleDateString() : "—"
export const localNow = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
export const localTime = (v?: string | null) =>
  v
    ? new Date(new Date(v).getTime() - new Date(v).getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : ""
export const today = () => localNow().slice(0, 10)
export const visitStatus = ["Admitted", "Discharged", "Referred"]
export const incidentStatus = ["", "Open", "Monitoring", "Referred", "Closed"]
export const medStatus = [
  "",
  "Draft",
  "Active",
  "Suspended",
  "Expired",
  "Revoked",
]
export const outcome = [
  "",
  "Given",
  "Refused",
  "Missed",
  "Withheld",
  "Self-administered",
]
export const roles = [
  "",
  "Health lead",
  "School nurse",
  "First aider",
  "Records administrator",
  "Read only",
]
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: string
}) {
  return <span className={"hw-badge " + tone}>{children}</span>
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="hw-empty">{children}</div>
}
export function Pager({
  data,
  page,
  setPage,
}: {
  data?: Row
  page: number
  setPage: (p: number) => void
}) {
  return data && data.totalPages > 1 ? (
    <div className="hw-pager">
      <span>
        {data.totalItems} records · Page {page} of {data.totalPages}
      </span>
      <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
        Previous
      </button>
      <button
        disabled={page >= data.totalPages}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  ) : null
}
export function LoadState({
  state,
  retry,
  children,
}: {
  state: { loading: boolean; error: HealthHttpError | null; data?: any }
  retry: () => void
  children: ReactNode
}) {
  return state.loading ? (
    <div className="hw-empty" role="status">
      Loading health records…
    </div>
  ) : state.error && state.data == null ? (
    <div className="hw-alert" role="alert">
      <strong>
        {state.error.status === 403
          ? "Access is restricted"
          : "Unable to load records"}
      </strong>
      <p>{state.error.message}</p>
      <button onClick={retry}>Try again</button>
    </div>
  ) : (
    <>
      {state.error && (
        <div className="hw-alert" role="status">
          Unable to refresh. Showing the last loaded records.{" "}
          <button onClick={retry}>Try again</button>
        </div>
      )}
      {children}
    </>
  )
}
export type Field = {
  name: string
  label: string
  type?: string
  required?: boolean
  options?: { value: string | number; label: string }[]
  value?: any
  help?: string
  minLength?: number
  maxLength?: number
}
export type FormSpec = {
  title: string
  description?: string
  fields: Field[]
  submit: (v: Row) => Promise<unknown>
  label?: string
}
export function ActionDialog({
  spec,
  onClose,
  onSaved,
}: {
  spec: FormSpec
  onClose: () => void
  onSaved: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false)
  useEffect(() => {
    const el = ref.current
    el?.showModal()
    return () => el?.close()
  }, [])
  return (
    <dialog
      ref={ref}
      className="hw-dialog"
      onCancel={(e) => {
        if (saving) e.preventDefault()
        else onClose()
      }}
      aria-labelledby="health-dialog-title"
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (saving) return
          const f = new FormData(e.currentTarget)
          const v: Row = {}
          for (const field of spec.fields) {
            const raw = f.get(field.name)
            v[field.name] =
              field.type === "checkbox"
                ? raw === "on"
                : String(raw ?? "").trim()
          }
          setSaving(true)
          setError("")
          try {
            await spec.submit(v)
            onSaved()
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Unable to save. Try again."
            )
            setSaving(false)
          }
        }}
      >
        <header>
          <div>
            <p className="hw-eyebrow">SCHOOL HEALTH</p>
            <h2 id="health-dialog-title">{spec.title}</h2>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>
        <div className="hw-dialog-body">
          {spec.description && <p className="hw-muted">{spec.description}</p>}
          {error && (
            <div className="hw-alert" role="alert">
              {error}
            </div>
          )}
          <div className="hw-form-grid">
            {spec.fields.map((f) => (
              <label
                key={f.name}
                className={f.type === "textarea" ? "wide" : ""}
              >
                <span>
                  {f.label}
                  {f.required ? " *" : ""}
                </span>
                {f.options ? (
                  <select
                    name={f.name}
                    defaultValue={f.value ?? ""}
                    required={f.required}
                  >
                    {!f.value && <option value="">Choose…</option>}
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    name={f.name}
                    defaultValue={f.value ?? ""}
                    required={f.required}
                    minLength={f.minLength}
                    maxLength={f.maxLength ?? 2000}
                    rows={3}
                  />
                ) : (
                  <input
                    name={f.name}
                    type={f.type ?? "text"}
                    defaultValue={
                      f.type === "checkbox" ? undefined : (f.value ?? "")
                    }
                    defaultChecked={
                      f.type === "checkbox" ? !!f.value : undefined
                    }
                    required={f.required}
                    minLength={f.minLength}
                    maxLength={f.maxLength ?? 500}
                  />
                )}{" "}
                {f.help && <small>{f.help}</small>}
              </label>
            ))}
          </div>
        </div>
        <footer>
          <button type="button" disabled={saving} onClick={onClose}>
            Cancel
          </button>
          <button className="primary" disabled={saving}>
            {saving ? "Saving…" : (spec.label ?? "Save record")}
          </button>
        </footer>
      </form>
    </dialog>
  )
}
