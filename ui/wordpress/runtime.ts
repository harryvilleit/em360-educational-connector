export interface PortalRuntime {
  restBase: string
  initialPath: string
  module?: "users" | "students"
  menuId?: string
  frontendBase: string
}
export function runtime(): PortalRuntime {
  const value = JSON.parse(
    document.getElementById("em360-runtime")?.textContent ?? "{}",
  )
  const url = new URL(value.restBase, location.origin)
  if (url.origin !== location.origin)
    throw new Error("Invalid portal configuration.")
  return {
    restBase: url.href,
    initialPath: value.initialPath || "/dashboard/users",
    menuId: typeof value.menuId === "string" ? value.menuId : undefined,
    module: value.module === "students" ? "students" : "users",
    frontendBase: value.frontendBase || "",
  }
}
/** REST route the shared api.ts adapter sends school operations to. */
export const gatewayRoute = "user-management"

/** Staff frames send every operation to the gateway. */
export async function localOperation(_method: string, _path: string): Promise<unknown> {
  return undefined
}

let csrf = ""
export function restUrl(path: string) {
  const url = new URL(runtime().restBase)
  const [pathname, query] = path.split("?")
  path = pathname
  new URLSearchParams(query).forEach((value, key) =>
    url.searchParams.set(key, value),
  )
  if (url.searchParams.has("rest_route"))
    url.searchParams.set(
      "rest_route",
      url.searchParams.get("rest_route")!.replace(/\/$/, "") + "/" + path,
    )
  else url.pathname = url.pathname.replace(/\/$/, "") + "/" + path
  return url.href
}
export async function portalRequest(path: string, data?: unknown) {
  const response = await fetch(restUrl(path), {
    method: data === undefined ? "GET" : "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(csrf ? { "X-EM360-CSRF": csrf } : {}),
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  })
  const result = await response
    .json()
    .catch(() => ({ message: "The server returned an unreadable response." }))
  if (!response.ok) {
    const error = Object.assign(
      new Error(
        result.message ||
          result.Message ||
          result.title ||
          "Unable to complete the request.",
      ),
      { status: response.status, data: result },
    )
    if (response.status === 401)
      window.dispatchEvent(new Event("em360:session-ended"))
    throw error
  }
  return result
}
export async function bootstrap() {
  const data = await portalRequest("bootstrap")
  csrf = data.csrf
  if (!data.signedIn) {
    window.dispatchEvent(new Event("em360:session-ended"))
    throw Object.assign(
      new Error("Sign in to the school portal to continue."),
      { status: 401 },
    )
  }
  return portalRequest("user-management/context?module=" + runtime().module)
}
