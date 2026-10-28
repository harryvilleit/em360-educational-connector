import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function SectionCard({
  title,
  description,
  icon: Icon,
  iconBg = "bg-blue-50",
  iconColor = "text-blue-600",
  action,
  children,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  iconBg?: string
  iconColor?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2">
          {Icon && (
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                iconBg
              )}
            >
              <Icon className={cn("size-4", iconColor)} />
            </div>
          )}
          <div>
            <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
            {description && (
              <p className="mt-0.5 text-xs text-gray-500">{description}</p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}
