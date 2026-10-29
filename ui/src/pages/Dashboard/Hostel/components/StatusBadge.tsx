import { cn } from "@/lib/utils"

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "purple"

const variantClasses: Record<Variant, string> = {
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-orange-100 text-orange-700 border-orange-200",
  danger: "bg-red-100 text-red-700 border-red-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
  neutral: "bg-gray-100 text-gray-600 border-gray-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
}

type Props = {
  variant?: Variant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

export function StatusBadge({
  variant = "neutral",
  children,
  className,
  dot = false,
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-green-500": variant === "success",
            "bg-orange-500": variant === "warning",
            "bg-red-500": variant === "danger",
            "bg-blue-500": variant === "info",
            "bg-gray-400": variant === "neutral",
            "bg-purple-500": variant === "purple",
          })}
        />
      )}
      {children}
    </span>
  )
}

export function occupancyVariant(
  availableSpots: number,
  capacity: number
): Variant {
  if (availableSpots === 0) return "danger"
  const pct = ((capacity - availableSpots) / capacity) * 100
  if (pct >= 80) return "warning"
  return "success"
}
