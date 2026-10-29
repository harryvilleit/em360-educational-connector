import { memo, useMemo, useState } from "react"
import type { TimetableSlotI } from "@/api/timetable.api/types"
import type { DayName } from "@/types/timetable"
import { PeriodCard } from "./PeriodCard"
import { PERIOD_TEMPLATE_DRAG_TYPE } from "./PeriodBankPanel"

// ─── Day column body — a single cell inside WeekGridTable, not its own
// bordered card (the header row and outer border live in WeekGridTable). ──────

export const DayColumn = memo(function DayColumn({
  day,
  periods,
  pendingIds,
  onDropTemplate,
  onEdit,
  onDelete,
  onTimeSave,
  deletingId,
}: {
  day: DayName
  periods: TimetableSlotI[]
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
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const sorted = useMemo(
    () => [...periods].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [periods]
  )

  return (
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
        if (templateId) onDropTemplate(day, templateId)
      }}
      className={`min-h-32 space-y-2 border-r border-gray-200 p-2 transition-colors last:border-r-0 ${
        isDragOver ? "bg-blue-50" : ""
      }`}
    >
      {sorted.length === 0 ? (
        isDragOver ? (
          <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-blue-400 px-2 text-center text-[11px] text-blue-500">
            Drop to schedule
          </div>
        ) : null
      ) : (
        sorted.map((period) => (
          <PeriodCard
            key={period.id}
            period={period}
            isPending={pendingIds.has(period.id)}
            onEdit={() => onEdit(period)}
            onDelete={() => onDelete(period.id)}
            onTimeChange={(start, end) => onTimeSave(period, start, end)}
            isDeleting={deletingId === period.id}
          />
        ))
      )}
    </div>
  )
})
