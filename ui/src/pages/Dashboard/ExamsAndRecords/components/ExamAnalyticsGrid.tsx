import type { LucideIcon } from "lucide-react"

type ExamAnalyticsItem = {
  label: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  bg: string
  iconColor: string
  border: string
  trend: string
  trendUp: boolean
}

type ExamAnalyticsGridProps = {
  metrics: ExamAnalyticsItem[]
}

export function ExamAnalyticsGrid({ metrics }: ExamAnalyticsGridProps) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`rounded-2xl border ${metric.border} bg-white p-5`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${metric.bg}`}
              >
                <metric.icon className={`size-6 ${metric.iconColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  metric.trendUp ? "text-green-600" : "text-orange-600"
                }`}
              >
                {metric.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
