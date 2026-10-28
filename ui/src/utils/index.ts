import type { Module } from "@/types"
import type { SchoolSessionItem } from "@/api/userMgt.api/types"
import { validatePhoneValue } from "@/utils/phone"

export const getGreeting = (name?: string) => {
  const hour = new Date().getHours()

  let greeting = "Hello 👋"

  if (hour < 12) greeting = "Good morning 👋"
  else if (hour < 17) greeting = "Good afternoon 👋"
  else if (hour < 21) greeting = "Good evening 👋"
  else greeting = "Good night 👋"

  return name ? `${greeting}, ${name}` : greeting
}

export function getInitials(name?: string) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

//  Helper to convert module IDs to Module objects
export const createModuleFromId = (moduleId: string): Module => {
  const moduleNames: Record<string, string> = {
    attendance: "Attendance",
    exams_and_records: "Exams and Records",
    timetable: "Timetable",
    fees: "Fee Management",
    library: "Library",
    hostel: "Hostel",
    transport: "Transport",
    health_records: "Health Records",
    parent_portal: "Parent Portal",
    e_learning: "E-Learning",
    user_management: "User Management",
    teachers_portal: "Teachers Portal",
    students: "Students",
  }

  return {
    id: moduleId,
    name: moduleNames[moduleId] || moduleId,
    menus: [],
  }
}

export const getOrdinalRank = (position: number): string => {
  const suffixes = ["th", "st", "nd", "rd"]
  const lastDigit = position % 10
  const lastTwoDigits = position % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${position}th`
  }
  return `${position}${suffixes[lastDigit] || "th"}`
}

// Calculate grade based on total score
export const calculateGrade = (total: number): string => {
  if (total >= 90) return "A"
  if (total >= 80) return "B"
  if (total >= 70) return "C"
  if (total >= 60) return "D"
  if (total >= 50) return "E"
  return "F"
}

export const getGradeColor = (grade?: string): string => {
  switch (grade) {
    case "A":
      return "bg-green-100 text-green-800 border-green-300"
    case "B":
      return "bg-blue-100 text-blue-800 border-blue-300"
    case "C":
      return "bg-purple-100 text-purple-800 border-purple-300"
    case "D":
      return "bg-orange-100 text-orange-800 border-orange-300"
    case "E":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "F":
      return "bg-red-100 text-red-800 border-red-300"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

export type DateFormat = "long" | "short" | "numeric" | "YYYY-MM-DD"

/**
 * Format a date for display. Accepts an ISO string or Date and returns
 * "" for empty/invalid input so callers can fall back to a placeholder.
 *
 * Formats:
 * - "long"       e.g. 29 January 1998 (default)
 * - "short"      e.g. 29 Jan 1998
 * - "numeric"    e.g. 29/01/1998
 * - "YYYY-MM-DD" e.g. 1998-01-29
 */
export function formatDate(
  dateStr?: string | Date | null,
  format: DateFormat = "long"
): string {
  if (!dateStr) return ""
  const date = dateStr instanceof Date ? dateStr : new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ""

  switch (format) {
    case "YYYY-MM-DD": {
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, "0")
      const dd = String(date.getDate()).padStart(2, "0")
      return `${yyyy}-${mm}-${dd}`
    }
    case "short":
      return date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    case "numeric":
      return date.toLocaleDateString("en-GB")
    case "long":
    default:
      return date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
  }
}

const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

export function fmtDate(iso?: string | null): string {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-")
  return `${parseInt(d)} ${SHORT_MONTHS[parseInt(m) - 1]} ${y}`
}


export function formatDateTime(dateStr?: string | Date | null): string {
  if (!dateStr) return "—"
  const date = dateStr instanceof Date ? dateStr : new Date(dateStr)
  if (Number.isNaN(date.getTime())) return "—"
  return `${formatDate(date, "short")} · ${date.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  })}`
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}


export function termBadgeColor(name: string) {
  const l = name.toLowerCase()
  if (l.includes("1st") || l.includes("first")) return "bg-blue-100 text-blue-700"
  if (l.includes("2nd") || l.includes("second")) return "bg-purple-100 text-purple-700"
  if (l.includes("3rd") || l.includes("third")) return "bg-teal-100 text-teal-700"
  return "bg-gray-100 text-gray-700"
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === "string" && error.trim()) return error
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string" &&
    (error as { message: string }).message.trim()
  ) {
    return (error as { message: string }).message
  }
  return fallback
}


export function isValidPhoneNumber(phone: string): boolean {
  return !validatePhoneValue(phone)
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim())
}
export function filterSessionsSinceEnrollment(
  sessions: SchoolSessionItem[],
  admissionDate?: string | null
): SchoolSessionItem[] {
  if (!admissionDate) return sessions
  const admission = admissionDate.slice(0, 10)
  return sessions.filter(
    (s) =>
      s.Terms.length === 0 ||
      s.Terms.some((t) => t.EndDate.slice(0, 10) >= admission)
  )
}
