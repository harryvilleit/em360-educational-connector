import { useNavigate } from "react-router"
import { format } from "date-fns"
import { ClipboardList } from "lucide-react"
import { useGetClassAttendanceRoster } from "@/hooks/studentAttendance"
import { DashboardRoutes } from "@/routes"
import type { ClassAttendanceSummaryI } from "@/api/studentAttendance.api/types"

export default function AttendanceSessionCard({
  summary,
  schoolId,
  date,
  productId,
}: {
  summary: ClassAttendanceSummaryI
  schoolId: string
  date: string
  productId: string
}) {
  const navigate = useNavigate()
  const { roster, isLoading, isError } = useGetClassAttendanceRoster({
    schoolClassId: summary.schoolClassId,
    schoolId,
    attendanceDate: date,
  })

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-blue-50">
            <ClipboardList className="size-4 text-blue-600" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {summary.schoolClassName}
            </h2>
            <p className="text-xs text-gray-400">
              {format(new Date(`${date}T12:00:00`), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="text-green-600">{summary.presentCount} present</span>
          <span className="text-red-500">{summary.absentCount} absent</span>
          <strong className="text-gray-800">
            {Math.round(summary.presentPercentage)}%
          </strong>
        </div>
      </div>

      {isLoading ? (
        <p className="p-5 text-sm text-gray-500">Loading class roster…</p>
      ) : isError ? (
        <p role="alert" className="p-5 text-sm text-red-600">
          Class roster could not be loaded.
        </p>
      ) : (
        <div className="divide-y divide-gray-50">
          {(roster?.students ?? []).map((student) => (
            <div
              key={student.studentId}
              className="flex items-center gap-3 px-5 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {student.fullName}
                </p>
                {student.remarks && (
                  <p className="text-xs text-gray-400">{student.remarks}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    DashboardRoutes.toAttendanceStudentDetail(
                      productId,
                      student.studentId
                    )
                  )
                }
                className="text-xs text-blue-600 hover:underline"
              >
                History
              </button>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                {student.statusName}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
