import { useState } from "react"
import { CalendarDays, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { EmptyState } from "@/components/ui/empty-state"
import { LeaveFilterSelect as FilterSelect } from "./LeaveFilterSelect"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import {
  useCancelLeaveRequest,
  useMyLeaveBalances,
  useMyLeaveRequests,
} from "@/hooks/leaveManagement"
import {
  LeaveRequestStatus,
  type LeaveRequestDto,
  type StaffLeaveBalanceDto,
} from "@/api/leaveManagement.api/types"
import { ApplyLeaveModal } from "./ApplyLeaveModal"
import { LeaveStatusBadge, LeaveTypeChip } from "./LeaveStatusBadge"
import {
  canCancelLeave,
  formatDays,
  formatLeaveDate,
  formatLeaveRange,
  formatTimeRange,
  leaveTypeColor,
  toLeaveStatus,
} from "./utils"

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: String(LeaveRequestStatus.Pending), label: "Pending" },
  { value: String(LeaveRequestStatus.Approved), label: "Approved" },
  { value: String(LeaveRequestStatus.Rejected), label: "Rejected" },
  { value: String(LeaveRequestStatus.Cancelled), label: "Cancelled" },
]

export function MyLeaveTab({ schoolId }: { schoolId: string }) {
  const balances = useMyLeaveBalances(schoolId)
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const requests = useMyLeaveRequests({
    schoolId,
    status: status === "" ? undefined : (Number(status) as LeaveRequestStatus),
  })
  const allRequests = requests.data ?? []
  const pageRequests = allRequests.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )
  const cancel = useCancelLeaveRequest(schoolId)

  const [applyOpen, setApplyOpen] = useState(false)
  const [viewing, setViewing] = useState<LeaveRequestDto | null>(null)
  const [cancelling, setCancelling] = useState<LeaveRequestDto | null>(null)

  const handleCancel = async () => {
    if (!cancelling) return
    try {
      await cancel.mutateAsync({ leaveRequestId: cancelling.id, schoolId })
      toast.success("Leave request cancelled.")
      setCancelling(null)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not cancel request."
      )
    }
  }

  const columns: DataTableColumn<LeaveRequestDto>[] = [
    {
      key: "type",
      header: "Leave type",
      render: (r) => (
        <LeaveTypeChip name={r.leaveTypeName} typeId={r.leaveTypeId} />
      ),
    },
    {
      key: "dates",
      header: "Dates",
      render: (r) => formatLeaveRange(r.startDate, r.endDate),
    },
    { key: "days", header: "Working days", render: (r) => r.workingDays },
    {
      key: "reason",
      header: "Reason",
      render: (r) => (
        <span className="line-clamp-1 max-w-56" title={r.reason}>
          {r.reason}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <LeaveStatusBadge
          status={r.status}
          title={r.rejectionReason ?? undefined}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => setViewing(r)}>
            View
          </Button>
          {canCancelLeave(r) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCancelling(r)}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setApplyOpen(true)}>
          <Plus className="size-4" />
          Apply for Leave
        </Button>
      </div>

      <BalanceCards
        balances={balances.data}
        isLoading={balances.isPending}
        isError={balances.isError}
        onRetry={() => balances.refetch()}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900">
            My leave requests
          </h3>
          <FilterSelect
            value={status}
            onChange={(v) => {
              setStatus(v)
              setPage(1)
            }}
            options={STATUS_OPTIONS}
            placeholder="All statuses"
            className="w-44"
          />
        </div>
        {requests.isError ? (
          <ErrorNote
            message="Could not load your leave requests."
            onRetry={() => requests.refetch()}
          />
        ) : (
          <DataTable
            columns={columns}
            data={pageRequests}
            getRowKey={(r) => r.id}
            isLoading={requests.isPending}
            emptyState={
              <EmptyState
                icon={CalendarDays}
                title="No leave requests yet"
                description="Requests you submit will appear here."
                size="sm"
              />
            }
            pagination={{
              page,
              total: allRequests.length,
              pageSize: PAGE_SIZE,
              onPageChange: setPage,
            }}
          />
        )}
      </div>

      {applyOpen && (
        <ApplyLeaveModal
          schoolId={schoolId}
          onClose={() => setApplyOpen(false)}
        />
      )}

      {viewing && (
        <RequestDetailsModal
          request={viewing}
          onClose={() => setViewing(null)}
        />
      )}

      {cancelling && (
        <Modal
          title="Cancel leave request"
          size="md"
          onClose={() => setCancelling(null)}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCancelling(null)}>
                Keep request
              </Button>
              <Button onClick={handleCancel} disabled={cancel.isPending}>
                {cancel.isPending ? "Cancelling..." : "Cancel request"}
              </Button>
            </div>
          }
        >
          <p className="text-sm text-gray-600">
            Cancel your {cancelling.leaveTypeName.toLowerCase()} request for{" "}
            {formatLeaveRange(cancelling.startDate, cancelling.endDate)}?
            {toLeaveStatus(cancelling.status) === LeaveRequestStatus.Approved &&
              " The days will be returned to your balance."}
          </p>
        </Modal>
      )}
    </div>
  )
}

