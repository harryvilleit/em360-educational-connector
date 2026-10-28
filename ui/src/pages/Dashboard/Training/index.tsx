import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuthStore } from "@/store/auth.store"
import { trainingApi, trainingMenus } from "@/api/training.api"
import {
  AccessDenied,
  Empty,
  LoadError,
  Progress,
  Status,
  panel,
  message,
} from "./shared"

export default function Training() {
  const schoolId = useSchoolId(),
    permissions = usePermissions(),
    cache = useQueryClient(),
    user = useAuthStore((s) => s.user)
  const view = permissions.canView(trainingMenus.learn)
  const [selected, setSelected] = useState<string | null>(null),
    [lessonIndex, setLessonIndex] = useState(0),
    [answers, setAnswers] = useState<number[]>([])
  const key = ["my-training", schoolId, user?.id],
    detailKey = ["my-training-detail", schoolId, user?.id, selected]
  const query = useQuery({
    queryKey: key,
    queryFn: () => trainingApi.assignments(schoolId),
    enabled: !!schoolId && view,
  })
  const detail = useQuery({
    queryKey: detailKey,
    queryFn: () => trainingApi.assignment(schoolId, selected!),
    enabled: !!selected && !!schoolId && view,
  })
  const assignment = detail.data,
    lessons = assignment?.content?.sections.flatMap((s) => s.lessons) ?? [],
    lesson = lessons[lessonIndex]
  useEffect(() => setAnswers([]), [selected, lessonIndex])
  const complete = useMutation({
    mutationFn: () =>
      trainingApi.complete(schoolId, assignment!, lessonIndex, answers),
    onSuccess: (result) => {
      cache.setQueryData(detailKey, result.assignment)
      void cache.invalidateQueries({ queryKey: key })
      ;(result.passed ? toast.success : toast.error)(
        `${result.message} Score: ${result.scorePercent}%.`
      )
    },
    onError: (e) => {
      toast.error(message(e))
      void detail.refetch()
    },
  })
  if (!view) return <AccessDenied />
  const items = query.data ?? []
  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Training"
        description="Your assigned learning, deadlines and progress in one place."
        icon={<GraduationCap className="size-6 text-blue-600" />}
        badge="Training & Development"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Assigned courses"
          value={items.length}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          label="Completed"
          value={items.filter((x) => x.status === "completed").length}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          label="Overdue"
          value={items.filter((x) => x.status === "overdue").length}
          icon={Clock3}
          color="amber"
        />
      </div>
      {query.isPending && (
        <p role="status" className="text-sm text-slate-500">
          Loading your training…
        </p>
      )}
      {query.isError && (
        <LoadError error={query.error} retry={() => void query.refetch()} />
      )}
      {query.isSuccess && !items.length && (
        <Empty title="You’re ready for your next course">
          Your administrator’s assigned courses will appear here.
        </Empty>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((a) => (
          <article className={panel + " space-y-4"} key={a.id}>
            <div className="flex items-center justify-between">
              <BookOpen className="size-6 text-blue-600" />
              <Status value={a.status} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {a.courseTitle}
            </h2>
            <p className="text-sm text-slate-500">
              Due {new Date(a.dueAtUtc).toLocaleString()} · {a.lessonCount}{" "}
              lessons
            </p>
            <Progress value={a.progressPercent} />
            <Button
              className="w-full"
              variant={a.completedAtUtc ? "outline" : "default"}
              onClick={() => {
                setSelected(a.id)
                setLessonIndex(
                  a.completedLessons.length < a.lessonCount
                    ? a.completedLessons.length
                    : 0
                )
              }}
            >
              {a.completedAtUtc
                ? "Review course"
                : a.completedLessons.length
                  ? "Continue learning"
                  : "Start training"}
            </Button>
          </article>
        ))}
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(o) => {
          if (!o && !complete.isPending) setSelected(null)
        }}
      >
        <DialogContent
          className="max-h-[92vh] overflow-y-auto sm:max-w-5xl"
          onEscapeKeyDown={(e) => complete.isPending && e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {assignment?.courseTitle ?? "Your training"}
            </DialogTitle>
            <DialogDescription>
              Read the lesson, practise and complete the assessment. Your
              progress is saved after you meet the pass mark.
            </DialogDescription>
          </DialogHeader>
          {detail.isPending && <p role="status">Loading course…</p>}
          {detail.isError && (
            <LoadError
              error={detail.error}
              retry={() => void detail.refetch()}
            />
          )}
          {assignment && lesson && (
            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
              <aside className="space-y-4">
                <Progress value={assignment.progressPercent} />
                <nav aria-label="Course lessons" className="space-y-2">
                  {lessons.map((l, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={
                        complete.isPending ||
                        i > assignment.completedLessons.length
                      }
                      aria-current={i === lessonIndex ? "step" : undefined}
                      onClick={() => setLessonIndex(i)}
                      className={`flex w-full items-start gap-2 rounded-xl p-3 text-left text-sm disabled:opacity-50 ${i === lessonIndex ? "bg-blue-50 font-semibold text-blue-700" : "bg-slate-50 text-slate-600"}`}
                    >
                      {assignment.completedLessons.includes(i) ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      ) : (
                        <span className="text-xs">{i + 1}.</span>
                      )}
                      {l.title}
                    </button>
                  ))}
                </nav>
                <p className="text-xs text-slate-500">
                  Pass mark: {assignment.passPercent}%<br />
                  Due: {new Date(assignment.dueAtUtc).toLocaleString()}
                </p>
              </aside>
              <div className="min-w-0 space-y-6">
                <div>
                  <span className="text-xs font-semibold tracking-wide text-blue-600">
                    LESSON {lessonIndex + 1} OF {lessons.length}
                  </span>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {lesson.title}
                  </h2>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {lesson.outcomes.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>
                {(
                  [
                    "explanation",
                    "workedExample",
                    "activity",
                    "worksheet",
                  ] as const
                ).map((field) => (
                  <section key={field} className={panel}>
                    <h3 className="mb-3 font-semibold">
                      {
                        {
                          explanation: "Lesson",
                          workedExample: "Worked example",
                          activity: "Practical activity",
                          worksheet: "Practice material",
                        }[field]
                      }
                    </h3>
                    <p className="text-sm leading-7 break-words whitespace-pre-wrap text-slate-700">
                      {lesson[field]}
                    </p>
                  </section>
                ))}
                {!!lesson.books.length && (
                  <section className={panel}>
                    <h3 className="mb-3 font-semibold">Recommended reading</h3>
                    {lesson.books.map((b, i) => (
                      <div key={i} className="mb-3 text-sm">
                        <p className="font-medium">
                          {b.title} — {b.author}
                        </p>
                        <p className="mt-1 text-slate-500">{b.reason}</p>
                      </div>
                    ))}
                  </section>
                )}
                {assignment.completedLessons.includes(lessonIndex) ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-4">
                    <p className="text-sm font-medium text-emerald-800">
                      Lesson completed
                    </p>
                    {lessonIndex + 1 < lessons.length && (
                      <Button onClick={() => setLessonIndex((i) => i + 1)}>
                        Next lesson
                      </Button>
                    )}
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      complete.mutate()
                    }}
                    className={panel + " space-y-5"}
                  >
                    <h3 className="font-semibold">Check your understanding</h3>
                    {lesson.questions.map((q, qi) => (
                      <fieldset
                        key={qi}
                        disabled={complete.isPending}
                        className="space-y-2"
                      >
                        <legend className="mb-2 text-sm font-medium">
                          {qi + 1}. {q.prompt}
                        </legend>
                        {q.options.map((option, oi) => (
                          <label
                            className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm hover:bg-blue-50"
                            key={oi}
                          >
                            <input
                              required
                              type="radio"
                              name={`question-${qi}`}
                              value={oi}
                              checked={answers[qi] === oi}
                              onChange={() =>
                                setAnswers((v) => {
                                  const next = [...v]
                                  next[qi] = oi
                                  return next
                                })
                              }
                              className="mt-0.5"
                            />
                            {option}
                          </label>
                        ))}
                      </fieldset>
                    ))}
                    <Button
                      type="submit"
                      disabled={
                        complete.isPending ||
                        lesson.questions.some((_, i) => answers[i] == null)
                      }
                    >
                      {complete.isPending && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      Submit assessment
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
