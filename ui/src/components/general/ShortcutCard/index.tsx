import type { ReactNode } from "react"
import { ChevronRight } from "lucide-react"

export function ShortcutCard({
  onClick,
  iconBg,
  icon,
  borderColor,
  title,
  badge,
  badgeColor,
  description,
}: {
  onClick: () => void
  iconBg: string
  icon: ReactNode
  borderColor: string
  title: string
  badge?: string
  badgeColor?: string
  description: string
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-4 rounded-2xl border bg-white p-5 text-left transition-all  ${borderColor}`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900">{title}</p>
          {badge && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1" />
    </button>
  )
}
