import { ArrowRight, BookOpen, CheckCircle2, Clock3 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StudentELearningCourseI } from "@/api/studentElearning.api"

const accents = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
]

export default function StudentCourseCard({
  course,
  index,
  onOpen,
}: {
  course: StudentELearningCourseI
  index: number
  onOpen: () => void
}) {
  const done = course.lessonCount > 0 && course.completedLessonCount === course.lessonCount
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className={cn("h-2", accents[index % accents.length])} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-950">
              {course.subjectName}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{course.className}</p>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold",
              done
                ? "bg-emerald-100 text-emerald-700"
                : "bg-blue-50 text-blue-700"
            )}
          >
            {done ? "Completed" : `${Math.round(course.progressPercent)}%`}
          </span>
        </div>

        <p className="mt-4 truncate text-sm text-slate-600">
          {course.teacherName || "Teacher not assigned"}
        </p>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
            <span>Course progress</span>
            <span className="font-semibold text-slate-700">
              {course.completedLessonCount}/{course.lessonCount} lessons
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full", done ? "bg-emerald-500" : "bg-blue-600")}
              style={{ width: `${Math.min(100, Math.max(0, course.progressPercent))}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            {done ? (
              <CheckCircle2 className="size-4 text-emerald-500" />
            ) : course.lastStudiedAtUtc ? (
              <Clock3 className="size-4 text-blue-500" />
            ) : (
              <BookOpen className="size-4 text-blue-500" />
            )}
            {done ? "Great work" : course.lastStudiedAtUtc ? "Continue learning" : "Start course"}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600">
            Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </button>
  )
}
