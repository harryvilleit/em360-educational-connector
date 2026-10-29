import React from "react"
import type { PayslipStatus } from "../types/payroll"
import type { GoalStatus, ReviewStatus } from "../types/performance"

// ─── Badge

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger" | "info" | "muted"
  className?: string
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
    muted: "bg-slate-50 text-slate-500 border border-slate-100",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

// ─── Staff Status Badge

const statusConfig: Record<
  string,
  { variant: BadgeProps["variant"]; dot: string }
> = {
  active: { variant: "success", dot: "bg-emerald-500" },
  inactive: { variant: "muted", dot: "bg-slate-400" },
  suspended: { variant: "warning", dot: "bg-amber-500" },
  terminated: { variant: "danger", dot: "bg-red-500" },
}

/** `status` is whatever label the backend sends (e.g. statusLabel from the
 * Staff API) — normalized case-insensitively, with a safe fallback for any
 * value we don't recognize instead of throwing. */
export function StaffStatusBadge({ status }: { status?: string | null }) {
  // Same nullability trap as EmploymentTypeBadge — a null statusLabel would
  // take the page down in exactly the same way.
  const label = status?.trim()
  const cfg = statusConfig[(label ?? "").toLowerCase()] ?? {
    variant: "default" as const,
    dot: "bg-slate-400",
  }
  return (
    <Badge variant={cfg.variant}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} mr-1.5`} />
      {label || "Unknown"}
    </Badge>
  )
}

// ─── Payslip Status Badge

const payslipStatusConfig: Record<
  PayslipStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  draft: { label: "Draft", variant: "muted" },
  processed: { label: "Processed", variant: "info" },
  paid: { label: "Paid", variant: "success" },
}

export function PayslipStatusBadge({ status }: { status: PayslipStatus }) {
  const cfg = payslipStatusConfig[status]
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

// ─── Review Status Badge

const reviewStatusConfig: Record<
  ReviewStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  draft: { label: "Draft", variant: "muted" },
  submitted: { label: "Pending Acknowledgement", variant: "warning" },
  acknowledged: { label: "Acknowledged", variant: "success" },
}

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const cfg = reviewStatusConfig[status]
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

// ─── Goal Status Badge

const goalStatusConfig: Record<
  GoalStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  "not-started": { label: "Not Started", variant: "muted" },
  "in-progress": { label: "In Progress", variant: "info" },
  completed: { label: "Completed", variant: "success" },
}

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  const cfg = goalStatusConfig[status]
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

// ─── Employment Type Badge

const employmentConfig: Record<string, BadgeProps["variant"]> = {
  "full-time": "info",
  fulltime: "info",
  "part-time": "muted",
  parttime: "muted",
  contract: "warning",
}

/**
 * `type` is whatever label the backend sends — normalized case/dash
 * insensitively, with a safe fallback for any value we don't recognize.
 *
 * The prop is nullable because the API genuinely returns null for staff with
 * no employment type recorded, even though StaffDtoI declares it `string`.
 * Trusting that declaration crashed the whole Staff list page: one null and
 * `type.trim()` threw before a single row rendered.
 */
export function EmploymentTypeBadge({ type }: { type?: string | null }) {
  const label = type?.trim()
  if (!label) return <Badge variant="muted">Not set</Badge>

  const key = label.toLowerCase().replace(/\s+/g, "-")
  const variant = employmentConfig[key] ?? "default"
  return <Badge variant={variant}>{label}</Badge>
}

// ─── Avatar

interface AvatarProps {
  /** Nullable: staff records reach this component with names unset. */
  name?: string | null
  src?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeMap = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-20 h-20 text-xl",
}

function getInitials(name?: string | null) {
  return (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

// Deterministic color from name
const avatarColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-indigo-500",
]

function getAvatarColor(name?: string | null) {
  // charCodeAt on an empty string is NaN, and avatarColors[NaN] is undefined —
  // which renders an unstyled avatar rather than throwing, but is still wrong.
  const seed = (name ?? "").charCodeAt(0)
  const idx = Number.isNaN(seed) ? 0 : seed % avatarColors.length
  return avatarColors[idx]
}

export function Avatar({ name, src, size = "md" }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)
  const sizeClass = sizeMap[size]
  const color = getAvatarColor(name)

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name ?? ""}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white`}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} ${color} flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-white`}
    >
      {getInitials(name)}
    </div>
  )
}

// ─── Loading Skeleton

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
}

// ─── Empty State

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-slate-300">{icon}</div>}
      <h3 className="mb-1 text-base font-semibold text-slate-700">{title}</h3>
      {description && (
        <p className="mb-4 max-w-xs text-sm text-slate-500">{description}</p>
      )}
      {action}
    </div>
  )
}

// ─── Section Card

interface SectionCardProps {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>
      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}
