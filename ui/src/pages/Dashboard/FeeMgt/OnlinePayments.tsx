import { useMemo, useState } from "react"
import { Eye, RefreshCw, RotateCcw } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterSelect } from "@/components/ui/filter-select"
import Pagination from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetSchoolPaymentRefunds,
  useGetSchoolPaymentTransactions,
  useRequestPaymentRefund,
} from "@/hooks/payment"
import {
  PaymentTransactionStatus,
  type PaymentRefundI,
  type PaymentTransactionI,
} from "@/api/payment.api/types"
import { formatCurrency } from "@/utils/currency"
import {
  formatPaymentDate,
  paymentStatusClass,
  refundStatusLabel,
  transactionStatusLabel,
  transactionStatusLabels,
  transactionStatusValue,
} from "./paymentDisplay"

const PAGE_SIZE = 25

export default function OnlinePaymentsPage() {
  const schoolId = useSchoolId()
  const [transactionPage, setTransactionPage] = useState(1)
  const [refundPage, setRefundPage] = useState(1)
  const [status, setStatus] = useState("all")
  const [selected, setSelected] = useState<PaymentTransactionI | null>(null)
  const [refundTarget, setRefundTarget] = useState<PaymentTransactionI | null>(null)

  const transactionStatus =
    status === "all" ? undefined : (Number(status) as PaymentTransactionStatus)
  const transactionParams = useMemo(
    () => ({
      schoolId,
      status: transactionStatus,
      pageNumber: transactionPage,
      pageSize: PAGE_SIZE,
    }),
    [schoolId, transactionStatus, transactionPage]
  )
  const refundParams = useMemo(
    () => ({ schoolId, pageNumber: refundPage, pageSize: PAGE_SIZE }),
    [schoolId, refundPage]
  )

  const {
    transactions,
    pagination: transactionPagination,
    isLoading,
    isFetching,
    refetch,
  } = useGetSchoolPaymentTransactions(transactionParams)
  const { refunds, pagination: refundPagination, isLoading: refundsLoading } =
    useGetSchoolPaymentRefunds(refundParams)

  const statusOptions = [
    { value: "all", label: "All statuses" },
    ...Object.entries(transactionStatusLabels).map(([value, label]) => ({
      value,
      label,
    })),
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Online Payments"
        description="Provider payment attempts, verified wallet credits and refunds."
        actions={
          <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-end">
            <FilterSelect
              value={status}
              onChange={(value) => {
                setStatus(value)
                setTransactionPage(1)
              }}
              options={statusOptions}
              placeholder="Filter status"
              triggerClassName="w-48"
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {isLoading ? (
              <div className="py-16 text-center text-sm text-gray-400">Loading payments...</div>
            ) : transactions.length === 0 ? (
              <EmptyState
                icon={RotateCcw}
                title="No provider payments"
                description="Online payment attempts will appear here after parents start checkout."
                size="sm"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="bg-gray-50 text-left text-xs text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Reference</th>
                      <th className="px-5 py-3 font-medium">Provider</th>
                      <th className="px-5 py-3 font-medium">Student</th>
                      <th className="px-5 py-3 text-right font-medium">Wallet credit</th>
                      <th className="px-5 py-3 text-right font-medium">Customer charged</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Created</th>
                      <th className="px-5 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((transaction) => {
                      const statusValue = transactionStatusValue(
                        transaction.paymentStatus
                      )
                      const label = transactionStatusLabel(
                        transaction.paymentStatus
                      )
                      const refundable =
                        statusValue === PaymentTransactionStatus.Succeeded ||
                        statusValue === PaymentTransactionStatus.PartiallyRefunded
                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50/60">
                          <td className="px-5 py-4 font-mono text-xs text-gray-700">
                            {transaction.reference}
                          </td>
                          <td className="px-5 py-4 capitalize">{transaction.providerKey}</td>
                          <td className="px-5 py-4 font-mono text-xs">{transaction.studentId}</td>
                          <td className="px-5 py-4 text-right font-semibold">
                            {formatCurrency(transaction.walletAmount, transaction.currencyCode)}
                          </td>
                          <td className="px-5 py-4 text-right">
                            {formatCurrency(
                              transaction.customerChargedAmount,
                              transaction.currencyCode
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <Badge className={paymentStatusClass(label)}>{label}</Badge>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-500">
                            {formatPaymentDate(transaction.dateCreated)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => setSelected(transaction)}>
                                <Eye className="size-3.5" /> View
                              </Button>
                              {refundable && (
                                <Button size="sm" variant="outline" onClick={() => setRefundTarget(transaction)}>
                                  Refund
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination
              page={transactionPagination?.pageNumber ?? transactionPage}
              total={transactionPagination?.totalItems ?? 0}
              pageSize={transactionPagination?.pageSize ?? PAGE_SIZE}
              onPageChange={setTransactionPage}
            />
          </div>
        </TabsContent>

        <TabsContent value="refunds">
          <RefundsTable refunds={refunds} isLoading={refundsLoading} />
          <Pagination
            page={refundPagination?.pageNumber ?? refundPage}
            total={refundPagination?.totalItems ?? 0}
            pageSize={refundPagination?.pageSize ?? PAGE_SIZE}
            onPageChange={setRefundPage}
          />
        </TabsContent>
      </Tabs>

      <TransactionDetailsModal transaction={selected} onClose={() => setSelected(null)} />
      <RefundModal transaction={refundTarget} onClose={() => setRefundTarget(null)} />
    </div>
  )
}

function RefundsTable({
  refunds,
  isLoading,
}: {
  refunds: PaymentRefundI[]
  isLoading: boolean
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading refunds...</div>
      ) : refunds.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">No refunds have been requested.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Transaction</th>
                <th className="px-5 py-3 font-medium">Provider</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 text-right font-medium">Wallet outstanding</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {refunds.map((refund) => {
                const label = refundStatusLabel(refund.refundStatus)
                return (
                  <tr key={refund.id}>
                    <td className="px-5 py-4 font-mono text-xs">{refund.paymentTransactionId}</td>
                    <td className="px-5 py-4 capitalize">{refund.providerKey}</td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {formatCurrency(refund.amount, refund.currencyCode)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {formatCurrency(refund.outstandingWalletAmount, refund.currencyCode)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={paymentStatusClass(label)}>{label}</Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {formatPaymentDate(refund.requestedAtUtc)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function TransactionDetailsModal({
  transaction,
  onClose,
}: {
  transaction: PaymentTransactionI | null
  onClose: () => void
}) {
  if (!transaction) return null
  const rows = [
    ["EM360 reference", transaction.reference],
    ["Provider reference", transaction.providerReference ?? "—"],
    ["Student ID", transaction.studentId],
    ["Guardian ID", transaction.guardianId ?? "—"],
    ["Wallet credited", transaction.walletCredited ? "Yes" : "No"],
    ["Wallet amount", formatCurrency(transaction.walletAmount, transaction.currencyCode)],
    ["Customer charged", formatCurrency(transaction.customerChargedAmount, transaction.currencyCode)],
    ["Platform fee", formatCurrency(transaction.platformFeeAmount, transaction.currencyCode)],
    ["Provider fee", formatCurrency(transaction.providerFeeAmount ?? 0, transaction.currencyCode)],
    ["Estimated school settlement", formatCurrency(transaction.estimatedSchoolSettlementAmount, transaction.currencyCode)],
    ["Paid", formatPaymentDate(transaction.paidAtUtc)],
  ]
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Provider transaction</DialogTitle>
          <DialogDescription className="capitalize">{transaction.providerKey}</DialogDescription>
        </DialogHeader>
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-5 px-4 py-3 text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="max-w-[60%] break-all text-right font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RefundModal({
  transaction,
  onClose,
}: {
  transaction: PaymentTransactionI | null
  onClose: () => void
}) {
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const { requestRefundAsync, isPending } = useRequestPaymentRefund()

  if (!transaction) return null
  const submit = async () => {
    const numeric = Number(amount)
    if (!Number.isFinite(numeric) || numeric <= 0) return
    await requestRefundAsync({
      schoolId: transaction.schoolId,
      paymentTransactionId: transaction.id,
      amount: numeric,
      reason: reason.trim() || undefined,
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request refund</DialogTitle>
          <DialogDescription>
            Refunds reverse available wallet entitlement before the provider request is sent.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Refund amount ({transaction.currencyCode})</Label>
            <Input
              type="number"
              min="0"
              max={transaction.walletAmount}
              step="any"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder={`Maximum ${transaction.walletAmount}`}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button className="flex-1" onClick={() => void submit()} disabled={isPending || Number(amount) <= 0}>
              {isPending ? "Submitting..." : "Request refund"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
