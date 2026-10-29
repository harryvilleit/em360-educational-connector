import { useAuthStore } from "../auth.store"

export type RebuiltModule = "hostel" | "staff" | "elearning"
export interface PortalContext {
  schoolId: string
  productId: string
  schoolName: string
  timeZone: string
  currency: string
  user: { id: string; name: string; email: string }
  dashboard: any
  navigation: {
    id: string
    menus: { id: string; name: string; path: string; permissions: string[] }[]
  }
}
let context: PortalContext | undefined
let csrf = ""
export const gatewayRoute = "user-management"
export function runtime() {
  const value = JSON.parse(
    document.getElementById("em360-runtime")?.textContent || "{}"
  )
  const base = new URL(value.restBase, location.origin)
  if (
    base.origin !== location.origin ||
    !["hostel", "staff", "elearning"].includes(value.module)
  )
    throw new Error("Invalid school portal configuration.")
  return {
    ...value,
    restBase: base.href,
    module: value.module as RebuiltModule,
  }
}
export function currentContext() {
  if (!context) throw new Error("The school session is not ready.")
  return context
}
export function restUrl(path: string) {
  const url = new URL(runtime().restBase)
  const [pathname, query] = path.split("?")
  new URLSearchParams(query).forEach((value, key) =>
    url.searchParams.set(key, value)
  )
  if (url.searchParams.has("rest_route"))
    url.searchParams.set(
      "rest_route",
      url.searchParams.get("rest_route")!.replace(/\/$/, "") + "/" + pathname
    )
  else url.pathname = url.pathname.replace(/\/$/, "") + "/" + pathname
  return url.href
}
export async function portalRequest(
  path: string,
  body?: unknown,
  signal?: AbortSignal
) {
  const response = await fetch(restUrl(path), {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    cache: "no-store",
    signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(csrf ? { "X-EM360-CSRF": csrf } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await response
    .json()
    .catch(() => ({ message: "The server returned an unreadable response." }))
  if (!response.ok) {
    if (response.status === 401) {
      context = undefined
      csrf = ""
      useAuthStore.getState().clearAuth()
      window.dispatchEvent(new Event("em360:session-ended"))
    }
    throw Object.assign(
      new Error(data.message || data.Message || "The school request failed."),
      { status: response.status, data }
    )
  }
  return data
}
export async function bootstrap(): Promise<PortalContext> {
  const session = await portalRequest("bootstrap")
  csrf = session.csrf
  if (!session.signedIn) {
    window.dispatchEvent(new Event("em360:session-ended"))
    throw Object.assign(new Error("Sign in through the school portal."), {
      status: 401,
    })
  }
  context = await portalRequest(
    "user-management/context?module=" + runtime().module
  )
  return context!
}
export async function localOperation(
  method: string,
  path: string
): Promise<unknown> {
  // Identity reads use the exact signed-in context; no browser bearer tokens are created.
  if (
    method === "GET" &&
    context &&
    path === "/School/Dashboard/" + context.schoolId
  )
    return { IsSuccess: true, Value: context.dashboard }
  return undefined
}
