// WordPress version: staff totals come from the school's attendance register, not this browser.
import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { format } from "date-fns"
import {
  CalendarCheck2,
  CalendarDays,
  Camera,
  ChevronRight,
  ClipboardList,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react"
import { StatCard, dashboardCardSurface } from "@/components/general/StatCard"
import { PageHeader } from "@/components/general/PageHeader"
import { FilterSelect } from "@/components/ui/filter-select"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAttendanceDashboard } from "@/hooks/studentAttendance"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { Button } from "@/components/ui/button"
import { useStaffAttendanceSummary } from "../../../../attendance/service"
import { DashboardRoutes } from "@/routes"
import { formatDate } from "@/utils"

import StatusRow from "@/pages/Dashboard/Attendance/components/StatusRow"

export default function AttendanceOverviewPage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const schoolId = useSchoolId()
  const attendanceDate = formatDate(new Date(), "YYYY-MM-DD")

  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: s.Id, label: s.SessionName })),
    [sessions]
  )
  const currentSession = useMemo(
    () => sessions.find((s) => s.Terms.some((t) => t.IsCurrent)) ?? sessions[0],
    [sessions]
  )
  const [selectedSessionId, setSelectedSessionId] = useState("")
  const activeSessionId = selectedSessionId || currentSession?.Id || ""
  const activeSession = sessions.find((s) => s.Id === activeSessionId)
  const termOptions = useMemo(
    () =>
      (activeSession?.Terms ?? []).map((t) => ({
        value: t.Id,
        label: t.TermName,
      })),
    [activeSession]
  )
  const currentTerm =
    activeSession?.Terms.find((t) => t.IsCurrent) ?? activeSession?.Terms[0]
  const [selectedTermId, setSelectedTermId] = useState("")
  const activeTermId = selectedTermId || currentTerm?.Id || ""

  function handleSessionChange(newSessionId: string) {
    setSelectedSessionId(newSessionId)
    // Never keep a Term that belonged to the previous Session.
    setSelectedTermId("")
  }

  const {
    dashboard,
    isLoading: dashboardLoading,
    isError: dashboardError,
    refetch: refetchDashboard,
  } = useGetAttendanceDashboard({
    schoolId,
    attendanceDate,
    schoolSessionId: activeSessionId || undefined,
    schoolSessionTermId: activeTermId || undefined,
  })

  const studentLate = (dashboard?.todaysSummary ?? []).reduce(
    (sum, c) => sum + c.lateCount,
    0
  )
  const studentExcused = (dashboard?.todaysSummary ?? []).reduce(
    (sum, c) => sum + c.excusedCount,
    0
  )
  const studentTotal = dashboard?.totalStudents ?? 0
  const studentPresent = dashboard?.presentToday ?? 0
  const studentAbsent = dashboard?.absentToday ?? 0
  const studentRate =
    studentTotal > 0 ? Math.round((studentPresent / studentTotal) * 100) : 0
  // Staff totals come from the school's attendance register.
  const {
    data: staffSummary,
    isLoading: staffLoading,
    isError: staffError,
    refetch: refetchStaff,
  } = useStaffAttendanceSummary()
  const staffStats = staffSummary ?? { total: 0, present: 0, absent: 0, late: 0 }
  const staffRate =
    staffStats.total > 0
      ? Math.round((staffStats.present / staffStats.total) * 100)
      : 0

  const formattedDate = format(
    new Date(`${attendanceDate}T12:00:00`),
    "d MMM yyyy"
  )

  if (dashboardError || staffError)
    return (
      <div role="alert" className="rounded-2xl border bg-white p-6">
        Attendance could not be loaded.{" "}
        <Button
          onClick={() => {
            void refetchDashboard()
            void refetchStaff()
          }}
        >
          Try again
        </Button>
      </div>
    )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Overview"
        description="Monitor student and staff attendance across the school."
      />

      <div className="flex flex-wrap items-center gap-2">
        {sessionOptions.length > 0 && (
          <FilterSelect
            value={activeSessionId}
            onChange={handleSessionChange}
            options={sessionOptions}
            placeholder="Select session"
            triggerClassName="h-9 w-40"
          />
        )}
        {termOptions.length > 0 && (
          <FilterSelect
            value={activeTermId}
            onChange={setSelectedTermId}
            options={termOptions}
            placeholder="Select term"
            triggerClassName="h-9 w-36"
          />
        )}
        <span className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600">
          <CalendarDays className="size-4 text-gray-400" />
          {formattedDate}
        </span>
      </div>

      {/* Combined high-level summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Students"
          value={dashboardLoading ? "0" : studentTotal}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Students Present"
          value={dashboardLoading ? "0" : studentPresent}
          icon={CalendarCheck2}
          color="green"
          meta={
            !dashboardLoading && studentTotal > 0
              ? `${studentRate}%`
              : undefined
          }
          metaType="up"
        />
        <StatCard
          label="Total Staff"
          value={staffLoading ? "0" : staffStats.total}
          icon={UserCog}
          color="indigo"
        />
        <StatCard
          label="Staff Present"
          value={staffLoading ? "0" : staffStats.present}
          icon={CalendarCheck2}
          color="green"
          meta={
            !staffLoading && staffStats.total > 0 ? `${staffRate}%` : undefined
          }
          metaType="up"
        />
      </div>

      {/* Student / Staff summary cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${dashboardCardSurface} p-5`}>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Student Attendance
            </h2>
            <ClipboardList className="size-4 text-gray-300" />
          </div>
          <div className="divide-y divide-gray-50">
            <StatusRow
              status="present"
              label="Present"
              value={studentPresent}
            />
            <StatusRow status="absent" label="Absent" value={studentAbsent} />
            <StatusRow status="late" label="Late" value={studentLate} />
            <StatusRow
              status="excused"
              label="Excused"
              value={studentExcused}
            />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
            <span className="text-sm text-gray-500">Attendance Rate</span>
            <span className="text-lg font-bold text-gray-900">
              {dashboardLoading || studentTotal === 0 ? "0%" : `${studentRate}%`}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-gray-500">Classes Marked</span>
            <span className="text-sm font-semibold text-gray-900">
              {dashboard?.classesMarkedText ??
                `${dashboard?.markedClassesCount ?? 0}/${dashboard?.totalClassesCount ?? 0}`}
            </span>
          </div>
          <button
            onClick={() =>
              navigate(
                DashboardRoutes.toAttendanceStudents(productId!, {
                  date: attendanceDate,
                  sessionId: activeSessionId || undefined,
                  termId: activeTermId || undefined,
                })
              )
            }
            className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            View Student Attendance
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className={`${dashboardCardSurface} p-5`}>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Staff Attendance
            </h2>
            <UserCog className="size-4 text-gray-300" />
          </div>
          <div className="divide-y divide-gray-50">
            <StatusRow
              status="present"
              label="Present"
              value={staffStats.present}
            />
            <StatusRow
              status="absent"
              label="Absent"
              value={staffStats.absent}
            />
            <StatusRow status="late" label="Late" value={staffStats.late} />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
            <span className="text-sm text-gray-500">Attendance Rate</span>
            <span className="text-lg font-bold text-gray-900">
              {staffLoading || staffStats.total === 0 ? "0%" : `${staffRate}%`}
            </span>
          </div>
          <button
            onClick={() =>
              navigate(DashboardRoutes.toAttendanceStaff(productId!))
            }
            className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            View Staff Attendance
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(DashboardRoutes.toAttendanceScan(productId!))}
        className="flex w-full flex-col justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 text-left transition-shadow hover:shadow-sm sm:flex-row sm:items-center"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Camera className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-gray-900">Scan ID Card</h2>
            <p className="mt-1 text-sm text-gray-600">
              Scan a student or staff ID card to confirm identity and mark
              them present.
            </p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700">
          Open scanner <ChevronRight className="size-4" />
        </span>
      </button>

      <button
        type="button"
        onClick={() =>
          navigate(DashboardRoutes.toAttendanceIntervention(productId!))
        }
        className="flex w-full flex-col justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 text-left transition-shadow hover:shadow-sm sm:flex-row sm:items-center"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <TrendingUp className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-gray-900">
              Attendance & Early Intervention
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Detect persistent absence, repeated lateness and sudden attendance
              decline, then coordinate support.
            </p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-700">
          Open intervention dashboard <ChevronRight className="size-4" />
        </span>
      </button>
    </div>
  )
}
