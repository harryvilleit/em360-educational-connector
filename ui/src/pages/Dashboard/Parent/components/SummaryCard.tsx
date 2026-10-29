import { formatCurrency } from "@/utils/currency"

export function SummaryCard({
  label,
  amount,
  color,
  highlight,
  currencyCode,
}: {
  label: string
  amount: number
  color: "gray" | "green" | "red" | "blue"
  highlight?: boolean
  currencyCode?: string | null
}) {
  const numColor = {
    gray: "text-gray-900 dark:text-gray-100",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    blue: "text-blue-600 dark:text-blue-400",
  }[color]

  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-900/10"
          : "border-gray-200 bg-white dark:border-white/10 dark:bg-white/3"
      }`}
    >
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-1 text-xl font-bold ${numColor}`}>
        {formatCurrency(amount, currencyCode)}
      </p>
    </div>
  )
}
