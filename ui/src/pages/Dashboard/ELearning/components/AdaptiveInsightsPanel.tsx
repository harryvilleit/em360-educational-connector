import { useState } from "react"
import {
  AlertTriangle,
  Brain,
  Dumbbell,
  Info,
  Lightbulb,
  RefreshCw,
  Tags,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { dashboardCardSurface } from "@/components/general/StatCard"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils"
import { useAdaptiveCourseInsights } from "@/hooks/elearning/useAdaptiveLearning"
import type { AdaptiveCourseRefI, AdaptiveTopicSummaryI } from "@/api/adaptiveLearning.api"
import AdaptiveQuestionTagger from "./AdaptiveQuestionTagger"
import AdaptivePracticeBank from "./AdaptivePracticeBank"

const masteryTone = (percent?: number | null) =>
  percent == null
    ? "text-slate-400"
    : percent >= 75
      ? "text-emerald-700"
      : percent >= 50
        ? "text-amber-700"
        : "text-rose-700"

function StatTile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

function DistributionBar({ topic, total }: { topic: AdaptiveTopicSummaryI; total: number }) {
  const parts = [
    { key: "secure", count: topic.secureCount, className: "bg-emerald-500", label: "Secure" },
    { key: "developing", count: topic.developingCount, className: "bg-amber-400", label: "Developing" },
    { key: "gap", count: topic.gapCount, className: "bg-rose-500", label: "Gap" },
    {
      key: "none",
      count: topic.notEnoughEvidenceCount,
      className: "bg-slate-200",
      label: "Not enough evidence",
    },
  ]
  if (total === 0) return <div className="h-2 rounded-full bg-slate-100" />
  return (
    <div
      className="flex h-2 overflow-hidden rounded-full bg-slate-100"
      role="img"
      aria-label={parts.map((p) => `${p.label}: ${p.count}`).join(", ")}
    >
      {parts
        .filter((p) => p.count > 0)
        .map((p) => (
          <div
            key={p.key}
            className={p.className}
            style={{ width: `${(p.count / total) * 100}%` }}
            title={`${p.label}: ${p.count}`}
          />
        ))}
    </div>
  )
}

export default function AdaptiveInsightsPanel({
  courseRef,
  readOnly = false,
}: {
  courseRef?: AdaptiveCourseRefI
  readOnly?: boolean
}) {
  const { insights, isLoading, isError, error, refetch, isFetching } =
    useAdaptiveCourseInsights(courseRef)
  const [taggerOpen, setTaggerOpen] = useState(false)
  const [bankOpen, setBankOpen] = useState(false)

  if (!courseRef) {
    return (
      <div className={`${dashboardCardSurface} p-8 text-center text-sm text-muted-foreground`}>
        Learning insights are available for live school courses.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`${dashboardCardSurface} p-8 text-center text-sm text-muted-foreground`}>
        Analysing class answers…
      </div>
    )
  }

  if (isError || !insights) {
    return (
      <div className={`${dashboardCardSurface} p-8 text-center text-sm text-rose-600`}>
        {error instanceof Error ? error.message : "Could not load learning insights."}
      </div>
    )
  }

  const totalQuestions = insights.taggedQuestionCount + insights.untaggedQuestionCount
  const topicsWithGaps = insights.topics.filter((t) => t.gapCount > 0).length
  const hasEvidence = insights.assessmentEvidenceCount + insights.practiceResponseCount > 0

  return (
    <div className="space-y-4">
      <div className={dashboardCardSurface}>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 font-semibold">
              <Brain className="size-4 text-blue-600" /> Learning insights
            </h3>
            <p className="text-xs text-muted-foreground">
              Topic mastery from marked assessment answers and student practice. Updated{" "}
              {formatDate(insights.generatedAtUtc, "short")}.
            </p>
          </div>
          <div className="flex gap-2">
            {!readOnly && (
              <Button
                size="sm"
                variant={taggerOpen ? "secondary" : "outline"}
                className="h-8 rounded-md"
                onClick={() => setTaggerOpen((open) => !open)}
              >
                <Tags className="size-3.5" />
                {taggerOpen ? "Hide tagging" : "Tag questions"}
              </Button>
            )}
            <Button
              size="sm"
              variant={bankOpen ? "secondary" : "outline"}
              className="h-8 rounded-md"
              onClick={() => setBankOpen((open) => !open)}
            >
              <Dumbbell className="size-3.5" />
              Practice questions
              {insights.practiceBankQuestionCount > 0 && ` (${insights.practiceBankQuestionCount})`}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 rounded-md"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-4">
          <StatTile label="Students" value={insights.enrolledStudentCount} />
          <StatTile
            label="Need support"
            value={insights.studentsNeedingSupport.length}
            hint="At least one topic gap"
          />
          <StatTile label="Topics with gaps" value={`${topicsWithGaps} / ${insights.topics.length}`} />
          <StatTile
            label="Questions tagged"
            value={`${insights.taggedQuestionCount} / ${totalQuestions}`}
            hint={`${insights.practiceResponseCount} practice answers from ${insights.practicingStudentCount} students`}
          />
        </div>

        {insights.untaggedQuestionCount > 0 && (
          <div className="mx-5 mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <Lightbulb className="mt-0.5 size-4 shrink-0" />
            <div className="flex-1">
              {insights.untaggedQuestionCount} question
              {insights.untaggedQuestionCount === 1 ? " is" : "s are"} not linked to a topic yet.
              Tagged questions are what EM360 uses to find learning gaps and build practice.
            </div>
            {!readOnly && !taggerOpen && (
              <Button size="sm" variant="outline" className="h-7" onClick={() => setTaggerOpen(true)}>
                Tag now
              </Button>
            )}
          </div>
        )}
      </div>

      {taggerOpen && !readOnly && <AdaptiveQuestionTagger courseRef={courseRef} />}
      {bankOpen && <AdaptivePracticeBank courseRef={courseRef} readOnly={readOnly} />}

      <div className={dashboardCardSurface}>
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold">Topic mastery</h3>
          <p className="text-xs text-muted-foreground">
            Green secure · amber developing · red gap · grey not enough evidence yet
          </p>
        </div>
        {insights.topics.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Add curriculum sections to this course. Each section is a topic.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {insights.topics.map((topic) => (
              <li key={topic.sectionId} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                <div className="col-span-12 sm:col-span-4">
                  <p className="text-sm font-medium">{topic.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {topic.taggedQuestionCount} tagged question
                    {topic.taggedQuestionCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="col-span-8 sm:col-span-6">
                  <DistributionBar topic={topic} total={insights.enrolledStudentCount} />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {topic.gapCount > 0 && (
                      <span className="font-medium text-rose-700">{topic.gapCount} with a gap · </span>
                    )}
                    {topic.secureCount} secure · {topic.developingCount} developing
                  </p>
                </div>
                <p
                  className={cn(
                    "col-span-4 text-right text-sm font-semibold tabular-nums sm:col-span-2",
                    masteryTone(topic.averageMasteryPercent)
                  )}
                >
                  {topic.averageMasteryPercent == null ? "—" : `${topic.averageMasteryPercent}%`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={dashboardCardSurface}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <Users className="size-4" /> Students who may need support
            </h3>
            <p className="text-xs text-muted-foreground">Ordered by number of topic gaps</p>
          </div>
          {insights.studentsNeedingSupport.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              {hasEvidence
                ? "No student currently has a topic gap."
                : "Insights appear once tagged questions have been answered and marked."}
            </p>
          ) : (
            <ul className="max-h-[420px] divide-y divide-gray-100 overflow-y-auto">
              {insights.studentsNeedingSupport.map((student) => (
                <li key={student.studentId} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{student.studentName}</p>
                    <span className={cn("text-xs font-semibold", masteryTone(student.averageMasteryPercent))}>
                      {student.averageMasteryPercent == null ? "—" : `${student.averageMasteryPercent}% avg`}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {student.gapTopics.map((topic) => (
                      <span
                        key={topic.sectionId}
                        className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700"
                      >
                        {topic.title} · {topic.masteryPercent ?? "—"}%
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {student.lastPracticedAtUtc
                      ? `Last practised ${formatDate(student.lastPracticedAtUtc, "short")}`
                      : "Has not practised yet"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={dashboardCardSurface}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4 text-amber-600" /> Recurring misconceptions
            </h3>
            <p className="text-xs text-muted-foreground">
              The same wrong option chosen by a large share of the class
            </p>
          </div>
          {insights.misconceptions.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No recurring wrong answer stands out yet.
            </p>
          ) : (
            <ul className="max-h-[420px] divide-y divide-gray-100 overflow-y-auto">
              {insights.misconceptions.map((item) => (
                <li key={`${item.questionId}-${item.wrongOptionText}`} className="space-y-1.5 px-5 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {item.topicTitle}
                  </p>
                  <p className="whitespace-pre-line text-sm">{item.questionPrompt}</p>
                  <p className="text-xs">
                    <span className="font-semibold text-rose-700">
                      {item.sharePercent}% chose “{item.wrongOptionText}”
                    </span>{" "}
                    <span className="text-muted-foreground">
                      ({item.chosenCount} of {item.responseCount}) · correct: {item.correctOptionText}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="flex items-start gap-2 px-1 text-[11px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-3 shrink-0" />
        {insights.method.description} Suggestions support, not replace, teacher judgement.
      </p>
    </div>
  )
}
