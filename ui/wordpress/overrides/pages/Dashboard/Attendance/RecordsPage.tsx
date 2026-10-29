// WordPress version: records open on the school's own date.
import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { format } from "date-fns"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId, useSchoolTimeZone } from "@/contexts/SchoolContext"
import { dateISOInTimeZone } from "@/lib/schoolDate"
import { useGetAttendanceDashboard } from "@/hooks/studentAttendance"
import { DashboardRoutes } from "@/routes"
import AttendanceSessionCard from "@/pages/Dashboard/Attendance/components/AttendanceSessionCard"
import AttendanceRecordsEmptyState from "@/pages/Dashboard/Attendance/components/AttendanceRecordsEmptyState"

export default function AttendanceRecordsPage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const schoolId = useSchoolId()
  // The school's own date, not the visitor's.
  const schoolToday = dateISOInTimeZone(useSchoolTimeZone())
  const [filterDate, setFilterDate] = useState(() => schoolToday)
  const [filterClass, setFilterClass] = useState("all")
  const { dashboard, isLoading, isError } = useGetAttendanceDashboard({
    schoolId,
    attendanceDate: filterDate,
  })
  const summaries = useMemo(
    () => dashboard?.todaysSummary ?? [],
    [dashboard?.todaysSummary]
  )
  const classes = useMemo(
    () =>
      summaries.map((summary) => ({
        id: summary.schoolClassId,
        name: summary.schoolClassName,
      })),
    [summaries]
  )
  const filtered = summaries.filter(
    (summary) => filterClass === "all" || summary.schoolClassId === filterClass
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Attendance Records"
        description="Browse attendance saved to the school record"
        onBack={() =>
          navigate(DashboardRoutes.toAttendanceStudents(productId!))
        }
        backLabel="Back to Student Attendance"
      />

      <div className="flex flex-wrap items-center gap-4">
        <select
          aria-label="Filter by class"
          value={filterClass}
          onChange={(event) => setFilterClass(event.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
        >
          <option value="all">All Classes</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <input
          aria-label="Attendance date"
          type="date"
          value={filterDate}
          onChange={(event) => {
            setFilterDate(event.target.value)
            setFilterClass("all")
          }}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
        />
      </div>

      {isLoading ? (
        <AttendanceRecordsEmptyState message="Loading attendance records…" />
      ) : isError ? (
        <AttendanceRecordsEmptyState
          message="Attendance records could not be loaded."
          alert
        />
      ) : filtered.length === 0 ? (
        <AttendanceRecordsEmptyState message="No saved attendance was found for this date." />
      ) : (
        <div className="space-y-4">
          {filtered.map((summary) => (
            <AttendanceSessionCard
              key={summary.sessionId}
              summary={summary}
              schoolId={schoolId}
              date={filterDate}
              productId={productId!}
            />
          ))}
        </div>
      )}
    </div>
  )
}
