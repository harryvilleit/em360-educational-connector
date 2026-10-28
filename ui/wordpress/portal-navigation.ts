import { runtime } from "./runtime"
export function openExternalPage(url: string) {
  const target = new URL(url)
  if (target.protocol !== "https:") throw new Error("Invalid external address.")
  window.top!.location.href = target.href
}
export function endPortalSession(_fallback: string) {
  window.dispatchEvent(new Event("em360:session-ended"))
}

export function publicSiteUrl(path: string) {
  const base = new URL(runtime().frontendBase)
  if (base.protocol !== "https:") throw new Error("Invalid EM360 website.")
  return base.href.replace(/\/$/, "") + "/" + path.replace(/^\//, "")
}

// Calendar and other school modules are not included in this release.
export function localSchoolRoute(_path: string): string | undefined {
  return undefined
}
