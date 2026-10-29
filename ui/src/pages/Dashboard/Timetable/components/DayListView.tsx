import { memo, useMemo, useState } from "react"
import { MapPin, Pencil, Video } from "lucide-react"
import type { TimetableSlotI } from "@/api/timetable.api/types"
import type { DayName } from "@/types/timetable"
import {
  TIMETABLE_TYPE,
  apiNumberToClassMode,
  dateForDayInWeek,
  formatTimeHHMM,
  normalizeTimetableType,
} from "../timetable.utils"
import { PERIOD_TEMPLATE_DRAG_TYPE } from "./PeriodBankPanel"

const TIMETABLE_TYPE_LABEL: Record<number, string> = {
  [TIMETABLE_TYPE.Class]: "Class",
  [TIMETABLE_TYPE.Assessment]: "Assessment",
}

const DAY_NAMES: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

interface DayListViewProps {
  weekStart: string
  periodsByDay: Map<DayName, TimetableSlotI[]>
  pendingIds: Set<string>
  onDropTemplate: (day: DayName, templateId: string) => void
  onEdit: (slot: TimetableSlotI) => void
  onDelete: (id: string) => void
  deletingId: string | null
}


export function DayListView({
  weekStart,
  periodsByDay,
  pendingIds,
  onDropTemplate,
  onEdit,
  onDelete,
  deletingId,
}: DayListViewProps) {
  const [activeDay, setActiveDay] = useState<DayName>("Monday")
  const [isDragOver, setIsDragOver] = useState(false)

  const periods = useMemo(
    () =>
      [...(periodsByDay.get(activeDay) ?? [])].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      ),
    [periodsByDay, activeDay]
  )

  const dateLabel = useMemo(() => {
    const iso = dateForDayInWeek(activeDay, weekStart)
    const d = new Date(`${iso}T00:00:00`)
    return `${d.getDate()}/${d.getMonth() + 1}`
  }, [activeDay, weekStart])

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

      <div
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = "copy"
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          const templateId = e.dataTransfer.getData(PERIOD_TEMPLATE_DRAG_TYPE)
          if (templateId) onDropTemplate(activeDay, templateId)
        }}
        className={`overflow-hidden rounded-xl border transition-colors ${
          isDragOver ? "border-blue-400 bg-blue-50/40" : "border-gray-200 bg-white"
        }`}
      >
        <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
          <p className="text-sm font-semibold text-gray-900">
            {activeDay}{" "}
            <span className="font-normal text-gray-400">{dateLabel}</span>
          </p>
        </div>

        {periods.length === 0 ? (
          <p
            className={`px-5 py-10 text-center text-sm ${
              isDragOver ? "text-blue-500" : "text-muted-foreground"
            }`}
          >
            {isDragOver
              ? "Drop to schedule"
              : `No periods scheduled for ${activeDay}. Drag a period here.`}
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {periods.map((period) => (
              <DayListRow
                key={period.id}
                period={period}
                isPending={pendingIds.has(period.id)}
                isDeleting={deletingId === period.id}
                onEdit={() => onEdit(period)}
                onDelete={() => onDelete(period.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const DayListRow = memo(function DayListRow({
  period,
  isPending,
  isDeleting,
  onEdit,
  onDelete,
}: {
  period: TimetableSlotI
  isPending: boolean
  isDeleting: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const type = normalizeTimetableType(period.timetableType)
  const isAssessment = type === TIMETABLE_TYPE.Assessment
  const mode = apiNumberToClassMode(period.classMode)

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 ${
        isPending ? "bg-amber-50/60" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="w-20 shrink-0 text-xs text-gray-400">
          <p>{formatTimeHHMM(period.startTime)}</p>
          <p>{formatTimeHHMM(period.endTime)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            {type !== undefined && type !== TIMETABLE_TYPE.Class && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-blue-700 uppercase">
                {TIMETABLE_TYPE_LABEL[type]}
              </span>
            )}
            <p className="text-sm font-medium text-gray-800">
              {period.subjectName || period.periodTypeName}
            </p>
          </div>
          {isAssessment && (period.venue || period.assessmentType) && (
            <p className="text-xs text-gray-400">
              {[period.assessmentType, period.venue]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          {!isAssessment && period.subjectName && mode && (
            <p className="flex items-center gap-1 text-xs text-gray-400 capitalize">
              {mode === "virtual" ? (
                <Video className="h-3 w-3" />
              ) : (
                <MapPin className="h-3 w-3" />
              )}
              {mode}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isPending ? (
          <span className="flex items-center gap-1 text-[9px] font-semibold tracking-wide text-amber-600 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Unsaved
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            >
              {isDeleting ? "Removing…" : "Remove"}
            </button>
          </>
        )}
      </div>
    </div>
  )
})
