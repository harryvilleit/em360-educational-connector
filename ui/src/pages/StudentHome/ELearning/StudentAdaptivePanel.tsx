import { useMemo, useState } from "react"
import {
  CheckCircle2,
  Dumbbell,
  Info,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
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
import { cn } from "@/lib/utils"
import {
  useStartStudentPractice,
  useStudentAdaptiveLearning,
  useSubmitStudentPracticeAnswer,
} from "@/hooks/elearning/useAdaptiveLearning"
import type {
  AdaptiveCourseRefI,
  AdaptiveMasteryStatusI,
  AdaptivePracticeResultI,
  AdaptivePracticeSetI,
} from "@/api/adaptiveLearning.api"

const statusStyle: Record<AdaptiveMasteryStatusI, { label: string; pill: string; bar: string }> = {
  secure: { label: "Secure", pill: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-500" },
  developing: { label: "Developing", pill: "bg-amber-50 text-amber-700", bar: "bg-amber-400" },
  gap: { label: "Needs work", pill: "bg-rose-50 text-rose-700", bar: "bg-rose-500" },
  not_enough_evidence: {
    label: "Not enough answers yet",
    pill: "bg-slate-100 text-slate-500",
    bar: "bg-slate-300",
  },
}

const lessonActionLabel = {
  start: "Start lesson",
  continue: "Continue lesson",
  review: "Review lesson",
} as const

export default function StudentAdaptivePanel({
  course,
  onOpenLesson,
}: {
  course: AdaptiveCourseRefI
  onOpenLesson: (lessonId: string) => void
}) {
  const { learning, isLoading, isError, error } = useStudentAdaptiveLearning(course)
  const startPractice = useStartStudentPractice(course)
  const [practiceSet, setPracticeSet] = useState<AdaptivePracticeSetI | null>(null)

  const openPractice = async (sectionId: string) => {
    try {
      const res = await startPractice.mutateAsync(sectionId)
      if (res.value.questions.length === 0) {
        toast.info("No practice questions are available for this topic yet.")
        return
      }
      setPracticeSet(res.value)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start practice")
    }
  }

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-slate-400">Working out your progress…</div>
  }
  if (isError || !learning) {
    return (
      <div className="py-16 text-center text-sm text-rose-600">
        {error instanceof Error ? error.message : "Could not load your progress."}
      </div>
    )
  }

  const hasAnyEvidence = learning.topics.some(
    (t) => t.assessmentEvidenceCount + t.practiceEvidenceCount > 0
  )

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overall</p>
          <p className="mt-2 text-4xl font-black tabular-nums text-slate-950">
            {learning.overallMasteryPercent == null ? "—" : `${Math.round(learning.overallMasteryPercent)}%`}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Based on your marked assignments and practice in {learning.subjectName}.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Sparkles className="size-4 text-blue-600" /> What to work on next
          </h3>
          {learning.recommendations.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              {hasAnyEvidence
                ? "Nice work — no topic needs extra attention right now."
                : "Complete your assignments and your next steps will appear here."}
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {learning.recommendations.map((rec) => (
                <li key={rec.sectionId} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{rec.title}</p>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", statusStyle[rec.status].pill)}>
                      {statusStyle[rec.status].label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{rec.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rec.nextLessonId && rec.lessonAction && (
                      <Button size="sm" variant="outline" onClick={() => onOpenLesson(rec.nextLessonId!)}>
                        <PlayCircle className="size-4" />
                        {lessonActionLabel[rec.lessonAction]}
                        {rec.nextLessonTitle ? `: ${rec.nextLessonTitle}` : ""}
                      </Button>
                    )}
                    {rec.practiceQuestionCount > 0 && (
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={startPractice.isPending}
                        onClick={() => void openPractice(rec.sectionId)}
                      >
                        <Dumbbell className="size-4" /> Practise
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Target className="size-4" /> Topics
          </h3>
        </div>
        {learning.topics.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">Topics have not been added yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {learning.topics.map((topic) => {
              const style = statusStyle[topic.status]
              return (
                <li key={topic.sectionId} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{topic.title}</p>
                    <div className="mt-1.5 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn("h-full rounded-full", style.bar)}
                        style={{ width: `${topic.masteryPercent ?? 0}%` }}
                      />
                    </div>
                  </div>
                  <span className={cn("w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold", style.pill)}>
                    {topic.masteryPercent == null || topic.status === "not_enough_evidence"
                      ? style.label
                      : `${style.label} · ${Math.round(topic.masteryPercent)}%`}
                  </span>
                  {topic.practiceQuestionCount > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-fit"
                      disabled={startPractice.isPending}
                      onClick={() => void openPractice(topic.sectionId)}
                    >
                      <Dumbbell className="size-3.5" /> Practise
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <p className="flex items-start gap-2 px-1 text-[11px] leading-relaxed text-slate-400">
        <Info className="mt-0.5 size-3 shrink-0" />
        Practice does not affect your grades. Your teacher can see which topics you have practised.
      </p>

      {practiceSet && (
        <PracticeDialog
          course={course}
          practiceSet={practiceSet}
          onClose={() => setPracticeSet(null)}
          onRestart={() => void openPractice(practiceSet.sectionId)}
        />
      )}
    </div>
  )
}

function PracticeDialog({
  course,
  practiceSet,
  onClose,
  onRestart,
}: {
  course: AdaptiveCourseRefI
  practiceSet: AdaptivePracticeSetI
  onClose: () => void
  onRestart: () => void
}) {
  const submit = useSubmitStudentPracticeAnswer(course)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [result, setResult] = useState<AdaptivePracticeResultI | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [lastTopic, setLastTopic] = useState<AdaptivePracticeResultI["topic"] | null>(null)

  const question = practiceSet.questions[index]
  const finished = index >= practiceSet.questions.length
  const isMultiple = question?.answerMode === "multiple_choice"
  const correctIds = useMemo(() => new Set(result?.correctOptionIds ?? []), [result])

  const choose = (optionId: string) => {
    if (result) return
    setSelected((current) =>
      isMultiple
        ? current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId]
        : [optionId]
    )
  }

  const check = async () => {
    if (!question || selected.length === 0) return
    try {
      const res = await submit.mutateAsync({
        sectionId: practiceSet.sectionId,
        questionId: question.questionId,
        selectedOptionIds: selected,
      })
      setResult(res.value)
      setLastTopic(res.value.topic)
      if (res.value.isCorrect) setCorrectCount((count) => count + 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not check your answer")
    }
  }

  const next = () => {
    setIndex((i) => i + 1)
    setSelected([])
    setResult(null)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Practice: {practiceSet.title}</DialogTitle>
          <DialogDescription>
            {finished
              ? "Practice complete"
              : `Question ${index + 1} of ${practiceSet.questions.length}`}
          </DialogDescription>
        </DialogHeader>

        {finished ? (
          <div className="space-y-4 py-2 text-center">
            <p className="text-4xl font-black text-slate-950">
              {correctCount}/{practiceSet.questions.length}
            </p>
            {lastTopic?.masteryPercent != null && (
              <p className="text-sm text-slate-600">
                Your mastery of {practiceSet.title} is now{" "}
                <span className="font-semibold">{Math.round(lastTopic.masteryPercent)}%</span>.
              </p>
            )}
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Done
              </Button>
              <Button variant="primary" onClick={onRestart}>
                <RotateCcw className="size-4" /> Practise again
              </Button>
            </div>
          </div>
        ) : (
          question && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                {question.isTeacherPractice ? "Practice question from your teacher. " : ""}
                {question.reason}
              </p>
              <p className="whitespace-pre-line text-base font-semibold text-slate-950">{question.prompt}</p>
              {isMultiple && <p className="text-xs text-slate-500">Select all that apply.</p>}
              <div className="space-y-2">
                {question.options.map((option) => {
                  const isSelected = selected.includes(option.id)
                  const isCorrect = correctIds.has(option.id)
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => choose(option.id)}
                      disabled={Boolean(result)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                        !result && isSelected && "border-blue-600 bg-blue-50",
                        !result && !isSelected && "border-slate-200 hover:bg-slate-50",
                        result && isCorrect && "border-emerald-500 bg-emerald-50",
                        result && !isCorrect && isSelected && "border-rose-400 bg-rose-50",
                        result && !isCorrect && !isSelected && "border-slate-200 opacity-60"
                      )}
                    >
                      <span className="flex-1">{option.text}</span>
                      {result && isCorrect && <CheckCircle2 className="size-4 text-emerald-600" />}
                      {result && !isCorrect && isSelected && <XCircle className="size-4 text-rose-500" />}
                    </button>
                  )
                })}
              </div>

              {result && (
                <div
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm",
                    result.isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                  )}
                >
                  <p className="font-semibold">{result.isCorrect ? "Correct!" : "Not quite."}</p>
                  {result.explanation && (
                    <p className="mt-1 whitespace-pre-line">{result.explanation}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2">
                {result ? (
                  <Button variant="primary" onClick={next}>
                    {index + 1 < practiceSet.questions.length ? "Next question" : "See results"}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    disabled={selected.length === 0 || submit.isPending}
                    onClick={() => void check()}
                  >
                    {submit.isPending ? "Checking…" : "Check answer"}
                  </Button>
                )}
              </div>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
