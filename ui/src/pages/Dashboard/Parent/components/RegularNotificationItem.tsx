import { memo } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { regularTypeStyle, type ListItem } from "./notificationHelpers"
import { fmtDate } from "@/utils"

export const RegularNotificationItem = memo(function RegularNotificationItem({
  item,
  isExpanded,
  onToggle,
}: {
  item: Extract<ListItem, { kind: "regular" }>
  isExpanded: boolean
  onToggle: (id: string) => void
}) {
  const { icon: Icon, iconBg, badge, badgeColor } = regularTypeStyle(item.type)

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white dark:bg-white/3 ${
        !item.read
          ? "border-blue-200 dark:border-blue-500/30"
          : "border-gray-200 dark:border-white/10"
      }`}
    >
      <button
        onClick={() => onToggle(item.id)}
        className="flex w-full items-start gap-3.5 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/2"
      >
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {!item.read && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
            )}
            <p className={`truncate text-sm ${!item.read ? "font-semibold text-gray-900 dark:text-gray-100" : "font-medium text-gray-700 dark:text-gray-300"}`}>
              {item.title}
            </p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeColor}`}>
              {badge}
            </span>
            {item.priority === "high" && (
              <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                Important
              </span>
            )}
          </div>
          {item.type === "fee_reminder" && item.metadata?.amount && (
            <div className="mt-1 flex items-center gap-3">
              <span className="text-sm font-bold text-red-600 dark:text-red-400">{item.metadata.amount}</span>
              {item.metadata.dueDate && <span className="text-xs text-gray-500 dark:text-gray-400">Due: {item.metadata.dueDate}</span>}
            </div>
          )}
          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span>{fmtDate(item.date)}</span>
            {item.term && <span>· {item.term}</span>}
            {item.session && <span>· {item.session}</span>}
          </div>
        </div>
        {isExpanded ? <ChevronUp size={15} className="mt-1 shrink-0 text-gray-400" /> : <ChevronDown size={15} className="mt-1 shrink-0 text-gray-400" />}
      </button>
      {isExpanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 dark:border-white/5">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{item.body}</p>
        </div>
      )}
    </div>
  )
})
