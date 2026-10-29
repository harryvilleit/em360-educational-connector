import {useSchoolCardBranding} from "@/hooks/useSchoolCardBranding"
import {toast} from "sonner"
import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import {
  FileText,
  Trophy,
  TrendingUp,
  Download,
  Calendar,
  BookOpen,
  BarChart2,
} from "lucide-react"
import { StatCard } from "@/components/general/StatCard"
import { PageHeader } from "@/components/general/PageHeader"
import { FilterSelect } from "@/components/ui/filter-select"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useResolvedParent } from "@/hooks/useResolvedParent"
import { useGetGuardianStudentResult } from "@/hooks/guardian"
import { useChildSessionTree } from "@/hooks/useChildSessionTree"
import { useParentPortalSelection } from "@/hooks/useParentPortalSelection"

import {
  formatClassOptionLabel,
  getCurrentPortalClass,
} from "@/utils/guardianAdapter"
import { gradeColor, ordinal, scoreDelta } from "@/utils/resultFormatting"
import { ScoreBar } from "@/components/general/ScoreBar"
import type { LaunchSchoolPortalDataI } from "@/api/guardian.api/types"
import { ClassSelector } from "@/pages/Dashboard/Parent/components/ClassSelector"
import { downloadResult } from "@/pages/Dashboard/Parent/components/downloadResult"
import ReportCardButton from "@/components/report-card/ReportCardButton"
import { reportCardFromGuardianResult } from "@/components/report-card/adapters"
import { LinkedChildTab } from "@/pages/Dashboard/Parent/components/LinkedChildTab"
import { PerformanceAnalytics } from "@/pages/Dashboard/Parent/components/PerformanceAnalytics"

interface ParentResultsPageProps {
  parentIdOverride?: string
  portalOverride?: LaunchSchoolPortalDataI
}

