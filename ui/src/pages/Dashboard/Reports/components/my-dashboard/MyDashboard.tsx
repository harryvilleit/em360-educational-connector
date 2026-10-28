import { useMemo, useState } from "react"
import { LayoutDashboard, Plus, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { dashboardCardSurface } from "@/components/general/StatCard"
import {
  selectPinnedMetricIds,
  useReportDashboardStore,
} from "@/store/reportDashboard.store"
import { MetricTile } from "../shared/MetricTile"
import {
  DOMAIN_META,
  DOMAIN_ORDER,
  METRIC_BY_ID,
  metricsForDomain,
  sourcesFor,
  type ReportMetric,
} from "../../metrics"
import { useReportData, type ReportPeriod } from "../../useReportData"
import { DemoSourcesBanner } from "../shared/DemoSourcesBanner"

export default function MyDashboard({
  schoolId,
  period,
}: {
  schoolId: string
  period: ReportPeriod
}) {
  const [picking, setPicking] = useState(false)
  const pinnedIds = useReportDashboardStore(selectPinnedMetricIds(schoolId))
  const toggleMetric = useReportDashboardStore((s) => s.toggleMetric)
  const reset = useReportDashboardStore((s) => s.reset)

  const pinned = useMemo(
    () =>
      pinnedIds
        .map((id) => METRIC_BY_ID.get(id))
        .filter((m): m is ReportMetric => Boolean(m)),
    [pinnedIds]
  )
  const needed = useMemo(() => sourcesFor(pinned), [pinned])
  const data = useReportData(schoolId, period, needed)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          Pick the figures you care about. Your layout is saved on this device.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => reset(schoolId)}
          >
            <RotateCcw className="mr-1.5 size-4" />
            Reset
          </Button>
          <Button type="button" size="sm" onClick={() => setPicking((v) => !v)}>
            <Plus className="mr-1.5 size-4" />
            {picking ? "Done" : "Add metrics"}
          </Button>
        </div>
      </div>

      <DemoSourcesBanner data={data} />

      {picking && (
        <div className={`${dashboardCardSurface} space-y-4 p-5`}>
          {DOMAIN_ORDER.map((domain) => (
            <div key={domain}>
              <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {DOMAIN_META[domain].label}
              </p>
              <div className="flex flex-wrap gap-2">
                {metricsForDomain(domain).map((m) => {
                  const active = pinnedIds.includes(m.id)
                  return (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleMetric(schoolId, m.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {pinned.length === 0 ? (
        <EmptyState
          icon={LayoutDashboard}
          title="Your dashboard is empty"
          description="Add metrics to build a view of the numbers you track."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {pinned.map((m) => (
            <div key={m.id} className="group relative">
              <MetricTile metric={m} data={data} />
              <button
                type="button"
                aria-label={`Remove ${m.label}`}
                onClick={() => toggleMetric(schoolId, m.id)}
                className="absolute top-2 right-2 rounded-full p-1 text-gray-400 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-gray-100"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
