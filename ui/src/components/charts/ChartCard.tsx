import type { ReactNode } from "react"
import { Link } from "react-router"
import { ArrowRight } from "lucide-react"

export function ChartCard({
  title,
  subtitle,
  to,
  action,
  children,
  className = "",
}: {
  title: string
  subtitle?: string
  to?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-2xl border border-gray-100 bg-white p-6 ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
        {to && (
          <Link
            to={to}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
          >
            Details
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

export function ChartEmpty({ text }: { text: string }) {
  return (
    <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}

