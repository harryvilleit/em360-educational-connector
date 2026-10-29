import { useEffect, useMemo, useState } from "react"
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  setMonth,
  setYear,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { FilterSelect } from "@/components/ui/filter-select"
import { cn } from "@/lib/utils"
import { mondayOfWeekContaining } from "@/pages/Dashboard/Timetable/timetable.utils"
import type { ELearningCalendarActivity } from "../liveClasses.utils"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const WEEKDAYS_MON_START = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: format(new Date(2020, i, 1), "MMMM"),
}))

const ACTIVITY_COLORS: Record<ELearningCalendarActivity["type"], string> = {
  live: "bg-red-500",
  upcoming: "bg-blue-500",
  ended: "bg-gray-400",
  assignment: "bg-amber-500",
  material: "bg-emerald-500",
}

type CalendarViewMode = "month" | "week"

interface ELearningActivityCalendarProps {
  activities: ELearningCalendarActivity[]
  selectedDate?: string
  onDateSelect: (dateISO: string | undefined) => void
  minDate?: string
  maxDate?: string
  variant?: "compact" | "full"
}

function weekStartFromDate(dateISO?: string): string {
  const base = dateISO ?? format(new Date(), "yyyy-MM-dd")
  return mondayOfWeekContaining(base)
}

function weekRangeLabel(weekStartISO: string): string {
  const start = parseISO(weekStartISO)
  const end = addDays(start, 6)
  const sameMonth = start.getMonth() === end.getMonth()
  if (sameMonth) {
    return `${format(start, "d")} – ${format(end, "d MMMM yyyy")}`
  }
  return `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`
}

