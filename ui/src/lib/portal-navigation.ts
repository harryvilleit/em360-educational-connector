/** Normal app navigation; the WordPress build replaces this small host boundary. */
export function openExternalPage(url: string) {
  window.location.assign(url)
}
export function endPortalSession(fallback: string) {
  window.location.assign(fallback)
}

export function publicSiteUrl(path: string) {
  return path
}

export function localSchoolRoute(path: string): string | undefined {
  return path
}
