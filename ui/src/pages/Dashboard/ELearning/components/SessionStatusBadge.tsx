import { cn } from "@/lib/utils"
import type { ClassSessionStatus } from "@/types/elearning"

const config: Record<
  ClassSessionStatus,
  { label: string; className: string }
> = {
  live: {
    label: "Live Now",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ended: {
    label: "Ended",
    className: "bg-gray-50 text-gray-600 border-gray-200",
  },
}

export default function SessionStatusBadge({
  status,
  pulse,
}: {
  status: ClassSessionStatus
  pulse?: boolean
}) {
  const { label, className } = config[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        className
      )}
    >
      {pulse && status === "live" && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
      )}
      {label}
    </span>
  )
}
