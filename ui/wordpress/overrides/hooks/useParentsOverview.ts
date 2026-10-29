import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import { PARENT_SHORTCUTS } from "@/data/parentShortcut"
import { parentOverview } from "@/api/parentManagement.api"
export interface ParentStat {
  label: string
  value: number
  highlight?: boolean
}
export interface ParentGrowthPoint {
  month: string
  newParents: number
}
export interface RecentParentSummary {
  id: string
  name: string
  numberOfStudents: number
  createdAt: string
}
export function useParentsOverview() {
  const { productId = "" } = useParams(),
    schoolId = useSchoolId(),
    permissions = usePermissions()
  const query = useQuery({
    queryKey: ["parent-overview", schoolId],
    queryFn: () => parentOverview(schoolId),
    enabled: !!schoolId,
  })
  const data = query.data
  const stats: ParentStat[] = [
    { label: "Total parents", value: data?.totalParents ?? 0 },
    { label: "Linked children", value: data?.linkedChildren ?? 0 },
    { label: "Pending consent", value: data?.pendingConsent ?? 0 },
    { label: "Visit requests", value: data?.visitRequests ?? 0 },
  ]
  const shortcuts = PARENT_SHORTCUTS.filter(
    (s) =>
      permissions.canView(s.to(productId)) &&
      (s.id !== "add-parent" || permissions.canCreate(s.to(productId)))
  ).map((s) => ({ ...s, resolvedTo: s.to(productId) }))
  const recentParents: RecentParentSummary[] = (data?.recentParents ?? []).map(
    (p) => ({
      id: p.guardianId,
      name: p.fullName,
      numberOfStudents: p.childrenCount,
      createdAt: new Date(p.dateCreated).toLocaleDateString(),
    })
  )
  return {
    productId,
    stats,
    shortcuts,
    recentParents,
    growthSeries: data?.growthSeries ?? [],
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  }
}
