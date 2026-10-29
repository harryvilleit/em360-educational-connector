import type { PortalModule } from "./navigation"

export interface PortalRuntime {
  restBase: string
  initialPath: string
  module: PortalModule
  menuId?: string
  frontendBase: string
}
const modules: readonly PortalModule[] = [
  "users", "students", "parents", "exams", "fees", "elearning", "timetable", "attendance", "hostel", "staff",
]
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
    module: modules.includes(value.module) ? value.module : "users",
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
export interface RequestOptions {
  signal?: AbortSignal
  /** Upload progress for requests that carry files (sent through XMLHttpRequest). */
  onUploadProgress?: (loaded: number, total: number) => void
}
function upload(url: string, init: RequestInit & { headers: Record<string, string> }, options: RequestOptions) {
  return new Promise<Response>((resolve, reject) => {
    const request = new XMLHttpRequest()
    const abort = () => request.abort()
    request.open(init.method || "POST", url)
    request.withCredentials = true
    Object.entries(init.headers).forEach(([k, v]) => request.setRequestHeader(k, v))
    request.upload.onprogress = (e) => {
      if (e.lengthComputable) options.onUploadProgress?.(e.loaded, e.total)
    }
    request.onload = () =>
      resolve(new Response(request.status === 204 ? null : request.responseText, { status: request.status }))
    request.onerror = () => reject(new Error("The upload was interrupted. Please try again."))
    request.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"))
    request.onloadend = () => options.signal?.removeEventListener("abort", abort)
    if (options.signal?.aborted) return reject(new DOMException("Upload cancelled", "AbortError"))
    options.signal?.addEventListener("abort", abort, { once: true })
    request.send(init.body as string | undefined)
  })
}
export async function portalRequest(path: string, data?: unknown, options: RequestOptions = {}) {
  const init = {
    method: data === undefined ? "GET" : "POST",
    credentials: "same-origin" as const,
    cache: "no-store" as const,
    signal: options.signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(csrf ? { "X-EM360-CSRF": csrf } : {}),
    } as Record<string, string>,
    body: data === undefined ? undefined : JSON.stringify(data),
  }
  const response = options.onUploadProgress
    ? await upload(restUrl(path), init, options)
    : await fetch(restUrl(path), init)
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
