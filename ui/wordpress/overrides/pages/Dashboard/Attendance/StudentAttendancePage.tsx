// WordPress version: a failed load offers Try again.
import { useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/utils/queryKeys"
import { format } from "date-fns"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetStudentById } from "@/hooks/studentPortal"
import { useGetStudentAttendanceHistory } from "@/hooks/studentAttendance"
import { DashboardRoutes } from "@/routes"
import { AttendanceStatCards } from "@/pages/Dashboard/Attendance/components/AttendanceStatCards"
import { AttendanceStatusBadge } from "@/pages/Dashboard/Attendance/components/AttendanceStatusBadge"
import PageState from "@/pages/Dashboard/Attendance/components/PageState"

type StatusName = "present" | "absent" | "late" | "excused"

export default function StudentAttendancePage() {
  const navigate = useNavigate()
  const { productId, studentId } = useParams()
  const schoolId = useSchoolId()
  const queryClient = useQueryClient()
  const {
    student: detail,
    isLoading: studentLoading,
    isError: studentError,
    refetch: refetchStudent,
  } = useGetStudentById({
    studentId: studentId ?? "",
    schoolId,
  })
  const { history, isLoading: historyLoading, isError } =
    useGetStudentAttendanceHistory({ studentId: studentId ?? "", schoolId })
  const records = history?.records ?? []
  const stats = useMemo(() => {
    const present = history?.presentDays ?? 0
    const late = history?.lateDays ?? 0
    const total = history?.totalDaysMarked ?? 0
    return {
      present,
      absent: history?.absentDays ?? 0,
      late,
      excused: history?.excusedDays ?? 0,
      total,
      rate: total ? Math.round(((present + late) / total) * 100) : 0,
    }
  }, [history])

  if (studentLoading || historyLoading)
    return <PageState message="Loading attendance history…" />

  if (studentError || isError || !detail || !history) {
    return (
      <PageState
        message={
          studentError || isError ? "Attendance history could not be loaded." : "Student not found."
        }
      >
        <Button
          className="mt-4 mr-2"
          onClick={() => {
            void refetchStudent()
            void queryClient.invalidateQueries({ queryKey: [queryKeys.studentAttendanceRoster] })
          }}
        >
          Try again
        </Button>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() =>
            navigate(DashboardRoutes.toAttendanceStudents(productId!))
          }
        >
          <ChevronLeft className="size-4" /> Back
        </Button>
      </PageState>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={history.studentName}
        description={`Attendance history · ${history.currentClassName ?? detail.schoolClassName ?? "No current class"}`}
        onBack={() =>
          navigate(DashboardRoutes.toAttendanceStudentsRecords(productId!))
        }
        backLabel="Back to Records"
      />
      <AttendanceStatCards stats={stats} />

      {stats.total > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">
              Attendance Rate
            </p>
            <span className="text-lg font-bold text-blue-600">
              {stats.rate}%
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${stats.rate}%` }}
            />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Attendance History
          </h2>
        </div>
        {records.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-500">
            No attendance records yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs tracking-wider text-gray-400 uppercase">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((record) => (
                  <tr key={record.recordId}>
                    <td className="px-5 py-3 text-gray-700">
                      {format(
                        new Date(`${record.attendanceDate}T12:00:00`),
                        "EEE, MMM d, yyyy"
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {record.schoolClassName}
                    </td>
                    <td className="px-5 py-3">
                      <AttendanceStatusBadge
                        status={record.statusName.toLowerCase() as StatusName}
                      />
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {record.remarks ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
