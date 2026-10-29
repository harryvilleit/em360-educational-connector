import type { LucideIcon } from "lucide-react"
import { ShortcutCard } from "@/components/general/ShortcutCard"

type QuickActionItem = {
  title: string
  description: string
  icon: LucideIcon
  href: string
  color: string
  bgColor: string
  hoverBgColor: string
  borderColor: string
}

type QuickActionsSectionProps = {
  actions: QuickActionItem[]
  onActionClick: (href: string) => void
}

export function QuickActionsSection({
  actions,
  onActionClick,
}: QuickActionsSectionProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <ShortcutCard
            key={action.title}
            onClick={() => onActionClick(action.href)}
            iconBg={`${action.bgColor} group-hover:${action.hoverBgColor}`}
            icon={<action.icon className={`size-6 ${action.color}`} />}
            borderColor={action.borderColor}
            title={action.title}
            description={action.description}
          />
        ))}
      </div>
    </div>
  )
}
