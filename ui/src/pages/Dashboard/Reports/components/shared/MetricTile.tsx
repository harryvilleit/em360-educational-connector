import { StatCard, dashboardCardSurface } from "@/components/general/StatCard"
import { useMetricFormatter } from "../../useMetricFormatter"
import type { ReportMetric } from "../../metrics"
import type { ReportData } from "../../useReportData"
import { unavailableNote } from "../../sourceStatus"

export function MetricTile({
  metric,
  data,
}: {
  metric: ReportMetric
  data: ReportData
}) {
  const format = useMetricFormatter()
  const state = data[metric.source].state
  const value = metric.select(data)

  const change = metric.change?.select(data)
  let changeText: string | undefined
  let changeType: "up" | "down" | "neutral" = "neutral"
  if (metric.change && change != null) {
    const rounded = Math.round(change * 10) / 10
    const sign = rounded > 0 ? "+" : ""
    changeText = `${sign}${rounded}${metric.change.unit ?? ""} ${metric.change.label}`
    // Arrows only point the way the number moved, so skip them where lower is better
    if (rounded !== 0 && !metric.change.lowerIsBetter) {
      changeType = rounded > 0 ? "up" : "down"
    }
  }

  if (state === "error") {
    return (
      <div className={`${dashboardCardSurface} p-4`}>
        <p className="text-sm font-medium text-gray-500">—</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{metric.label}</p>
        <p className="mt-3 text-xs text-gray-400">
          {unavailableNote(metric.source)}
        </p>
      </div>
    )
  }

  if (value === undefined && state === "loading") {
    return (
      <div className={`${dashboardCardSurface} animate-pulse p-4`}>
        <div className="mb-3 h-10 w-10 rounded-xl bg-gray-100" />
        <div className="h-7 w-16 rounded bg-gray-100" />
        <p className="mt-1 text-xs text-muted-foreground">{metric.label}</p>
      </div>
    )
  }

  return (
    <StatCard
      label={metric.label}
      value={format(value ?? 0, metric.format)}
      icon={metric.icon}
      color="blue"
      meta={changeText}
      metaType={changeType}
    />
  )
}
