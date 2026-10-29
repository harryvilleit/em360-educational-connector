import { CalendarCheck2 } from "lucide-react"
import { AttendanceStatusBadge } from "@/pages/Dashboard/Attendance/components/AttendanceStatusBadge"
import { attendanceStatusToBadgeKey } from "@/utils/attendanceStatus"
import type { GuardianAttendanceRecordItemI } from "@/api/guardian.api/types"

export function GuardianAttendanceRecordList({
  records,
}: {
  records: GuardianAttendanceRecordItemI[]
}) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-20 text-center shadow-sm dark:border-white/10 dark:bg-white/3">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/5">
          <CalendarCheck2 size={22} className="text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          No attendance records found.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/3">
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 dark:border-white/10">
        <CalendarCheck2 size={15} className="text-gray-400" />
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Attendance History
        </h2>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-white/5">
        {records.map((record) => (
          <div
            key={record.recordId}
            className="flex items-start justify-between gap-4 px-5 py-3.5"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {record.formattedDate}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {record.schoolClassName}
              </p>
              {(record.sessionName || record.termName) && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {[record.sessionName, record.termName].filter(Boolean).join(" · ")}
                </p>
              )}
              {record.remarks && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {record.remarks}
                </p>
              )}
            </div>
            <AttendanceStatusBadge
              status={attendanceStatusToBadgeKey(record.status, record.statusName)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
