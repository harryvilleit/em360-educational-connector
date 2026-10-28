import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios"
import {
  computeTokenExpiresAt,
  needsAccessTokenRefresh,
} from "@/lib/tokenExpiry"
import {
  requestAuthSessionFromOtherTab,
  useAuthStore,
} from "@/store/auth.store"
import { readCsrfToken } from "@/lib/csrfSession"

const configuredBaseUrl = import.meta.env.VITE_BASE_URL as string
const configuredElearningBaseUrl = import.meta.env
  .VITE_ELEARNING_BASE_URL as string

function absoluteOrigin(value: string | undefined) {
  if (!value) return undefined
  try {
    return new URL(value).origin
  } catch {
    return undefined
  }
}

function developmentProxyPath(value: string | undefined, apiOrigin?: string) {
  if (!import.meta.env.DEV || !value) return value

  try {
    const url = new URL(value)
    // Vite proxies the configured API origin. Do not accidentally route a
    // separately hosted E-Learning API to the main API server.
    if (apiOrigin && url.origin !== apiOrigin) return value
    return `${url.pathname}${url.search}${url.hash}` || "/"
  } catch {
    return value
  }
}

const configuredApiOrigin = absoluteOrigin(configuredBaseUrl)
const baseUrl = developmentProxyPath(configuredBaseUrl) as string
const elearningBaseUrl = developmentProxyPath(
  configuredElearningBaseUrl,
  configuredApiOrigin
) as string
const configuredTimeout = Number(import.meta.env.VITE_API_TIMEOUT_MS)
const API_TIMEOUT_MS =
  Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : import.meta.env.DEV
      ? 120_000
      : 30_000

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

/**
 * Terminal authentication failure. Unlike an ordinary endpoint 401, this
 * means the refresh session is no longer usable and the application has
 * already started its single, global sign-out transition.
 */
export class SessionExpiredError extends ApiError {
  constructor(
    message = "Your session has expired. Please sign in again.",
    data?: unknown
  ) {
    super(401, message, data)
    this.name = "SessionExpiredError"
  }
}

export const AUTH_SESSION_EXPIRED_EVENT = "em360:auth-session-expired"

export function isSessionExpiredError(
  value: unknown
): value is SessionExpiredError {
  return (
    value instanceof SessionExpiredError ||
    (value instanceof ApiError && value.name === "SessionExpiredError")
  )
}

let sessionExpiryDispatched = false

function expireAuthSession(message?: string, data?: unknown) {
  const error = new SessionExpiredError(message, data)
  const state = useAuthStore.getState()

  if (state.token || state.user || state.hasRefreshSession) state.clearAuth()

  // The global watcher clears user-specific query/mutation caches. Dispatch
  // only once so a burst of concurrent 401s cannot repeatedly tear down and
  // recreate the login route.
  if (!sessionExpiryDispatched && typeof window !== "undefined") {
    sessionExpiryDispatched = true
    window.dispatchEvent(
      new CustomEvent(AUTH_SESSION_EXPIRED_EVENT, {
        detail: { message: error.message },
      })
    )
  }

  return error
}

function extractBackendMessage(data: Record<string, unknown> | undefined) {
  if (!data) return undefined

  // The API's model-state envelope stores field errors under Value.Errors
  // (PascalCase) while normal validation responses use errors/Errors. Prefer
  // those useful messages over the legacy generic "400 : Error occured" text.
  const value = data.Value ?? data.value
  if (value && typeof value === "object") {
    const nestedErrors =
      (value as Record<string, unknown>).Errors ??
      (value as Record<string, unknown>).errors
    if (Array.isArray(nestedErrors)) {
      const messages = nestedErrors
        .map((item) => {
          if (!item || typeof item !== "object") return undefined
          const error = item as Record<string, unknown>
          const message = error.Message ?? error.message
          return typeof message === "string" ? message : undefined
        })
        .filter((message): message is string => !!message)
      if (messages.length > 0) return messages.join(" :: ")
    }
  }

  const direct = data.Message || data.Error || data.message || data.error
  if (typeof direct === "string" && direct) return direct

  const validationErrors = data.errors ?? data.Errors
  if (validationErrors && typeof validationErrors === "object") {
    const firstField = Object.values(
      validationErrors as Record<string, unknown>
    )[0]
    const firstMessage = Array.isArray(firstField) ? firstField[0] : firstField
    if (typeof firstMessage === "string" && firstMessage) return firstMessage
  }

  const title = data.title ?? data.Title
  if (typeof title === "string" && title) return title

  return undefined
}

