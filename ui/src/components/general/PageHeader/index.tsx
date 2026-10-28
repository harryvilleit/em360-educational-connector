import type { ReactNode } from "react"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PageHeaderStat {
  label: string
  value: ReactNode
}

export interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  onBack?: () => void
  backLabel?: string
  actions?: ReactNode
  actionsPlacement?: "end" | "below"
  className?: string
  icon?: ReactNode
  iconBg?: string
  badge?: ReactNode
  badgeColor?: string
  stats?: PageHeaderStat[]
}

export function PageHeader({
  title,
  description,
  onBack,
  backLabel = "Back",
  actions,
  actionsPlacement = "end",
  className,
  icon,
  iconBg = "bg-blue-50",
  badge,
  badgeColor = "bg-gray-100 text-gray-700",
  stats,
}: PageHeaderProps) {
  const titleBlock = (
    <div className="min-w-0 flex-1">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="size-4" />
          {backLabel}
        </button>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {badge && (
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", badgeColor)}>
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
      )}
      {actions && actionsPlacement === "below" && (
        <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  )

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "flex flex-col gap-4",
          actionsPlacement === "end" && "sm:flex-row sm:items-start sm:justify-between"
        )}
      >
        <div className="flex items-start gap-3">
          {icon && (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                iconBg
              )}
            >
              {icon}
            </div>
          )}
          {titleBlock}
        </div>

        {actions && actionsPlacement === "end" && (
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {actions}
          </div>
        )}
      </div>

      {stats && stats.length > 0 && (
        <div className="flex flex-wrap gap-6 rounded-xl border border-gray-100 bg-gray-50 px-5 py-3">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PageHeader
