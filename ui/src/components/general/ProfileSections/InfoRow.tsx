import type { ReactNode } from "react"

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value?: string | null
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 h-4 w-4 shrink-0 text-gray-400">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-700">{value || "—"}</p>
      </div>
    </li>
  )
}
