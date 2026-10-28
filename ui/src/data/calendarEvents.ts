import type { CalendarEventI } from "@/api/calendar.api/types"

export interface DisplayCalendarEvent {
  id: string
  date: string
  endDate?: string
  title: string
  startTime?: string
  endTime?: string
  type: string
  typeLabel: string
  description: string
  affectsAll: boolean
  affectedClasses?: string[]
  source: CalendarEventI
}

const TYPE_COLORS: Record<string, string> = {
  holiday: "bg-red-100 text-red-700",
  exam: "bg-orange-100 text-orange-700",
  test: "bg-purple-100 text-purple-700",
  event: "bg-blue-100 text-blue-700",
  sports: "bg-green-100 text-green-700",
  meeting: "bg-yellow-100 text-yellow-700",
}
const DEFAULT_TYPE_COLOR = "bg-gray-100 text-gray-700"

export function getEventColor(type: string): string {
  return TYPE_COLORS[type.toLowerCase()] ?? DEFAULT_TYPE_COLOR
}

function toDateOnly(iso: string): string {
  return iso.slice(0, 10)
}

export function toDisplayEvent(e: CalendarEventI): DisplayCalendarEvent {
  const date = toDateOnly(e.startDate)
  const endDate = e.endDate ? toDateOnly(e.endDate) : date
  return {
    id: e.id,
    date,
    endDate: endDate !== date ? endDate : undefined,
    title: e.title,
    startTime: e.startTime?.slice(0, 5) || undefined,
    endTime: e.endTime?.slice(0, 5) || undefined,
    type: e.eventTypeName.toLowerCase(),
    typeLabel: e.eventTypeName,
    description: e.description,
    affectsAll: e.affectsAllClasses,
    affectedClasses: e.affectsAllClasses
      ? undefined
      : e.affectedClasses.map((c) => c.schoolClassName),
    source: e,
  }
}

export function toDisplayEvents(
  events: CalendarEventI[]
): DisplayCalendarEvent[] {
  return events.map(toDisplayEvent)
}
