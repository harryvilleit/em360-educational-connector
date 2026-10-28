import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export type StatMetaType = "up" | "down" | "neutral"

export type StatColor =
  | "blue"
  | "green"
  | "emerald"
  | "red"
  | "amber"
  | "orange"
  | "indigo"
  | "purple"
  | "violet"
  | "cyan"
  | "teal"
  | "rose"
  | "gray"

export interface StatCardProps {
  label: string
  value: ReactNode
  icon?: LucideIcon
  color?: StatColor
  valueColor?: string
  meta?: string
  metaType?: StatMetaType
  onClick?: () => void
}

const metaStyles: Record<StatMetaType, string> = {
  up: "bg-green-50 text-green-700",
  down: "bg-red-50 text-red-600",
  neutral: "bg-gray-100 text-gray-500",
}

const colorStyles: Record<StatColor, { iconBg: string; iconColor: string }> = {
  blue: { iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  green: { iconBg: "bg-green-50", iconColor: "text-green-600" },
  emerald: { iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  red: { iconBg: "bg-red-50", iconColor: "text-red-600" },
  amber: { iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  orange: { iconBg: "bg-orange-50", iconColor: "text-orange-600" },
  indigo: { iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
  purple: { iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  violet: { iconBg: "bg-violet-50", iconColor: "text-violet-600" },
  cyan: { iconBg: "bg-cyan-50", iconColor: "text-cyan-600" },
  teal: { iconBg: "bg-teal-50", iconColor: "text-teal-600" },
  rose: { iconBg: "bg-rose-50", iconColor: "text-rose-600" },
  gray: { iconBg: "bg-gray-50", iconColor: "text-gray-600" },
}

/** Shared surface for dashboard stat cards and matching panel cards */
export const dashboardCardSurface =
  "rounded-2xl border border-gray-100 border-slate-200 bg-white"

/** Inner rows/items inside a dashboard card */
export const dashboardCardInner = "rounded-xl border border-slate-200 bg-white"

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "gray",
  valueColor = "text-gray-900",
  meta,
  metaType = "neutral",
  onClick,
}: StatCardProps) {
  const { iconBg, iconColor } = colorStyles[color]

  const content = (
    <>
      {Icon && (
        <div
          className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`size-5 ${iconColor}`} />
        </div>
      )}
      <p className={`text-2xl leading-tight font-bold ${valueColor}`}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      {meta && (
        <span
          className={`mt-3 inline-block w-fit rounded-full px-2 py-0.5 text-xs font-medium ${metaStyles[metaType]}`}
        >
          {metaType === "up" && "↑ "}
          {metaType === "down" && "↓ "}
          {meta}
        </span>
      )}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        className={`${dashboardCardSurface} w-full cursor-pointer p-4 text-left transition-shadow focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none`}
        onClick={onClick}
      >
        {content}
      </button>
    )
  }

  return <div className={`${dashboardCardSurface} p-4`}>{content}</div>
}

export default StatCard
