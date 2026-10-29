import { format, parseISO } from "date-fns"
import type {
  ClassMaterial,
  ELearningAssignment,
  LiveClassSession,
} from "@/types/elearning"
export interface LiveClassFilters {
  className: string
  term: string
  startDate: string
  endDate: string
  selectedDate?: string
  search: string
}

export const DEFAULT_LIVE_CLASS_FILTERS: LiveClassFilters = {
  className: "all",
  term: "all",
  startDate: "",
  endDate: "",
  selectedDate: undefined,
  search: "",
}

export type ELearningCalendarActivity = {
  id: string
  date: string
  title: string
  type: "live" | "upcoming" | "ended" | "assignment" | "material"
  time?: string
}

function matchesBaseFilters(
  item: {
    className?: string
    classId?: string
    term?: string
    subject?: string
    title?: string
    teacherName?: string
    uploadedBy?: string
  },
  filters: LiveClassFilters
): boolean {
  // `className` filter holds the selected class **id**. Only items that carry a
  // classId are constrained by it (mock assignments/materials without one stay
  // visible until their own modules are wired to the DB).
  if (
    filters.className !== "all" &&
    item.classId &&
    item.classId !== filters.className
  ) {
    return false
  }

  if (filters.term !== "all" && item.term && item.term !== filters.term) {
    return false
  }

  const query = filters.search.trim().toLowerCase()
  if (query) {
    const haystack = [
      item.title,
      item.subject,
      item.className,
      item.teacherName,
      item.uploadedBy,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    if (!haystack.includes(query)) return false
  }

  return true
}

export function filterLiveClassSessions(
  sessions: LiveClassSession[],
  filters: LiveClassFilters
): LiveClassSession[] {
  return sessions.filter((session) => {
    if (!matchesBaseFilters(session, filters)) return false

    if (filters.startDate && session.scheduledDate < filters.startDate)
      return false
    if (filters.endDate && session.scheduledDate > filters.endDate) return false

    if (
      filters.selectedDate &&
      session.scheduledDate !== filters.selectedDate
    ) {
      return false
    }

    return true
  })
}

export function buildCalendarActivities(
  sessions: LiveClassSession[],
  assignments: ELearningAssignment[],
  materials: ClassMaterial[],
  filters: LiveClassFilters
): ELearningCalendarActivity[] {
  const activities: ELearningCalendarActivity[] = []

  for (const session of sessions) {
    if (!matchesBaseFilters(session, filters)) continue
    if (filters.startDate && session.scheduledDate < filters.startDate) continue
    if (filters.endDate && session.scheduledDate > filters.endDate) continue

    activities.push({
      id: session.id,
      date: session.scheduledDate,
      title: session.title,
      type:
        session.status === "live"
          ? "live"
          : session.status === "upcoming"
            ? "upcoming"
            : "ended",
      time: session.startTime,
    })
  }

  for (const assignment of assignments) {
    if (!matchesBaseFilters(assignment, filters)) continue
    if (filters.startDate && assignment.dueDate < filters.startDate) continue
    if (filters.endDate && assignment.dueDate > filters.endDate) continue

    activities.push({
      id: assignment.id,
      date: assignment.dueDate,
      title: assignment.title,
      type: "assignment",
    })
  }

  for (const material of materials) {
    if (!matchesBaseFilters(material, filters)) continue
    if (filters.startDate && material.uploadedAt < filters.startDate) continue
    if (filters.endDate && material.uploadedAt > filters.endDate) continue

    activities.push({
      id: material.id,
      date: material.uploadedAt,
      title: material.title,
      type: "material",
    })
  }

  return activities.sort((a, b) => a.date.localeCompare(b.date))
}

export function dateHeading(filters: LiveClassFilters): string {
  if (filters.selectedDate) {
    return format(parseISO(filters.selectedDate), "EEEE, d MMMM yyyy")
  }
  if (!filters.startDate && !filters.endDate) return "all dates"
  if (!filters.startDate)
    return `until ${format(parseISO(filters.endDate), "d MMM yyyy")}`
  if (!filters.endDate)
    return `from ${format(parseISO(filters.startDate), "d MMM yyyy")}`
  return `${format(parseISO(filters.startDate), "d MMM yyyy")} – ${format(parseISO(filters.endDate), "d MMM yyyy")}`
}

export function parseLiveClassFilters(
  params: URLSearchParams
): LiveClassFilters {
  const termParam = params.get("term") ?? DEFAULT_LIVE_CLASS_FILTERS.term
  return {
    className: params.get("class") ?? DEFAULT_LIVE_CLASS_FILTERS.className,
    term: termParam,
    startDate: params.get("startDate") ?? DEFAULT_LIVE_CLASS_FILTERS.startDate,
    endDate: params.get("endDate") ?? DEFAULT_LIVE_CLASS_FILTERS.endDate,
    selectedDate: (() => {
      const dateParam = params.get("date")
      return dateParam && dateParam !== "all" ? dateParam : undefined
    })(),
    search: params.get("search") ?? "",
  }
}

export function liveClassFiltersToParams(
  filters: LiveClassFilters
): Record<string, string> {
  const params: Record<string, string> = {}

  if (filters.className !== "all") params.class = filters.className
  params.term = filters.term
  if (filters.startDate) params.startDate = filters.startDate
  if (filters.endDate) params.endDate = filters.endDate
  if (filters.selectedDate) params.date = filters.selectedDate
  if (filters.search.trim()) params.search = filters.search.trim()

  return params
}
