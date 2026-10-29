import { useState } from "react"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import { LeaveFilterSelect as FilterSelect } from "./LeaveFilterSelect"
import { SearchInput } from "@/components/ui/search-input"
import { StatCard } from "@/components/general/StatCard"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useStaffDirectory } from "@/hooks/staff"
import {
  useAdminLeaveRequests,
  useLeaveAdminOverview,
  useLeaveTypes,
} from "@/hooks/leaveManagement"
import {
  LeaveRequestStatus,
  type LeaveRequestDto,
} from "@/api/leaveManagement.api/types"
import { LeaveStatusBadge, LeaveTypeChip } from "./LeaveStatusBadge"
import { ErrorNote } from "./MyLeaveTab"
import { ReviewLeaveModal } from "./ReviewLeaveModal"
import { formatLeaveRange, toLeaveStatus } from "./utils"

const PAGE_SIZE = 10

const STATUS_TABS = [
  { value: String(LeaveRequestStatus.Pending), label: "Pending" },
  { value: String(LeaveRequestStatus.Approved), label: "Approved" },
  { value: String(LeaveRequestStatus.Rejected), label: "Rejected" },
  { value: "", label: "All requests" },
] as const

const PENDING = String(LeaveRequestStatus.Pending)

export function ApprovalsTab({ schoolId }: { schoolId: string }) {
  const [status, setStatus] = useState<string>(PENDING)
  const [search, setSearch] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [leaveTypeId, setLeaveTypeId] = useState("")
  const [page, setPage] = useState(1)
  const [reviewing, setReviewing] = useState<LeaveRequestDto | null>(null)
  const debouncedSearch = useDebouncedValue(search, 400)

  const overview = useLeaveAdminOverview(schoolId)
  const { data: leaveTypes = [] } = useLeaveTypes(schoolId)
  const { directory } = useStaffDirectory({ schoolId, pageSize: 1 })
  const requests = useAdminLeaveRequests({
    schoolId,
    status: status === "" ? undefined : (Number(status) as LeaveRequestStatus),
    search: debouncedSearch || undefined,
    departmentId: departmentId || undefined,
    leaveTypeId: leaveTypeId || undefined,
    pageNumber: page,
    pageSize: PAGE_SIZE,
  })

  const resetPage = () => setPage(1)

  const columns: DataTableColumn<LeaveRequestDto>[] = [
    {
      key: "staff",
      header: "Staff member",
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900">{r.staffName}</p>
          <p className="text-xs text-gray-500">
            {[r.staffRole, r.staffDepartment].filter(Boolean).join(" · ")}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Leave type",
      render: (r) => (
        <LeaveTypeChip name={r.leaveTypeName} typeId={r.leaveTypeId} />
      ),
    },
    {
      key: "range",
      header: "Requested range",
      render: (r) => formatLeaveRange(r.startDate, r.endDate),
    },
    {
      key: "duration",
      header: "Duration",
      render: (r) => `${r.workingDays} working days`,
    },
    {
      key: "impact",
      header: "Class impact",
      render: (r) =>
        r.impactedPeriods.length > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            <AlertTriangle className="size-3" />
            {r.impactedPeriods.length} periods
          </span>
        ) : (
          <span className="text-gray-400">None</span>
        ),
    },
    {
      key: "submitted",
      header: "Submitted",
      render: (r) => relativeTime(r.dateCreated),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <LeaveStatusBadge status={r.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setReviewing(r)}>
            {toLeaveStatus(r.status) === LeaveRequestStatus.Pending
              ? "Review"
              : "View"}
          </Button>
        </div>
      ),
    },
  ]

  const kpi = overview.data

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending approvals"
          value={overview.isError ? "—" : (kpi?.pendingRequestsCount ?? "…")}
          color="red"
        />
        <StatCard
          label="Staff on leave today"
          value={overview.isError ? "—" : (kpi?.staffOnLeaveTodayCount ?? "…")}
          color="blue"
        />
        <StatCard
          label="Approved this month (working days)"
          value={overview.isError ? "—" : (kpi?.approvedDaysThisMonth ?? "…")}
          color="green"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                setStatus(tab.value)
                resetPage()
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                status === tab.value
                  ? "bg-chart-2 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {tab.value === PENDING && kpi
                ? ` (${kpi.pendingRequestsCount})`
                : ""}
            </button>
          ))}
        </div>
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v)
            resetPage()
          }}
          placeholder="Search by staff name or email"
          containerClassName="max-w-xs"
        />
        <FilterSelect
          value={departmentId}
          onChange={(v) => {
            setDepartmentId(v)
            resetPage()
          }}
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
          onChange={(v) => {
            setLeaveTypeId(v)
            resetPage()
          }}
          placeholder="All leave types"
          options={[
            { value: "", label: "All leave types" },
            ...leaveTypes.map((t) => ({ value: t.id, label: t.name })),
          ]}
          className="w-48"
        />
      </div>

      {requests.isError ? (
        <ErrorNote
          message="Could not load leave requests."
          onRetry={() => requests.refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={requests.data?.items ?? []}
          getRowKey={(r) => r.id}
          isLoading={requests.isPending}
          emptyState={
            <EmptyState
              icon={CheckCircle2}
              title={
                status === PENDING
                  ? "All caught up!"
                  : "No leave requests found"
              }
              description={
                status === PENDING
                  ? "No pending leave requests."
                  : "Try changing the filters."
              }
              size="sm"
            />
          }
          pagination={{
            page,
            total: requests.data?.totalItems ?? 0,
            pageSize: PAGE_SIZE,
            onPageChange: setPage,
          }}
        />
      )}

      {reviewing && (
        <ReviewLeaveModal
          schoolId={schoolId}
          request={reviewing}
          onClose={() => setReviewing(null)}
        />
      )}
    </div>
  )
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}
