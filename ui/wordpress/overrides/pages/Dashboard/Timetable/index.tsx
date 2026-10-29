// WordPress version: load errors with retry, the school's own date, and shortcuts limited to permitted screens.
import { useMemo } from "react"
import {
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  ClipboardCheck,
} from "lucide-react"
import { useNavigate, useParams } from "react-router"
import { StatCard } from "@/components/general/StatCard"
import { PageHeader } from "@/components/general/PageHeader"
import { ShortcutCard } from "@/components/general/ShortcutCard"
import { DashboardRoutes } from "@/routes"
import { useSchoolId, useSchoolTimeZone } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import { dateISOInTimeZone } from "@/lib/schoolDate"
import { useGetCalendarEvents } from "@/hooks/calendar"
import { useGetTimetableOverview } from "@/hooks/timetable"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"

type UpcomingItem = {
  id: string
  date: string
  type: "Event"
  title: string
  subtitle: string
  badgeColor: string
}

export default function TimetablePage() {
  const go = useNavigate()
  const permissions = usePermissions()
  // Shortcuts only open screens the role can see.
  const navigate = (path: string) => {
    if (permissions.hasRouteAccess(path)) go(path)
  }
  const timeZone = useSchoolTimeZone()
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const schoolId = useSchoolId()

  const {
    sessions,
    isError: sessionsError,
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const currentSession =
    sessions.find((s) => s.IsCurrent || s.Status === "Active") ?? sessions[0]
  const currentTerm =
    currentSession?.Terms.find((t) => t.IsCurrent) ?? currentSession?.Terms[0]

  const {
    overview,
    isError: overviewError,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = useGetTimetableOverview({
    // Wait for the current session and term instead of asking for the whole school.
    schoolId: currentSession?.Id && currentTerm?.Id ? schoolId : "",
    sessionId: currentSession?.Id,
    termId: currentTerm?.Id,
  })
  const {
    events: calendarEvents,
    isError: eventsError,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useGetCalendarEvents({ schoolId })

  const today = dateISOInTimeZone(timeZone)

  const upcoming: UpcomingItem[] = useMemo(() => {
    return calendarEvents
      .filter((e) => (e.endDate ?? e.startDate).slice(0, 10) >= today)
      .map((e) => ({
        id: `event-${e.id}`,
        date: e.startDate.slice(0, 10),
        type: "Event" as const,
        title: e.title,
        subtitle: e.affectsAllClasses
          ? "All classes"
          : e.affectedClasses.map((c) => c.schoolClassName).join(", "),
        badgeColor: "bg-green-50 text-green-700",
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6)
  }, [calendarEvents, today])

  if (sessionsError || overviewError || eventsError)
    return (
      <div role="alert" className="rounded-xl bg-red-50 p-6">
        Unable to load the timetable overview.{" "}
        <button
          onClick={() => {
            void refetchSessions()
            void refetchOverview()
            void refetchEvents()
          }}
        >
          Try Again
        </button>
      </div>
    )
  if (sessionsLoading || (overviewLoading && !!currentTerm?.Id) || eventsLoading) return <p className="p-6">Loading timetable overview…</p>

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable"
        description="Overview of class, test, and exam timetables."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Classes with Timetable"
          value={overview?.classesWithTimetable ?? 0}
          icon={BookOpen}
          color="blue"
          onClick={() =>
            navigate(DashboardRoutes.toTimetableManage(p, "class"))
          }
        />
        <StatCard
          label="Upcoming Tests"
          value={overview?.upcomingTests ?? 0}
          icon={CalendarCheck2}
          color="purple"
          onClick={() => navigate(DashboardRoutes.toTimetableManage(p, "test"))}
        />
        <StatCard
          label="Upcoming Exams"
          value={overview?.upcomingExams ?? 0}
          icon={ClipboardCheck}
          color="orange"
          onClick={() => navigate(DashboardRoutes.toTimetableManage(p, "exam"))}
        />
        <StatCard
          label="Upcoming Calendar Events"
          value={overview?.upcomingCalendarEvents ?? 0}
          icon={CalendarDays}
          color="green"
          onClick={() => navigate(DashboardRoutes.toTimetableCalendar(p))}
        />
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Quick Actions
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ShortcutCard
            onClick={() =>
              navigate(DashboardRoutes.toTimetableManage(p, "class"))
            }
            iconBg="bg-blue-50 group-hover:bg-blue-100"
            icon={<BookOpen className="size-6 text-blue-600" />}
            borderColor="border-blue-100"
            title="Class Timetable"
            description="Build and publish weekly class timetables"
          />
          <ShortcutCard
            onClick={() =>
              navigate(DashboardRoutes.toTimetableManage(p, "assessment"))
            }
            iconBg="bg-orange-50 group-hover:bg-orange-100"
            icon={<ClipboardCheck className="size-6 text-orange-600" />}
            borderColor="border-orange-100"
            title="Assessment Timetable"
            description="Schedule tests and end-of-term examinations"
          />
          <ShortcutCard
            onClick={() => navigate(DashboardRoutes.toTimetableCalendar(p))}
            iconBg="bg-green-50 group-hover:bg-green-100"
            icon={<CalendarDays className="size-6 text-green-600" />}
            borderColor="border-green-100"
            title="School Calendar"
            description="Manage holidays, events, and school-wide dates"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <p className="text-sm font-semibold text-gray-900">Coming Up</p>
          <button
            onClick={() => navigate(DashboardRoutes.toTimetableCalendar(p))}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            View calendar
          </button>
        </div>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarDays className="mb-2 size-8 text-gray-300" />
            <p className="text-sm text-gray-500">Nothing scheduled yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcoming.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-400">{item.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {new Date(item.date).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.badgeColor}`}
                  >
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
