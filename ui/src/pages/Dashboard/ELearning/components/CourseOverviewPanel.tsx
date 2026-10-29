import { useMemo } from "react"
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Radio,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils"
import { useAdaptiveCourseInsights } from "@/hooks/elearning/useAdaptiveLearning"
import type { AdaptiveCourseRefI, AdaptiveTopicSummaryI } from "@/api/adaptiveLearning.api"
import type {
  ELearningAssignment,
  LiveClassSession,
  LmsCourseModule,
  LmsEnrollment,
} from "@/types/elearning"
import type { CourseTab } from "../../Lms/components/CourseTabs"

const card = "rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6"

type AttentionItem = {
  id: string
  icon: LucideIcon
  tone: "warn" | "info"
  title: string
  detail: string
  action: string
  onClick: () => void
}

function masteryChip(topic?: AdaptiveTopicSummaryI) {
  if (!topic || topic.averageMasteryPercent == null)
    return { label: "Not enough answers yet", className: "bg-slate-100 text-slate-700" }
  const value = topic.averageMasteryPercent
  if (value >= 75) return { label: `${Math.round(value)}% secure`, className: "bg-emerald-50 text-emerald-800" }
  if (value >= 50) return { label: `${Math.round(value)}% developing`, className: "bg-amber-50 text-amber-800" }
  return { label: `${Math.round(value)}% gap`, className: "bg-rose-50 text-rose-800" }
}

