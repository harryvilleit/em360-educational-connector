import { AlertCircle, CheckCircle2, CreditCard } from "lucide-react"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

export function OverviewCard({
  label,
  amount,
  color,
}: {
  label: string
  amount?: number
  color: "gray" | "green" | "red"
}) {
  const { formatMoney } = useSchoolMoney()
  const numColor = {
    gray: "text-gray-900 dark:text-gray-100",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
  }[color]

  const Icon = { gray: CreditCard, green: CheckCircle2, red: AlertCircle }[
    color
  ]

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/3">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={14} className="text-gray-400" />
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className={`text-xl font-bold ${numColor}`}>
        {amount === undefined ? "—" : formatMoney(amount)}
      </p>
    </div>
  )
}
