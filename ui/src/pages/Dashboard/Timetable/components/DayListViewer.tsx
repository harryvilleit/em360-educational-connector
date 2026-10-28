import { useMemo, useState } from "react"
import { ClipboardCheck, Clock, MapPin, Video } from "lucide-react"
import type { TimetableSlotI } from "@/api/timetable.api/types"
import type { DayName } from "@/types/timetable"
import {
  TIMETABLE_TYPE,
  apiNumberToClassMode,
  dateForDayInWeek,
  dayNameFromDate,
  formatTimeHHMM,
  normalizeTimetableType,
} from "../timetable.utils"

const DAY_NAMES: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

const CA_COLORS: Record<string, string> = {
  "CA 1": "bg-blue-100 text-blue-700",
  "CA 2": "bg-purple-100 text-purple-700",
  "CA 3": "bg-orange-100 text-orange-700",
}

interface DayListViewerProps {
  weekStart: string
  periodsByDay: Map<DayName, TimetableSlotI[]>
  today: string
}

/** Read-only day-by-day list for the parent/student Timetable viewer —
 * mirrors Admin's DayListView (day tabs over the same week-scoped data the
 * grid uses) minus the drag/edit/delete affordances that only make sense
 * when building a timetable. */
export function DayListViewer({ weekStart, periodsByDay, today }: DayListViewerProps) {
  const weekEnd = dateForDayInWeek("Sunday", weekStart)
  const defaultDay =
    today >= weekStart && today <= weekEnd ? dayNameFromDate(today) : "Monday"
  const [activeDay, setActiveDay] = useState<DayName>(defaultDay)

  const periods = useMemo(
    () =>
      [...(periodsByDay.get(activeDay) ?? [])].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      ),
    [periodsByDay, activeDay]
  )

  const dateISO = dateForDayInWeek(activeDay, weekStart)
  const dateLabel = useMemo(() => {
    const d = new Date(`${dateISO}T00:00:00`)
    return `${d.getDate()}/${d.getMonth() + 1}`
  }, [dateISO])

  const status: "past" | "today" | "upcoming" =
    dateISO < today ? "past" : dateISO === today ? "today" : "upcoming"

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAY_NAMES.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setActiveDay(day)}
            className={`shrink-0 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
              activeDay === day
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-3">
          <p className="text-sm font-semibold text-gray-900">
            {activeDay} <span className="font-normal text-gray-400">{dateLabel}</span>
          </p>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              status === "today"
                ? "bg-green-100 text-green-700"
                : status === "upcoming"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            {status === "today" ? "Today" : status === "upcoming" ? "Upcoming" : "Past"}
          </span>
        </div>

        {periods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <ClipboardCheck size={32} className="mb-2 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              No periods scheduled for {activeDay}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {periods.map((period) => (
              <DayListRow key={period.id} period={period} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DayListRow({ period }: { period: TimetableSlotI }) {
  const type = normalizeTimetableType(period.timetableType)
  const isAssessment = type === TIMETABLE_TYPE.Assessment
  const mode = apiNumberToClassMode(period.classMode)

  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-3.5">
      <div className="flex w-24 shrink-0 items-center gap-1 text-xs text-gray-400">
        <Clock size={11} />
        {formatTimeHHMM(period.startTime)}–{formatTimeHHMM(period.endTime)}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          {isAssessment && (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-blue-700 uppercase">
              Assessment
            </span>
          )}
          <p className="text-sm font-medium text-gray-800">
            {period.subjectName || period.periodTypeName}
          </p>
        </div>
        {isAssessment && (period.venue || period.assessmentType) && (
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
            {period.venue && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {period.venue}
              </span>
            )}
            {period.assessmentType && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  CA_COLORS[period.assessmentType] ?? ""
                }`}
              >
                {period.assessmentType}
              </span>
            )}
          </p>
        )}
        {!isAssessment && period.subjectName && mode && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400 capitalize">
            {mode === "virtual" ? <Video size={11} /> : <MapPin size={11} />}
            {mode}
          </p>
        )}
      </div>
    </div>
  )
}
