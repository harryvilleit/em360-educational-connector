import type { LiveClassSession } from "@/types/elearning"

function parseLiveSessionDate(date: string) {
  if (!date?.trim()) return null
  const value = /^\d{4}-\d{2}-\d{2}$/.test(date.trim())
    ? `${date.trim()}T12:00:00`
    : date.trim()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatLiveSessionDate(date: string) {
  const parsed = parseLiveSessionDate(date)
  if (!parsed) return "Date unavailable"
  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatLiveSessionShortDate(date: string) {
  const parsed = parseLiveSessionDate(date)
  if (!parsed) return "Date unavailable"
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

export function formatLiveSessionTime(start: string, end: string) {
  return `${start} – ${end}`
}

export function formatLiveSessionPrice(session: LiveClassSession) {
  if (!session.isPaid) return "Free"
  const currency = (session.currency || "USD").toUpperCase()
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(session.price ?? 0)
}

export function filterPublicLiveSessions(
  sessions: LiveClassSession[],
  filters: {
    q?: string
    access?: string
    payment?: string
  }
) {
  const q = filters.q?.trim().toLowerCase() ?? ""
  return sessions.filter((session) => {
    if (filters.access === "public" && session.accessType !== "public")
      return false
    if (filters.access === "private" && session.accessType !== "private")
      return false
    if (filters.payment === "free" && session.isPaid) return false
    if (filters.payment === "paid" && !session.isPaid) return false
    if (!q) return true
    const haystack = [
      session.title,
      session.subject,
      session.teacherName,
      session.courseTitle,
      session.className,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return haystack.includes(q)
  })
}
