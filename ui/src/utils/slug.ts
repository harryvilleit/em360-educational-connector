/**
 * Converts a school name to a URL-safe slug.
 * e.g. "Greenfield Academy" → "greenfield-academy"
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

/**
 * Returns true if the string matches the standard UUID v4 format.
 * Used to detect whether a route param is a raw UUID or a human-readable slug.
 */
export function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    str
  )
}
