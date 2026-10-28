const STYLES: Record<string, string> = {
  Admitted: "bg-red-100 text-red-700",
  Discharged: "bg-green-100 text-green-700",
  Referred: "bg-amber-100 text-amber-700",
}

export default function SickBayBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STYLES[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status || "Unknown"}
    </span>
  )
}
