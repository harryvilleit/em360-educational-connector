import {
  roleBadgeClass,
  roleLabel,
  type ChatAvatarProps,
  type ChatRoleBadgeProps,
} from "@/hooks/chat"
import { cn } from "@/lib/utils"

export function ChatRoleBadge({ role, className }: ChatRoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold",
        roleBadgeClass(role),
        className
      )}
    >
      {roleLabel(role)}
    </span>
  )
}

export function ChatAvatar({
  name,
  color,
  online,
  size = "md",
}: ChatAvatarProps) {
  const sizeClass =
    size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-11 text-base" : "size-10 text-sm"
  const initial = name.trim().charAt(0).toUpperCase() || "?"

  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "flex items-center justify-center rounded-full font-semibold text-white",
          color,
          sizeClass
        )}
      >
        {initial}
      </div>
      {online != null && (
        <span
          className={cn(
            "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white",
            online ? "bg-emerald-500" : "bg-slate-300"
          )}
        />
      )}
    </div>
  )
}
