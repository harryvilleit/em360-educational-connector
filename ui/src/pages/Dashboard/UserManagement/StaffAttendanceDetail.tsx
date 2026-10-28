import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  GripVertical,
  History,
  Loader2,
  LockKeyhole,
  Pencil,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useELearningFilterOptions } from "@/hooks/elearning/useELearningFilterOptions"
import {
  useStaffAttendanceTerm,
  useUpsertManualStaffAttendance,
} from "@/hooks/staffAttendance/useStaffAttendance"
import { usePermissions } from "@/hooks/usePermissions"
import { DashboardRoutes } from "@/routes"
import type { StaffAttendanceRecordI } from "@/types/staffAttendance"
import { getErrorMessage } from "@/utils"

const MENU_URL = "/dashboard/users/attendance"

interface EditState {
  record: StaffAttendanceRecordI
  signInTime: string
  signOutTime: string
  notes: string
  reason: string
}

function displayDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  })
}

function statusStyle(record: StaffAttendanceRecordI) {
  if (record.signInStatus === "Upcoming") return "bg-slate-50 text-slate-500"
  if (record.signInStatus === "OutsideTerm") return "bg-slate-50 text-slate-300"
  if (record.signInStatus === "Absent") return "bg-red-50 text-red-700"
  if (record.signOutStatus === "EarlyOut") return "bg-red-50 text-red-800"
  if (record.signInStatus === "Late") return "bg-amber-50 text-amber-800"
  return "bg-green-50 text-green-800"
}

function signInStatusLabel(record: StaffAttendanceRecordI) {
  if (record.signInStatus === "Late") return "Late in"
  if (record.signInStatus === "OnTime") return "On time"
  if (record.signInStatus === "OutsideTerm") return "Outside term"
  return record.signInStatus
}

function signOutStatusLabel(record: StaffAttendanceRecordI) {
  if (record.signOutStatus === "EarlyOut") return "Early out"
  if (record.signOutStatus === "OnTime") return "On time"
  if (record.signOutStatus === "NotApplicable") return "—"
  if (record.signOutStatus === "OutsideTerm") return "Outside term"
  return record.signOutStatus
}

