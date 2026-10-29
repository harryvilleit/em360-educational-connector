// Colour is a display convenience keyed off known status strings; the label
// itself is always the backend's raw `status` value, never recalculated.
const STATUS_DOT_COLOR: Record<string, string> = {
  draft: "bg-yellow-500",
  submitted: "bg-blue-500",
  approved: "bg-green-500",
  published: "bg-emerald-600",
}

interface StudentStatusBadgeProps {
  status: string
}

export function StudentStatusBadge({ status }: StudentStatusBadgeProps) {
  const color = STATUS_DOT_COLOR[status.toLowerCase()] ?? "bg-gray-400"
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-xs font-medium">{status || "—"}</span>
    </div>
  )
}
