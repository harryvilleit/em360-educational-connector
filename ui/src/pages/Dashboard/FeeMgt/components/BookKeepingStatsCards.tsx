import { TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { StatCard } from "@/components/general/StatCard"
import { money } from "../../StaffManagement/payroll/service"
export default function BookKeepingStatsCards({
  summary,
}: {
  summary?: {
    currency: string
    moneyIn: number
    moneyOut: number
    partiallyPaidCount: number
  }[]
}) {
  if (!summary) return <p className="text-sm text-slate-500">Loading totals…</p>
  if (!summary.length)
    return (
      <p className="text-sm text-slate-500">
        No transactions match these filters.
      </p>
    )
  return (
    <div className="space-y-3">
      {summary.map((s) => (
        <div key={s.currency} className="space-y-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label={`Recorded money in · ${s.currency}`}
              value={money(s.moneyIn, s.currency)}
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              label={`Recorded money out · ${s.currency}`}
              value={money(s.moneyOut, s.currency)}
              icon={TrendingDown}
              color="red"
            />
            <StatCard
              label={`Net cash movement · ${s.currency}`}
              value={money(s.moneyIn - s.moneyOut, s.currency)}
              icon={Wallet}
              color="blue"
            />
          </div>
          {s.partiallyPaidCount > 0 && (
            <p className="text-xs text-amber-700">
              {s.partiallyPaidCount} partially paid records excluded: their
              settled cash amounts are not available in this ledger.
            </p>
          )}
        </div>
      ))}
      <p className="text-xs text-slate-500">
        Totals cover all filtered pages and fully paid cash-book entries,
        including payroll payments and reversals. Net cash movement excludes an
        opening balance. Payroll cost and outstanding remittances are reported
        in Payroll; do not add them to these cash totals.
      </p>
    </div>
  )
}
