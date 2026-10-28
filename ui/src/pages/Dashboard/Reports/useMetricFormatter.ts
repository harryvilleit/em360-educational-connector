import { useReportMoney } from "./useReportMoney"
import type { MetricFormat } from "./metrics"

export function useMetricFormatter() {
  const { formatMoney } = useReportMoney()
  return (value: number, format: MetricFormat) => {
    if (format === "money") return formatMoney(value)
    if (format === "percent") return `${Math.round(value * 10) / 10}%`
    return value.toLocaleString()
  }
}
