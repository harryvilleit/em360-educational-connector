import { useMemo, useState } from "react"
import { Eye, RefreshCw, Scale } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FilterSelect } from "@/components/ui/filter-select"
import Pagination from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetSchoolPaymentProviderAccounts,
  useGetSchoolPaymentSettlements,
  useReconcileSchoolSettlements,
} from "@/hooks/payment"
import type { PaymentSettlementI } from "@/api/payment.api/types"
import { formatCurrency } from "@/utils/currency"
import {
  formatPaymentDate,
  paymentStatusClass,
  reconciliationStatusLabel,
  settlementStatusLabel,
} from "./paymentDisplay"

const PAGE_SIZE = 25

function dateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export default function PaymentSettlementsPage() {
  const schoolId = useSchoolId()
  const today = useMemo(() => new Date(), [])
  const thirtyDaysAgo = useMemo(() => {
    const value = new Date(today)
    value.setUTCDate(value.getUTCDate() - 30)
    return value
  }, [today])
  const [accountId, setAccountId] = useState("")
  const [fromDate, setFromDate] = useState(dateInputValue(thirtyDaysAgo))
  const [toDate, setToDate] = useState(dateInputValue(today))
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<PaymentSettlementI | null>(null)

  const { accounts, isLoading: accountsLoading } =
    useGetSchoolPaymentProviderAccounts(schoolId)
  const activeAccountId = accountId || accounts[0]?.id || ""
  const params = useMemo(
    () => ({
      schoolId,
      providerAccountId: activeAccountId || undefined,
      pageNumber: page,
      pageSize: PAGE_SIZE,
    }),
    [activeAccountId, page, schoolId]
  )
  const { settlements, pagination, isLoading, refetch } =
    useGetSchoolPaymentSettlements(params)
  const { reconcileSettlementsAsync, isPending } =
    useReconcileSchoolSettlements()
  const [resultMessage, setResultMessage] = useState("")

  const runReconciliation = async () => {
    if (!activeAccountId || !fromDate || !toDate) return
    const result = await reconcileSettlementsAsync({
      schoolId,
      accountId: activeAccountId,
      fromUtc: new Date(`${fromDate}T00:00:00.000Z`).toISOString(),
      toUtc: new Date(`${toDate}T23:59:59.999Z`).toISOString(),
    })
    setResultMessage(
      `${result.value.message} ${result.value.matchedItemCount} matched, ${result.value.unmatchedItemCount} unmatched.`
    )
    await refetch()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settlement Reconciliation"
        description="Match provider settlement reports against EM360 payments, refunds and disputes."
      />

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        Reconciliation is reporting only. EM360 does not hold school money and this action never creates or sends a payout.
      </div>

      <div className="grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 sm:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Provider account</Label>
          <FilterSelect
            value={activeAccountId}
            onChange={(value) => {
              setAccountId(value)
              setPage(1)
            }}
            options={accounts.map((account) => ({
              value: account.id,
              label: `${account.displayName || account.providerKey} · ${account.currencyCode}${account.settlementAccountLast4 ? ` · ••••${account.settlementAccountLast4}` : ""}`,
            }))}
            placeholder={accountsLoading ? "Loading accounts..." : "Select account"}
            triggerClassName="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label>From</Label>
          <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>To</Label>
          <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        </div>
        <div className="sm:col-span-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">Maximum reconciliation range: 366 days.</p>
          <Button disabled={!activeAccountId || isPending} onClick={() => void runReconciliation()}>
            <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Reconciling..." : "Run reconciliation"}
          </Button>
        </div>
        {resultMessage && (
          <p className="sm:col-span-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">{resultMessage}</p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading settlements...</div>
        ) : settlements.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="No settlement reports"
            description="Run reconciliation for a connected provider account to retrieve reports."
            size="sm"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Settlement</th>
                  <th className="px-5 py-3 font-medium">Provider</th>
                  <th className="px-5 py-3 text-right font-medium">Gross</th>
                  <th className="px-5 py-3 text-right font-medium">Provider fee</th>
                  <th className="px-5 py-3 text-right font-medium">Net</th>
                  <th className="px-5 py-3 text-right font-medium">Unmatched</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settlements.map((settlement) => {
                  const label = settlementStatusLabel(
                    settlement.settlementStatus
                  )
                  return (
                    <tr key={settlement.id}>
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs">{settlement.externalSettlementId}</p>
                        <p className="mt-1 text-xs text-gray-400">{formatPaymentDate(settlement.settlementDateUtc)}</p>
                      </td>
                      <td className="px-5 py-4 capitalize">{settlement.providerKey}</td>
                      <td className="px-5 py-4 text-right">{formatCurrency(settlement.grossAmount, settlement.currencyCode)}</td>
                      <td className="px-5 py-4 text-right">{formatCurrency(settlement.providerFeeAmount, settlement.currencyCode)}</td>
                      <td className="px-5 py-4 text-right font-semibold">{formatCurrency(settlement.netAmount, settlement.currencyCode)}</td>
                      <td className="px-5 py-4 text-right">{formatCurrency(settlement.unmatchedNetAmount, settlement.currencyCode)}</td>
                      <td className="px-5 py-4"><Badge className={paymentStatusClass(label)}>{label}</Badge></td>
                      <td className="px-5 py-4 text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelected(settlement)}>
                          <Eye className="size-3.5" /> Items
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          page={pagination?.pageNumber ?? page}
          total={pagination?.totalItems ?? 0}
          pageSize={pagination?.pageSize ?? PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <SettlementItemsModal settlement={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
function SettlementItemsModal({
  settlement,
  onClose,
}: {
  settlement: PaymentSettlementI | null
  onClose: () => void
}) {
  if (!settlement) return null
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Settlement items</DialogTitle>
          <DialogDescription>{settlement.externalSettlementId}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {settlement.items.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No settlement items were returned.</p>
          ) : (
            settlement.items.map((item) => {
              const label = reconciliationStatusLabel(item.matchStatus)
              return (
                <div key={item.id} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-gray-700">{item.externalItemId}</p>
                      <p className="mt-1 text-xs text-gray-400">{item.providerReference || "No provider reference"}</p>
                    </div>
                    <Badge className={paymentStatusClass(label)}>{label}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                    <div><p className="text-gray-400">Gross</p><p className="font-semibold">{formatCurrency(item.grossAmount, item.currencyCode)}</p></div>
                    <div><p className="text-gray-400">Provider fee</p><p className="font-semibold">{formatCurrency(item.providerFeeAmount, item.currencyCode)}</p></div>
                    <div><p className="text-gray-400">Net</p><p className="font-semibold">{formatCurrency(item.netAmount, item.currencyCode)}</p></div>
                  </div>
                  {item.matchMessage && <p className="mt-3 text-xs text-gray-500">{item.matchMessage}</p>}
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
