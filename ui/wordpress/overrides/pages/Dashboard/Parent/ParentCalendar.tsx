import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import { PageHeader } from "@/components/general/PageHeader"
import { FilterSelect } from "@/components/ui/filter-select"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useResolvedParent } from "@/hooks/useResolvedParent"
import { useChildSessionTree } from "@/hooks/useChildSessionTree"
import { useParentPortalSelection } from "@/hooks/useParentPortalSelection"

import { SchoolCalendarViewer } from "@/pages/Dashboard/Timetable/components/SchoolCalendarViewer"
import type { LaunchSchoolPortalDataI } from "@/api/guardian.api/types"
import { LinkedChildTab } from "@/pages/Dashboard/Parent/components/LinkedChildTab"
import {
  getCurrentPortalClass,
  formatClassOptionLabel,
} from "@/utils/guardianAdapter"

interface ParentCalendarPageProps {
  parentIdOverride?: string
  portalOverride?: LaunchSchoolPortalDataI
}

export default function ParentCalendarPage({
  parentIdOverride,
  portalOverride,
}: ParentCalendarPageProps = {}) {
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
  const { selectedChildId, selectedSessionId, selectChild, selectSession } =
    useParentPortalSelection(guardianId)

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
  const activeSession = childSessions.find((s) => s.id === activeSessionId)

  const dateRange = useMemo(() => {
    const terms = activeSession?.terms ?? []
    if (terms.length === 0) return { startDate: undefined, endDate: undefined }
    const starts = terms
      .map((t) => t.startDate)
      .filter(Boolean)
      .sort()
    const ends = terms
      .map((t) => t.endDate)
      .filter(Boolean)
      .sort()
    return { startDate: starts[0], endDate: ends[ends.length - 1] }
  }, [activeSession])

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
  if(!parent.children.length || !childSessions.length) return <div><PageHeader title="School Calendar" onBack={parentIdOverride?undefined:()=>navigate(-1)}/><p className="mt-6 rounded-xl border bg-white p-8 text-sm text-slate-500">{!parent.children.length ? "No children are linked to this parent. Open the parent profile to link a child." : "No academic enrollments are available for this child yet."}</p></div>


  const activeChild = parent.children.find((c) => c.id === activeChildId)
  const childClass = activeChild?.class ?? "Enrollment Pending"
  const activePortalChild = portalOverride?.children.find(
    (child) => child.studentId === activeChildId
  )
  const currentClass = activePortalChild
    ? getCurrentPortalClass(activePortalChild)
    : undefined
  const activeClassId =
    activePortalChild?.currentSchoolClassId ??
    currentClass?.schoolClassId ??
    activeSession?.terms.flatMap((t) => t.classes).find((c) => c.isCurrent)
      ?.schoolClassId ??
    activeSession?.terms[0]?.classes[0]?.schoolClassId
  const displayClass = activePortalChild
    ? formatClassOptionLabel(
        activePortalChild.currentClassName,
        activePortalChild.currentSchoolArmName ??
          activePortalChild.currentArmName ??
          null
      )
    : childClass

  return (
    <div>
      <PageHeader
        title="School Calendar"
        description={`${parent.firstName} ${parent.lastName}${activeChild ? ` — ${activeChild.name} (${displayClass})` : ""}`}
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

      {/* Session selector — School Calendar is not scoped by class or term */}
      {sessionOptions.length > 1 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <FilterSelect
            value={activeSessionId}
            onChange={selectSession}
            options={sessionOptions}
            placeholder="Select session"
            triggerClassName="h-9 w-40"
          />
        </div>
      )}

      <SchoolCalendarViewer
        studentClass={childClass}
        studentId={activeChildId || undefined}
        classId={activeClassId}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />
    </div>
  )
}
