import DOMPurify from "dompurify"

export function cleanSchoolHtml(value: string | null | undefined): string {
  return DOMPurify.sanitize(value ?? "", {
    ALLOWED_TAGS: [
      "p",
      "br",
      "div",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
      "a",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      "caption",
    ],
    ALLOWED_ATTR: ["href", "title", "rel"],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  })
    .replace(/<div>/g, "<p>")
    .replace(/<\/div>/g, "</p>")
}
export function schoolHtmlText(value: string | null | undefined): string {
  const element = document.createElement("div")
  element.innerHTML = cleanSchoolHtml(value)
  return (element.textContent ?? "").replace(/\s+/g, " ").trim()
}