export default function StaffAttendanceDetailPage() {
  const schoolId = useSchoolId()
  const navigate = useNavigate()
  const { productId = "", staffId = "" } = useParams<{
    productId: string
    staffId: string
  }>()
  const { canUpdate } = usePermissions()
  const canEdit = canUpdate(MENU_URL)
  const {
    termIdByName,
    currentTermName,
    isLoading: termsLoading,
  } = useELearningFilterOptions(schoolId)
  const termId = currentTermName ? (termIdByName[currentTermName] ?? "") : ""
  const { data, isLoading, isError } = useStaffAttendanceTerm(
    schoolId,
    staffId,
    termId
  )
  const manualUpdate = useUpsertManualStaffAttendance(schoolId, staffId, termId)
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [edit, setEdit] = useState<EditState | null>(null)

  const defaultWeekNumber = useMemo(() => {
    if (!data?.weeks.length) return null
    const now = new Date()
    const current = data.weeks.find(
      (week) =>
        now >= new Date(`${week.startDate}T00:00:00`) &&
        now <= new Date(`${week.endDate}T23:59:59`)
    )
    return (current ?? data.weeks[0]).weekNumber
  }, [data])
  const activeWeekNumber = selectedWeek ?? defaultWeekNumber
  const week = data?.weeks.find((item) => item.weekNumber === activeWeekNumber)
  const auditEntries = useMemo(
    () =>
      (week?.days ?? [])
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
    [week]
  )

  function openEditor(record: StaffAttendanceRecordI) {
    if (!canEdit || ["Upcoming", "OutsideTerm"].includes(record.status)) return
    setEdit({
      record,
      signInTime:
        record.signInTime ??
        record.expectedSignInTime ??
        data?.settings.signInTime ??
        "08:30",
      signOutTime:
        record.signOutTime ??
        record.expectedSignOutTime ??
        data?.settings.signOutTime ??
        "16:30",
      notes: record.notes ?? "",
      reason: record.id
        ? "Attendance time corrected by administrator"
        : "Manual attendance created by administrator",
    })
  }

  async function saveManualAttendance() {
    if (!edit || !termId) return
    try {
      await manualUpdate.mutateAsync({
        schoolSessionTermId: termId,
        attendanceDate: edit.record.attendanceDate,
        signInTime: edit.signInTime,
        signOutTime: edit.signOutTime,
        notes: edit.notes.trim(),
        reason: edit.reason.trim(),
      })
      toast.success(
        edit.record.id ? "Attendance updated." : "Attendance created."
      )
      setEdit(null)
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save attendance."))
    }
  }

  if (termsLoading || isLoading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="size-7 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!termId || isError || !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Staff attendance"
          onBack={() => navigate(DashboardRoutes.toUsersAttendance(productId))}
          backLabel="Back to attendance"
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {!termId
            ? "Create an active academic term before viewing weekly attendance."
            : "This staff member’s attendance could not be loaded."}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${data.staff.name} · Attendance`}
        description={`${data.termName} · ${data.staff.email}`}
        onBack={() => navigate(DashboardRoutes.toUsersAttendance(productId))}
        backLabel="Back to attendance"
        badge={canEdit ? "Manual editing enabled" : "View only"}
        badgeColor={
          canEdit ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-5 text-blue-600" />
          <h2 className="text-sm font-semibold text-slate-900">
            Select a week in the current term
          </h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {data.weeks.map((item) => (
            <button
              key={item.weekNumber}
              type="button"
              onClick={() => setSelectedWeek(item.weekNumber)}
              className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                item.weekNumber === activeWeekNumber
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="block text-xs font-semibold">
                Week {item.weekNumber}
              </span>
              <span className="mt-0.5 block text-[11px] opacity-70">
                {displayDate(item.startDate)} – {displayDate(item.endDate)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {week && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Week {week.weekNumber}
              </h2>
              <p className="text-xs text-slate-500">
                {displayDate(week.startDate)} – {displayDate(week.endDate)}
              </p>
            </div>
            {canEdit && (
              <div
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData("text/plain", "attendance-slot")
                }
                className="flex cursor-grab items-center gap-3 rounded-xl bg-green-600 px-4 py-3 text-white shadow-sm active:cursor-grabbing"
              >
                <GripVertical className="size-4" />
                <span>
                  <span className="block text-sm font-semibold">
                    Attendance slot
                  </span>
                  <span className="block text-[11px] text-green-100">
                    Uses that day’s saved policy · drag to a day
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {week.days.map((day) => {
              const editable =
                canEdit && !["Upcoming", "OutsideTerm"].includes(day.status)
              return (
                <button
                  key={day.attendanceDate}
                  type="button"
                  disabled={!editable}
                  onClick={() => openEditor(day)}
                  onDragOver={(event) => editable && event.preventDefault()}
                  onDrop={(event) => {
                    if (!editable) return
                    event.preventDefault()
                    if (
                      event.dataTransfer.getData("text/plain") ===
                      "attendance-slot"
                    ) {
                      openEditor(day)
                    }
                  }}
                  className={`min-h-40 rounded-xl p-4 text-left transition-all ${statusStyle(day)} ${
                    editable
                      ? "hover:-translate-y-0.5 hover:shadow-md"
                      : "cursor-default"
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span>
                      <span className="block text-sm font-semibold">
                        {day.dayName}
                      </span>
                      <span className="block text-xs opacity-70">
                        {displayDate(day.attendanceDate)}
                      </span>
                    </span>
                    {day.id ? (
                      day.isManual ? (
                        <Pencil className="size-4" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )
                    ) : editable ? (
                      <Plus className="size-4" />
                    ) : (
                      <LockKeyhole className="size-4 opacity-50" />
                    )}
                  </span>
                  <span className="mt-5 block text-lg font-bold">
                    {day.signInTime ?? "—"} – {day.signOutTime ?? "—"}
                  </span>
                  <span className="mt-1 block text-[11px] opacity-70">
                    Expected {day.expectedSignInTime} –{" "}
                    {day.expectedSignOutTime}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    <span className="inline-flex rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold">
                      Sign in: {signInStatusLabel(day)}
                    </span>
                    <span className="inline-flex rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold">
                      Sign out: {signOutStatusLabel(day)}
                    </span>
                  </span>
                  {day.isManual && (
                    <span className="mt-2 block text-[11px] opacity-70">
                      Manually recorded
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4">
          <History className="size-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">
            Manual-change audit trail
          </h2>
        </div>
        {auditEntries.length ? (
          <div className="divide-y divide-slate-100">
            {auditEntries.map((audit) => (
              <div key={audit.id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-800">
                    {audit.changedByUserName} · {audit.action}
                  </p>
                  <time className="text-xs text-slate-400">
                    {new Date(audit.changedAtUtc).toLocaleString("en-GB")}
                  </time>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {audit.attendanceDate}: {audit.previousSignInTime ?? "—"}–
                  {audit.previousSignOutTime ?? "—"} →{" "}
                  {audit.newSignInTime ?? "—"}–{audit.newSignOutTime ?? "—"}
                </p>
                {audit.reason && (
                  <p className="mt-1 text-xs text-slate-600">
                    Reason: {audit.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="p-6 text-center text-sm text-slate-500">
            No manual changes in this week.
          </p>
        )}
      </section>

      <Dialog
        open={Boolean(edit)}
        onOpenChange={(open) => !open && setEdit(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {edit?.record.id ? "Edit attendance" : "Create manual attendance"}
            </DialogTitle>
            <DialogDescription>
              {edit?.record.dayName}{" "}
              {edit && displayDate(edit.record.attendanceDate)}. This action
              will be stored with your username in the audit trail.
            </DialogDescription>
          </DialogHeader>

          {edit && (
            <div className="grid gap-5 py-2 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="manual-start-time">Start time</Label>
                  <Input
                    id="manual-start-time"
                    type="time"
                    value={edit.signInTime}
                    onChange={(event) =>
                      setEdit({ ...edit, signInTime: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="manual-end-time">End time</Label>
                  <Input
                    id="manual-end-time"
                    type="time"
                    value={edit.signOutTime}
                    onChange={(event) =>
                      setEdit({ ...edit, signOutTime: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="manual-reason">Audit reason</Label>
                  <Input
                    id="manual-reason"
                    value={edit.reason}
                    onChange={(event) =>
                      setEdit({ ...edit, reason: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="manual-notes">Notes</Label>
                <Textarea
                  id="manual-notes"
                  value={edit.notes}
                  onChange={(event) =>
                    setEdit({ ...edit, notes: event.target.value })
                  }
                  placeholder="Optional context about this attendance record"
                  className="min-h-44"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>
              Cancel
            </Button>
            <Button
              onClick={saveManualAttendance}
              disabled={
                !edit?.signInTime ||
                !edit.signOutTime ||
                !edit.reason.trim() ||
                manualUpdate.isPending
              }
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {manualUpdate.isPending ? (
                <Spinner />
              ) : (
                <Clock3 className="size-4" />
              )}
              Save attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
