import * as React from "react"
import { cn } from "@/lib/utils"
import { toneFor } from "./constants"
import type { ConnectionQuality } from "@/types/liveroom"

/* --------------------------------------------------------------------------
 * Control button — the round buttons on the bottom bar.
 * `tone` communicates state: neutral (on), danger (off/muted), active (engaged).
 * ----------------------------------------------------------------------- */

interface ControlButtonProps extends React.ComponentProps<"button"> {
  label: string
  icon: React.ReactNode
  tone?: "neutral" | "danger" | "active" | "leave"
  badge?: number | string
  showLabel?: boolean
  compact?: boolean
}

export function ControlButton({
  label,
  icon,
  tone = "neutral",
  badge,
  showLabel = true,
  compact = false,
  className,
  ...props
}: ControlButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        "group relative flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 outline-none transition",
        "focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F17]",
        "disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "relative flex items-center justify-center rounded-full transition-colors",
          compact ? "size-9" : "size-11",
          tone === "neutral" && "bg-white/10 text-white hover:bg-white/20",
          tone === "active" && "bg-blue-600 text-white hover:bg-blue-500",
          tone === "danger" && "bg-red-500/90 text-white hover:bg-red-500",
          tone === "leave" && "bg-red-600 px-5 text-white hover:bg-red-700",
          compact ? "[&_svg]:size-4" : "[&_svg]:size-[18px]"
        )}
      >
        {icon}
        {badge !== undefined && badge !== 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-semibold text-white ring-2 ring-[#0B0F17]">
            {badge}
          </span>
        )}
      </span>
      {showLabel && (
        <span className="hidden text-[10px] leading-none font-medium text-white/60 group-hover:text-white/90 lg:block">
          {label}
        </span>
      )}
    </button>
  )
}

/* --------------------------------------------------------------------------
 * Pill — small status chips used across the top bar.
 * ----------------------------------------------------------------------- */

export function Pill({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode
  tone?: "muted" | "live" | "info" | "warn" | "good"
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        tone === "muted" && "bg-white/8 text-white/70",
        tone === "live" && "bg-red-500/15 text-red-300",
        tone === "info" && "bg-blue-500/15 text-blue-300",
        tone === "warn" && "bg-amber-500/15 text-amber-300",
        tone === "good" && "bg-emerald-500/15 text-emerald-300",
        className
      )}
    >
      {children}
    </span>
  )
}

/* --------------------------------------------------------------------------
 * Connection bars — three-bar signal meter.
 * ----------------------------------------------------------------------- */

export function ConnectionBars({
  quality,
  className,
}: {
  quality: ConnectionQuality
  className?: string
}) {
  const filled = quality === "good" ? 3 : quality === "fair" ? 2 : quality === "poor" ? 1 : 0
  const colour =
    quality === "good"
      ? "bg-emerald-400"
      : quality === "fair"
        ? "bg-amber-400"
        : "bg-red-400"

  return (
    <span
      className={cn("inline-flex items-end gap-[2px]", className)}
      title={`Connection: ${quality}`}
      aria-label={`Connection ${quality}`}
    >
      {[3, 5, 7].map((h, i) => (
        <span
          key={h}
          style={{ height: `${h}px` }}
          className={cn("w-[3px] rounded-[1px]", i < filled ? colour : "bg-white/25")}
        />
      ))}
    </span>
  )
}

/* --------------------------------------------------------------------------
 * Avatar — initials circle with deterministic colour.
 * ----------------------------------------------------------------------- */

export function RoomAvatar({
  initials,
  seed,
  size = "md",
  className,
}: {
  initials: string
  seed?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        size === "sm" && "size-7 text-[11px]",
        size === "md" && "size-9 text-xs",
        size === "lg" && "size-14 text-base",
        size === "xl" && "size-24 text-2xl ring-4 ring-white/5",
        toneFor(seed ?? initials),
        className
      )}
    >
      {initials}
    </span>
  )
}

/* --------------------------------------------------------------------------
 * Panel scaffolding — every side panel uses the same head/body rhythm.
 * ----------------------------------------------------------------------- */

export function PanelHeader({
  title,
  count,
  action,
}: {
  title: string
  count?: number
  action?: React.ReactNode
}) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
        {title}
        {count !== undefined && (
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/70">
            {count}
          </span>
        )}
      </h2>
      {action}
    </div>
  )
}

export function PanelEmpty({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 py-12 text-center">
      <span className="mb-1 flex size-10 items-center justify-center rounded-full bg-white/8 text-white/50 [&_svg]:size-5">
        {icon}
      </span>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-xs leading-relaxed text-white/50">{body}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

/* --------------------------------------------------------------------------
 * Switch — small toggle used in settings and host controls.
 * ----------------------------------------------------------------------- */

export function RoomSwitch({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  hint?: string
  disabled?: boolean
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start justify-between gap-4 py-2.5",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm text-white">{label}</span>
        {hint && <span className="mt-0.5 block text-xs leading-relaxed text-white/45">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors outline-none",
          "focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]",
          checked ? "bg-blue-600" : "bg-white/20"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  )
}

/* --------------------------------------------------------------------------
 * Segmented control — layout switcher, chat scope, poll type.
 * ----------------------------------------------------------------------- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = "md",
  className,
}: {
  value: T
  onChange: (next: T) => void
  options: { value: T; label: string; icon?: React.ReactNode }[]
  size?: "sm" | "md"
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg bg-white/8 p-0.5",
        className
      )}
      role="tablist"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors outline-none",
            "focus-visible:ring-2 focus-visible:ring-blue-400",
            size === "sm" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs",
            value === o.value
              ? "bg-white text-gray-900"
              : "text-white/60 hover:bg-white/8 hover:text-white",
            "[&_svg]:size-3.5"
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  )
}
