import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { useCallback, useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import { PageHeader } from "@/components/general/PageHeader"
import { FilterSelect } from "@/components/ui/filter-select"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useResolvedParent } from "@/hooks/useResolvedParent"
import { useChildSessionTree } from "@/hooks/useChildSessionTree"
import { useParentPortalSelection } from "@/hooks/useParentPortalSelection"

import { TimetableViewer } from "@/pages/Dashboard/Timetable/components/TimetableViewer"
import {
  formatClassOptionLabel,
  getCurrentPortalClass,
  mapLaunchPortalSessionsToSchoolSessions,
} from "@/utils/guardianAdapter"
import type { LaunchSchoolPortalDataI } from "@/api/guardian.api/types"
import { ClassSelector } from "@/pages/Dashboard/Parent/components/ClassSelector"
import { LinkedChildTab } from "@/pages/Dashboard/Parent/components/LinkedChildTab"

interface ParentTimetablePageProps {
  parentIdOverride?: string
  portalOverride?: LaunchSchoolPortalDataI
}

export default function ParentTimetablePage({
  parentIdOverride,
  portalOverride,
}: ParentTimetablePageProps = {}) {
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
    selectedClass,
    selectChild,
    selectSession,
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
    () => childSessions.map((s) => ({ value: s.id, label: s.name })),
    [childSessions]
  )
  const defaultSessionId = useMemo(() => {
    const current = childSessions.find((s) => s.isCurrent)
    return current?.id ?? childSessions[0]?.id ?? ""
  }, [childSessions])
  const activeSessionId = selectedSessionId || defaultSessionId
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

  const handleSelectClass = useCallback(
    (enrollmentId: string) => {
      const cls = currentSessionClasses.find(
        (c) => c.enrollmentId === enrollmentId
      )
      selectClass(cls ?? null)
    },
    [currentSessionClasses, selectClass]
  )

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
      <div className="p-6 text-center text-sm text-gray-400">
        Loading parent...
      </div>
    )
  }

  if (!parent) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        Parent not found.
      </div>
    )
  }
  if(!parent.children.length || !childSessions.length) return <div><PageHeader title="Timetable" onBack={parentIdOverride?undefined:()=>navigate(-1)}/><p className="mt-6 rounded-xl border bg-white p-8 text-sm text-slate-500">{!parent.children.length ? "No children are linked to this parent. Open the parent profile to link a child." : "No academic enrollments are available for this child yet."}</p></div>


  const activeChild = parent.children.find((c) => c.id === activeChildId)
  // Falls back to the single class name for historical sessions/mock guardians
  const childClass = activeClassObj
    ? formatClassOptionLabel(activeClassObj.className, activeClassObj.armName)
    : (activeChild?.class ?? "")

  const sessionsOverride = activePortalChild
    ? mapLaunchPortalSessionsToSchoolSessions(activePortalChild.sessions)
    : undefined
  const periodTypesOverride = portalOverride?.timetablePeriodTypes

  return (
    <div>
      <PageHeader
        title="Timetable & Calendar"
        description={`${parent.firstName} ${parent.lastName}${activeChild ? ` — ${activeChild.name} (${childClass})` : ""}`}
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

      {/* Session + class selectors */}
      {(sessionOptions.length > 1 || classOptions.length > 0) && (
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
          <ClassSelector
            options={classOptions}
            value={activeClassEnrollmentId}
            onChange={handleSelectClass}
          />
        </div>
      )}

      <TimetableViewer
        studentClass={childClass}
        classIdOverride={activeClassObj?.schoolClassId || undefined}
        sessionIdOverride={activeSessionId || undefined}
        sessionsOverride={sessionsOverride}
        periodTypesOverride={periodTypesOverride}
      />
    </div>
  )
}
