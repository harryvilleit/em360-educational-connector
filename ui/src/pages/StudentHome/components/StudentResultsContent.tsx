import { useMemo } from "react"
import {
  FileText,
  Trophy,
  TrendingUp,
  BarChart2,
  Calendar,
  BookOpen,
} from "lucide-react"
import { StatCard } from "@/components/general/StatCard"
import { PageHeader } from "@/components/general/PageHeader"
import { ScoreBar } from "@/components/general/ScoreBar"
import { FilterSelect } from "@/components/ui/filter-select"
import { useGetStudentPortalResults } from "@/hooks/studentPortal"
import { gradeColor, ordinal, scoreDelta } from "@/utils/resultFormatting"
import type {
  StudentPortalLaunchSessionI,
  StudentPortalLaunchTermI,
} from "@/api/studentPortal.api/types"

export function StudentResultsContent({
  schoolId,
  studentId,
  isLinked,
  studentName,
  studentClass,
  currentClassName,
  sessions,
  selectedSession,
  selectedTerm,
  selectSession,
  selectTerm,
  isSessionsLoading,
  onBack,
}: {
  schoolId: string
  studentId: string
  isLinked: boolean
  studentName: string
  studentClass: string
  currentClassName?: string | null
  sessions: StudentPortalLaunchSessionI[]
  selectedSession: StudentPortalLaunchSessionI | undefined
  selectedTerm: StudentPortalLaunchTermI | undefined
  selectSession: (id: string) => void
  selectTerm: (id: string) => void
  isSessionsLoading: boolean
  onBack: () => void
}) {
  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: s.sessionId, label: s.sessionName })),
    [sessions]
  )
  const activeSessionId = selectedSession?.sessionId ?? ""

  const termOptions = useMemo(
    () =>
      (selectedSession?.terms ?? []).map((t) => ({
        value: t.schoolSessionTermId,
        label: t.termName,
      })),
    [selectedSession]
  )
  const activeTermId = selectedTerm?.schoolSessionTermId ?? ""

  const {
    result: realResult,
    isLoading: realResultLoading,
    isError: realResultError,
    error: realResultErrorObj,
  } = useGetStudentPortalResults({
    studentId: isLinked ? studentId : "",
    schoolId,
    schoolSessionId: isLinked ? activeSessionId || undefined : undefined,
    schoolSessionTermId: isLinked ? activeTermId || undefined : undefined,
  })

  const result = isLinked ? realResult : undefined
  const resultLoading = isLinked
    ? isSessionsLoading || realResultLoading
    : false
  const resultError = isLinked ? realResultError : false
  const resultErrorMessage = isLinked ? realResultErrorObj?.message : undefined

  return (
    <div>
      <PageHeader
        title="Result Records"
        description={`${studentName} — ${currentClassName || studentClass || "No Class Assigned"}`}
        onBack={onBack}
        className="mb-7"
      />

      {(sessionOptions.length > 1 || termOptions.length > 1) && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {sessionOptions.length > 1 && (
            <FilterSelect
              value={activeSessionId}
              onChange={selectSession}
              options={sessionOptions}
              placeholder="Select session"
              triggerClassName="h-9 w-40"
            />
          )}
          {termOptions.length > 1 && (
            <FilterSelect
              value={activeTermId}
              onChange={selectTerm}
              options={termOptions}
              placeholder="Select term"
              triggerClassName="h-9 w-36"
            />
          )}
        </div>
      )}

      {resultLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
          <p className="text-sm text-gray-400">Loading results...</p>
        </div>
      ) : result ? (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Term"
              value={result.student.termName}
              icon={Calendar}
              color="gray"
              meta={result.student.sessionName}
            />
            <StatCard
              label="Class"
              value={result.student.className}
              icon={BookOpen}
              color="blue"
            />
            <StatCard
              label="Average Score"
              value={`${result.summary.averageScore}%`}
              icon={BarChart2}
              color="blue"
              valueColor="text-blue-600"
              {...scoreDelta(result.summary.averageScoreChange)}
            />
            <StatCard
              label="Position"
              value={`${result.summary.position}${ordinal(result.summary.position)}`}
              icon={Trophy}
              color="amber"
              {...(result.summary.positionChange !== 0
                ? scoreDelta(result.summary.positionChange)
                : {
                    meta: `out of ${result.summary.totalStudentsInClass} students`,
                  })}
            />
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
              <FileText size={15} className="text-gray-400" />
              <h2 className="text-sm font-medium text-gray-900">
                Subject Results
              </h2>
              <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {result.subjectResults.length} subjects
              </span>
            </div>

            <div className="hidden grid-cols-[1fr_80px_60px_100px_120px] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-2.5 sm:grid">
              {["Subject", "Score", "Grade", "Performance", "Remark"].map(
                (h) => (
                  <p key={h} className="text-xs font-medium text-gray-500">
                    {h}
                  </p>
                )
              )}
            </div>

            <div className="divide-y divide-gray-100">
              {result.subjectResults.map((s) => (
                <div
                  key={s.subjectName}
                  className="grid grid-cols-1 gap-1 px-5 py-3.5 sm:grid-cols-[1fr_80px_60px_100px_120px] sm:items-center sm:gap-4"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {s.subjectName}
                  </p>
                  <p className="text-sm text-gray-700">
                    {s.score}
                    <span className="text-xs text-gray-400">/{s.maxScore}</span>
                  </p>
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-semibold ${gradeColor(s.grade)}`}
                  >
                    {s.grade}
                  </span>
                  <ScoreBar score={s.score} />
                  <span className="text-xs text-gray-500">{s.remark}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <TrendingUp size={13} />
                Class position:
                <span className="font-medium text-gray-700">
                  {result.summary.position}
                  {ordinal(result.summary.position)} of{" "}
                  {result.summary.totalStudentsInClass}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Trophy size={13} />
                Overall average:
                <span className="font-medium text-gray-700">
                  {result.summary.averageScore}%
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText size={36} className="mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            {resultError
              ? resultErrorMessage || "Couldn't load results"
              : "No result found"}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {resultError
              ? "Try a different session or term."
              : "Results will appear here once they are published"}
          </p>
        </div>
      )}
    </div>
  )
}
