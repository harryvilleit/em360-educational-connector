import { useNavigate, useParams } from "react-router"
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { DashboardRoutes } from "@/routes"
import type { LmsCourseModule, SchoolSubjectCourse } from "@/types/elearning"

type ELearningCourseWorkspaceProps = {
  course: SchoolSubjectCourse
  modules: LmsCourseModule[]
  liveCount: number
  upcomingCount: number
  children: React.ReactNode
  isDemo?: boolean
  readOnly?: boolean
  backPath?: string
  /** Primary course actions shown at the top right of the header. */
  actions?: React.ReactNode
  /** Adaptive-learning tagging progress; the stat is hidden when unknown. */
  questionsTagged?: { tagged: number; total: number }
}

function StatCard({ label, value, suffix }: { label: string; value: React.ReactNode; suffix?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 sm:px-5">
      <span className="text-[13px] text-slate-600">{label}</span>
      <span className="text-2xl font-bold tabular-nums text-slate-900">
        {value}
        {suffix && <span className="text-base font-medium text-slate-500"> {suffix}</span>}
      </span>
    </div>
  )
}

export default function ELearningCourseWorkspace({
  course,
  modules,
  liveCount,
  upcomingCount,
  children,
  isDemo = false,
  readOnly = false,
  backPath,
  actions,
  questionsTagged,
}: ELearningCourseWorkspaceProps) {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const lessonCount = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const goBack = () =>
    navigate(backPath ?? DashboardRoutes.toELearningCourses(productId ?? ""))

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-600">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1 rounded-md hover:text-slate-900 sm:hidden"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Courses
        </button>
        <button type="button" onClick={goBack} className="hidden hover:text-slate-900 sm:inline">
          Courses
        </button>
        <ChevronRight className="hidden size-3.5 sm:block" aria-hidden="true" />
        <span className="hidden font-medium text-slate-900 sm:inline">{course.subject}</span>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 sm:size-16"
          >
            <BookOpen className="size-7" />
          </span>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap gap-2">
              {course.className && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-900">
                  {course.className}
                </span>
              )}
              {(course.terms ?? []).map((term) => (
                <span key={term} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {term}
                </span>
              ))}
              {isDemo && (
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">
                  Demo
                </span>
              )}
              {readOnly && (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  Read-only oversight
                </span>
              )}
            </div>
            <h1 className="truncate text-3xl font-bold tracking-tight text-slate-900">{course.subject}</h1>
            {course.teacherName && (
              <p className="text-sm text-slate-600">Taught by {course.teacherName}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
      </header>

      <section
        aria-label="Course statistics"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        <StatCard label="Lessons" value={lessonCount} />
        <StatCard label="Students" value={course.studentCount} />
        <StatCard label="Live now" value={liveCount} />
        <StatCard label="Upcoming classes" value={upcomingCount} />
        {questionsTagged && (
          <StatCard
            label="Questions tagged"
            value={questionsTagged.tagged}
            suffix={`/ ${questionsTagged.total}`}
          />
        )}
      </section>

      {children}
    </div>
  )
}
