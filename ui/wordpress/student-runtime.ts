// Runtime for the WordPress Student Portal frame (vite.wordpress-module.config.ts --mode student-portal).
// The shared adapters import "./runtime"; this build maps that import here, so every request goes to the
// student gateway, which only accepts operations on the signed-in student's own records.
export interface PortalRuntime {
  restBase: string
  initialPath: string
  module: "student-portal"
  frontendBase: string
}

export function runtime(): PortalRuntime {
  const value = JSON.parse(
    document.getElementById("em360-runtime")?.textContent ?? "{}",
  )
  const url = new URL(value.restBase, location.origin)
  if (url.origin !== location.origin)
    throw new Error("Invalid portal configuration.")
  if (value.module !== "student-portal")
    throw new Error("Unknown school module.")
  return {
    restBase: url.href,
    initialPath: typeof value.initialPath === "string" ? value.initialPath : "",
    module: "student-portal",
    frontendBase: value.frontendBase || "",
  }
}

/** REST route the shared api.ts adapter sends school operations to. */
export const gatewayRoute = "student-portal"

export interface StudentContext {
  schoolId: string
  schoolName: string
  timeZone: string | null
  currency: string | null
  studentId: string
  user: { id: string; name: string; email: string }
  /** GetUserProfileInformation, limited by the API to this student at this school. */
  profile: unknown
}

let context: Promise<StudentContext> | null = null

/**
 * The React student layout reads the signed-in user's schools from GetUserProfileInformation. In WordPress
 * that answer comes from the signed-in context, which the API limits to this school.
 */
export async function localOperation(
  method: string,
  path: string,
): Promise<unknown> {
  if (method === "GET" && path === "/ProductUser/GetUserProfileInformation") {
    const value = await (context ?? bootstrap())
    return {
      value: value.profile,
      isSuccess: true,
      isFailure: false,
      statusCode: 200,
      message: "",
    }
  }
  // The React layout's "Log out" ends the WordPress portal session (never the student's EM360 login elsewhere).
  if (method === "POST" && path === "/Users/logout") {
    await portalRequest("logout", {})
    return { isSuccess: true, isFailure: false, statusCode: 200, message: "" }
  }
  return undefined
}

let csrf = ""

export function restUrl(path: string) {
  const url = new URL(runtime().restBase)
  const [pathname, query] = path.split("?")
  new URLSearchParams(query).forEach((value, key) =>
    url.searchParams.set(key, value),
  )
  if (url.searchParams.has("rest_route"))
    url.searchParams.set(
      "rest_route",
      url.searchParams.get("rest_route")!.replace(/\/$/, "") + "/" + pathname,
    )
  else url.pathname = url.pathname.replace(/\/$/, "") + "/" + pathname
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

export function bootstrap(): Promise<StudentContext> {
  context = (async () => {
    const data = await portalRequest("bootstrap?audience=student")
    csrf = data.csrf
    if (!data.signedIn) {
      window.dispatchEvent(new Event("em360:session-ended"))
      throw Object.assign(
        new Error("Sign in to the student portal to continue."),
        { status: 401 },
      )
    }
    return (await portalRequest("student-portal/context")) as StudentContext
  })()
  context.catch(() => {
    context = null
  })
  return context
}

export async function signOut() {
  await portalRequest("logout", {})
}
