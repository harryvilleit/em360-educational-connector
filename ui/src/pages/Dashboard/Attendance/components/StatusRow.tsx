const statusDot: Record<"present" | "absent" | "late" | "excused", string> = {
  present: "bg-green-500",
  absent: "bg-red-500",
  late: "bg-amber-500",
  excused: "bg-blue-500",
}

export default function StatusRow({
  status,
  label,
  value,
}: {
  status: "present" | "absent" | "late" | "excused"
  label: string
  value: number
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="flex items-center gap-2 text-sm text-gray-500">
        <span className={`size-2 rounded-full ${statusDot[status]}`} />
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}

