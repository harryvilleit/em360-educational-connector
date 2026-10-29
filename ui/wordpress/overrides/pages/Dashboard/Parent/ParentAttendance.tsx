import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import React, { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Percent,
  RefreshCw,
} from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { FilterSelect } from "@/components/ui/filter-select"
import { DatePicker } from "@/components/ui/date-picker"
import { EmptyState } from "@/components/ui/empty-state"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useResolvedParent } from "@/hooks/useResolvedParent"
import { useChildSessionTree } from "@/hooks/useChildSessionTree"
import { useParentPortalSelection } from "@/hooks/useParentPortalSelection"
import { useGetGuardianStudentAttendance } from "@/hooks/guardian"

import {
  formatClassOptionLabel,
  getCurrentPortalClass,
} from "@/utils/guardianAdapter"
import type { LaunchSchoolPortalDataI } from "@/api/guardian.api/types"
import { ClassSelector } from "@/pages/Dashboard/Parent/components/ClassSelector"
import { LinkedChildTab } from "@/pages/Dashboard/Parent/components/LinkedChildTab"
import { GuardianAttendanceRecordList } from "@/pages/Dashboard/Parent/components/GuardianAttendanceRecordList"

const ALL_SESSIONS = "__all_sessions__"
const ALL_TERMS = "__all_terms__"
const ALL_CLASSES = "__all_classes__"

interface ParentAttendancePageProps {
  parentIdOverride?: string
  portalOverride?: LaunchSchoolPortalDataI
}

