import { cn } from "@/lib/utils"
import { LeaveRequestStatus } from "@/api/leaveManagement.api/types"
import { LEAVE_STATUS_LABEL, leaveTypeColor, toLeaveStatus } from "./utils"

const STYLES: Record<LeaveRequestStatus, string> = {
  [LeaveRequestStatus.Pending]: "bg-amber-50 text-amber-700 ring-amber-200",
  [LeaveRequestStatus.Approved]:
    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  [LeaveRequestStatus.Rejected]: "bg-red-50 text-red-700 ring-red-200",
  [LeaveRequestStatus.Cancelled]: "bg-gray-100 text-gray-600 ring-gray-200",
}

export function LeaveStatusBadge({
  status,
  title,
}: {
  status: LeaveRequestStatus | string
  title?: string
}) {
  const value = toLeaveStatus(status)
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[value]
      )}
    >
      {LEAVE_STATUS_LABEL[value]}
    </span>
  )
}

export function LeaveTypeChip({
  name,
  typeId,
}: {
  name: string
  typeId: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
      <span
        className="size-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: leaveTypeColor(typeId) }}
      />
      {name}
    </span>
  )
}
