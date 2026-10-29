import { memo } from "react"
import type { useParentsOverview } from "@/hooks/useParentsOverview"
import { useNavigate } from "react-router"


type ResolvedShortcut = ReturnType<
  typeof useParentsOverview
>["shortcuts"][number]

interface ParentShortcutCardsProps {
  shortcuts: ResolvedShortcut[]
}

export const ParentShortcutCards = memo(function ParentShortcutCards({
  shortcuts,
}: ParentShortcutCardsProps) {
  const navigate = useNavigate()

  return (
    <section>
      <h2 className="mb-4 text-sm font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
        Quick actions
      </h2>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shortcuts.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate(s.resolvedTo)}
            className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-gray-300 hover:shadow-sm dark:border-white/10 dark:bg-white/3 dark:hover:border-white/20"
          >
            <div className={`shrink-0 rounded-lg p-2.5 ${s.colorClass}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                {s.label}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {s.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
})