export default function ParentResultsPage({
  parentIdOverride,
  portalOverride,
}: ParentResultsPageProps = {}) {
  const { parentId: routeParentId } = useParams<{
    productId: string
    parentId: string
  }>()
  const parentId = parentIdOverride ?? routeParentId
  const navigate = useNavigate()
  const schoolId = useSchoolId()
  const guardianId = parentId ?? ""
  const schoolBrand=useSchoolCardBranding(schoolId)

  const {
    parent,
    isLoading,
    isError: parentError,
    error: parentErrorObj,
    refetch: refetchParent,
  } = useResolvedParent(parentId, portalOverride)
  const {
    selectedChildId,
    selectedSessionId,
    selectedTermId,
    selectedClass,
    selectChild,
    selectSession,
    selectTerm,
    selectClass,
  } = useParentPortalSelection(guardianId)

  const activeChildId = selectedChildId || parent?.children[0]?.id || ""
  const activeChild = parent?.children.find((c) => c.id === activeChildId)

  const academic = useChildSessionTree({
    schoolId,
    activeChildId,

    portal: portalOverride,
  })
  const childSessions = academic.sessions
  const sessionOptions = useMemo(
    () => childSessions.map((s) => ({ value: s.id, label: s.name })),
    [childSessions]
  )
  const defaultSessionId = useMemo(() => {
    const current = childSessions.find((s) => s.isCurrent)
    return current?.id ?? childSessions[0]?.id ?? ""
  }, [childSessions])
  const activeSessionId = selectedSessionId || defaultSessionId
  const activeSession = childSessions.find((s) => s.id === activeSessionId)

  const termOptions = useMemo(
    () =>
      (activeSession?.terms ?? []).map((t) => ({ value: t.id, label: t.name })),
    [activeSession]
  )
  const defaultTermId = useMemo(
    () =>
      activeSession?.terms.find((t) => t.isCurrent)?.id ??
      activeSession?.terms[0]?.id ??
      "",
    [activeSession]
  )
  const activeTermId = selectedTermId || defaultTermId

  // Class options only apply to the active session
  const isCurrentSessionActive =
    childSessions.find((s) => s.isCurrent)?.id === activeSessionId
  const activePortalChild = portalOverride?.children.find(
    (c) => c.studentId === activeChildId
  )
  const currentSessionClasses = useMemo(
    () =>
      Array.from(
        new Map(
          (activePortalChild && isCurrentSessionActive
            ? activePortalChild.currentSessionClasses
            : (childSessions
                .find((s) => s.id === activeSessionId)
                ?.terms.flatMap((t) => t.classes) ?? [])
          ).map((c) => [c.enrollmentId, c])
        ).values()
      ),
    [activePortalChild, childSessions, activeSessionId, isCurrentSessionActive]
  )
  const classOptions = useMemo(
    () =>
      currentSessionClasses.map((c) => ({
        value: c.enrollmentId,
        label: `${formatClassOptionLabel(c.className, c.armName)}${c.isCurrent ? " (Current)" : ""}`,
      })),
    [isCurrentSessionActive, currentSessionClasses]
  )
  const activeClassEnrollmentId =
    selectedClass?.enrollmentId &&
    classOptions.some((o) => o.value === selectedClass.enrollmentId)
      ? selectedClass.enrollmentId
      : activePortalChild
        ? (getCurrentPortalClass(activePortalChild)?.enrollmentId ?? "")
        : (currentSessionClasses[0]?.enrollmentId ?? "")
  const activeClassObj = currentSessionClasses.find(
    (c) => c.enrollmentId === activeClassEnrollmentId
  )

  const handleSelectClass = (enrollmentId: string) => {
    const cls = currentSessionClasses.find(
      (c) => c.enrollmentId === enrollmentId
    )
    selectClass(cls ?? null)
  }

  const {
    result: realResult,
    isLoading: realResultLoading,
    isError: realResultError,
    error: realResultErrorObj,
  } = useGetGuardianStudentResult({
    guardianId: guardianId,
    schoolId,
    studentId: activeChildId,
    schoolSessionId: activeSessionId,
    schoolSessionTermId: activeTermId || undefined,
    schoolClassId: activeClassObj?.schoolClassId,
  })

  const result = realResult
  const resultLoading = realResultLoading
  const resultError = realResultError
  const resultErrorMessage = realResultErrorObj?.message

  if (parentError || academic.isError)
    return (
      <QueryErrorPanel
        title="Unable to load parent records"
        message={
          (parentErrorObj ?? academic.error)?.message ?? "Please try again."
        }
        onRetry={() => {
          refetchParent()
          void academic.refetch()
        }}
      />
    )
  if (isLoading || academic.isLoading) {
    return (
      <div className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">
        Loading parent...
      </div>
    )
  }

  if (!parent) {
    return (
      <div className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">
        Parent not found.
      </div>
    )
  }
  if(!parent.children.length || !childSessions.length) return <div><PageHeader title="Result Records" onBack={parentIdOverride?undefined:()=>navigate(-1)}/><p className="mt-6 rounded-xl border bg-white p-8 text-sm text-slate-500">{!parent.children.length ? "No children are linked to this parent. Open the parent profile to link a child." : "No academic enrollments are available for this child yet."}</p></div>


  return (
    <div>
      <PageHeader
        title="Result Records"
        description={
          <>
            {parent.firstName} {parent.lastName} &mdash;{" "}
            {parent.children.length === 1
              ? parent.children[0].name
              : `${parent.children.length} children`}
          </>
        }
        onBack={parentIdOverride ? undefined : () => navigate(-1)}
        className="mb-7"
      />

      {/* Child tabs */}
      {parent.children.length > 1 && (
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {parent.children.map((child) => (
            <LinkedChildTab
              key={child.id}
              child={child}
              active={child.id === activeChildId}
              onClick={selectChild}
            />
          ))}
        </div>
      )}

      {/* Session + term + class selectors — pick which term's result to view */}
      {parent.children.length > 0 &&
        (sessionOptions.length > 1 ||
          termOptions.length > 1 ||
          classOptions.length > 0) && (
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
            <ClassSelector
              options={classOptions}
              value={activeClassEnrollmentId}
              onChange={handleSelectClass}
            />
          </div>
        )}

      {resultLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20 dark:border-white/10 dark:bg-white/3">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Loading results...
          </p>
        </div>
      ) : activeChild && result ? (
        <>
          {/* Summary cards */}
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

          {/* ── Performance Analytics ──────────────────────────────────────── */}
          <PerformanceAnalytics result={result} />

          {/* ── Subject Results table ─────────────────────────────────────── */}
          <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3">
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-5 py-4 dark:border-white/5">
              <FileText size={15} className="text-gray-400" />
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Subject Results
              </h2>
              <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-white/10 dark:text-gray-400">
                {result.subjectResults.length} subjects
              </span>
              <div className="ml-auto flex items-center gap-2">
                <ReportCardButton
                  result={reportCardFromGuardianResult(result)}
                />
                <button
                  disabled={!schoolBrand.branding||schoolBrand.isLoading}
                  onClick={()=>void downloadResult(result,schoolBrand.branding!.schoolName).catch(()=>toast.error("Unable to download results. Please try again."))}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <Download size={12} />
                  Download PDF
                </button>
              </div>
            </div>

            <div className="hidden grid-cols-[1fr_80px_60px_100px_120px] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-2.5 sm:grid dark:border-white/5 dark:bg-white/2">
              {["Subject", "Score", "Grade", "Performance", "Remark"].map(
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
              {result.subjectResults.map((s) => (
                <div
                  key={s.subjectName}
                  className="grid grid-cols-1 gap-1 px-5 py-3.5 sm:grid-cols-[1fr_80px_60px_100px_120px] sm:items-center sm:gap-4"
                >
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {s.subjectName}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {s.score}
                    <span className="text-xs text-gray-400">/{s.maxScore}</span>
                  </p>
                  <span
                    className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-semibold ${gradeColor(s.grade)}`}
                  >
                    {s.grade}
                  </span>
                  <ScoreBar score={s.score} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {s.remark}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3 dark:border-white/5 dark:bg-white/2">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <TrendingUp size={13} />
                Class position:
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {result.summary.position}
                  {ordinal(result.summary.position)} of{" "}
                  {result.summary.totalStudentsInClass}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Trophy size={13} />
                Overall average:
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {result.summary.averageScore}%
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText
            size={36}
            className="mb-3 text-gray-300 dark:text-gray-600"
          />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {resultError
              ? resultErrorMessage || "Couldn't load results"
              : `No result found for ${activeChild?.name ?? "this child"}`}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {resultError
              ? "Try a different session or term."
              : "Results will appear here once they are published"}
          </p>
        </div>
      )}
    </div>
  )
}