function BalanceCards({
  balances,
  isLoading,
  isError,
  onRetry,
}: {
  balances: StaffLeaveBalanceDto[] | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}) {
  if (isError) {
    return (
      <ErrorNote
        message="Could not load your leave balances."
        onRetry={onRetry}
      />
    )
  }
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    )
  }
  if (!balances?.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No leave balances yet"
        description="Balances appear once a leave policy applies to your role."
        size="sm"
      />
    )
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {balances.map((b) => {
        const total = b.entitledDays + b.carriedForwardDays
        const usedPct =
          total > 0 ? Math.min(100, Math.round((b.usedDays / total) * 100)) : 0
        return (
          <div
            key={b.id}
            className="rounded-2xl border border-gray-100 bg-white p-5"
          >
            <LeaveTypeChip name={b.leaveTypeName} typeId={b.leaveTypeId} />
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {b.availableDays}
              <span className="ml-1 text-sm font-medium text-gray-500">
                days available
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Entitled: {b.entitledDays} · Carried: {b.carriedForwardDays} ·
              Used: {b.usedDays} · Pending: {b.pendingDays}
            </p>
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-valuenow={usedPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${b.leaveTypeName} used`}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${usedPct}%`,
                  backgroundColor: leaveTypeColor(b.leaveTypeId),
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ErrorNote({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
      <Button size="sm" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}

function RequestDetailsModal({
  request,
  onClose,
}: {
  request: LeaveRequestDto
  onClose: () => void
}) {
  return (
    <Modal title="Leave request details" size="lg" onClose={onClose}>
      <dl className="space-y-3 text-sm">
        <Row label="Leave type">
          <LeaveTypeChip
            name={request.leaveTypeName}
            typeId={request.leaveTypeId}
          />
        </Row>
        <Row label="Dates">
          {formatLeaveRange(request.startDate, request.endDate)}
        </Row>
        <Row label="Working days">{formatDays(request.workingDays)}</Row>
        <Row label="Status">
          <LeaveStatusBadge status={request.status} />
        </Row>
        <Row label="Reason">{request.reason}</Row>
        {request.attachmentUrl && (
          <Row label="Attachment">
            <a
              href={request.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-chart-2 underline"
            >
              View document
            </a>
          </Row>
        )}
        {request.reviewedByName && (
          <Row label="Reviewed by">
            {request.reviewedByName}
            {request.reviewedAtUtc &&
              ` on ${formatLeaveDate(request.reviewedAtUtc)}`}
          </Row>
        )}
        {request.rejectionReason && (
          <Row label="Rejection reason">{request.rejectionReason}</Row>
        )}
        {request.impactedPeriods.length > 0 && (
          <Row label="Classes affected">
            <ul className="space-y-1">
              {request.impactedPeriods.map((p, i) => (
                <li key={`${p.date}-${p.startTime}-${i}`}>
                  {formatLeaveDate(p.date)},{" "}
                  {formatTimeRange(p.startTime, p.endTime)} —{" "}
                  {p.schoolClassName}, {p.subjectName}
                  {p.assignedReliefStaffName &&
                    ` (relief: ${p.assignedReliefStaffName})`}
                </li>
              ))}
            </ul>
          </Row>
        )}
      </dl>
    </Modal>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <dt className="text-gray-500">{label}</dt>
      <dd className="col-span-2 text-gray-900">{children}</dd>
    </div>
  )
}
