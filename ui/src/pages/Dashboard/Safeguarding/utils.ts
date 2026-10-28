export function labelFromCode(value?: string) {
  if (!value) return "—"
  return value.replace(/([a-z])([A-Z])/g, "$1 $2")
}

export function formatDateTime(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatDate(value?: string) {
  if (!value) return "—"
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function toLocalDateTimeInput(value: Date) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export function toLocalDateInput(value: Date) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-gray-50 disabled:text-gray-500"
export const textareaClass = `${inputClass} h-auto min-h-24 py-2`

export const concernCategories = [
  "PhysicalAbuse",
  "EmotionalAbuse",
  "SexualAbuse",
  "Neglect",
  "PeerOnPeerAbuse",
  "OnlineSafety",
  "DomesticAbuse",
  "Exploitation",
  "Radicalisation",
  "MissingEducation",
  "MentalHealth",
  "Bullying",
  "Discrimination",
  "Other",
] as const

export const actionTypes = [
  "ImmediateSafety",
  "SpeakWithLearner",
  "ContactParentOrGuardian",
  "InternalReview",
  "Monitor",
  "MultiAgencyMeeting",
  "ExternalReferral",
  "InformationSharing",
  "Other",
] as const
