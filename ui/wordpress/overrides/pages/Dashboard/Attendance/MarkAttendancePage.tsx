// WordPress version: Late status, the school's own date, Update permission, and protection for unsaved marks.
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { Save, Users, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { usePermissions } from "@/hooks/usePermissions"
import { dateISOInTimeZone } from "@/lib/schoolDate"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterSelect } from "@/components/ui/filter-select"
import { useSchoolId, useSchoolTimeZone } from "@/contexts/SchoolContext"
import { useGetAllClasses } from "@/hooks/examAndRecords"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import {
  useGetClassAttendanceRoster,
  useSaveStudentAttendance,
} from "@/hooks/studentAttendance"
import {
  AttendanceStatus,
  isAttendanceStatusValue,
} from "@/api/studentAttendance.api/types"
import type {
  AttendanceStatusValue,
  ClassAttendanceRosterI,
  StudentRosterItemI,
} from "@/api/studentAttendance.api/types"
import { DashboardRoutes } from "@/routes"
import { AttendanceStatCards } from "@/pages/Dashboard/Attendance/components/AttendanceStatCards"

const STATUS_BUTTONS: {
  status: AttendanceStatusValue
  label: string
  className: string
}[] = [
  {
    status: AttendanceStatus.Late,
    label: "L",
    className:
      "bg-amber-100 text-amber-800 data-[active=true]:ring-2 data-[active=true]:ring-amber-500",
  },
  {
    status: AttendanceStatus.Present,
    label: "P",
    className:
      "bg-green-100 text-green-700 hover:bg-green-200 data-[active=true]:ring-2 data-[active=true]:ring-green-500 data-[active=true]:bg-green-200",
  },
  {
    status: AttendanceStatus.Absent,
    label: "A",
    className:
      "bg-red-100 text-red-600 hover:bg-red-200 data-[active=true]:ring-2 data-[active=true]:ring-red-500 data-[active=true]:bg-red-200",
  },
  {
    status: AttendanceStatus.Excused,
    label: "E",
    className:
      "bg-blue-100 text-blue-700 hover:bg-blue-200 data-[active=true]:ring-2 data-[active=true]:ring-blue-500 data-[active=true]:bg-blue-200",
  },
]

const STATUS_ACTION_LABEL: Record<AttendanceStatusValue, string> = {
  [AttendanceStatus.Present]: "Present",
  [AttendanceStatus.Absent]: "Absent",
  [AttendanceStatus.Late]: "Late",
  [AttendanceStatus.Excused]: "Excused",
}

const STATUS_NAME_TO_VALUE: Record<string, AttendanceStatusValue> = {
  present: AttendanceStatus.Present,
  absent: AttendanceStatus.Absent,
  late: AttendanceStatus.Late,
  excused: AttendanceStatus.Excused,
}

function normalizeAttendanceStatus(status: unknown): AttendanceStatusValue {
  if (isAttendanceStatusValue(status)) return status
  if (typeof status === "string") {
    const named = STATUS_NAME_TO_VALUE[status.trim().toLowerCase()]
    if (named) return named
    const numeric = Number(status)
    if (isAttendanceStatusValue(numeric)) return numeric
  }
  return AttendanceStatus.Present
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function RosterAvatar({ name, src }: { name: string; src: string | null }) {
  const [imgError, setImgError] = useState(false)
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
      {getInitials(name)}
    </div>
  )
}

