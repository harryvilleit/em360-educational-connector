import { useMemo, useState } from "react"
import {
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Percent,
} from "lucide-react"
import { StatCard } from "@/components/general/StatCard"
import { PageHeader } from "@/components/general/PageHeader"
import { FilterSelect } from "@/components/ui/filter-select"
import { DatePicker } from "@/components/ui/date-picker"
import { AttendanceStatusBadge } from "@/pages/Dashboard/Attendance/components/AttendanceStatusBadge"
import { ClassSelector } from "@/pages/Dashboard/Parent/components/ClassSelector"
import { attendanceStatusToBadgeKey } from "@/utils/attendanceStatus"
import { formatClassOptionLabel } from "@/utils/guardianAdapter"
import { useGetMyAttendance } from "@/hooks/studentPortal"
import type { SelectedStudentClassI } from "@/store/studentPortalFilter.store"
import type {
  StudentPortalLaunchClassI,
  StudentPortalLaunchSessionI,
  StudentPortalLaunchTermI,
} from "@/api/studentPortal.api/types"

export function StudentAttendanceContent({
  schoolId,
  studentId,
  isLinked,
  sessions,
  selectedSession,
  selectedTerm,
  selectedClass,
  selectSession,
  selectTerm,
  selectClass,
  isSessionsLoading,
  onBack,
}: {
  schoolId: string
  studentId: string
  isLinked: boolean
  sessions: StudentPortalLaunchSessionI[]
  selectedSession: StudentPortalLaunchSessionI | undefined
  selectedTerm: StudentPortalLaunchTermI | undefined
  selectedClass: SelectedStudentClassI | null
  selectSession: (id: string) => void
  selectTerm: (id: string) => void
  selectClass: (cls: SelectedStudentClassI | null) => void
  isSessionsLoading: boolean
  onBack: () => void
}) {
  // Sessions/terms/classes all come from the StudentPortal/LaunchSchool
  // bootstrap (already scoped to this student's enrollment, per term) — no
  // separate session, term, or enrolled-classes lookup is fetched here.
  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: s.sessionId, label: s.sessionName })),
    [sessions]
  )
  const activeSessionId = selectedSession?.sessionId ?? ""

  const termOptions = useMemo(
    () => (selectedSession?.terms ?? []).map((t) => ({ value: t.schoolSessionTermId, label: t.termName })),
    [selectedSession]
  )
  const activeTermId = selectedTerm?.schoolSessionTermId ?? ""

  const termClasses = useMemo<StudentPortalLaunchClassI[]>(
    () => selectedTerm?.classes ?? [],
    [selectedTerm]
  )
  const classOptions = useMemo(
    () =>
      termClasses.map((c) => ({
        value: c.enrollmentId,
        label: `${formatClassOptionLabel(c.className, c.armName)}${c.isCurrent ? " (Current)" : ""}`,
      })),
    [termClasses]
  )
  const activeClassEnrollmentId =
    selectedClass?.enrollmentId ?? classOptions[0]?.value ?? ""

  function handleSelectClass(enrollmentId: string) {
    const cls = termClasses.find((c) => c.enrollmentId === enrollmentId)
    if (!cls) return
    selectClass({
      enrollmentId: cls.enrollmentId,
      schoolClassId: cls.schoolClassId,
      className: cls.className,
      schoolArmId: cls.schoolArmId,
      armName: cls.armName,
      isPrimaryClass: cls.isPrimaryClass,
      classType: cls.classType,
      isCurrent: cls.isCurrent,
    })
  }

  // Date range — local to this page only; not part of the shared
  // studentPortalFilter store since no other Student Portal page needs it.
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const dateRangeInvalid = !!startDate && !!endDate && startDate > endDate

  const {
    attendance,
    isLoading: attendanceLoading,
    isError: attendanceError,
    error: attendanceErrorObj,
  } = useGetMyAttendance({
    studentId: isLinked ? studentId : "",
    schoolId,
    schoolClassId: isLinked
      ? selectedClass?.schoolClassId || undefined
      : undefined,
    schoolSessionId: isLinked ? activeSessionId || undefined : undefined,
    schoolSessionTermId: isLinked ? activeTermId || undefined : undefined,
    startDate: isLinked ? startDate || undefined : undefined,
    endDate: isLinked ? endDate || undefined : undefined,
  })

  const loading = isLinked ? isSessionsLoading || attendanceLoading : false
  const records = attendance?.records ?? []

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Track your attendance and view your attendance history."
        onBack={onBack}
        className="mb-7"
      />

      {/* Filters */}
      <div className="mb-2 flex flex-wrap items-end gap-3">
        {sessionOptions.length > 1 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Session</p>
            <FilterSelect
              value={activeSessionId}
              onChange={selectSession}
              options={sessionOptions}
              placeholder="Select session"
              triggerClassName="h-9 w-40"
            />
          </div>
        )}
        {termOptions.length > 1 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Term</p>
            <FilterSelect
              value={activeTermId}
              onChange={selectTerm}
              options={termOptions}
              placeholder="Select term"
              triggerClassName="h-9 w-36"
            />
          </div>
        )}
        {classOptions.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Class</p>
            <ClassSelector
              options={classOptions}
              value={activeClassEnrollmentId}
              onChange={handleSelectClass}
            />
          </div>
        )}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Start date</p>
          <DatePicker
            value={startDate}
            onChange={setStartDate}
            placeholder="Start date"
            className="h-9 w-36 text-xs"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">End date</p>
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            placeholder="End date"
            className="h-9 w-36 text-xs"
          />
        </div>
      </div>
      {dateRangeInvalid && (
        <p className="mb-3 text-xs text-red-500">
          Start date must be before end date.
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
          <p className="text-sm text-gray-400">Loading attendance...</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard
              label="Total Days"
              value={attendance?.totalDaysMarked ?? 0}
              icon={CalendarCheck2}
              color="gray"
            />
            <StatCard
              label="Present"
              value={attendance?.presentDays ?? 0}
              icon={CheckCircle2}
              color="green"
            />
            <StatCard
              label="Absent"
              value={attendance?.absentDays ?? 0}
              icon={XCircle}
              color="red"
            />
            <StatCard
              label="Late"
              value={attendance?.lateDays ?? 0}
              icon={Clock}
              color="amber"
            />
            <StatCard
              label="Excused"
              value={attendance?.excusedDays ?? 0}
              icon={AlertCircle}
              color="blue"
            />
            <StatCard
              label="Attendance"
              value={`${Math.round((attendance?.attendancePercentage ?? 0) * 10) / 10}%`}
              icon={Percent}
              color="indigo"
            />
          </div>

          {/* Attendance history */}
          <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
              <CalendarCheck2 size={15} className="text-gray-400" />
              <h2 className="text-sm font-medium text-gray-900">
                Attendance History
              </h2>
              {records.length > 0 && (
                <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {records.length} record{records.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {attendanceError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarCheck2 size={32} className="mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">
                  {attendanceErrorObj?.message || "Couldn't load attendance"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Try a different session, term or date range.
                </p>
              </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarCheck2 size={32} className="mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">
                  No attendance records found.
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Records will appear here once they are available.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-[140px_1fr_1.4fr_110px_1fr] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-2.5 sm:grid">
                  {["Date", "Class", "Session / Term", "Status", "Remarks"].map((h) => (
                    <p key={h} className="text-xs font-medium text-gray-500">
                      {h}
                    </p>
                  ))}
                </div>
                <div className="divide-y divide-gray-100">
                  {records.map((record) => (
                    <div
                      key={record.recordId}
                      className="grid grid-cols-1 gap-1 px-5 py-3.5 sm:grid-cols-[140px_1fr_1.4fr_110px_1fr] sm:items-center sm:gap-4"
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {record.formattedDate}
                      </p>
                      <p className="text-sm text-gray-700">{record.schoolClassName}</p>
                      <p className="text-xs text-gray-500">
                        {[record.sessionName, record.termName].filter(Boolean).join(" · ") ||
                          "—"}
                      </p>
                      <AttendanceStatusBadge
                        status={attendanceStatusToBadgeKey(record.status, record.statusName)}
                      />
                      <p className="text-xs text-gray-500">{record.remarks || "—"}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
