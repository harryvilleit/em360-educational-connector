import DOMPurify from "dompurify"

const FORBIDDEN_TAGS = [
  "base",
  "embed",
  "form",
  "iframe",
  "link",
  "meta",
  "object",
  "script",
  "style",
]

/** Sanitize API- and editor-provided rich text before inserting it into the DOM. */
export function sanitizeHtml(value: string | null | undefined): string {
  if (!value) return ""

  return DOMPurify.sanitize(value, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: FORBIDDEN_TAGS,
    FORBID_ATTR: ["srcdoc"],
  })
}
