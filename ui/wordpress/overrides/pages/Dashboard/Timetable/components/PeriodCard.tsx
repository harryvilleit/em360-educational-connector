// WordPress version: time changes, edit and remove follow the role's timetable permissions, and failed time saves revert.
import { memo, useState } from "react"
import { MapPin, Pencil, Video } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePermissions } from "@/hooks/usePermissions"
import type { TimetableSlotI } from "@/api/timetable.api/types"
import {
  TIMETABLE_TYPE,
  apiNumberToClassMode,
  formatTimeHHMM,
  getPeriodColorClasses,
  normalizeTimetableType,
} from "@/pages/Dashboard/Timetable/timetable.utils"
import { withCurrentTimeOption } from "@/pages/Dashboard/Timetable/components/PeriodData"

const TIMETABLE_TYPE_LABEL: Record<number, string> = {
  [TIMETABLE_TYPE.Class]: "Class",
  [TIMETABLE_TYPE.Assessment]: "Assessment",
}

export const PeriodCard = memo(function PeriodCard({
  period,
  isPending,
  onEdit,
  onDelete,
  onTimeChange,
  isDeleting,
}: {
  period: TimetableSlotI
  isPending: boolean
  onEdit: () => void
  onDelete: () => void
  onTimeChange: (startTime: string, endTime: string) => Promise<void> | void
  isDeleting: boolean
}) {
  const permissions = usePermissions()
  // Unsaved periods are part of a new timetable (Create); saved ones need Update / Delete.
  const canEdit = isPending
    ? permissions.canCreate("/dashboard/timetable/manage")
    : permissions.canUpdate("/dashboard/timetable/manage")
  const canRemove = isPending
    ? permissions.canCreate("/dashboard/timetable/manage")
    : permissions.canDelete("/dashboard/timetable/manage")
  const [saving, setSaving] = useState(false)
  const [startTime, setStartTime] = useState(formatTimeHHMM(period.startTime))
  const [endTime, setEndTime] = useState(formatTimeHHMM(period.endTime))
  const [syncedTimes, setSyncedTimes] = useState(
    `${period.startTime}|${period.endTime}`
  )

  const currentTimes = `${period.startTime}|${period.endTime}`
  if (currentTimes !== syncedTimes) {
    setSyncedTimes(currentTimes)
    setStartTime(formatTimeHHMM(period.startTime))
    setEndTime(formatTimeHHMM(period.endTime))
  }

  async function commitTime(newStart: string, newEnd: string) {
    if (newStart === formatTimeHHMM(period.startTime) && newEnd === formatTimeHHMM(period.endTime)) return
    setSaving(true)
    try {
      await onTimeChange(newStart, newEnd)
    } catch {
      // Not saved: show the stored times again.
      setStartTime(formatTimeHHMM(period.startTime))
      setEndTime(formatTimeHHMM(period.endTime))
    } finally {
      setSaving(false)
    }
  }

  const timetableType = normalizeTimetableType(period.timetableType)
  const isClassPeriod = !!period.subjectId
  const mode = apiNumberToClassMode(period.classMode)
  const colorClasses = getPeriodColorClasses(period.periodTypeCode || period.periodTypeName)
  const typeLabel = timetableType === undefined ? undefined : TIMETABLE_TYPE_LABEL[timetableType]

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`rounded-lg px-2.5 py-2 text-white shadow-sm ${colorClasses} ${
          isPending ? "ring-2 ring-amber-400 ring-offset-1" : ""
        }`}
      >
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
            {mode === "virtual" ? (
              <Video className="h-3 w-3" />
            ) : (
              <MapPin className="h-3 w-3" />
            )}
            {mode}
          </p>
        )}

        <div className="mt-1.5 flex items-center gap-1">
          <Select
            disabled={!canEdit || saving}
            value={startTime}
            onValueChange={(v) => {
              setStartTime(v)
              void commitTime(v, endTime)
            }}
          >
            <SelectTrigger className="h-5 min-w-0 w-16 gap-0.5 rounded border-0 bg-white px-1 py-0 text-[10px] font-medium text-gray-800 [&_svg]:hidden focus-visible:ring-1 focus-visible:ring-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {withCurrentTimeOption(startTime).map((t) => (
                <SelectItem key={t.value} value={t.value} className="text-xs">
                  {t.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-[10px] text-white/70">–</span>
          <Select
            disabled={!canEdit || saving}
            value={endTime}
            onValueChange={(v) => {
              setEndTime(v)
              void commitTime(startTime, v)
            }}
          >
            <SelectTrigger className="h-5 min-w-0 w-16 gap-0.5 rounded border-0 bg-white px-1 py-0 text-[10px] font-medium text-gray-800 [&_svg]:hidden focus-visible:ring-1 focus-visible:ring-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {withCurrentTimeOption(endTime).map((t) => (
                <SelectItem key={t.value} value={t.value} className="text-xs">
                  {t.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5">
          {!isPending && canEdit && (
            <button
              type="button"
              aria-label="Edit period"
              onClick={onEdit}
              className="rounded p-1 text-white/80 hover:bg-white/20 hover:text-white"
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
          {isPending && (
            <span className="flex items-center gap-1 text-[9px] font-semibold tracking-wide text-amber-100 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              Unsaved
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting || !canRemove || saving}
        className="rounded-lg border border-gray-200 bg-white py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
      >
        {isDeleting ? "Removing…" : "Remove"}
      </button>
    </div>
  )
})