export default function MarkAttendancePage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const queryClient = useQueryClient()
  // Only roles with Update on the register can change attendance.
  const canEdit = usePermissions().canUpdate("/dashboard/attendance/students")
  const schoolId = useSchoolId()
  // "Today" is the school's date, not the visitor's.
  const schoolToday = dateISOInTimeZone(useSchoolTimeZone())
  const [searchParams, setSearchParams] = useSearchParams()

  const { classes, isLoading: classesLoading } = useGetAllClasses({
    schoolId,
    pageSize: 200,
  })

  const [classIdOverride, setClassIdOverride] = useState<string | null>(null)
  const selectedClassId =
    classIdOverride ?? searchParams.get("classId") ?? classes[0]?.Id ?? ""

  const todayStr = schoolToday
  const [dateOverride, setDateOverride] = useState<string | null>(null)
  const attendanceDate = dateOverride ?? searchParams.get("date") ?? todayStr

  // Same session/term source used on the Attendance Dashboard.
  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: s.Id, label: s.SessionName })),
    [sessions]
  )
  const currentSession = useMemo(
    () => sessions.find((s) => s.Terms.some((t) => t.IsCurrent)) ?? sessions[0],
    [sessions]
  )
  const [sessionIdOverride, setSessionIdOverride] = useState<string | null>(
    null
  )
  const selectedSessionId =
    sessionIdOverride ??
    searchParams.get("sessionId") ??
    currentSession?.Id ??
    ""
  const selectedSession = sessions.find((s) => s.Id === selectedSessionId)
  const termOptions = useMemo(
    () =>
      (selectedSession?.Terms ?? []).map((t) => ({
        value: t.Id,
        label: t.TermName,
      })),
    [selectedSession]
  )
  const currentTerm =
    selectedSession?.Terms.find((t) => t.IsCurrent) ?? selectedSession?.Terms[0]
  const [termIdOverride, setTermIdOverride] = useState<string | null>(null)
  const selectedTermId =
    termIdOverride ?? searchParams.get("termId") ?? currentTerm?.Id ?? ""

  function handleClassChange(newClassId: string) {
    if (isDirty && !window.confirm("Discard unsaved attendance changes?")) return
    setClassIdOverride(newClassId)
    const next = new URLSearchParams(searchParams)
    next.set("classId", newClassId)
    next.set("date", attendanceDate)
    next.set("sessionId", selectedSessionId)
    next.set("termId", selectedTermId)
    setSearchParams(next, { replace: true })
  }

  function handleDateChange(newDate: string) {
    if (isDirty && !window.confirm("Discard unsaved attendance changes?")) return
    setDateOverride(newDate)
    const next = new URLSearchParams(searchParams)
    next.set("classId", selectedClassId)
    next.set("date", newDate)
    next.set("sessionId", selectedSessionId)
    next.set("termId", selectedTermId)
    setSearchParams(next, { replace: true })
  }

  function handleSessionChange(newSessionId: string) {
    if (isDirty && !window.confirm("Discard unsaved attendance changes?")) return
    setSessionIdOverride(newSessionId)
    setTermIdOverride("")
    const next = new URLSearchParams(searchParams)
    next.set("classId", selectedClassId)
    next.set("date", attendanceDate)
    next.set("sessionId", newSessionId)
    next.set("termId", "")
    setSearchParams(next, { replace: true })
  }

  function handleTermChange(newTermId: string) {
    if (isDirty && !window.confirm("Discard unsaved attendance changes?")) return
    setTermIdOverride(newTermId)
    const next = new URLSearchParams(searchParams)
    next.set("classId", selectedClassId)
    next.set("date", attendanceDate)
    next.set("sessionId", selectedSessionId)
    next.set("termId", newTermId)
    setSearchParams(next, { replace: true })
  }

  const {
    roster,
    isLoading: rosterLoading,
    isError: rosterError,
    error: rosterErrorObj,
    refetch: refetchRoster,
  } = useGetClassAttendanceRoster({
    schoolClassId: selectedClassId,
    schoolId,
    attendanceDate,
    schoolSessionId: selectedSessionId || undefined,
    schoolSessionTermId: selectedTermId || undefined,
  })

  const [syncedRoster, setSyncedRoster] =
    useState<ClassAttendanceRosterI | null>(null)
  const [localStudents, setLocalStudents] = useState<StudentRosterItemI[]>([])
  const [isDirty, setIsDirty] = useState(false)
  useEffect(() => {
    if (!isDirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [isDirty])

  const rosterKey = `${selectedClassId}|${attendanceDate}|${selectedSessionId}|${selectedTermId}`
  const [lastRosterKey, setLastRosterKey] = useState(rosterKey)
  if (rosterKey !== lastRosterKey) {
    setLastRosterKey(rosterKey)
    setSyncedRoster(null)
    setLocalStudents([])
    setIsDirty(false)
  }
  // A background refresh never replaces marks that have not been saved yet.
  if (roster && roster !== syncedRoster && !isDirty) {
    setSyncedRoster(roster)
    setLocalStudents(
      (roster.students ?? []).map((s) => ({
        ...s,
        status: normalizeAttendanceStatus(s.status),
      }))
    )
    setIsDirty(false)
  }

  function setStatus(studentId: string, status: AttendanceStatusValue) {
    if (!canEdit || saving) return
    setLocalStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status } : s))
    )
    setIsDirty(true)
  }

  function setRemarks(studentId: string, remarks: string) {
    if (!canEdit || saving) return
    setLocalStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, remarks } : s))
    )
    setIsDirty(true)
  }

  function markAll(status: AttendanceStatusValue) {
    if (!canEdit || saving) return
    setLocalStudents((prev) => prev.map((s) => ({ ...s, status })))
    setIsDirty(true)
  }

  const stats = useMemo(() => {
    const total = localStudents.length
    const present = localStudents.filter(
      (s) => s.status === AttendanceStatus.Present
    ).length
    const absent = localStudents.filter(
      (s) => s.status === AttendanceStatus.Absent
    ).length
    const late = localStudents.filter(
      (s) => s.status === AttendanceStatus.Late
    ).length
    const excused = localStudents.filter(
      (s) => s.status === AttendanceStatus.Excused
    ).length
    return {
      present,
      absent,
      late,
      excused,
      total,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
    }
  }, [localStudents])

  const { saveAttendanceAsync, isPending: saving } = useSaveStudentAttendance()

  async function handleSave() {
    if (!canEdit || saving) return
    if (!selectedClassId) {
      toast.error("Select a class first")
      return
    }
    if (!attendanceDate) {
      toast.error("Select a date first")
      return
    }
    if (localStudents.length === 0) {
      toast.error("No students to mark")
      return
    }

    const items = localStudents.map((s) => ({
      studentId: s.studentId,
      status: s.status,
      remarks: s.remarks || null,
    }))

    if (items.some((i) => !isAttendanceStatusValue(i.status))) {
      toast.error("Every student must have a valid attendance status")
      return
    }

    if (
      selectedTermId &&
      !termOptions.some((t) => t.value === selectedTermId)
    ) {
      toast.error("Select a term that belongs to the selected session")
      return
    }

    try {
      await saveAttendanceAsync({
        schoolId,
        schoolClassId: selectedClassId,
        schoolSessionId: selectedSessionId || null,
        schoolSessionTermId: selectedTermId || null,
        attendanceDate,
        items,
      })

      void queryClient.invalidateQueries({
        predicate: (q) => /attendance/i.test(String(q.queryKey[0])),
      })
      setIsDirty(false)
      refetchRoster()
    } catch {}
  }

  const noClasses = !classesLoading && classes.length === 0
  const alreadyMarked =
    !!roster &&
    roster.presentCount +
      roster.absentCount +
      roster.lateCount +
      roster.excusedCount >
      0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mark Student Attendance"
        description="Record daily student attendance by class"
        onBack={() =>
          navigate(DashboardRoutes.toAttendanceStudents(productId!))
        }
        backLabel="Back to Student Attendance"
        actions={
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!canEdit || saving || localStudents.length === 0 || !isDirty}
          >
            <Save className="size-4" />
            {saving ? "Saving…" : "Save Attendance"}
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Class</label>
          <select
            value={selectedClassId}
            disabled={classesLoading || noClasses}
            onChange={(e) => handleClassChange(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
          >
            {classes.map((cls) => (
              <option key={cls.Id} value={cls.Id}>
                {cls.ClsName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Date</label>
          <input
            type="date"
            value={attendanceDate}
            max={todayStr}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
          />
        </div>
        {sessionOptions.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Session</label>
            <FilterSelect
              value={selectedSessionId}
              onChange={handleSessionChange}
              options={sessionOptions}
              placeholder="Select session"
              triggerClassName="h-9 w-40"
            />
          </div>
        )}
        {termOptions.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Term</label>
            <FilterSelect
              value={selectedTermId}
              onChange={handleTermChange}
              options={termOptions}
              placeholder="Select term"
              triggerClassName="h-9 w-36"
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <AttendanceStatCards stats={stats} />

      {/* Bulk actions */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Mark all as:</span>
        {STATUS_BUTTONS.map(({ status }) => (
          <button
            key={status}
            onClick={() => markAll(status)}
            disabled={!canEdit || saving || localStudents.length === 0}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {STATUS_ACTION_LABEL[status]}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">
          <Users className="mr-1 inline size-3.5" />
          {localStudents.length} student{localStudents.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Student list */}
      {noClasses ? (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <EmptyState icon={Users} title="No classes available." size="sm" />
        </div>
      ) : rosterError ? (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <EmptyState
            icon={Users}
            title="Couldn't load this class' roster"
            description={
              rosterErrorObj?.message ||
              "Something went wrong loading attendance."
            }
            action={{
              label: "Retry",
              onClick: () => refetchRoster(),
              icon: RefreshCw,
            }}
            size="sm"
          />
        </div>
      ) : classesLoading || rosterLoading ? (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="mb-2 size-10 text-gray-300" />
            <p className="text-sm text-gray-500">Loading students…</p>
          </div>
        </div>
      ) : localStudents.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <EmptyState
            icon={Users}
            title="No students found in this class."
            size="sm"
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
              {roster?.schoolClassName} · {roster?.formattedDate}
              {alreadyMarked && (
                <span className="ml-2 font-normal text-blue-500 normal-case">
                  (editing existing record)
                </span>
              )}
              {isDirty && (
                <span className="ml-2 font-normal text-amber-500 normal-case">
                  (unsaved changes)
                </span>
              )}
            </p>
          </div>

          <div className="divide-y divide-gray-50">
            {localStudents.map((student, idx) => {
              const current = student.status
              return (
                <div
                  key={student.studentId}
                  className="flex flex-wrap items-center gap-3 px-4 py-3"
                >
                  <span className="w-6 text-xs font-medium text-gray-400">
                    {idx + 1}
                  </span>
                  <RosterAvatar
                    name={student.fullName}
                    src={student.profilePicture}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {student.fullName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {student.studentGivenId || "—"}
                    </p>
                  </div>

                  {/* Status buttons */}
                  <div className="flex items-center gap-1.5">
                    {STATUS_BUTTONS.map(({ status, label, className }) => (
                      <button
                        key={status}
                        data-active={current === status}
                        disabled={!canEdit || saving}
                        onClick={() => setStatus(student.studentId, status)}
                        className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${className}`}
                        title={STATUS_ACTION_LABEL[status]}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Remarks (show when not present) */}
                  {current !== AttendanceStatus.Present && (
                    <input
                      type="text"
                      value={student.remarks ?? ""}
                      disabled={!canEdit || saving}
                      onChange={(e) =>
                        setRemarks(student.studentId, e.target.value)
                      }
                      placeholder="Add note (optional)"
                      className="hidden w-40 rounded-lg border border-gray-200 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none sm:block"
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div className="border-t border-gray-100 px-5 py-4">
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!canEdit || saving || !isDirty}
              className="w-full justify-center sm:w-auto"
            >
              <Save className="size-4" />
              {saving ? "Saving…" : "Save Attendance"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
