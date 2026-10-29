import { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import {
  ActivitySquare,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  XCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllHostels, useGetHostelAttendanceHistory } from "@/hooks/hostel"
import type { HostelAttendanceSessionI } from "@/api/hostel.api/types"
import { PageHeader } from "@/components/general/PageHeader"
import { DashboardRoutes } from "@/routes"
import { StatusBadge } from "./components/StatusBadge"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import Pagination from "@/components/ui/pagination"
import { formatDate } from "@/utils"
import {
  ATTENDANCE_PERIOD_OPTIONS,
  attendanceStatusVariant,
  attendanceStatusLabel,
  ATTENDANCE_STATUS,
} from "@/schema/hostelAttendance.schema"

const PAGE_SIZE = 20

// ── Session Detail Modal ──────────────────────────────────────────────────────

function SessionDetailModal({
  session,
  onClose,
}: {
  session: HostelAttendanceSessionI
  onClose: () => void
}) {
  const absentStudents = session.studentRecords.filter(
    (c) => c.status !== ATTENDANCE_STATUS.Present
  )
  const presentStudents = session.studentRecords.filter(
    (c) => c.status === ATTENDANCE_STATUS.Present
  )

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {session.hostelName} —{" "}
            {ATTENDANCE_PERIOD_OPTIONS.find((o) => o.value === session.period)
              ?.label ?? session.period}{" "}
            · {formatDate(session.date, "short")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary strip */}
          <div className="grid grid-cols-4 gap-3">
            {[
              {
                label: "Total",
                value: session.studentRecords.length,
                color: "text-gray-900",
              },
              {
                label: "Present",
                value: session.totalPresent,
                color: "text-green-600",
              },
              {
                label: "Absent",
                value: session.totalAbsent,
                color: "text-red-600",
              },
              {
                label: "Late/Excused",
                value: session.totalLate + session.totalExcused,
                color: "text-orange-600",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg bg-gray-50 p-3 text-center"
              >
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400">
            Conducted by{" "}
            <span className="font-medium text-gray-600">
              {session.conductedByUserName}
            </span>
          </p>

          {/* Non-present students first */}
          {absentStudents.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Absent / Late / Excused
              </p>
              <div className="space-y-1">
                {absentStudents.map((c) => (
                  <div
                    key={c.studentId}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {c.studentName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {c.roomName}
                        {c.bedName && ` · ${c.bedName}`} · {c.className}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge variant={attendanceStatusVariant(c.status)} dot>
                        {attendanceStatusLabel(c.status)}
                      </StatusBadge>
                      {c.remarks && (
                        <span className="text-xs text-gray-400">
                          {c.remarks}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Present students */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Present ({presentStudents.length})
            </p>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {presentStudents.map((c) => (
                <div
                  key={c.studentId}
                  className="flex items-center gap-2 rounded-lg bg-green-50 px-2.5 py-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                  <span className="truncate text-xs font-medium text-gray-700">
                    {c.studentName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AttendanceHistoryPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const schoolId = useSchoolId()
  const [searchParams] = useSearchParams()
  const hostelIdParam = searchParams.get("hostelId") ?? "all"

  const { hostels } = useGetAllHostels({ schoolId, pageSize: 100 })

  const [hostelFilter, setHostelFilter] = useState(hostelIdParam)
  const [periodFilter, setPeriodFilter] = useState<number | "all">("all")
  const [dateFilter, setDateFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewSession, setViewSession] =
    useState<HostelAttendanceSessionI | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { sessions, pagination, isLoading } = useGetHostelAttendanceHistory({
    schoolId,
    hostelId: hostelFilter !== "all" ? hostelFilter : undefined,
    period: periodFilter !== "all" ? periodFilter : undefined,
    date: dateFilter || undefined,
    pageNumber: currentPage,
    pageSize: PAGE_SIZE,
  })

  const handleHostelChange = (v: string) => {
    setHostelFilter(v)
    setCurrentPage(1)
  }

  const handlePeriodChange = (v: string) => {
    setPeriodFilter(v === "all" ? "all" : Number(v))
    setCurrentPage(1)
  }

  const handleDateChange = (v: string) => {
    setDateFilter(v)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance History"
        description="Daily roll call records"
        onBack={() => navigate(DashboardRoutes.toHostel(productId ?? ""))}
        stats={[{ label: "Total Sessions", value: pagination?.totalItems ?? 0 }]}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={hostelFilter} onValueChange={handleHostelChange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hostels</SelectItem>
            {hostels.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={periodFilter === "all" ? "all" : String(periodFilter)}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            {ATTENDANCE_PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-44"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Date</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Hostel</TableHead>
              <TableHead>Conducted By</TableHead>
              <TableHead className="text-center">Present</TableHead>
              <TableHead className="text-center">Absent</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Rate</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <EmptyState
                    icon={ActivitySquare}
                    title="No attendance records"
                    description="Roll call records will appear here once attendance is taken."
                  />
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => {
                const total = session.studentRecords.length
                const rate =
                  total > 0
                    ? Math.round((session.totalPresent / total) * 100)
                    : 0
                const isExpanded = expandedId === session.id

                return (
                  <>
                    <TableRow
                      key={session.id}
                      className="cursor-pointer hover:bg-blue-50/40"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : session.id)
                      }
                    >
                      <TableCell className="font-medium text-gray-800">
                        {formatDate(session.date, "short")}
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant="info">
                          {ATTENDANCE_PERIOD_OPTIONS.find(
                            (o) => o.value === session.period
                          )?.label ?? session.period}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {session.hostelName}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {session.conductedByUserName}
                      </TableCell>
                      <TableCell className="text-center font-medium text-green-600">
                        {session.totalPresent}
                      </TableCell>
                      <TableCell className="text-center font-medium text-red-600">
                        {session.totalAbsent}
                      </TableCell>
                      <TableCell className="text-center font-medium text-gray-700">
                        {total}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-semibold ${rate >= 90 ? "text-green-600" : rate >= 75 ? "text-orange-600" : "text-red-600"}`}
                        >
                          {rate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expanded absentees */}
                    {isExpanded && (
                      <TableRow key={`${session.id}-exp`}>
                        <TableCell colSpan={9} className="bg-gray-50 p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              {session.studentRecords
                                .filter(
                                  (c) => c.status !== ATTENDANCE_STATUS.Present
                                )
                                .map((c) => (
                                  <div
                                    key={c.studentId}
                                    className="flex items-center gap-3 text-sm"
                                  >
                                    <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                                    <span className="font-medium text-gray-800">
                                      {c.studentName}
                                    </span>
                                    <span className="text-gray-400">
                                      {c.roomName}
                                    </span>
                                    <StatusBadge
                                      variant={attendanceStatusVariant(
                                        c.status
                                      )}
                                    >
                                      {attendanceStatusLabel(c.status)}
                                    </StatusBadge>
                                    {c.remarks && (
                                      <span className="text-xs text-gray-400">
                                        {c.remarks}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              {session.totalAbsent === 0 && (
                                <p className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle2 className="h-4 w-4" />
                                  All students present
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setViewSession(session)
                              }}
                              className="text-xs font-medium text-blue-600 hover:underline"
                            >
                              Full Details →
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })
            )}
          </TableBody>
        </Table>

        {pagination && pagination.totalItems > PAGE_SIZE && (
          <Pagination
            page={currentPage}
            total={pagination.totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {viewSession && (
        <SessionDetailModal
          session={viewSession}
          onClose={() => setViewSession(null)}
        />
      )}
    </div>
  )
}
