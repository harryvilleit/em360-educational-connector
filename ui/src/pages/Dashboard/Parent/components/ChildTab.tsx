import { memo } from "react"
import {
  formatClassOptionLabel,
  initialsOfName,
} from "@/utils/guardianAdapter"
import type { GuardianChildI } from "@/api/guardian.api/types"

export const ChildTab = memo(function ChildTab({
  child,
  active,
  onClick,
}: {
  child: GuardianChildI
  active: boolean
  onClick: (id: string) => void
}) {
  const classes = child.currentSessionClasses ?? []
  const currentClass = classes.find((item) => item.isCurrent)
  const classLabel = child.currentClassName
    ? formatClassOptionLabel(
        child.currentClassName,
        child.currentSchoolArmName ?? null
      )
    : currentClass
      ? formatClassOptionLabel(currentClass.className, currentClass.armName)
      : "Enrollment Pending"

  return (
    <button
      onClick={() => onClick(child.studentId)}
      className={`flex shrink-0 items-center gap-2.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
        active
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-white/10 dark:bg-white/3 dark:text-gray-300"
      }`}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
          active
            ? "bg-white/20 text-white"
            : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        }`}
      >
        {initialsOfName(child.fullName)}
      </div>
      <div className="text-left">
        <p className="leading-tight">{child.fullName}</p>
        {classes && classes.length > 1 ? (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {classes.map((c) => (
              <span
                key={c.enrollmentId}
                className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                  active
                    ? "bg-white/20 text-blue-50"
                    : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                }`}
              >
                {formatClassOptionLabel(c.className, c.armName)}
                {c.isCurrent ? " (Current)" : ""}
              </span>
            ))}
          </div>
        ) : (
          <p
            className={`text-xs leading-tight ${active ? "text-blue-100" : "text-gray-400 dark:text-gray-500"}`}
          >
            {classLabel || child.currentClass || "Enrollment Pending"}
          </p>
        )}
      </div>
    </button>
  )
})
