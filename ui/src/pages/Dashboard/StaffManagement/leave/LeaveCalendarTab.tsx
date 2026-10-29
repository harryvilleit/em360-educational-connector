import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { LeaveFilterSelect as FilterSelect } from "./LeaveFilterSelect"
import { useStaffDirectory } from "@/hooks/staff"
import { useLeaveCalendar, useLeaveTypes } from "@/hooks/leaveManagement"
import {
  HalfDayPeriod,
  LeaveRequestStatus,
  type LeaveCalendarItemDto,
} from "@/api/leaveManagement.api/types"
import { LeaveStatusBadge } from "./LeaveStatusBadge"
import { ErrorNote } from "./MyLeaveTab"
import {
  formatDays,
  formatLeaveRange,
  leaveTypeColor,
  toHalfDayPeriod,
  toIsoDate,
  toLeaveStatus,
} from "./utils"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MAX_CHIPS = 3

export function LeaveCalendarTab({ schoolId }: { schoolId: string }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [departmentId, setDepartmentId] = useState("")
  const [leaveTypeId, setLeaveTypeId] = useState("")
  const [selected, setSelected] = useState<LeaveCalendarItemDto | null>(null)

  const { directory } = useStaffDirectory({ schoolId, pageSize: 1 })
  const { data: leaveTypes = [] } = useLeaveTypes(schoolId)

  const gridStart = startOfWeek(month, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const calendar = useLeaveCalendar({
    schoolId,
    startDate: toIsoDate(gridStart),
    endDate: toIsoDate(gridEnd),
    departmentId: departmentId || undefined,
    leaveTypeId: leaveTypeId || undefined,
  })

  const items = useMemo(
    () =>
      (calendar.data ?? []).filter((i) => {
        const status = toLeaveStatus(i.status)
        return (
          status === LeaveRequestStatus.Approved ||
          status === LeaveRequestStatus.Pending
        )
      }),
    [calendar.data]
  )

  const itemsOn = (iso: string) =>
    items.filter(
      (i) => i.startDate.slice(0, 10) <= iso && iso <= i.endDate.slice(0, 10)
    )

  const exportCsv = () => {
    const rows = [
      [
        "Staff",
        "Department",
        "Leave type",
        "Start",
        "End",
        "Working days",
        "Status",
      ],
      ...items.map((i) => [
        i.staffName,
        i.staffDepartment ?? "",
        i.leaveTypeName,
        i.startDate.slice(0, 10),
        i.endDate.slice(0, 10),
        String(i.workingDays),
        String(i.status),
      ]),
    ]
    const csv = rows
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `leave-calendar-${format(month, "yyyy-MM")}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="outline"
            aria-label="Previous month"
            onClick={() => setMonth((m) => addMonths(m, -1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setMonth(startOfMonth(new Date()))}
          >
            Today
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label="Next month"
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <h2 className="min-w-36 text-base font-semibold text-gray-900">
          {format(month, "MMMM yyyy")}
        </h2>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <FilterSelect
            value={departmentId}
            onChange={setDepartmentId}
            placeholder="All departments"
            options={[
              { value: "", label: "All departments" },
              ...(directory?.availableDepartments ?? []).map((d) => ({
                value: d.id,
                label: d.name,
              })),
            ]}
            className="w-48"
          />
          <FilterSelect
            value={leaveTypeId}
            onChange={setLeaveTypeId}
            placeholder="All leave types"
            options={[
              { value: "", label: "All leave types" },
              ...leaveTypes.map((t) => ({ value: t.id, label: t.name })),
            ]}
            className="w-48"
          />
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={items.length === 0}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {calendar.isError ? (
        <ErrorNote
          message="Could not load the leave calendar."
          onRetry={() => calendar.refetch()}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const iso = toIsoDate(day)
              const dayItems = itemsOn(iso)
              return (
                <div
                  key={iso}
                  className={`min-h-24 border-r border-b border-gray-50 p-1.5 ${
                    isSameMonth(day, month) ? "" : "bg-gray-50/60 text-gray-400"
                  }`}
                >
                  <p className="mb-1 text-xs">{format(day, "d")}</p>
                  <div className="space-y-1">
                    {dayItems.slice(0, MAX_CHIPS).map((i) => (
                      <button
                        key={i.id}
                        type="button"
                        onClick={() => setSelected(i)}
                        className="block w-full truncate rounded px-1.5 py-0.5 text-left text-xs font-medium text-white"
                        style={{
                          backgroundColor: leaveTypeColor(i.leaveTypeId),
                        }}
                        title={`${i.staffName} — ${i.leaveTypeName}`}
                      >
                        {halfDayIcon(i)} {i.staffName}
                      </button>
                    ))}
                    {dayItems.length > MAX_CHIPS && (
                      <p className="px-1 text-xs text-gray-500">
                        +{dayItems.length - MAX_CHIPS} more
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {calendar.isSuccess && items.length === 0 && (
        <p className="text-center text-sm text-gray-500">
          No staff on leave in this period.
        </p>
      )}

      {selected && (
        <Modal
          title="Leave details"
          size="md"
          onClose={() => setSelected(null)}
        >
          <dl className="space-y-2 text-sm">
            <p className="text-base font-semibold text-gray-900">
              {selected.staffName}
            </p>
            {selected.staffDepartment && (
              <p className="text-gray-500">{selected.staffDepartment}</p>
            )}
            <p className="text-gray-900">
              {selected.leaveTypeName} ·{" "}
              {formatLeaveRange(selected.startDate, selected.endDate)}
            </p>
            <p className="text-gray-600">
              {formatDays(selected.workingDays)}
              {selected.isHalfDay &&
                ` · ${toHalfDayPeriod(selected.halfDayPeriod) === HalfDayPeriod.Morning ? "Morning" : "Afternoon"} only`}
            </p>
            <LeaveStatusBadge status={selected.status} />
          </dl>
        </Modal>
      )}
    </div>
  )
}

function halfDayIcon(item: LeaveCalendarItemDto): string {
  if (!item.isHalfDay) return ""
  return toHalfDayPeriod(item.halfDayPeriod) === HalfDayPeriod.Morning
    ? "AM"
    : "PM"
}
