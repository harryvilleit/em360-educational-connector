import { MapPin, Video } from "lucide-react"
import type { TimetableSlotI } from "@/api/timetable.api/types"
import type { DayName } from "@/types/timetable"
import {
  TIMETABLE_TYPE,
  apiNumberToClassMode,
  dateForDayInWeek,
  formatTimeHHMM,
  getPeriodColorClasses,
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

const TIMETABLE_TYPE_LABEL: Record<number, string> = {
  [TIMETABLE_TYPE.Class]: "Class",
  [TIMETABLE_TYPE.Assessment]: "Assessment",
}

function dateLabelFor(day: DayName, weekStart: string) {
  const iso = dateForDayInWeek(day, weekStart)
  const d = new Date(`${iso}T00:00:00`)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

interface WeekGridViewerProps {
  weekStart: string
  weekNumber: number | null
  periodsByDay: Map<DayName, TimetableSlotI[]>
}


export function WeekGridViewer({ weekStart, weekNumber, periodsByDay }: WeekGridViewerProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <div className="grid min-w-[820px] grid-cols-[52px_repeat(7,minmax(110px,1fr))]">
        {/* Header row */}
        <div className="border-r border-b border-gray-200 bg-gray-50 px-2 py-2.5 text-center">
          <p className="text-sm font-semibold text-gray-900">Wk</p>
        </div>
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="border-r border-b border-gray-200 bg-gray-50 px-2 py-2.5 text-center last:border-r-0"
          >
            <p className="text-sm font-semibold text-gray-900">
              {day.slice(0, 3)}{" "}
              <span className="font-normal text-gray-400">{dateLabelFor(day, weekStart)}</span>
            </p>
          </div>
        ))}

        {/* Body row */}
        <div className="flex items-center justify-center border-r border-gray-200 p-2">
          <span className="text-base font-bold text-gray-700">{weekNumber ?? "–"}</span>
        </div>
        {DAY_NAMES.map((day) => (
          <DayColumnViewer key={day} periods={periodsByDay.get(day) ?? []} />
        ))}
      </div>
    </div>
  )
}

function DayColumnViewer({ periods }: { periods: TimetableSlotI[] }) {
  const sorted = [...periods].sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <div className="min-h-32 space-y-2 border-r border-gray-200 p-2 last:border-r-0">
      {sorted.length === 0 ? (
        <p className="px-1 py-4 text-center text-[11px] text-gray-300">—</p>
      ) : (
        sorted.map((period) => <PeriodChip key={period.id} period={period} />)
      )}
    </div>
  )
}

function PeriodChip({ period }: { period: TimetableSlotI }) {
  const timetableType = normalizeTimetableType(period.timetableType)
  const isClassPeriod = !!period.subjectId
  const mode = apiNumberToClassMode(period.classMode)
  const colorClasses = getPeriodColorClasses(period.periodTypeCode || period.periodTypeName)
  const typeLabel = timetableType === undefined ? undefined : TIMETABLE_TYPE_LABEL[timetableType]

  return (
    <div className={`rounded-lg px-2.5 py-2 text-white shadow-sm ${colorClasses}`}>
      {typeLabel && typeLabel !== "Class" && (
        <span className="mb-1 inline-block rounded bg-white/20 px-1.5 py-0.5 text-[8px] font-bold tracking-wide uppercase">
          {typeLabel}
        </span>
      )}
      <p className="truncate text-xs font-semibold">
        {period.subjectName || period.periodTypeName}
      </p>
      {timetableType === TIMETABLE_TYPE.Assessment && period.venue && (
        <p className="truncate text-[10px] text-white/80">{period.venue}</p>
      )}
      {timetableType === TIMETABLE_TYPE.Assessment && period.assessmentType && (
        <p className="truncate text-[10px] text-white/80">{period.assessmentType}</p>
      )}
      {isClassPeriod && timetableType === TIMETABLE_TYPE.Class && mode && (
        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/70">
          {mode === "virtual" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
          {mode}
        </p>
      )}
      <p className="mt-1.5 text-[10px] font-medium text-white/90">
        {formatTimeHHMM(period.startTime)}–{formatTimeHHMM(period.endTime)}
      </p>
    </div>
  )
}
