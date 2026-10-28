import { useEffect, useRef, useState } from "react"
import { jwtDecode } from "jwt-decode"
import { refreshAccessToken } from "@/api/api"
import { useAuthStore } from "@/store/auth.store"
import { useHydration } from "@/hooks/useHydration"
import { AuthRoutes, HomeRoutes } from "@/routes"

interface JwtPayload {
  exp: number
  iat: number
}

type RedirectIntent =
  | { shouldRedirect: true; to: string }
  | { shouldRedirect: false }

function isUsableAccessToken(token: string | null) {
  if (!token) return false

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export function useAuthRedirect(requireAuth = true) {
  const token = useAuthStore((s) => s.token)
  const hasRefreshSession = useAuthStore((s) => s.hasRefreshSession)
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const isHydrated = useHydration()
  const [sessionCheckComplete, setSessionCheckComplete] = useState(false)
  const sessionCheckStarted = useRef(false)
  const tokenIsUsable = isUsableAccessToken(token)

  // A new or reloaded tab has no access token in memory, so it may initially
  // have the persisted user and browser-wide refresh cookie but no access
  // token. Validate/restore that session before rendering either a protected
  // page or an auth page. A rejected refresh clears auth in the API layer; a transient
  // network failure retains the known browser session for a later retry.
  const needsSessionCheck = Boolean(
    isHydrated && user && hasRefreshSession && !tokenIsUsable
  )

  useEffect(() => {
    if (!needsSessionCheck || sessionCheckStarted.current) return

    sessionCheckStarted.current = true
    void refreshAccessToken(token ?? undefined)
      .catch(() => {
        // Terminal 401/403 refresh failures clear the auth store in api.ts.
        // Non-terminal failures preserve the session and are retried by the
        // normal API interceptor when the dashboard makes its next request.
      })
      .finally(() => setSessionCheckComplete(true))
  }, [needsSessionCheck, token])

  const isAuthStateReady =
    isHydrated && (!needsSessionCheck || sessionCheckComplete)

  // Store updates belong in an effect, never in React's render phase.
  const hasInvalidSession = Boolean(
    isAuthStateReady &&
    ((tokenIsUsable && !user) ||
      (!tokenIsUsable &&
        !(hasRefreshSession && user) &&
        (token || user || hasRefreshSession)))
  )
  useEffect(() => {
    if (hasInvalidSession) clearAuth()
  }, [hasInvalidSession, clearAuth])

  const redirect = ((): RedirectIntent => {
    if (!isAuthStateReady) return { shouldRedirect: false }

    if (!tokenIsUsable) {
      if (hasRefreshSession && user) {
        return requireAuth
          ? { shouldRedirect: false }
          : { shouldRedirect: true, to: HomeRoutes.home }
      }

      return requireAuth
        ? { shouldRedirect: true, to: AuthRoutes.login }
        : { shouldRedirect: false }
    }

    if (!user) {
      return requireAuth
        ? { shouldRedirect: true, to: AuthRoutes.login }
        : { shouldRedirect: false }
    }

    if (!requireAuth) {
      return { shouldRedirect: true, to: HomeRoutes.home }
    }

    return { shouldRedirect: false }
  })()

  return { isHydrated: isAuthStateReady, user, token, redirect }
}
