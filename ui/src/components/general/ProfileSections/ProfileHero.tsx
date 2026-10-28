import { useState, type ReactNode } from "react"
import { Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

export const PROFILE_HERO_ACTION_CLASS =
  "flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"

export function ProfileHero({
  coverClassName = "bg-linear-to-r from-blue-600 to-violet-600",
  avatarInitials,
  avatarClassName = "bg-blue-500",
  avatarSrc,
  name,
  badge,
  subtitle,
  meta,
  onEdit,
  actions,
}: {
  coverClassName?: string
  avatarInitials: string
  avatarClassName?: string
  /** Optional profile photo URL. Falls back to the initials avatar if absent or if it fails to load. */
  avatarSrc?: string
  name: ReactNode
  badge?: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  onEdit?: () => void
  actions?: ReactNode
}) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className={cn("h-28", coverClassName)} />

      <div className="px-6 pb-6">
        <div className="-mt-10 mb-4 flex flex-wrap items-end justify-between gap-4 space-y-2">
          {avatarSrc && !imgError ? (
            <img
              src={avatarSrc}
              alt={typeof name === "string" ? name : ""}
              className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-white"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className={cn(
                "flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white ring-4 ring-white",
                avatarClassName
              )}
            >
              {avatarInitials}
            </div>
          )}
          {actions ??
            (onEdit && (
              <button onClick={onEdit} className={PROFILE_HERO_ACTION_CLASS}>
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            ))}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            {(badge || subtitle) && (
              <div className="mt-1 flex items-center gap-2">
                {badge}
                {badge && subtitle && <span className="text-gray-300">·</span>}
                {subtitle && (
                  <span className="text-sm text-gray-500">{subtitle}</span>
                )}
              </div>
            )}
            {meta && (
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {meta}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
