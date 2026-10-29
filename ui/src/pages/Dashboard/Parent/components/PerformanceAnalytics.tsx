import { memo } from "react"
import { AlertCircle, BarChart2, Minus, Star, TrendingDown, TrendingUp } from "lucide-react"
import type {
  GuardianStudentResultAnalyticsSubjectI,
  GuardianStudentResultI,
  GuardianStudentResultTermComparisonI,
} from "@/api/guardian.api/types"

export function PerformanceAnalytics({ result }: { result: GuardianStudentResultI }) {
  const previousTermName =
    result.termComparison[0]?.previousTermName ?? "previous term"

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
        <div className="flex items-center gap-2">
          <BarChart2 size={15} className="text-gray-400" />
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Performance Analytics
          </h2>
        </div>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 dark:bg-white/10 dark:text-gray-400">
          {result.student.termName} vs {previousTermName}
        </span>
      </div>

      {/* Strongest / Weakest split */}
      <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-white/5">
        {/* Strongest */}
        <div className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Star size={13} className="text-green-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
              Strongest Subjects
            </h3>
          </div>
          <div className="space-y-3">
            {result.performanceAnalytics.strongestSubjects.map((s) => (
              <AnalyticsSubjectRow key={s.subjectName} subject={s} intent="strong" />
            ))}
          </div>
        </div>

        {/* Weakest */}
        <div className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle size={13} className="text-red-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
              Needs Attention
            </h3>
          </div>
          <div className="space-y-3">
            {result.performanceAnalytics.needsAttentionSubjects.map((s) => (
              <AnalyticsSubjectRow key={s.subjectName} subject={s} intent="weak" />
            ))}
          </div>
        </div>
      </div>

      {/* Term-by-term comparison table */}
      <div className="border-t border-gray-100 dark:border-white/5">
        <div className="border-b border-gray-100 bg-gray-50 px-5 py-3 dark:border-white/5 dark:bg-white/2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Term-by-Term Comparison
          </p>
        </div>
        <div className="hidden grid-cols-[1fr_90px_90px_110px] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-2 sm:grid dark:border-white/5 dark:bg-white/2">
          {["Subject", previousTermName, result.student.termName, "Change"].map(
            (h) => (
              <p
                key={h}
                className="text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {h}
              </p>
            )
          )}
        </div>
        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {result.termComparison.map((c) => (
            <ComparisonRow key={c.subjectName} row={c} />
          ))}
        </div>
      </div>
    </div>
  )
}

const AnalyticsSubjectRow = memo(function AnalyticsSubjectRow({
  subject,
  intent,
}: {
  subject: GuardianStudentResultAnalyticsSubjectI
  intent: "strong" | "weak"
}) {
  const barBase = intent === "strong" ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
  const barFill = intent === "strong" ? "bg-green-500" : "bg-red-400"

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
          {subject.subjectName}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {subject.score}
          </span>
          <DeltaChip delta={subject.change} />
        </div>
      </div>
      <div className={`h-1.5 w-full overflow-hidden rounded-full ${barBase}`}>
        <div
          className={`h-full rounded-full ${barFill}`}
          style={{ width: `${subject.score}%` }}
        />
      </div>
    </div>
  )
})

const ComparisonRow = memo(function ComparisonRow({
  row,
}: {
  row: GuardianStudentResultTermComparisonI
}) {
  return (
    <div className="grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-[1fr_90px_90px_110px] sm:items-center sm:gap-4">
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
        {row.subjectName}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {row.previousTermScore ?? 0}
      </p>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
        {row.currentTermScore}
      </p>
      <DeltaChip delta={row.change} showLabel />
    </div>
  )
})

function DeltaChip({
  delta,
  showLabel,
}: {
  delta: number | null
  showLabel?: boolean
}) {
  if (delta === null) return <span className="text-xs text-gray-400">—</span>

  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
        <Minus size={11} />
        {showLabel && "No change"}
      </span>
    )
  }

  const positive = delta > 0
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        positive
          ? "text-green-600 dark:text-green-400"
          : "text-red-500 dark:text-red-400"
      }`}
    >
      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {positive ? "+" : ""}
      {delta}
      {showLabel && " pts"}
    </span>
  )
}
