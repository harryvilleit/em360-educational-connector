import { useMemo, useState } from "react"
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DoorOpen,
  History,
  Loader2,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useMyPersistedAttendance,
  useStaffAttendanceTerm,
} from "@/hooks/staffAttendance/useStaffAttendance"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import type {
  PersistedSignInStatus,
  PersistedSignOutStatus,
  StaffAttendanceRecordI,
  StaffAttendanceWeekI,
} from "@/types/staffAttendance"

interface Props {
  // Staff profiles supply a target. On the self-service page this is omitted,
  // so the target is resolved from the signed-in user's staff profile.
  staffId?: string
}

interface FlatTerm {
  termId: string
  label: string
}

function displayDate(value: string, includeYear = false) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  })
}

function isVisibleAttendanceDay(day: StaffAttendanceRecordI) {
  if (day.id) return true
  const weekday = new Date(`${day.attendanceDate}T12:00:00`).getDay()
  return weekday >= 1 && weekday <= 5
}

function signInLabel(status: PersistedSignInStatus) {
  if (status === "OnTime") return "On time"
  if (status === "Late") return "Late in"
  if (status === "OutsideTerm") return "Outside term"
  return status
}

function signOutLabel(status: PersistedSignOutStatus) {
  if (status === "OnTime") return "On time"
  if (status === "EarlyOut") return "Early out"
  if (status === "NotApplicable") return "—"
  if (status === "OutsideTerm") return "Outside term"
  return status
}

function SignInPill({ status }: { status: PersistedSignInStatus }) {
  const appearance =
    status === "OnTime"
      ? "bg-green-100 text-green-700"
      : status === "Late"
        ? "bg-amber-100 text-amber-700"
        : status === "Absent"
          ? "bg-red-50 text-red-700"
          : "bg-slate-100 text-slate-600"

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${appearance}`}
    >
      {signInLabel(status)}
    </span>
  )
}

function SignOutPill({ status }: { status: PersistedSignOutStatus }) {
  const appearance =
    status === "OnTime"
      ? "bg-green-100 text-green-700"
      : status === "EarlyOut"
        ? "bg-red-100 text-red-700"
        : status === "Pending"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-600"

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${appearance}`}
    >
      {signOutLabel(status)}
    </span>
  )
}

function weekStats(week: StaffAttendanceWeekI) {
  const days = week.days.filter(isVisibleAttendanceDay)
  return {
    present: days.filter((day) => ["OnTime", "Late"].includes(day.signInStatus))
      .length,
    late: days.filter((day) => day.signInStatus === "Late").length,
    absent: days.filter((day) => day.signInStatus === "Absent").length,
    early: days.filter((day) => day.signOutStatus === "EarlyOut").length,
  }
}

