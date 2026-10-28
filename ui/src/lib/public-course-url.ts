import { plainText } from "./school-share-metadata.ts"

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const maxUuid = (1n << 128n) - 1n

/** Readable title + lossless identity: duplicate titles never share a URL. */
export function publicCourseSlug(id: string, title?: string | null) {
  if (!title || !uuid.test(id)) return id
  const name = plainText(title).normalize("NFKD").replace(/\p{M}/gu, "")
    .toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "").slice(0, 100).replace(/-+$/g, "") || "course"
  // Base 36 retains all 128 bits; do not truncate IDs or search by title.
  const identity = BigInt(`0x${id.replaceAll("-", "")}`).toString(36)
  return `${name}--${identity}`
}

/** Accept existing ID links and title slugs without changing API/checkout IDs. */
export function publicCourseId(value?: string): string | undefined {
  if (!value || !/^[a-zA-Z0-9_-]{1,190}$/.test(value)) return undefined
  if (!value.includes("--")) return uuid.test(value) ? value.toLowerCase() : value
  const match = /^[a-z0-9]+(?:-[a-z0-9]+)*--([0-9a-z]{1,25})$/.exec(value)
  if (!match) return undefined
  let number = 0n
  for (const digit of match[1]) number = number * 36n + BigInt(parseInt(digit, 36))
  if (number > maxUuid || number.toString(36) !== match[1]) return undefined
  const hex = number.toString(16).padStart(32, "0")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export const coursePublicPath = (id: string, title?: string | null) =>
  `/courses/${encodeURIComponent(publicCourseSlug(id, title))}`

export const coursePackagePublicPath = (id: string, title?: string | null) =>
  `/course-packages/${encodeURIComponent(publicCourseSlug(id, title))}`
