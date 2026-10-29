import { useCallback, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import "./frame.css"
import HealthApp from "../../src/pages/Dashboard/Health/workspace/HealthApp"
import {
  camel,
  HealthHttpError,
  type Request,
  type Row,
} from "../../src/pages/Dashboard/Health/workspace/shared"
const config = JSON.parse(
  document.getElementById("em360-runtime")?.textContent || "{}"
)
function endpoint(path: string) {
  const u = new URL(config.restBase, location.origin)
  if (u.origin !== location.origin) throw Error("Invalid portal configuration.")
  if (u.searchParams.has("rest_route"))
    u.searchParams.set(
      "rest_route",
      u.searchParams.get("rest_route")!.replace(/\/$/, "") + "/" + path
    )
  else u.pathname = u.pathname.replace(/\/$/, "") + "/" + path
  return u
}
async function local(path: string, csrf = "", body?: unknown, query?: Row) {
  const url = endpoint(path)
  Object.entries(query ?? {}).forEach(([k, v]) =>
    url.searchParams.set(k, String(v))
  )
  const res = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(csrf ? { "X-EM360-CSRF": csrf } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const d = camel(
    await res.json().catch(() => ({ message: "Unreadable server response." }))
  )
  if (!res.ok || d?.isSuccess === false || d?.isFailure === true) {
    if (res.status === 401)
      window.parent.postMessage(
        { type: "em360:session-ended" },
        location.origin
      )
    throw new HealthHttpError(
      d.message || d.error?.message || "Unable to load the health portal.",
      res.status
    )
  }
  return d && "value" in d ? d.value : d
}
function Portal() {
  const [session, setSession] = useState<Row | null>(null),
    [error, setError] = useState(""),
    [path, setPath] = useState(config.initialPath || "/dashboard/health")
  useEffect(() => {
    let live = true
    local("bootstrap")
      .then(async (b) => {
        if (!b.signedIn) throw Error("Sign in to the school portal.")
        const context = await local(
          "user-management/context",
          b.csrf,
          undefined,
          { module: "health" }
        )
        if (live) setSession({ ...context, csrf: b.csrf })
      })
      .catch((e) => {
        if (live) setError(e.message)
      })
    return () => {
      live = false
    }
  }, [])
  const request: Request = useCallback(
    (path, method = "GET", body, query = {}) => {
      if (!session)
        throw new HealthHttpError("Sign in to the school portal.", 401)
      return local("user-management", session.csrf, {
        path,
        method,
        query: { ...query, schoolId: session.schoolId },
        body: body ?? null,
        files: [],
        multipart: false,
      })
    },
    [session]
  )
  function navigate(next: string) {
    setPath(next)
    const menu = session?.navigation?.menus
      ?.filter((m: Row) => next === m.path || next.startsWith(m.path + "/"))
      .sort((a: Row, b: Row) => b.path.length - a.path.length)[0]
    if (menu)
      window.parent.postMessage(
        {
          type: "em360:module-route",
          moduleId: session?.navigation.id,
          menuId: menu.id,
        },
        location.origin
      )
  }
  const granted = session?.navigation?.menus?.some(
    (m: Row) => m.id === config.menuId && m.permissions.includes("View")
  )
  return error ? (
    <main className="hw">
      <div role="alert" className="hw-alert">
        {error}
      </div>
    </main>
  ) : session ? (
    granted ? (
      <HealthApp
        request={request}
        allowedMenuPaths={(session.navigation?.menus ?? [])
          .filter((m: Row) => m.permissions.includes("View"))
          .map((m: Row) => m.path)}
        schoolId={session.schoolId}
        initialPath={path}
        navigate={navigate}
      />
    ) : (
      <main className="hw">
        <p role="alert">
          You do not have access to this health menu. Refresh your portal.
        </p>
      </main>
    )
  ) : (
    <main className="hw">
      <p role="status">Opening school health…</p>
    </main>
  )
}
createRoot(document.getElementById("root")!).render(<Portal />)
