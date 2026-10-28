import { jwtDecode } from "jwt-decode"

/** Fallback when the API omits or sends an invalid Expires_In (seconds). */
const DEFAULT_ACCESS_TOKEN_TTL_SEC = 3600

/** Allow time for the request to reach the API before the JWT expires. */
const REQUEST_REFRESH_MARGIN_MS = 30_000

export function needsAccessTokenRefresh(token: string | null): boolean {
  if (!token) return true

  try {
    // Inspect the token being sent. Cross-tab storage can update the cached
    // expiry before the matching access token arrives through BroadcastChannel.
    // This is only a scheduling hint; the API still validates the JWT.
    const { exp } = jwtDecode<{ exp?: number }>(token)
    return (
      typeof exp !== "number" ||
      !Number.isFinite(exp) ||
      exp * 1000 <= Date.now() + REQUEST_REFRESH_MARGIN_MS
    )
  } catch {
    return true
  }
}

export function computeTokenExpiresAt(expiresInSeconds: unknown): number {
  const seconds =
    typeof expiresInSeconds === "number" &&
    Number.isFinite(expiresInSeconds) &&
    expiresInSeconds > 0
      ? expiresInSeconds
      : DEFAULT_ACCESS_TOKEN_TTL_SEC

  return Date.now() + seconds * 1000
}

/** Delay before proactively refreshing; returns null when refresh should be skipped. */
export function computeProactiveRefreshDelayMs(tokenExpiresAt: number): number | null {
  const REFRESH_MARGIN_MS = 60_000
  const MIN_DELAY_MS = 30_000

  if (!Number.isFinite(tokenExpiresAt)) return null

  const untilExpiry = tokenExpiresAt - Date.now()

  // Already expired — the request interceptor refreshes before the next call.
  if (untilExpiry <= 0) return null

  const delay = untilExpiry - REFRESH_MARGIN_MS
  if (delay <= 0) {
    return Math.max(MIN_DELAY_MS, Math.floor(untilExpiry * 0.5))
  }

  return delay
}