export default function ELearningActivityCalendar({
  activities,
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  variant = "compact",
}: ELearningActivityCalendarProps) {
  const isFull = variant === "full"
  const maxVisible = isFull ? 4 : 2

  const initialMonth = selectedDate
    ? startOfMonth(parseISO(selectedDate))
    : startOfMonth(new Date())

  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month")
  const [weekStart, setWeekStart] = useState(() =>
    weekStartFromDate(selectedDate)
  )

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(startOfMonth(parseISO(selectedDate)))
      setWeekStart(weekStartFromDate(selectedDate))
    }
  }, [selectedDate])

  const yearOptions = useMemo(() => {
    const from = minDate
      ? parseISO(minDate.slice(0, 10)).getFullYear() - 1
      : 2024
    const to = maxDate ? parseISO(maxDate.slice(0, 10)).getFullYear() + 1 : 2028
    const lo = Math.min(from, 2024)
    const hi = Math.max(to, 2028)
    return Array.from({ length: hi - lo + 1 }, (_, i) => ({
      value: String(lo + i),
      label: String(lo + i),
    }))
  }, [minDate, maxDate])

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth))
    const end = endOfWeek(endOfMonth(currentMonth))
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const weekDays = useMemo(() => {
    const start = parseISO(weekStart)
    return eachDayOfInterval({ start, end: addDays(start, 6) })
  }, [weekStart])

  const activitiesByDate = useMemo(() => {
    const map = new Map<string, ELearningCalendarActivity[]>()
    for (const activity of activities) {
      const list = map.get(activity.date) ?? []
      list.push(activity)
      map.set(activity.date, list)
    }
    return map
  }, [activities])

  const isDisabled = (day: Date) => {
    const iso = format(day, "yyyy-MM-dd")
    if (minDate && iso < minDate) return true
    if (maxDate && iso > maxDate) return true
    return false
  }

  const goToDate = (dateISO: string) => {
    const date = parseISO(dateISO)
    setCurrentMonth(startOfMonth(date))
    setWeekStart(weekStartFromDate(dateISO))
    onDateSelect(dateISO)
  }

  const handleMonthChange = (monthIndex: string) => {
    setCurrentMonth(startOfMonth(setMonth(currentMonth, Number(monthIndex))))
  }

  const handleYearChange = (year: string) => {
    setCurrentMonth(startOfMonth(setYear(currentMonth, Number(year))))
  }

  const renderDayCell = (
    day: Date,
    inMonth: boolean,
    options?: { showAllActivities?: boolean }
  ) => {
    const iso = format(day, "yyyy-MM-dd")
    const dayActivities = activitiesByDate.get(iso) ?? []
    const showAll = options?.showAllActivities
    const visible = showAll ? dayActivities : dayActivities.slice(0, maxVisible)
    const overflow = showAll ? 0 : dayActivities.length - visible.length
    const selected = selectedDate
      ? isSameDay(day, parseISO(selectedDate))
      : false
    const disabled = isDisabled(day)

    return (
      <button
        key={iso}
        type="button"
        disabled={disabled}
        onClick={() => onDateSelect(iso)}
        className={cn(
          "relative border-r border-b border-gray-100 p-1.5 text-left transition-colors last:border-r-0 sm:p-2",
          showAll ? "min-h-36" : isFull ? "min-h-28" : "min-h-[4.5rem]",
          inMonth ? "bg-white" : "bg-gray-50/60",
          selected && "bg-blue-50 ring-1 ring-blue-200 ring-inset",
          !disabled && !selected && "hover:bg-blue-50/40",
          disabled && "cursor-not-allowed opacity-40"
        )}
      >
        <span
          className={cn(
            "mb-1 flex items-center justify-center rounded-full font-medium",
            isFull || showAll ? "h-6 w-6 text-xs" : "h-5 w-5 text-[10px]",
            isToday(day) && "bg-blue-600 font-semibold text-white",
            !isToday(day) && inMonth && "text-gray-700",
            !isToday(day) && !inMonth && "text-gray-400"
          )}
        >
          {format(day, "d")}
        </span>

        <div className="space-y-0.5">
          {visible.map((activity) => (
            <div
              key={activity.id}
              title={activity.title}
              className={cn(
                "flex items-center gap-1 truncate rounded px-0.5 py-px text-gray-700",
                isFull || showAll ? "text-[11px]" : "text-[9px]"
              )}
            >
              <span
                className={cn(
                  "shrink-0 rounded-full",
                  isFull || showAll ? "size-2" : "size-1.5",
                  ACTIVITY_COLORS[activity.type]
                )}
              />
              <span className="truncate">{activity.title}</span>
            </div>
          ))}
          {overflow > 0 && (
            <p
              className={cn(
                "px-0.5 text-gray-400",
                isFull ? "text-[10px]" : "text-[9px]"
              )}
            >
              +{overflow} more
            </p>
          )}
        </div>
      </button>
    )
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm",
        isFull && "h-full"
      )}
    >
      <div
        className={cn(
          "border-b border-gray-100",
          isFull ? "px-5 py-4" : "px-4 py-3"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className={cn(
              "font-semibold text-gray-900",
              isFull ? "text-base" : "text-sm"
            )}
          >
            Activity Calendar
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {isFull && (
              <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                {(["month", "week"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      if (mode === "week") {
                        setWeekStart(
                          weekStartFromDate(
                            selectedDate ?? format(currentMonth, "yyyy-MM-dd")
                          )
                        )
                      } else {
                        setCurrentMonth(
                          startOfMonth(
                            selectedDate
                              ? parseISO(selectedDate)
                              : parseISO(weekStart)
                          )
                        )
                      }
                      setViewMode(mode)
                    }}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                      viewMode === mode
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => goToDate(format(new Date(), "yyyy-MM-dd"))}
            >
              Today
            </Button>
          </div>
        </div>

        {isFull && (
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-gray-500">Month</p>
              <FilterSelect
                value={String(currentMonth.getMonth())}
                onChange={handleMonthChange}
                options={MONTH_OPTIONS}
                triggerClassName="h-8 w-32 py-2 text-xs"
                itemClassName="text-xs"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-gray-500">Year</p>
              <FilterSelect
                value={String(currentMonth.getFullYear())}
                onChange={handleYearChange}
                options={yearOptions}
                triggerClassName="h-8 w-24 py-2 text-xs"
                itemClassName="text-xs"
              />
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-muted-foreground",
              isFull ? "text-sm" : "text-xs"
            )}
          >
            {viewMode === "month"
              ? format(currentMonth, "MMMM yyyy")
              : `Week · ${weekRangeLabel(weekStart)}`}
          </p>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                if (viewMode === "month") {
                  setCurrentMonth((m) => subMonths(m, 1))
                } else {
                  setWeekStart((w) =>
                    format(subWeeks(parseISO(w), 1), "yyyy-MM-dd")
                  )
                }
              }}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (viewMode === "month") {
                  setCurrentMonth((m) => addMonths(m, 1))
                } else {
                  setWeekStart((w) =>
                    format(addWeeks(parseISO(w), 1), "yyyy-MM-dd")
                  )
                }
              }}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "month" ? (
        <>
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className={cn(
                  "px-2 py-2 text-center font-medium text-gray-500",
                  isFull ? "text-xs" : "text-[10px]"
                )}
              >
                {d}
              </div>
            ))}
          </div>

          <div className={cn("grid grid-cols-7", isFull && "min-h-0 flex-1")}>
            {monthDays.map((day) =>
              renderDayCell(day, isSameMonth(day, currentMonth))
            )}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
            {WEEKDAYS_MON_START.map((d) => (
              <div
                key={d}
                className="px-2 py-2 text-center text-xs font-medium text-gray-500"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {weekDays.map((day) =>
              renderDayCell(day, true, { showAllActivities: true })
            )}
          </div>
        </>
      )}

      <div
        className={cn(
          "space-y-2 border-t border-gray-100",
          isFull ? "px-5 py-4" : "px-4 py-3"
        )}
      >
        {selectedDate && (
          <button
            type="button"
            onClick={() => onDateSelect(undefined)}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            View all dates in range
          </button>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {(
            [
              ["Live class", "live"],
              ["Upcoming", "upcoming"],
              ["Assignment", "assignment"],
              ["Material", "material"],
            ] as const
          ).map(([label, type]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "rounded-full",
                  isFull ? "size-2.5" : "size-2",
                  ACTIVITY_COLORS[type]
                )}
              />
              <span
                className={cn(
                  "text-gray-500",
                  isFull ? "text-xs" : "text-[10px]"
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
