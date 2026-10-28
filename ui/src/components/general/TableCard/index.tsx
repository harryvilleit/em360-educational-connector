import type { ReactNode } from "react"

// Card with a title block on the left, controls (search, filters) on the right,
// and a flush table below. Pass <DataTable wrapperClassName="" /> as the child.
export function TableCard({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="flex flex-col justify-between gap-3 p-6 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
      {children}
    </div>
  )
}
