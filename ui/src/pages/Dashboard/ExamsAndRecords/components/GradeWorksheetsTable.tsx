import { memo, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  FileText,
  MoreHorizontal,
  SlidersHorizontal,
  XCircle,
} from "lucide-react"
import type { GradeWorksheetSummaryI } from "@/api/examAndRecords.api/types"
import { useGetMySubUsers } from "@/hooks/userMgt"
import { useSchoolId } from "@/contexts/SchoolContext"

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatusFilter = "pending" | "approved" | "rejected" | "all"

interface FilterStats {
  pending: number
  approved: number
  rejected: number
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  all:      { label: "All Statuses",  badgeVariant: "outline"     as const, badgeClass: "border-gray-200 bg-gray-50 text-gray-600" },
  pending:  { label: "Pending",       badgeVariant: "outline"     as const, badgeClass: "border-amber-200 bg-amber-50 text-amber-700" },
  approved: { label: "Approved",      badgeVariant: "outline"     as const, badgeClass: "border-green-200 bg-green-50 text-green-700" },
  rejected: { label: "Rejected",      badgeVariant: "destructive" as const, badgeClass: "border-red-200 bg-red-50 text-red-700" },
} satisfies Record<StatusFilter, object>

const FILTER_KEYS: StatusFilter[] = ["all", "pending", "approved", "rejected"]

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase() as StatusFilter
  const cfg = STATUS_CONFIG[key] ?? STATUS_CONFIG.all
  return (
    <Badge variant={cfg.badgeVariant} className={`gap-1 ${cfg.badgeClass}`}>
      {key === "pending"  && <Clock       className="h-3 w-3" />}
      {key === "approved" && <CheckCircle2 className="h-3 w-3" />}
      {key === "rejected" && <XCircle      className="h-3 w-3" />}
      {cfg.label}
    </Badge>
  )
})

function StatusFilterDropdown({
  value,
  onChange,
}: {
  value: StatusFilter
  stats: FilterStats
  onChange: (v: StatusFilter) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
          {STATUS_CONFIG[value].label}
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40 rounded-xl p-1">
        {FILTER_KEYS.map((key) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onChange(key)}
            className="cursor-pointer rounded-lg px-3 py-2 text-xs text-gray-700 focus:bg-gray-50"
          >
            {STATUS_CONFIG[key].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const RowActions = memo(function RowActions({
  entry,
  onView,
  onApprove,
  onReject,
}: {
  entry: GradeWorksheetSummaryI
  onView: (e: GradeWorksheetSummaryI) => void
  onApprove: (e: GradeWorksheetSummaryI) => void
  onReject: (e: GradeWorksheetSummaryI) => void
}) {
  const isPending = entry.status.toLowerCase() === "pending"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl">
        <DropdownMenuItem
          className="cursor-pointer gap-2 rounded-lg text-xs text-gray-600"
          onClick={(e) => { e.stopPropagation(); onView(entry) }}
        >
          <Eye className="size-3.5 text-gray-400" />
          View Details
        </DropdownMenuItem>
        {isPending && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs text-green-600 focus:text-green-600"
              onClick={(e) => { e.stopPropagation(); onApprove(entry) }}
            >
              <CheckCircle2 className="size-3.5 text-green-500" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs text-red-600 focus:text-red-600"
              onClick={(e) => { e.stopPropagation(); onReject(entry) }}
            >
              <XCircle className="size-3.5 text-red-500" />
              Reject
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

// ─── SubmittedByCell ──────────────────────────────────────────────────────────


interface SubmitterInfo {
  name: string
  email: string | null
}

const SubmittedByCell = memo(function SubmittedByCell({
  info,
}: {
  info: SubmitterInfo | undefined
}) {
  if (!info) return <span className="text-gray-400">—</span>

  return (
    <div>
      <p className="text-sm font-medium text-gray-800">{info.name || "—"}</p>
      {info.email && <p className="text-xs text-gray-400">{info.email}</p>}
    </div>
  )
})

// ─── Main component ───────────────────────────────────────────────────────────

interface GradeWorksheetsTableProps {
  isLoading: boolean
  filteredEntries: GradeWorksheetSummaryI[]
  statusFilter: StatusFilter
  stats: FilterStats
  onStatusFilterChange: (filter: StatusFilter) => void
  onView: (entry: GradeWorksheetSummaryI) => void
  onApprove: (entry: GradeWorksheetSummaryI) => void
  onReject: (entry: GradeWorksheetSummaryI) => void
}

export default function GradeWorksheetsTable({
  isLoading,
  filteredEntries,
  statusFilter,
  stats,
  onStatusFilterChange,
  onView,
  onApprove,
  onReject,
}: GradeWorksheetsTableProps) {
  const schoolId = useSchoolId()
  // Fetched once for the whole table (not per row) so worksheet submitters
  // can be resolved to a name/email via a single lookup Map.
  const { subUsers } = useGetMySubUsers({ schoolId, pageSize: 1000 })
  const submitterInfoMap = useMemo(() => {
    const map = new Map<string, SubmitterInfo>()
    subUsers.forEach((u) => {
      map.set(u.SubUserId, {
        name: [u.FirstName, u.LastName].filter(Boolean).join(" "),
        email: u.Email ?? u.email ?? null,
      })
    })
    return map
  }, [subUsers])

  const columns: DataTableColumn<GradeWorksheetSummaryI>[] = useMemo(
    () => [
      {
        key: "class",
        header: "Class",
        render: (e) => <span className="font-medium text-gray-900">{e.className}</span>,
      },
      {
        key: "subject",
        header: "Subject",
        render: (e) => e.subjectName,
      },
      {
        key: "term",
        header: "Term",
        cellClassName: "text-gray-600",
        render: (e) => e.termName,
      },
      {
        key: "gradeDistribution",
        header: "Grade Distribution",
        cellClassName: "text-gray-600",
        render: (e) => e.gradeDistribution || "—",
      },
      {
        key: "students",
        header: "Students",
        render: (e) => e.totalStudents,
      },
      {
        key: "submittedBy",
        header: "Submitted By",
        render: (e) => (
          <SubmittedByCell
            info={e.submittedBy ? submitterInfoMap.get(e.submittedBy) : undefined}
          />
        ),
      },
      {
        key: "dateModified",
        header: "Date Modified",
        cellClassName: "text-gray-600",
        render: (e) =>
          e.dateModified ? new Date(e.dateModified).toLocaleDateString() : "—",
      },
      {
        key: "status",
        header: "Status",
        render: (e) => <StatusBadge status={e.status} />,
      },
      {
        key: "actions",
        header: "Actions",
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (e) => (
          <RowActions
            entry={e}
            onView={onView}
            onApprove={onApprove}
            onReject={onReject}
          />
        ),
      },
    ],
    [submitterInfoMap, onView, onApprove, onReject]
  )

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <CardTitle className="text-base">Submitted Grade Worksheets</CardTitle>

        {/* Filter — always on the right */}
        <StatusFilterDropdown
          value={statusFilter}
          stats={stats}
          onChange={onStatusFilterChange}
        />
      </div>

      <CardContent className="p-0">
        <DataTable
          columns={columns}
          data={filteredEntries}
          getRowKey={(e) => e.worksheetId}
          isLoading={isLoading}
          wrapperClassName=""
          emptyState={
            <EmptyState
              icon={FileText}
              title="No worksheets found"
              description={`No ${statusFilter !== "all" ? statusFilter : ""} grade submissions found.`}
              size="sm"
            />
          }
        />
      </CardContent>
    </Card>
  )
}
