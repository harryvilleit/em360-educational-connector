import { useNavigate, useParams } from "react-router"
import {
  BookOpen,
  CalendarDays,
  Clock3,
  Download,
  MoreHorizontal,
  Radio,
  UserRound,
  UsersRound,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard, dashboardCardSurface } from "@/components/general/StatCard"
import { ShortcutCard } from "@/components/general/ShortcutCard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import { useELearningFilterOptions } from "@/hooks/elearning/useELearningFilterOptions"
import { useELearningOverview } from "@/hooks/elearning/useELearningOverview"
import type {
  ELearningTeacherSummaryI,
  ELearningTodayClassI,
} from "@/api/elearningOverview.api"

const STATUS_STYLES: Record<string, string> = {
  live: "bg-red-50 text-red-700 ring-red-100",
  "in progress": "bg-amber-50 text-amber-700 ring-amber-100",
  upcoming: "bg-blue-50 text-blue-700 ring-blue-100",
  ended: "bg-slate-100 text-slate-600 ring-slate-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
}

function statusClass(status: string) {
  return (
    STATUS_STYLES[status.toLowerCase()] ??
    "bg-slate-100 text-slate-600 ring-slate-200"
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function csvCell(value: string | number) {
  const text = String(value).replaceAll('"', '""')
  return `"${text}"`
}

function formatSchoolDate(value?: string) {
  if (!value) return "Today"
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? "Today"
    : date.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
}

function TodayClassRow({ item }: { item: ELearningTodayClassI }) {
  return (
    <div className="grid gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 md:grid-cols-[1.4fr_1fr_1.1fr_0.8fr_auto] md:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">
          {item.subjectName}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {item.className}
        </p>
      </div>
      <div className="flex min-w-0 items-center gap-2 text-sm text-slate-700">
        <UserRound className="size-4 shrink-0 text-blue-500" />
        <span className="truncate">{item.teacherName}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <Clock3 className="size-4 text-slate-400" />
        {item.startTime} – {item.endTime}
      </div>
      <div className="text-xs text-muted-foreground">
        <p>{item.classMode}</p>
        {item.venue && <p className="mt-0.5 truncate">{item.venue}</p>}
      </div>
      <span
        className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass(item.status)}`}
      >
        {item.status}
      </span>
    </div>
  )
}

export default function ELearningOverviewPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const schoolId = useSchoolId()
  const { isOwner: permissionOwner } = usePermissions()
  const {
    termRanges,
    termIdByName,
    sessionId,
    currentTermName,
    isLoading: optionsLoading,
  } = useELearningFilterOptions(schoolId)

  const termId = currentTermName ? termIdByName[currentTermName] : undefined
  const currentTermRange = currentTermName
    ? termRanges[currentTermName]
    : undefined

  const overviewQuery = useELearningOverview({
    schoolId,
    schoolSessionId: sessionId,
    schoolSessionTermId: termId,
  })
  const overview = overviewQuery.overview
  const isOwner = overview?.isOwner ?? permissionOwner
  const teachers = overview?.teachers ?? []
  const todayClasses = overview?.todayClasses ?? []

  const currentTeacher = teachers[0]
  const totalCourses = overview?.totalCourses ?? 0
  const liveCourses = overview?.liveCoursesCurrentTerm ?? 0
  const upcomingClasses = overview?.upcomingClassesThisWeek ?? 0

  const termLabel = currentTermName ?? "Current term"
  const todayLabel = formatSchoolDate(overview?.schoolDate)

  const openTeacherTimetable = (teacher: ELearningTeacherSummaryI) =>
    navigate(
      DashboardRoutes.toELearningTeacherTimetable(
        productId ?? "",
        teacher.subUserId
      )
    )

  const openTeacherCourses = (teacher: ELearningTeacherSummaryI) =>
    navigate(
      DashboardRoutes.toELearningTeacherCourses(
        productId ?? "",
        teacher.subUserId
      )
    )

  const exportToday = () => {
    if (todayClasses.length === 0) {
      toast.info("There are no classes to export for today")
      return
    }
    const rows = [
      [
        "Subject",
        "Class",
        "Teacher",
        "Start",
        "End",
        "Mode",
        "Venue",
        "Status",
      ],
      ...todayClasses.map((item) => [
        item.subjectName,
        item.className,
        item.teacherName,
        item.startTime,
        item.endTime,
        item.classMode,
        item.venue,
        item.status,
      ]),
    ]
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "elearning-today-schedule.csv"
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success("Today’s schedule exported")
  }

  const loading = optionsLoading || overviewQuery.isLoading

  return (
    <div className="space-y-7">
      <PageHeader
        title="E-Learning Overview"
        description={
          isOwner
            ? "Monitor school courses, today’s timetable and every assigned teacher."
            : "Manage your assigned courses and follow your teaching timetable."
        }
        actions={
          <Button
            variant="outline"
            className="h-9 gap-2 rounded-lg"
            onClick={exportToday}
          >
            <Download className="size-4" />
            Export today
          </Button>
        }
      />

      {loading ? (
        <div className="flex min-h-80 items-center justify-center">
          <Spinner className="size-6" />
        </div>
      ) : !sessionId || !termId || !currentTermRange ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <CalendarDays className="mx-auto size-8 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            No current academic term is configured
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Configure the current session and term to load this overview.
          </p>
        </div>
      ) : overviewQuery.isError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
          The E-Learning overview could not be loaded. Please try again.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label={isOwner ? "School courses" : "My assigned courses"}
              value={totalCourses}
              icon={BookOpen}
              color="blue"
              meta={termLabel}
              onClick={
                !isOwner && currentTeacher
                  ? () => openTeacherCourses(currentTeacher)
                  : undefined
              }
            />
            <StatCard
              label="Live courses"
              value={liveCourses}
              icon={Radio}
              color="red"
              meta={termLabel}
              onClick={() =>
                navigate(
                  DashboardRoutes.toELearningLiveClasses(productId ?? "")
                )
              }
            />
            <StatCard
              label="Upcoming classes"
              value={upcomingClasses}
              icon={CalendarDays}
              color="indigo"
              meta="This week"
              onClick={
                currentTeacher
                  ? () => openTeacherTimetable(currentTeacher)
                  : undefined
              }
            />
          </div>

          <section className={dashboardCardSurface}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Today’s classes
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {todayLabel} · from the current timetable
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {todayClasses.length} scheduled
              </span>
            </div>

            {todayClasses.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <CalendarDays className="mx-auto size-7 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-600">
                  No timetable classes scheduled for today
                </p>
              </div>
            ) : (
              <div>
                {todayClasses.map((item) => (
                  <TodayClassRow key={item.timetableId} item={item} />
                ))}
              </div>
            )}
          </section>

          <section className={dashboardCardSurface}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">Teachers</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {isOwner
                    ? "Users with at least one class and subject assignment"
                    : "Your teacher profile and course access"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <UsersRound className="size-4" />
                {teachers.length}
              </div>
            </div>

            {teachers.length === 0 ? (
              <div className="px-5 py-14 text-center text-sm text-muted-foreground">
                No teacher has an assigned class and subject yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.subUserId}
                    className="grid gap-3 px-5 py-4 md:grid-cols-[auto_1.2fr_1.3fr_0.6fr_0.7fr_auto] md:items-center"
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700">
                      {initials(teacher.name) || "T"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {teacher.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Teacher
                      </p>
                    </div>
                    <p className="truncate text-sm text-slate-600">
                      {teacher.email}
                    </p>
                    <p className="text-sm text-slate-600">
                      {teacher.courseCount} course
                      {teacher.courseCount === 1 ? "" : "s"}
                    </p>
                    <span
                      className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass(teacher.status)}`}
                    >
                      {teacher.status}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="rounded-lg"
                          aria-label={`Actions for ${teacher.name}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44 rounded-xl"
                      >
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 rounded-lg text-xs"
                          onSelect={() => openTeacherTimetable(teacher)}
                        >
                          <CalendarDays className="size-3.5 text-indigo-500" />
                          View timetable
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 rounded-lg text-xs"
                          onSelect={() => openTeacherCourses(teacher)}
                        >
                          <BookOpen className="size-3.5 text-blue-500" />
                          View courses
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
