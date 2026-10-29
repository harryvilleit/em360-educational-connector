import { useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { format } from "date-fns"
import {
  CalendarCheck2,
  ClipboardList,
  ChevronRight,
  RefreshCw,
  UserX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterSelect } from "@/components/ui/filter-select"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAttendanceDashboard } from "@/hooks/studentAttendance"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { DashboardRoutes } from "@/routes"
import { formatDate } from "@/utils"

export default function StudentAttendanceDashboardPage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const schoolId = useSchoolId()
  const [searchParams] = useSearchParams()

  const attendanceDate =
    searchParams.get("date") || formatDate(new Date(), "YYYY-MM-DD")

  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: s.Id, label: s.SessionName })),
    [sessions]
  )
  const currentSession = useMemo(
    () => sessions.find((s) => s.Terms.some((t) => t.IsCurrent)) ?? sessions[0],
    [sessions]
  )
  const [selectedSessionId, setSelectedSessionId] = useState(
    () => searchParams.get("sessionId") || ""
  )
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
  const [selectedTermId, setSelectedTermId] = useState(
    () => searchParams.get("termId") || ""
  )
  const activeTermId = selectedTermId || currentTerm?.Id || ""

  function handleSessionChange(newSessionId: string) {
    setSelectedSessionId(newSessionId)
    setSelectedTermId("")
  }

  const {
    dashboard,
    isLoading: dashboardLoading,
    isError: dashboardError,
    error: dashboardErrorObj,
    refetch: refetchDashboard,
  } = useGetAttendanceDashboard({
    schoolId,
    attendanceDate,
    schoolSessionId: activeSessionId || undefined,
    schoolSessionTermId: activeTermId || undefined,
  })

  const formattedDateFallback = format(
    new Date(`${attendanceDate}T12:00:00`),
    "EEEE, MMMM d, yyyy"
  )

  const classesNotYetMarked = dashboard?.classesNotYetMarked ?? []
  const todaysSummary = dashboard?.todaysSummary ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Attendance"
        description={`Monitor and manage daily student attendance · ${dashboard?.formattedDate ?? formattedDateFallback}`}
        onBack={() => navigate(DashboardRoutes.toAttendance(productId!))}
        backLabel="Back to Attendance Overview"
        actions={
          <Button
            variant="primary"
            onClick={() =>
              navigate(
                DashboardRoutes.toAttendanceStudentsMark(productId!, {
                  date: attendanceDate,
                  sessionId: activeSessionId || undefined,
                  termId: activeTermId || undefined,
                })
              )
            }
          >
            <CalendarCheck2 className="size-4" />
            Mark Attendance
          </Button>
        }
      />

      {sessionOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            value={activeSessionId}
            onChange={handleSessionChange}
            options={sessionOptions}
            placeholder="Select session"
            triggerClassName="h-9 w-40"
          />
          {termOptions.length > 0 && (
            <FilterSelect
              value={activeTermId}
              onChange={setSelectedTermId}
              options={termOptions}
              placeholder="Select term"
              triggerClassName="h-9 w-36"
            />
          )}
        </div>
      )}

      {dashboardError ? (
        <EmptyState
          icon={ClipboardList}
          title="Couldn't load attendance"
          description={
            dashboardErrorObj?.message ||
            "Something went wrong loading today's attendance."
          }
          action={{
            label: "Retry",
            onClick: () => refetchDashboard(),
            icon: RefreshCw,
          }}
        />
      ) : dashboardLoading ? (
        <div className="flex items-center justify-center py-24 text-sm text-gray-500">
          Loading attendance...
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Total Students"
              value={dashboard?.totalStudents ?? 0}
              icon={ClipboardList}
              color="blue"
            />
            <StatCard
              label="Present Today"
              value={dashboard?.presentToday ?? 0}
              icon={CalendarCheck2}
              color="green"
              meta={
                dashboard && dashboard.totalStudents > 0
                  ? `${Math.round((dashboard.presentToday / dashboard.totalStudents) * 100)}% attendance`
                  : undefined
              }
              metaType="up"
            />
            <StatCard
              label="Absent Today"
              value={dashboard?.absentToday ?? 0}
              icon={UserX}
              color="red"
              meta={
                (dashboard?.absentToday ?? 0) > 0 ? "Needs attention" : "None"
              }
              metaType={(dashboard?.absentToday ?? 0) > 0 ? "down" : "neutral"}
            />
            <StatCard
              label="Classes Marked"
              value={
                dashboard?.classesMarkedText ??
                `${dashboard?.markedClassesCount ?? 0}/${dashboard?.totalClassesCount ?? 0}`
              }
              icon={ClipboardList}
              color="indigo"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Unmarked classes alert */}
            {classesNotYetMarked.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-amber-100 bg-amber-50">
                <div className="flex items-center justify-between border-b border-amber-100 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      {classesNotYetMarked.length} class
                      {classesNotYetMarked.length > 1 ? "es" : ""} not yet
                      marked
                    </p>
                    <p className="text-xs text-amber-600">
                      Today's attendance is pending for these classes
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-amber-100 px-5">
                  {classesNotYetMarked.map((cls) => (
                    <div
                      key={cls.schoolClassId}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-amber-900">
                          {cls.schoolClassName}
                        </p>
                        <p className="text-xs text-amber-600">
                          {cls.studentCount} student
                          {cls.studentCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          navigate(
                            DashboardRoutes.toAttendanceStudentsMark(
                              productId!,
                              {
                                classId: cls.schoolClassId,
                                date: attendanceDate,
                                sessionId: activeSessionId || undefined,
                                termId: activeTermId || undefined,
                              }
                            )
                          )
                        }
                        className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900"
                      >
                        Mark now
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's summary by class */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <p className="text-sm font-semibold text-gray-900">
                  Today's Summary
                </p>
                <button
                  onClick={() =>
                    navigate(
                      DashboardRoutes.toAttendanceStudentsRecords(productId!)
                    )
                  }
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View all records
                </button>
              </div>
              {todaysSummary.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarCheck2 className="mb-2 size-8 text-gray-300" />
                  <p className="text-sm text-gray-500">
                    No attendance marked today yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {todaysSummary.map((cls) => (
                    <div
                      key={cls.sessionId}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {cls.schoolClassName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {cls.presentCount} present · {cls.absentCount} absent
                          · {cls.lateCount} late
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          cls.presentPercentage >= 80
                            ? "text-green-600"
                            : cls.presentPercentage >= 60
                              ? "text-amber-600"
                              : "text-red-500"
                        }`}
                      >
                        {Math.round(cls.presentPercentage)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
