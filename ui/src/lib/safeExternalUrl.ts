/**
 * Validate browser navigation targets returned by payment/onboarding APIs.
 * The backend must still enforce a provider allow-list; this blocks script,
 * data and insecure cross-origin URLs from reaching window.location.
 */
export function toSafeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value, window.location.origin)
    const isSameOrigin = url.origin === window.location.origin
    if (!isSameOrigin && url.protocol !== "https:") return null
    if (url.username || url.password) return null
    return url.toString()
  } catch {
    return null
  }
}