export default function AttendanceSummaryPanel({ staffId }: Props) {
  const schoolId = useSchoolId()
  const { sessions, isLoading: termsLoading } = useGetAllSchoolSessions({
    schoolId,
    pageNumber: 1,
    pageSize: 100,
  })
  const { data: myAttendance, isLoading: myAttendanceLoading } =
    useMyPersistedAttendance(staffId ? "" : schoolId)

  const terms: FlatTerm[] = useMemo(
    () =>
      sessions.flatMap((session) =>
        session.Terms.map((term) => ({
          termId: term.Id,
          label: `${session.SessionName} · ${term.TermName}`,
        }))
      ),
    [sessions]
  )
  const currentTermId = useMemo(() => {
    const currentSession =
      sessions.find(
        (session) => session.IsCurrent || session.Status === "Active"
      ) ?? sessions[0]
    return (
      currentSession?.Terms.find((term) => term.IsCurrent)?.Id ??
      currentSession?.Terms[0]?.Id ??
      ""
    )
  }, [sessions])
  const defaultTermId = useMemo(
    () => currentTermId || terms[0]?.termId || "",
    [currentTermId, terms]
  )
  const [selectedTermId, setSelectedTermId] = useState("")
  const activeTermId = selectedTermId || defaultTermId
  const targetStaffId = staffId || myAttendance?.staff?.subUserId || ""
  const attendance = useStaffAttendanceTerm(
    schoolId,
    targetStaffId,
    activeTermId
  )
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  const defaultWeekNumber = useMemo(() => {
    if (!attendance.data?.weeks.length) return null
    const now = new Date()
    const currentWeek = attendance.data.weeks.find(
      (week) =>
        now >= new Date(`${week.startDate}T00:00:00`) &&
        now <= new Date(`${week.endDate}T23:59:59`)
    )
    return (currentWeek ?? attendance.data.weeks[0]).weekNumber
  }, [attendance.data])

  const activeWeekNumber = attendance.data?.weeks.some(
    (week) => week.weekNumber === selectedWeek
  )
    ? selectedWeek
    : defaultWeekNumber
  const week = attendance.data?.weeks.find(
    (item) => item.weekNumber === activeWeekNumber
  )
  const days = useMemo(
    () => (week?.days ?? []).filter(isVisibleAttendanceDay),
    [week]
  )
  const auditEntries = useMemo(
    () =>
      days
        .flatMap((day) =>
          day.auditLogs.map((audit) => ({
            ...audit,
            attendanceDate: day.attendanceDate,
          }))
        )
        .sort(
          (a, b) =>
            new Date(b.changedAtUtc).getTime() -
            new Date(a.changedAtUtc).getTime()
        ),
    [days]
  )

  const isLoading =
    termsLoading ||
    (!staffId && myAttendanceLoading) ||
    (Boolean(targetStaffId && activeTermId) && attendance.isLoading)

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Loader2 className="size-7 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!targetStaffId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          Your account is not linked to a staff profile. School owners can view
          individual histories from User Management → Attendance.
        </div>
      </div>
    )
  }

  if (!activeTermId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Create an academic term before viewing attendance history.
      </div>
    )
  }

  if (attendance.isError || !attendance.data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Attendance history could not be loaded. Refresh the page and try again.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
              Term attendance history
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              {attendance.data.weeks.length} weeks in {attendance.data.termName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {attendance.data.staff.name} ·{" "}
              {attendance.data.staff.role || "Staff"}
            </p>
          </div>
          <Select
            value={activeTermId}
            onValueChange={(value) => {
              setSelectedTermId(value)
              setSelectedWeek(null)
            }}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select term" />
            </SelectTrigger>
            <SelectContent>
              {terms.map((term) => (
                <SelectItem key={term.termId} value={term.termId}>
                  {term.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {attendance.data.weeks.map((item) => {
            const stats = weekStats(item)
            return (
              <button
                key={item.weekNumber}
                type="button"
                onClick={() => setSelectedWeek(item.weekNumber)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  item.weekNumber === activeWeekNumber
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <CalendarDays className="size-4 text-blue-600" />
                  Week {item.weekNumber}
                </span>
                <span className="mt-1 block text-[11px] text-slate-500">
                  {displayDate(item.startDate)} – {displayDate(item.endDate)}
                </span>
                <span className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[10px] font-medium text-slate-500">
                  <span className="text-green-700">
                    {stats.present} present
                  </span>
                  <span className="text-amber-700">{stats.late} late</span>
                  <span className="text-red-700">{stats.absent} absent</span>
                  {stats.early > 0 && (
                    <span className="text-red-700">
                      {stats.early} early out
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {week && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Week {week.weekNumber} attendance logs
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {displayDate(week.startDate, true)} –{" "}
                {displayDate(week.endDate, true)}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {days.filter((day) => day.id).length} recorded days
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                  <th className="px-4 py-3">Day</th>
                  <th className="px-4 py-3">Sign in</th>
                  <th className="px-4 py-3">Sign-in status</th>
                  <th className="px-4 py-3">Sign out</th>
                  <th className="px-4 py-3">Sign-out status</th>
                  <th className="px-4 py-3">Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {days.map((day) => (
                  <tr key={day.attendanceDate} className="align-top">
                    <td className="px-4 py-4">
                      <span className="block font-semibold text-slate-900">
                        {day.dayName}
                      </span>
                      <span className="text-xs text-slate-500">
                        {displayDate(day.attendanceDate, true)}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">
                      <span className="block">{day.signInTime ?? "—"}</span>
                      <span className="mt-1 block text-[11px] font-normal text-slate-400">
                        Expected {day.expectedSignInTime}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <SignInPill status={day.signInStatus} />
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">
                      <span className="block">{day.signOutTime ?? "—"}</span>
                      <span className="mt-1 block text-[11px] font-normal text-slate-400">
                        Expected {day.expectedSignOutTime}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <SignOutPill status={day.signOutStatus} />
                      {day.earlyLeaveReason && (
                        <p className="mt-2 max-w-52 text-xs text-slate-500">
                          Reason: {day.earlyLeaveReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {day.auditLogs.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                          <History className="size-3.5" />
                          Changed manually
                        </span>
                      ) : day.id ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                          <CheckCircle2 className="size-4" />
                          Staff recorded
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          No record
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4 sm:px-5">
          <History className="size-4 text-violet-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Manual-change history
            </h2>
            <p className="text-xs text-slate-500">
              Every administrative correction is shown with who changed it and
              why.
            </p>
          </div>
        </div>
        {auditEntries.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {auditEntries.map((audit) => (
              <article key={audit.id} className="px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Attendance for {displayDate(audit.attendanceDate, true)}{" "}
                      was changed by {audit.changedByUserName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {audit.previousSignInTime ?? "—"}–
                      {audit.previousSignOutTime ?? "—"} →{" "}
                      {audit.newSignInTime ?? "—"}–{audit.newSignOutTime ?? "—"}
                    </p>
                    {audit.reason && (
                      <p className="mt-2 text-xs text-slate-700">
                        Reason: {audit.reason}
                      </p>
                    )}
                  </div>
                  <time className="shrink-0 text-xs text-slate-400">
                    {new Date(audit.changedAtUtc).toLocaleString("en-GB")}
                  </time>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 p-6 text-sm text-slate-500">
            <CheckCircle2 className="size-4 text-green-600" />
            No manual changes were made in this week.
          </div>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-800">
          <CheckCircle2 className="size-5" />
          <span className="text-xs font-medium">On-time attendance</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-amber-800">
          <Clock3 className="size-5" />
          <span className="text-xs font-medium">Late sign-in</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-800">
          <DoorOpen className="size-5" />
          <span className="text-xs font-medium">Early sign-out</span>
        </div>
      </div>
    </div>
  )
}
