import type { TimetableSlotI } from "@/api/timetable.api/types"
import type { DayName } from "@/types/timetable"
import { dateForDayInWeek } from "../timetable.utils"
import { DayColumn } from "./DayColumn"

const DAY_NAMES: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

function dateLabelFor(day: DayName, weekStart: string) {
  const iso = dateForDayInWeek(day, weekStart)
  const d = new Date(`${iso}T00:00:00`)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

interface WeekGridTableProps {
  weekStart: string
  weekNumber: number | null
  periodsByDay: Map<DayName, TimetableSlotI[]>
  pendingIds: Set<string>
  onDropTemplate: (day: DayName, templateId: string) => void
  onEdit: (slot: TimetableSlotI) => void
  onDelete: (id: string) => void
  onTimeSave: (
    period: TimetableSlotI,
    startTime: string,
    endTime: string
  ) => void
  deletingId: string | null
}


export function WeekGridTable({
  weekStart,
  weekNumber,
  periodsByDay,
  pendingIds,
  onDropTemplate,
  onEdit,
  onDelete,
  onTimeSave,
  deletingId,
}: WeekGridTableProps) {
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
              <span className="font-normal text-gray-400">
                {dateLabelFor(day, weekStart)}
              </span>
            </p>
          </div>
        ))}

        {/* Body row */}
        <div className="flex items-center justify-center border-r border-gray-200 p-2">
          <span className="text-base font-bold text-gray-700">
            {weekNumber ?? "–"}
          </span>
        </div>
        {DAY_NAMES.map((day) => (
          <DayColumn
            key={day}
            day={day}
            periods={periodsByDay.get(day) ?? []}
            pendingIds={pendingIds}
            onDropTemplate={onDropTemplate}
            onEdit={onEdit}
            onDelete={onDelete}
            onTimeSave={onTimeSave}
            deletingId={deletingId}
          />
        ))}
      </div>
    </div>
  )
}
