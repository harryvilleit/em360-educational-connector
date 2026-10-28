export type SchoolIdCard = {
  kind: "student" | "staff"
  schoolId: string
  schoolName: string
  schoolLogo?: string
  personId: string
  displayId: string
  name: string
  photo?: string
  className?: string
  gender?: string
  schoolPhone?: string
  schoolEmail?: string
  schoolAddress?: string
  role?: string
  department?: string
  session?: string
  issuedOn?: string
}

function singleLine(value: string) {
  return value.replace(/[\r\n\t]+/g, " ").trim()
}

export function idCardIssuedDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function idCardQrText(card: SchoolIdCard): string {
  return [
    `${card.kind === "student" ? "Student" : "Staff"} ID Card`,
    `School: ${singleLine(card.schoolName)}`,
    `Name: ${singleLine(card.name)}`,
    `${card.kind === "student" ? "Student" : "Staff"} ID: ${singleLine(card.displayId)}`,
    ...(card.kind === "student" && card.className
      ? [`Class: ${singleLine(card.className)}`]
      : []),
    ...(card.kind === "student" && card.session
      ? [`Session: ${singleLine(card.session)}`]
      : []),
    ...(card.kind === "staff" && card.role
      ? [`Role: ${singleLine(card.role)}`]
      : []),
    ...(card.issuedOn ? [`Issued: ${singleLine(card.issuedOn)}`] : []),
  ].join("\n")
}

/** Recovers the card kind and ID from a scanned {@link idCardQrText} payload. */
export function parseIdCardQrText(
  payload: string
): { kind: "student" | "staff"; displayId: string } | null {
  const firstLine = payload.split("\n")[0]?.trim()
  const kind =
    firstLine === "Student ID Card"
      ? "student"
      : firstLine === "Staff ID Card"
        ? "staff"
        : null
  if (!kind) return null
  const idLine = payload
    .split("\n")
    .find((line) =>
      line.startsWith(kind === "student" ? "Student ID: " : "Staff ID: ")
    )
  const displayId = idLine?.split(": ").slice(1).join(": ").trim()
  if (!displayId) return null
  return { kind, displayId }
}

export function safeCardImage(value?: string | null): string | undefined {
  if (!value) return undefined
  if (/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(value)) return value
  if (/^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value)) return value
  return undefined
}
