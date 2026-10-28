const CSRF_STORAGE_KEY = "em360-session-csrf-token"

export function readCsrfToken(): string | null {
  try {
    const sharedToken = localStorage.getItem(CSRF_STORAGE_KEY)
    if (sharedToken) return sharedToken

    const legacyToken = sessionStorage.getItem(CSRF_STORAGE_KEY)
    if (legacyToken) {
      localStorage.setItem(CSRF_STORAGE_KEY, legacyToken)
      sessionStorage.removeItem(CSRF_STORAGE_KEY)
    }
    return legacyToken
  } catch {
    return null
  }
}

export function writeCsrfToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(CSRF_STORAGE_KEY, token)
    else localStorage.removeItem(CSRF_STORAGE_KEY)

    // Remove the previous tab-scoped copy so a stale value cannot be restored.
    sessionStorage.removeItem(CSRF_STORAGE_KEY)
  } catch {
    // Best effort. A browser that blocks web storage will simply be unable
    // to refresh and will receive the API's normal 403 response.
  }
}
