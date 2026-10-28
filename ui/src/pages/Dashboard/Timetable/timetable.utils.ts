import type { DayName, PeriodMode } from "@/types/timetable"

export const TIMETABLE_TYPE = {
  Class: 1,
  Assessment: 2,
} as const

const TIMETABLE_TYPE_NAME_TO_NUMBER: Record<string, number> = {
  class: TIMETABLE_TYPE.Class,
  assessment: TIMETABLE_TYPE.Assessment,
}


export function normalizeTimetableType(
  value: number | string | null | undefined
): number | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value === "number") {
   
    if (value === TIMETABLE_TYPE.Class || value === TIMETABLE_TYPE.Assessment) {
      return value
    }
    return value + 1
  }
  return TIMETABLE_TYPE_NAME_TO_NUMBER[value.trim().toLowerCase()]
}


const DAY_NAME_TO_API_DAY_OF_WEEK: Record<DayName, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
}

export function dayNameToApiDayOfWeek(day: DayName): number {
  return DAY_NAME_TO_API_DAY_OF_WEEK[day]
}



const API_TO_CLASS_MODE: Record<number, PeriodMode> = {
  1: "physical",
  2: "virtual",
}


const CLASS_MODE_NAME_TO_NUMBER: Record<string, number> = {
  physical: 1,
  online: 2,
  virtual: 2,
}


export function normalizeClassMode(
  value: number | string | null | undefined
): number | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value === "number") return value
  return CLASS_MODE_NAME_TO_NUMBER[value.trim().toLowerCase()]
}


export function apiNumberToClassMode(
  value: number | string | null | undefined
): PeriodMode {
  const numeric = normalizeClassMode(value)
  return numeric === undefined ? "" : (API_TO_CLASS_MODE[numeric] ?? "")
}

const DAY_OFFSET_FROM_MONDAY: Record<DayName, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
}

function toUtcDate(dateISO: string): Date {
  const [y, m, d] = dateISO.slice(0, 10).split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function utcDateToISO(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function mondayOfWeekContaining(dateISO: string): string {
  const date = toUtcDate(dateISO)
  const day = date.getUTCDay()
  const diff = 1 - (day === 0 ? 7 : day)
  date.setUTCDate(date.getUTCDate() + diff)
  return utcDateToISO(date)
}


export function currentWeekMonday(): string {
  const now = new Date()
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`
  return mondayOfWeekContaining(todayISO)
}


export function dateForDayInWeek(dayOfWeek: DayName, weekStartISO: string): string {
  const date = toUtcDate(weekStartISO)
  date.setUTCDate(date.getUTCDate() + DAY_OFFSET_FROM_MONDAY[dayOfWeek])
  return utcDateToISO(date)
}

const WEEKDAY_FROM_JS_GET_DAY: DayName[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]


export function dayNameFromDate(dateISO: string): DayName {
  return WEEKDAY_FROM_JS_GET_DAY[toUtcDate(dateISO).getUTCDay()]
}


const VALID_DAY_NAMES: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

function normalizeDayName(value: string): DayName | undefined {
  const trimmed = value.trim().toLowerCase()
  return VALID_DAY_NAMES.find((d) => d.toLowerCase() === trimmed)
}

export function resolveDayName(slot: {
  dayOfWeekName?: string | null
  date?: string | null
}): DayName | undefined {
  if (slot.dayOfWeekName) {
    const normalized = normalizeDayName(slot.dayOfWeekName)
    if (normalized) return normalized
  }
  if (slot.date) return dayNameFromDate(slot.date)
  return undefined
}

export function formatWeekRangeLabel(weekStartISO: string): string {
  const start = toUtcDate(weekStartISO)
  const end = toUtcDate(weekStartISO)
  end.setUTCDate(end.getUTCDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
  return `${fmt(start)} – ${fmt(end)}`
}


export function weekNumberInTerm(weekStartISO: string, termStart?: string): number | null {
  if (!termStart) return null
  const firstWeekStart = mondayOfWeekContaining(termStart.slice(0, 10))
  const diffDays = Math.round(
    (toUtcDate(weekStartISO).getTime() - toUtcDate(firstWeekStart).getTime()) / (24 * 60 * 60 * 1000)
  )
  return Math.floor(diffDays / 7) + 1
}



export function formatTimeHHMM(time: string): string {
  return time.slice(0, 5)
}

export function getPeriodColorClasses(periodTypeCode: string | null | undefined): string {
  const t = (periodTypeCode ?? "").toLowerCase()
  if (t === "break" || t === "lunch") return "bg-gray-500"
  if (t === "assembly") return "bg-blue-500"
  if (t === "sport" || t === "sportorclub") return "bg-blue-700"
  if (t === "free" || t === "freeperiod") return "bg-blue-400"
  return "bg-blue-600"
}

export function timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd
}


export function normalizeTimeForApi(raw: string): string {
  const trimmed = raw.trim()
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (!match) return trimmed

  let hour = parseInt(match[1], 10)
  const minute = match[2] ?? "00"
  const meridiem = match[3]?.toLowerCase()
  if (meridiem === "pm" && hour < 12) hour += 12
  if (meridiem === "am" && hour === 12) hour = 0

  return `${String(hour).padStart(2, "0")}:${minute}`
}
