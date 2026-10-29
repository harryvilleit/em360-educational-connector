import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router"
import api from "@/api/api"
import { value } from "@/api/parentManagement.api"
import { useMemo } from "react"
import type {
  LaunchSchoolPortalCurrentClassI,
  LaunchSchoolPortalDataI,
} from "@/api/guardian.api/types"

export interface NormalizedChildTermI {
  id: string
  name: string
  isCurrent: boolean
  startDate: string
  endDate: string
  classes: LaunchSchoolPortalCurrentClassI[]
}

export interface NormalizedChildSessionI {
  id: string
  name: string
  isCurrent: boolean
  terms: NormalizedChildTermI[]
}

export function useChildSessionTree({
  schoolId,
  activeChildId,

  portal,
}: {
  schoolId: string
  activeChildId: string

  portal?: LaunchSchoolPortalDataI
}) {
  const portalChild = portal?.children.find(
    (c) => c.studentId === activeChildId
  )
  const hasPortalData = !!portalChild

  const { parentId = "" } = useParams()
  const query = useQuery({
    queryKey: ["parent-academic-context", schoolId, parentId, activeChildId],
    queryFn: () =>
      value<NormalizedChildSessionI[]>(
        api.get("/Guardian/SchoolAcademicContext", {
          params: { schoolId, guardianId: parentId, studentId: activeChildId },
        })
      ),
    enabled: !hasPortalData && !!schoolId && !!parentId && !!activeChildId,
  })
  const sessions = useMemo<NormalizedChildSessionI[]>(() => {
    if (portalChild) {
      return portalChild.sessions.map((s) => ({
        id: s.sessionId,
        name: s.sessionName,
        isCurrent: s.isCurrentSession,
        terms: s.terms.map((t) => ({
          id: t.schoolSessionTermId,
          name: t.termName,
          isCurrent: t.isCurrentTerm,
          startDate: t.startDate,
          endDate: t.endDate,
          classes: t.classes,
        })),
      }))
    }
    return query.data ?? []
  }, [portalChild, query.data])
  return {
    sessions,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
