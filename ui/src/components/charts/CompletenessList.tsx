export function CompletenessList({
  items,
}: {
  items: { label: string; filled: number; total: number }[]
}) {
  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const pct = item.total ? Math.round((item.filled / item.total) * 100) : 0
        return (
          <li key={item.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-gray-700">{item.label}</span>
              <span className="text-gray-500">
                {item.filled} of {item.total} ({pct}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
              <div
                className={`h-2 rounded-full ${pct >= 60 ? "bg-blue-600" : "bg-blue-300"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
