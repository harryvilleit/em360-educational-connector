import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  DoorOpen,
  Loader2,
  MapPin,
  Settings,
  UserX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useDailyPersistedStaffAttendance } from "@/hooks/staffAttendance/useStaffAttendance"
import { usePermissions } from "@/hooks/usePermissions"
import { DashboardRoutes } from "@/routes"
import AttendanceSettingsModal from "../Attendance/components/attendance/AttendanceSettingsModal"
import type {
  PersistedSignInStatus,
  PersistedSignOutStatus,
  StaffAttendanceDailyRowI,
} from "@/types/staffAttendance"

const MENU_URL = "/dashboard/users/attendance"

function todayDate() {
  const date = new Date()
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function SignInStatusPill({ status }: { status: PersistedSignInStatus }) {
  const appearance =
    status === "OnTime"
      ? "bg-green-100 text-green-700"
      : status === "Late"
        ? "bg-amber-100 text-amber-700"
        : status === "Absent"
          ? "bg-red-50 text-red-700"
          : "bg-slate-100 text-slate-600"
  const label =
    status === "OnTime"
      ? "On time"
      : status === "Late"
        ? "Late in"
        : status === "OutsideTerm"
          ? "Outside term"
          : status

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${appearance}`}
    >
      {label}
    </span>
  )
}

function SignOutStatusPill({ status }: { status: PersistedSignOutStatus }) {
  const appearance =
    status === "OnTime"
      ? "bg-green-100 text-green-700"
      : status === "EarlyOut"
        ? "bg-red-100 text-red-700"
        : status === "Pending"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-600"
  const label =
    status === "OnTime"
      ? "On time"
      : status === "EarlyOut"
        ? "Early out"
        : status === "NotApplicable"
          ? "—"
          : status === "OutsideTerm"
            ? "Outside term"
            : status

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${appearance}`}
    >
      {label}
    </span>
  )
}

function StaffRow({
  row,
  onClick,
}: {
  row: StaffAttendanceDailyRowI
  onClick: () => void
}) {
  const { staff, record } = row
  const location = record.signOutLocation ?? record.signInLocation

  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full grid-cols-1 gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 lg:grid-cols-[minmax(220px,1fr)_90px_120px_90px_120px_105px_24px] lg:items-center"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
          {initials(staff.name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-900">
            {staff.name}
          </span>
          <span className="block truncate text-xs text-slate-500">
            {staff.email} · {staff.role || "Staff"}
          </span>
        </span>
      </span>
      <span className="text-sm text-slate-700">
        <span className="mr-2 text-xs text-slate-400 lg:hidden">Sign in</span>
        {record.signInTime ?? "—"}
      </span>
      <span className="flex items-center gap-2">
        <span className="text-xs text-slate-400 lg:hidden">Sign-in status</span>
        <SignInStatusPill status={record.signInStatus} />
      </span>
      <span className="text-sm text-slate-700">
        <span className="mr-2 text-xs text-slate-400 lg:hidden">Sign out</span>
        {record.signOutTime ?? "—"}
      </span>
      <span className="flex items-center gap-2">
        <span className="text-xs text-slate-400 lg:hidden">
          Sign-out status
        </span>
        <SignOutStatusPill status={record.signOutStatus} />
      </span>
      <span className="flex flex-wrap items-center gap-2">
        {location?.isWithinCampus != null && (
          <span
            title={
              location.distanceMetres != null
                ? `${Math.round(location.distanceMetres)} metres from campus centre`
                : undefined
            }
            className={`inline-flex items-center gap-1 text-[11px] font-medium ${
              location.isWithinCampus ? "text-green-600" : "text-red-600"
            }`}
          >
            <MapPin className="size-4" />
            {location.isWithinCampus ? "On campus" : "Outside"}
          </span>
        )}
      </span>
      <ArrowUpRight className="size-4 text-slate-400" />
    </button>
  )
}

export default function UserManagementAttendancePage() {
  const schoolId = useSchoolId()
  const navigate = useNavigate()
  const { productId = "" } = useParams<{ productId: string }>()
  const { isOwner, canUpdate } = usePermissions()
  const [date, setDate] = useState(todayDate)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { data, isLoading, isError } = useDailyPersistedStaffAttendance(
    schoolId,
    date
  )
  const canEdit = canUpdate(MENU_URL)

  const stats = [
    {
      label: "On time",
      value: data?.onTimeCount ?? 0,
      icon: CheckCircle2,
      color: "emerald" as const,
      valueColor: "text-emerald-700",
    },
    {
      label: "Late in",
      value: data?.lateInCount ?? 0,
      icon: Clock3,
      color: "amber" as const,
      valueColor: "text-amber-700",
    },
    {
      label: "Early out",
      value: data?.earlyOutCount ?? 0,
      icon: DoorOpen,
      color: "red" as const,
      valueColor: "text-red-700",
    },
    {
      label: "Absent",
      value: data?.absentCount ?? 0,
      icon: UserX,
      color: "gray" as const,
      valueColor: "text-slate-900",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff attendance"
        description="Monitor today’s staff arrival, departure and campus location."
        actions={
          <div className="flex flex-wrap gap-2">
            {isOwner && (
              <Button variant="outline" onClick={() => setSettingsOpen(true)}>
                <Settings className="size-4" />
                Settings
              </Button>
            )}
            <input
              type="date"
              value={date}
              max={todayDate()}
              onChange={(event) => setDate(event.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
        }
      />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Today’s overview
            </h2>
            <p className="text-xs text-slate-500">
              {data?.totalStaff ?? 0} active staff members
            </p>
          </div>
          {!canEdit && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              View only
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              {...stat}
              meta={`${
                data?.totalStaff
                  ? Math.round((Number(stat.value) / data.totalStaff) * 100)
                  : 0
              }% of staff`}
            />
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Staff attendance · {date}
          </h2>
          <div className="mt-3 hidden grid-cols-[minmax(220px,1fr)_90px_120px_90px_120px_105px_24px] items-center gap-3 text-[11px] font-semibold tracking-wide text-slate-400 uppercase lg:grid">
            <span>Staff</span>
            <span>Sign in</span>
            <span>Sign-in status</span>
            <span>Sign out</span>
            <span>Sign-out status</span>
            <span>Location</span>
            <span />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-56 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-blue-600" />
          </div>
        ) : isError ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-red-700">
            <AlertCircle className="size-6" />
            Attendance could not be loaded. Check that this menu has View
            permission for your role.
          </div>
        ) : !data?.staff.length ? (
          <div className="flex min-h-56 items-center justify-center text-sm text-slate-500">
            No active staff members were found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.staff.map((row) => (
              <StaffRow
                key={row.staff.subUserId}
                row={row}
                onClick={() =>
                  navigate(
                    DashboardRoutes.toUsersAttendanceStaff(
                      productId,
                      row.staff.subUserId
                    )
                  )
                }
              />
            ))}
          </div>
        )}
      </section>

      <AttendanceSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
