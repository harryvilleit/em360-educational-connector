import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { Candidate } from "@/types/student"

export function AvatarInitials({
  name,
  photo,
  size = "md",
  colorIndex = 0,
}: {
  name: string
  photo?: string
  size?: "sm" | "md" | "lg"
  colorIndex?: number
}) {
  const palettes = [
    { bg: "bg-blue-100", text: "text-blue-700" },
    { bg: "bg-emerald-100", text: "text-emerald-700" },
    { bg: "bg-amber-100", text: "text-amber-700" },
    { bg: "bg-pink-100", text: "text-pink-700" },
    { bg: "bg-violet-100", text: "text-violet-700" },
    { bg: "bg-teal-100", text: "text-teal-700" },
    { bg: "bg-orange-100", text: "text-orange-700" },
  ]
  const palette = palettes[colorIndex % palettes.length]
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  const sizes = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
  }

  return (
    <Avatar className={sizes[size]}>
      <AvatarImage src={photo || undefined} alt={name} />
      <AvatarFallback className={`font-semibold ${palette.bg} ${palette.text}`}>
        {initials || "?"}
      </AvatarFallback>
    </Avatar>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700",
    Closed: "bg-gray-100 text-gray-600",
    Draft: "bg-amber-100 text-amber-700",
    Cancelled: "bg-red-100 text-red-700",
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status === "Active" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
      )}
      {status}
    </span>
  )
}

// ── Category badge ─────────────────────────────────────────────────────────────

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
      {category}
    </span>
  )
}

// ── Vote progress bar ──────────────────────────────────────────────────────────

export function VoteBar({
  candidate,
  totalVotes,
  isLeading,
  colorIndex = 0,
}: {
  candidate: Candidate
  totalVotes: number
  isLeading: boolean
  colorIndex?: number
}) {
  const pct =
    totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0
  const barColors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-pink-500",
    "bg-violet-500",
    "bg-teal-500",
    "bg-orange-500",
  ]

  return (
    <div className="flex items-center gap-3">
      <AvatarInitials
        name={candidate.name}
        photo={candidate.profilePicture}
        size="sm"
        colorIndex={colorIndex}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="truncate text-sm font-medium text-gray-900">
            {candidate.name}
            {isLeading && totalVotes > 0 && (
              <span className="ml-1.5 text-amber-500">★</span>
            )}
          </span>
          <span className="ml-2 shrink-0 text-xs font-semibold text-gray-700">
            {candidate.votes}{" "}
            <span className="font-normal text-gray-400">({pct}%)</span>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColors[colorIndex % barColors.length]}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-gray-400">{description}</p>
        )}
      </div>
    </div>
  )
}
