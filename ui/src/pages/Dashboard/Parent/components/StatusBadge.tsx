import { AlertCircle, CheckCircle2, Clock } from "lucide-react"

export type FeeStatus = "Paid" | "Partial" | "Unpaid"

export function StatusBadge({ status }: { status: FeeStatus }) {
  const styles = {
    Paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Unpaid: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Partial:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  }
  const icons = { Paid: CheckCircle2, Unpaid: AlertCircle, Partial: Clock }
  const Icon = icons[status]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[status]}`}
    >
      <Icon size={10} />
      {status}
    </span>
  )
}
