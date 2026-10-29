import { FileText } from "lucide-react"
import { StatCard } from "@/components/general/StatCard"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface InvoiceStatsCardsProps {
  totalInvoiced: number
  totalCollected: number
  outstandingBalance: number
  fullyPaidCount: number
}

export default function InvoiceStatsCards({
  totalInvoiced,
  totalCollected,
  outstandingBalance,
  fullyPaidCount,
}: InvoiceStatsCardsProps) {
  const { formatMoney } = useSchoolMoney()
  const stats = [
    {
      label: "Total Invoiced",
      value: formatMoney(totalInvoiced),
      valueColor: "text-gray-900",
      color: "blue" as const,
    },
    {
      label: "Total Collected",
      value: formatMoney(totalCollected),
      valueColor: "text-green-700",
      color: "green" as const,
    },
    {
      label: "Outstanding",
      value: formatMoney(outstandingBalance),
      valueColor: "text-red-600",
      color: "red" as const,
    },
    {
      label: "Fully Paid",
      value: `${fullyPaidCount} invoice${fullyPaidCount !== 1 ? "s" : ""}`,
      valueColor: "text-gray-900",
      color: "amber" as const,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} icon={FileText} {...stat} />
      ))}
    </div>
  )
}
