import { memo, useMemo, useState } from "react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getEventColor,
  toDisplayEvent,
  type DisplayCalendarEvent,
} from "@/data/calendarEvents"
import type { CalendarEventI } from "@/api/calendar.api/types"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface MonthCalendarGridProps {
  events: CalendarEventI[]
  onDayClick: (dateISO: string) => void
  onEventClick: (event: DisplayCalendarEvent) => void
}

export const MonthCalendarGrid = memo(function MonthCalendarGrid({
  events,
  onDayClick,
  onEventClick,
}: MonthCalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date())
  )

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth))
    const end = endOfWeek(endOfMonth(currentMonth))
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const allEvents = useMemo<DisplayCalendarEvent[]>(
    () => events.map(toDisplayEvent),
    [events]
  )

  const eventsByDay = useMemo(() => {
    const map = new Map<string, DisplayCalendarEvent[]>()
    for (const day of days) {
      const iso = format(day, "yyyy-MM-dd")
      map.set(
        iso,
        allEvents.filter((e) =>
          e.endDate ? iso >= e.date && iso <= e.endDate : e.date === iso
        )
      )
    }
    return map
  }, [days, allEvents])

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="min-w-[760px]">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-gray-900">
              {format(currentMonth, "MMMM yyyy")}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(startOfMonth(new Date()))}
          >
            Today
          </Button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-[11px] font-medium text-gray-500"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const inMonth = isSameMonth(day, currentMonth)
            const dayEvents = eventsByDay.get(format(day, "yyyy-MM-dd")) ?? []
            const visible = dayEvents.slice(0, 3)
            const overflow = dayEvents.length - visible.length

            return (
              <div
                key={day.toISOString()}
                role="button"
                tabIndex={0}
                aria-label={`Add event on ${format(day, "EEEE, d MMMM yyyy")}`}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest("button")) return
                  onDayClick(format(day, "yyyy-MM-dd"))
                }}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    onDayClick(format(day, "yyyy-MM-dd"))
                  }
                }}
                className={`group relative min-h-24 cursor-pointer border-r border-b border-gray-100 p-1.5 last:border-r-0 hover:bg-blue-50/40 ${
                  inMonth ? "bg-white" : "bg-gray-50/60"
                } focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-blue-600`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                      isToday(day)
                        ? "bg-blue-600 font-semibold text-white"
                        : inMonth
                          ? "text-gray-700"
                          : "text-gray-400"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  <Plus
                    size={12}
                    className="text-gray-300 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </div>

                <div className="space-y-0.5">
                  {visible.map((e) => (
                    <button
                      type="button"
                      aria-label={`${e.title} on ${format(day, "d MMMM yyyy")}`}
                      key={e.id}
                      onClick={(ev) => {
                        ev.stopPropagation()
                        onEventClick(e)
                      }}
                      title={e.title}
                      className={`block w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium hover:opacity-80 ${getEventColor(e.type)}`}
                    >
                      {e.title}
                    </button>
                  ))}
                  {overflow > 0 && (
                    <p className="px-1 text-[10px] text-gray-400">
                      +{overflow} more
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})