export default function CourseOverviewPanel({
  modules,
  sessions,
  assignments,
  enrollments,
  courseRef,
  canManageCurriculum,
  readOnly,
  onTabChange,
  onCreateAssignment,
  onJoinSession,
  asideSlot,
}: {
  modules: LmsCourseModule[]
  sessions: LiveClassSession[]
  assignments: ELearningAssignment[]
  enrollments: LmsEnrollment[]
  courseRef?: AdaptiveCourseRefI
  canManageCurriculum: boolean
  readOnly: boolean
  onTabChange: (tab: CourseTab) => void
  onCreateAssignment?: () => void
  onJoinSession?: (session: LiveClassSession) => void | Promise<void>
  asideSlot?: React.ReactNode
}) {
  const { insights } = useAdaptiveCourseInsights(courseRef)
  const lessonCount = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const topicById = useMemo(
    () => new Map((insights?.topics ?? []).map((t) => [t.sectionId, t])),
    [insights]
  )

  const liveSession = sessions.find((s) => s.status === "live")
  const nextSession = useMemo(
    () =>
      sessions
        .filter((s) => s.status === "upcoming")
        .sort((a, b) =>
          (a.scheduledStartUtc ?? `${a.scheduledDate}T${a.startTime}`).localeCompare(
            b.scheduledStartUtc ?? `${b.scheduledDate}T${b.startTime}`
          )
        )[0],
    [sessions]
  )

  const rated = (insights?.topics ?? []).filter((t) => t.averageMasteryPercent != null)
  const classMastery = rated.length
    ? Math.round(rated.reduce((sum, t) => sum + (t.averageMasteryPercent ?? 0), 0) / rated.length)
    : null

  const drafts = assignments.filter((a) => a.status === "draft").length

  const attention: AttentionItem[] = []
  if (liveSession && onJoinSession) {
    attention.push({
      id: "live",
      icon: Radio,
      tone: "warn",
      title: "A class is live now",
      detail: liveSession.title,
      action: "Join",
      onClick: () => void onJoinSession(liveSession),
    })
  }
  if (!readOnly && insights && insights.untaggedQuestionCount > 0) {
    attention.push({
      id: "tag",
      icon: Tags,
      tone: "warn",
      title: `${insights.untaggedQuestionCount} question${insights.untaggedQuestionCount === 1 ? " isn't" : "s aren't"} linked to a topic`,
      detail: "Tagged questions power learning gaps and practice.",
      action: "Tag questions",
      onClick: () => onTabChange("insights"),
    })
  }
  if (insights && insights.studentsNeedingSupport.length > 0) {
    const n = insights.studentsNeedingSupport.length
    attention.push({
      id: "support",
      icon: Users,
      tone: "warn",
      title: `${n} student${n === 1 ? "" : "s"} may need support`,
      detail: "They have at least one topic gap.",
      action: "View students",
      onClick: () => onTabChange("insights"),
    })
  }
  if (!readOnly && drafts > 0) {
    attention.push({
      id: "drafts",
      icon: ClipboardList,
      tone: "info",
      title: `${drafts} assignment${drafts === 1 ? " is" : "s are"} still a draft`,
      detail: "Students can't see drafts until you approve them.",
      action: "Review",
      onClick: () => onTabChange("assignments"),
    })
  }
  if (!liveSession && !nextSession) {
    attention.push({
      id: "schedule",
      icon: CalendarDays,
      tone: "info",
      title: "No live class scheduled",
      detail: "Upcoming classes appear on students' timetables.",
      action: "Live classes",
      onClick: () => onTabChange("live"),
    })
  }
  if (!readOnly && canManageCurriculum && lessonCount === 0) {
    attention.push({
      id: "lessons",
      icon: FileText,
      tone: "info",
      title: "No lessons yet",
      detail: "Add sections and lessons, or build them with AI.",
      action: "Add lessons",
      onClick: () => onTabChange("curriculum"),
    })
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-[2] flex-col gap-5">
        <section className={card} aria-labelledby="attention-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="attention-heading" className="text-base font-semibold text-slate-900">
              Needs your attention
            </h2>
            {attention.length > 0 && (
              <span className="text-sm text-slate-600">
                {attention.length} item{attention.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          {attention.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
              <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
              You're all caught up on this course.
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {attention.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex flex-wrap items-center gap-3.5 rounded-xl px-3.5 py-3.5 sm:flex-nowrap",
                    item.tone === "warn" ? "bg-orange-50" : "bg-slate-50"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      item.tone === "warn" ? "bg-orange-100 text-orange-700" : "bg-blue-50 text-blue-700"
                    )}
                  >
                    <item.icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="truncate text-[13px] text-slate-600">{item.detail}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 rounded-xl bg-white px-3.5"
                    onClick={item.onClick}
                  >
                    {item.action}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={card} aria-labelledby="curriculum-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="curriculum-heading" className="text-base font-semibold text-slate-900">
              Curriculum
            </h2>
            {canManageCurriculum && (
              <button
                type="button"
                className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                onClick={() => onTabChange("curriculum")}
              >
                Open curriculum
              </button>
            )}
          </div>
          {modules.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
              No sections yet.
            </p>
          ) : (
            <ol className="flex flex-col gap-2.5">
              {[...modules]
                .sort((a, b) => a.order - b.order)
                .map((module, index) => {
                  const chip = masteryChip(topicById.get(module.id))
                  return (
                    <li
                      key={module.id}
                      className="flex flex-wrap items-center gap-3.5 rounded-xl border border-slate-200/80 px-4 py-3.5 sm:flex-nowrap"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[13px] font-bold text-slate-700">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{module.title}</p>
                        <p className="text-[13px] text-slate-600">
                          {module.lessons.length} lesson{module.lessons.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      {courseRef && (
                        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", chip.className)}>
                          {chip.label}
                        </span>
                      )}
                    </li>
                  )
                })}
            </ol>
          )}
        </section>
      </div>

      <aside className="flex min-w-0 flex-1 flex-col gap-5 lg:max-w-sm">
        {courseRef && (
          <section className={card} aria-labelledby="mastery-heading">
            <h2 id="mastery-heading" className="mb-4 text-base font-semibold text-slate-900">
              Class mastery
            </h2>
            <div className="flex items-center gap-4">
              <div
                role="img"
                aria-label={classMastery == null ? "Class mastery not available yet" : `Class mastery ${classMastery}%`}
                className="flex size-[76px] shrink-0 items-center justify-center rounded-full"
                style={{
                  background:
                    classMastery == null
                      ? "#F1F5F9"
                      : `conic-gradient(#2453E8 ${classMastery * 3.6}deg, #E2E8F0 0deg)`,
                }}
              >
                <span className="flex size-[60px] items-center justify-center rounded-full bg-white text-lg font-bold text-slate-900">
                  {classMastery == null ? "—" : `${classMastery}%`}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-600">
                {classMastery == null
                  ? "Appears once tagged questions have been answered and marked."
                  : `Average across ${rated.length} topic${rated.length === 1 ? "" : "s"} with enough answers.`}
              </p>
            </div>
            <button
              type="button"
              className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-900"
              onClick={() => onTabChange("insights")}
            >
              View insights
            </button>
          </section>
        )}

        <section className={card} aria-labelledby="next-class-heading">
          <h2 id="next-class-heading" className="mb-3 text-base font-semibold text-slate-900">
            {liveSession ? "Live now" : "Next live class"}
          </h2>
          {liveSession || nextSession ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-slate-900">{(liveSession ?? nextSession)!.title}</p>
              <p className="text-[13px] text-slate-600">
                {formatDate((liveSession ?? nextSession)!.scheduledDate, "short")} ·{" "}
                {(liveSession ?? nextSession)!.startTime}–{(liveSession ?? nextSession)!.endTime}
              </p>
            </div>
          ) : (
            <p className="text-[13px] text-slate-600">Nothing scheduled yet.</p>
          )}
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-blue-700 hover:text-blue-900"
            onClick={() => onTabChange("live")}
          >
            All live classes
          </button>
        </section>

        <section className={card} aria-labelledby="students-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="students-heading" className="text-base font-semibold text-slate-900">
              Students
            </h2>
            <span className="text-sm text-slate-600">{enrollments.length} enrolled</span>
          </div>
          {enrollments.length === 0 ? (
            <p className="text-[13px] text-slate-600">No students are enrolled yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {enrollments.slice(0, 4).map((student) => (
                <li key={student.id} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-900"
                  >
                    {initials(student.learnerName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{student.learnerName}</p>
                    <p className="text-[13px] text-slate-600">
                      {student.completedLessons ?? 0} of {student.totalLessons ?? lessonCount} lessons completed
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {enrollments.length > 0 && (
            <button
              type="button"
              className="mt-3 text-sm font-semibold text-blue-700 hover:text-blue-900"
              onClick={() => onTabChange("enrollments")}
            >
              View all students
            </button>
          )}
        </section>

        {onCreateAssignment && assignments.length === 0 && (
          <section className={card}>
            <h2 className="mb-1 text-base font-semibold text-slate-900">No assignments yet</h2>
            <p className="mb-3 text-[13px] text-slate-600">Create a CBT, written or voice assignment for this class.</p>
            <Button size="sm" className="h-10 rounded-xl" onClick={onCreateAssignment}>
              New assignment
            </Button>
          </section>
        )}

        {asideSlot}
      </aside>
    </div>
  )
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?"
}