export default function ParentAttendancePage({
  parentIdOverride,
  portalOverride,
}: ParentAttendancePageProps = {}) {
  const { parentId: routeParentId } = useParams<{
    productId: string
    parentId: string
  }>()
  const parentId = parentIdOverride ?? routeParentId
  const navigate = useNavigate()
  const schoolId = useSchoolId()
  const guardianId = parentId ?? ""

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

  const academic = useChildSessionTree({
    schoolId,
    activeChildId,

    portal: portalOverride,
  })
  const childSessions = academic.sessions
  const sessionOptions = useMemo(
    () => [
      { value: ALL_SESSIONS, label: "All Sessions" },
      ...childSessions.map((s) => ({ value: s.id, label: s.name })),
    ],
    [childSessions]
  )
  const defaultSessionId = useMemo(() => {
    const current = childSessions.find((s) => s.isCurrent)
    return current?.id ?? childSessions[0]?.id ?? ""
  }, [childSessions])
  const activeSessionId = selectedSessionId || defaultSessionId
  const isAllSessions = activeSessionId === ALL_SESSIONS
  const activeSession = childSessions.find((s) => s.id === activeSessionId)

  const termOptions = useMemo(() => {
    if (isAllSessions) return [{ value: ALL_TERMS, label: "All Terms" }]
    return [
      { value: ALL_TERMS, label: "All Terms" },
      ...(activeSession?.terms ?? []).map((t) => ({
        value: t.id,
        label: t.name,
      })),
    ]
  }, [isAllSessions, activeSession])
  const defaultTermId = useMemo(() => {
    if (isAllSessions) return ALL_TERMS
    return (
      activeSession?.terms.find((t) => t.isCurrent)?.id ??
      activeSession?.terms[0]?.id ??
      ALL_TERMS
    )
  }, [isAllSessions, activeSession])
  const activeTermId = selectedTermId || defaultTermId
  const isAllTerms = activeTermId === ALL_TERMS

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
  const classOptions = useMemo(() => {
    if (currentSessionClasses.length === 0) return []
    if (currentSessionClasses.length === 1) {
      return currentSessionClasses.map((c) => ({
        value: c.enrollmentId,
        label: `${formatClassOptionLabel(c.className, c.armName)}${c.isCurrent ? " (Current)" : ""}`,
      }))
    }
    return [
      { value: ALL_CLASSES, label: "All Classes" },
      ...currentSessionClasses.map((c) => ({
        value: c.enrollmentId,
        label: `${formatClassOptionLabel(c.className, c.armName)}${c.isCurrent ? " (Current)" : ""}`,
      })),
    ]
  }, [isCurrentSessionActive, currentSessionClasses])
  const activeClassEnrollmentId =
    selectedClass?.enrollmentId &&
    classOptions.some((o) => o.value === selectedClass.enrollmentId)
      ? selectedClass.enrollmentId
      : activePortalChild
        ? (getCurrentPortalClass(activePortalChild)?.enrollmentId ?? "")
        : ""
  const selectedClassObj = currentSessionClasses.find(
    (c) => c.enrollmentId === activeClassEnrollmentId
  )

  const handleSelectClass = (enrollmentId: string) => {
    if (enrollmentId === ALL_CLASSES) {
      selectClass(null)
      return
    }
    const cls = currentSessionClasses.find(
      (c) => c.enrollmentId === enrollmentId
    )
    selectClass(cls ?? null)
  }

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const dateRangeInvalid = !!startDate && !!endDate && startDate > endDate

  const {
    attendance,
    isLoading: attendanceLoading,
    isError: attendanceError,
    error: attendanceErrorObj,
    refetch: refetchAttendance,
  } = useGetGuardianStudentAttendance({
    studentId: activeChildId,
    schoolId,
    schoolClassId: selectedClassObj?.schoolClassId,
    schoolSessionId: isAllSessions ? undefined : activeSessionId || undefined,
    schoolSessionTermId: isAllTerms ? undefined : activeTermId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  })

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
  if(!parent.children.length || !childSessions.length) return <div><PageHeader title="Attendance Records" onBack={parentIdOverride?undefined:()=>navigate(-1)}/><p className="mt-6 rounded-xl border bg-white p-8 text-sm text-slate-500">{!parent.children.length ? "No children are linked to this parent. Open the parent profile to link a child." : "No academic enrollments are available for this child yet."}</p></div>


  const records = attendance?.records ?? []

  return (
    <div>
      <PageHeader
        title="Attendance"
        description={
          <>
            {parent.firstName} {parent.lastName}
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

      {/* Session + term + class + date range filters */}
      <div className="mb-2 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Session</p>
          <FilterSelect
            value={activeSessionId}
            onChange={selectSession}
            options={sessionOptions}
            placeholder="Select session"
            triggerClassName="h-9 w-40"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Term</p>
          <FilterSelect
            value={activeTermId}
            onChange={selectTerm}
            options={termOptions}
            placeholder="Select term"
            triggerClassName="h-9 w-36"
            disabled={isAllSessions}
          />
        </div>
        {classOptions.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Class</p>
            <ClassSelector
              options={classOptions}
              value={activeClassEnrollmentId}
              onChange={handleSelectClass}
            />
          </div>
        )}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Start date</p>
          <DatePicker
            value={startDate}
            onChange={setStartDate}
            placeholder="Start date"
            className="h-9 w-36 text-xs"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">End date</p>
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            placeholder="End date"
            className="h-9 w-36 text-xs"
          />
        </div>
      </div>
      <div className="mb-5">
        {dateRangeInvalid && (
          <p className="text-xs text-red-500">
            Start date must be before end date.
          </p>
        )}
      </div>

      {attendanceError ? (
        <EmptyState
          icon={CalendarCheck2}
          title="Couldn't load attendance"
          description={
            attendanceErrorObj?.message ||
            "Something went wrong loading attendance records."
          }
          action={{
            label: "Retry",
            onClick: () => refetchAttendance(),
            icon: RefreshCw,
          }}
        />
      ) : attendanceLoading ? (
        <div className="flex items-center justify-center py-24 text-sm text-gray-400 dark:text-gray-500">
          Loading attendance...
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <SummaryCard
              label="Total Days"
              value={attendance?.totalDaysMarked ?? 0}
              icon={CalendarCheck2}
              color="gray"
            />
            <SummaryCard
              label="Present"
              value={attendance?.presentDays ?? 0}
              icon={CheckCircle2}
              color="green"
            />
            <SummaryCard
              label="Absent"
              value={attendance?.absentDays ?? 0}
              icon={XCircle}
              color="red"
            />
            <SummaryCard
              label="Late"
              value={attendance?.lateDays ?? 0}
              icon={Clock}
              color="amber"
            />
            <SummaryCard
              label="Excused"
              value={attendance?.excusedDays ?? 0}
              icon={AlertCircle}
              color="blue"
            />
            <SummaryCard
              label="Attendance"
              value={`${Math.round((attendance?.attendancePercentage ?? 0) * 10) / 10}%`}
              icon={Percent}
              color="indigo"
            />
          </div>

          {/* Attendance history */}
          <GuardianAttendanceRecordList records={records} />
        </>
      )}
    </div>
  )
}

// ─── Summary card ───────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: React.ReactNode
  icon: React.ElementType
  color: "gray" | "green" | "blue" | "red" | "amber" | "indigo"
}) {
  const iconStyles = {
    gray: "bg-gray-50 text-gray-500",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
  }
  const numStyles = {
    gray: "text-gray-900 dark:text-gray-100",
    green: "text-green-700",
    blue: "text-blue-700",
    red: "text-red-700",
    amber: "text-amber-700",
    indigo: "text-indigo-700",
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/3">
      <div className={`mb-2 inline-flex rounded-lg p-2 ${iconStyles[color]}`}>
        <Icon size={15} />
      </div>
      <p className={`text-2xl font-bold ${numStyles[color]}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  )
}