const PUBLIC_AUTH_PATHS = [
  "/Users/authenticate",
  "/Users/student-change-password",
  "/Users/VerifyMfaOtp",
  "/Users/ResendMfaOtp",
  "/SystemUser/CreateUser",
  "/Users/verify-email",
  "/Users/forgot-password",
  "/Users/reset-password",
]
const isPublicAuthRequest = (url?: string) =>
  !!url && PUBLIC_AUTH_PATHS.some((path) => url.includes(path))

const getAuthHeaders = () => {
  const { token, hasRefreshSession } = useAuthStore.getState()
  // A successful login can happen in the same SPA lifetime after an earlier
  // expiry. Re-arm the one-shot event for that new authenticated session.
  if (token && hasRefreshSession) sessionExpiryDispatched = false
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const refreshClient = axios.create({
  baseURL: baseUrl,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
})

let refreshInFlight: Promise<string> | null = null

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

async function doRefreshRequest(expectedAccessToken?: string): Promise<string> {
  try {
    const { hasRefreshSession, setSessionTokens } = useAuthStore.getState()

    if (!hasRefreshSession) {
      throw expireAuthSession()
    }

    let csrfToken = readCsrfToken()
    if (!csrfToken) {
      const restored = await requestAuthSessionFromOtherTab()
      const latest = useAuthStore.getState()

      if (
        restored &&
        latest.token &&
        latest.token !== expectedAccessToken &&
        !needsAccessTokenRefresh(latest.token)
      ) {
        return latest.token
      }

      csrfToken = readCsrfToken()
      if (!csrfToken) {
        throw expireAuthSession(
          "Your secure session could not be restored. Please sign in again."
        )
      }
    }

    const { data } = await refreshClient.post("/Users/refreshtoken", null, {
      headers: { "X-CSRF-Token": csrfToken },
    })

    const newAccess: string = data.Value.Access_Token
    const newCsrf: string = data.Value.Csrf_Token
    const expiresIn: number = data.Value.Expires_In

    // A refresh response can arrive after the user signs out in this or
    // another tab. It must not restore a session the user just ended.
    if (!useAuthStore.getState().hasRefreshSession) {
      throw new SessionExpiredError()
    }

    setSessionTokens(newAccess, computeTokenExpiresAt(expiresIn), newCsrf)
    sessionExpiryDispatched = false

    return newAccess
  } catch (refreshError) {
    // Another tab (e.g. one opened via "Launch School") may have already
    // refreshed successfully with this same refresh token while we were
    // waiting on the network — cross-tab sync (see auth.store.ts) would
    // have already pulled the new tokens into this tab's store. Retry
    // with those instead of treating a stale/rotated token as fatal.
    const latest = useAuthStore.getState()
    if (
      latest.token &&
      latest.token !== expectedAccessToken &&
      !needsAccessTokenRefresh(latest.token)
    ) {
      return latest.token
    }

    if (axios.isAxiosError(refreshError) && refreshError.response) {
      const status = refreshError.response.status

      // A transient rate limit is not a terminal authentication failure. The
      // original request stays failed, but the user's local session remains so
      // their next action can retry after the server window clears.
      if (status === 429) {
        throw refreshError
      }

      // Only end the session when the refresh token is actually rejected.
      if (status === 401 || status === 403) {
        const sessionError = expireAuthSession(
          undefined,
          refreshError.response.data
        )
        throw sessionError
      }
    }

    // All waiting requests receive the same failure from refreshInFlight.
    throw refreshError
  }
}

/**
 * Share the whole refresh operation within this tab, including time waiting
 * for a Web Lock. Requests made during page restoration often have no access
 * token yet, so they must join the same operation before entering the lock.
 * Other tabs can hand over a fresh in-memory token while this tab is waiting.
 */
function doRefresh(failedAccessToken?: string): Promise<string> {
  if (refreshInFlight) return refreshInFlight

  const expectedAccessToken =
    failedAccessToken ?? useAuthStore.getState().token ?? undefined

  const refreshOrReuseToken = async () => {
    const latest = useAuthStore.getState()
    if (
      latest.token &&
      latest.token !== expectedAccessToken &&
      !needsAccessTokenRefresh(latest.token)
    ) {
      return latest.token
    }

    return doRefreshRequest(expectedAccessToken)
  }

  const runRefresh = async () => {
    if (typeof navigator !== "undefined" && navigator.locks) {
      return navigator.locks.request(
        "em360-auth-token-refresh",
        refreshOrReuseToken
      )
    }

    return refreshOrReuseToken()
  }

  refreshInFlight = runRefresh().finally(() => {
    refreshInFlight = null
  })

  return refreshInFlight
}

async function prepareAuthSession() {
  const { token, hasRefreshSession } = useAuthStore.getState()
  if (!hasRefreshSession) return

  if (refreshInFlight) {
    await refreshInFlight
  } else if (needsAccessTokenRefresh(token)) {
    await doRefresh(token ?? undefined)
  }
}

function getBearerToken(config: RetriableConfig): string | undefined {
  const value = config.headers.get("Authorization")
  if (typeof value !== "string") return undefined
  return value.startsWith("Bearer ") ? value.slice(7) : undefined
}

function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use(
    async (config) => {
      if (!isPublicAuthRequest(config.url)) {
        await prepareAuthSession()
      }

      const headers = getAuthHeaders()
      if (headers.Authorization)
        config.headers["Authorization"] = headers["Authorization"]
      const method = config.method?.toUpperCase()
      if (method && !["GET", "HEAD", "OPTIONS"].includes(method)) {
        const csrfToken = readCsrfToken()
        if (csrfToken) config.headers["X-CSRF-Token"] = csrfToken
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  client.interceptors.response.use(
    (response) => {
      const { status, data } = response
      if (
        data?.isError &&
        !((status >= 200 && status < 300) || status === 404)
      ) {
        return Promise.reject(response?.data?.message ?? "Fatal error")
      }
      return data ?? []
    },
    async (error) => {
      // A refresh rejected during request preparation has already triggered
      // the global sign-out. Preserve its type instead of retrying or wrapping.
      if (isSessionExpiredError(error)) return Promise.reject(error)

      const original = error.config as RetriableConfig | undefined

      if (
        error.response?.status === 401 &&
        original &&
        !original._retry &&
        !isPublicAuthRequest(original?.url)
      ) {
        original._retry = true

        try {
          const newToken = await doRefresh(getBearerToken(original))
          original.headers["Authorization"] = `Bearer ${newToken}`
          return client(original)
        } catch (refreshError) {
          return Promise.reject(refreshError)
        }
      }

      if (error.response) {
        const { status, statusText, data } = error.response

        if (status === 401 && !isPublicAuthRequest(original?.url)) {
          const backendMessage = extractBackendMessage(data)
          return Promise.reject(
            new ApiError(401, backendMessage || "Unauthorized", data)
          )
        }

        const backendMessage = extractBackendMessage(data)
        return Promise.reject(
          new ApiError(
            status,
            backendMessage || statusText || "Error from axios interceptor",
            data
          )
        )
      }

      if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
        return Promise.reject(
          new Error(
            "The request timed out. Check your connection and try again."
          )
        )
      }

      return Promise.reject(
        new Error(
          error.message || "The network request failed. Please try again."
        )
      )
    }
  )

  return client
}

const apiClient = attachInterceptors(
  axios.create({
    baseURL: baseUrl,
    timeout: API_TIMEOUT_MS,
    withCredentials: true,
  })
)

const elearningApiClient = attachInterceptors(
  axios.create({
    baseURL: elearningBaseUrl,
    timeout: API_TIMEOUT_MS,
    withCredentials: true,
  })
)

export { baseUrl, elearningBaseUrl, elearningApiClient }
export const refreshAccessToken = doRefresh
// Product APIs share the existing in-memory/session token, cross-tab refresh
// lock, expiry handling and error normalisation. Refresh cookies stay on the
// identity API; a separate product service authenticates only with the JWT.
export function createAuthenticatedApiClient(baseURL: string) {
  return attachInterceptors(
    axios.create({ baseURL, timeout: API_TIMEOUT_MS, withCredentials: false })
  )
}
export default apiClient
