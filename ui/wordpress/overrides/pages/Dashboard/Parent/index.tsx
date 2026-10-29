import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { useCallback } from "react"
import { useNavigate } from "react-router"
import { DashboardRoutes } from "@/routes"
import { useParentsOverview } from "@/hooks/useParentsOverview"
import { PageHeader } from "@/components/general/PageHeader"
import { ParentStatsStrip } from "@/pages/Dashboard/Parent/components/ParentStatStrips"
import { ParentGrowthChart } from "@/pages/Dashboard/Parent/components/ParentGrowthChart"
import { ParentShortcutCards } from "@/pages/Dashboard/Parent/components/ParentShortcutCards"
import { RecentParentsList } from "@/pages/Dashboard/Parent/components/RecentParentList"

export default function ParentsOverviewPage() {
  const navigate = useNavigate()
  const {
    productId,
    stats,
    shortcuts,
    recentParents,
    growthSeries,
    isLoading,
    isError,
    refetch,
  } = useParentsOverview()

  const handleViewAll = useCallback(
    () => navigate(DashboardRoutes.toParentList(productId)),
    [navigate, productId]
  )
  const handleSelectParent = useCallback(
    (parentId: string) =>
      navigate(DashboardRoutes.toParentProfile(productId, parentId)),
    [navigate, productId]
  )

  if (isLoading) return <p role="status">Loading parent overview…</p>
  if (isError)
    return (
      <QueryErrorPanel
        title="Unable to load parent overview"
        message="Try loading the school records again."
        onRetry={() => void refetch()}
      />
    )
  return (
    <div className="space-y-6">
      <PageHeader
        title="Parents"
        description="Manage parent accounts, profiles, and school communications."
      />

      <ParentStatsStrip stats={stats} />

      <ParentShortcutCards shortcuts={shortcuts} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ParentGrowthChart data={growthSeries} />

        <RecentParentsList
          parents={recentParents}
          onViewAll={handleViewAll}
          onSelectParent={handleSelectParent}
        />
      </div>
    </div>
  )
}
