import { memo } from "react"
import type { LinkedChild } from "@/types/parent"

export const LinkedChildTab = memo(function LinkedChildTab({
  child,
  active,
  onClick,
}: {
  child: LinkedChild
  active: boolean
  onClick: (id: string) => void
}) {
  return (
    <button
      onClick={() => onClick(child.id)}
      className={`flex shrink-0 items-center gap-2.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-white/10 dark:bg-white/3 dark:text-gray-300 dark:hover:border-white/20"
      }`}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
          active
            ? "bg-white/20 text-white"
            : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        }`}
      >
        {child.avatarInitials}
      </div>
      <div className="text-left">
        <p className="leading-tight">{child.name}</p>
        <p
          className={`text-xs leading-tight ${active ? "text-blue-100" : "text-gray-400 dark:text-gray-500"}`}
        >
          {child.class}
        </p>
      </div>
    </button>
  )
})
