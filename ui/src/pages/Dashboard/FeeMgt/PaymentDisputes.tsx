import { useMemo, useState } from "react"
import { AlertTriangle, Scale } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetSchoolPaymentDisputes,
  useResolvePaymentDispute,
} from "@/hooks/payment"
import {
  PaymentDisputeResolution,
  type PaymentDisputeI,
  type PaymentDisputeStatus,
} from "@/api/payment.api/types"
import { formatCurrency } from "@/utils/currency"
import {
  disputeStatusLabels,
  disputeStatusLabel,
  disputeStatusValue,
  formatPaymentDate,
  paymentStatusClass,
} from "./paymentDisplay"

const PAGE_SIZE = 25

export default function PaymentDisputesPage() {
  const schoolId = useSchoolId()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState("all")
  const [selected, setSelected] = useState<PaymentDisputeI | null>(null)
  const params = useMemo(
    () => ({
      schoolId,
      pageNumber: page,
      pageSize: PAGE_SIZE,
      status:
        status === "all" ? undefined : (Number(status) as PaymentDisputeStatus),
    }),
    [page, schoolId, status]
  )
  const { disputes, pagination, isLoading } =
    useGetSchoolPaymentDisputes(params)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Disputes"
        description="Review provider chargebacks and submit the school’s response before evidence deadlines."
      />

      <div className="flex justify-end">
        <FilterSelect
          value={status}
          onChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
          options={[
            { value: "all", label: "All statuses" },
            ...Object.entries(disputeStatusLabels).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
          placeholder="Filter status"
          triggerClassName="w-48"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading disputes...</div>
        ) : disputes.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="No payment disputes"
            description="Provider chargebacks will appear here if they occur."
            size="sm"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Provider dispute</th>
                  <th className="px-5 py-3 font-medium">Transaction</th>
                  <th className="px-5 py-3 text-right font-medium">Disputed</th>
                  <th className="px-5 py-3 text-right font-medium">Wallet recovered</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Evidence due</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {disputes.map((dispute) => {
                  const label = disputeStatusLabel(dispute.disputeStatus)
                  const statusValue = disputeStatusValue(dispute.disputeStatus)
                  const canRespond = statusValue === 0 || statusValue === 1
                  return (
                    <tr key={dispute.id}>
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs">{dispute.providerDisputeId}</p>
                        <p className="mt-1 text-xs capitalize text-gray-400">{dispute.providerKey}</p>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs">{dispute.paymentTransactionId}</td>
                      <td className="px-5 py-4 text-right font-semibold">
                        {formatCurrency(dispute.disputedAmount, dispute.currencyCode)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {formatCurrency(dispute.walletRecoveredAmount, dispute.currencyCode)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge className={paymentStatusClass(label)}>{label}</Badge>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {formatPaymentDate(dispute.evidenceDueAtUtc)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelected(dispute)}>
                          {canRespond ? "Respond" : "View"}
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

      <DisputeResponseModal dispute={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
function DisputeResponseModal({
  dispute,
  onClose,
}: {
  dispute: PaymentDisputeI | null
  onClose: () => void
}) {
  const [resolution, setResolution] = useState<PaymentDisputeResolution>(
    PaymentDisputeResolution.Challenge
  )
  const [message, setMessage] = useState("")
  const [evidenceUrl, setEvidenceUrl] = useState("")
  const { resolveDisputeAsync, isPending } = useResolvePaymentDispute()

  if (!dispute) return null
  const statusValue = disputeStatusValue(dispute.disputeStatus)
  const canRespond = statusValue === 0 || statusValue === 1
  const submit = async () => {
    await resolveDisputeAsync({
      schoolId: dispute.schoolId,
      disputeId: dispute.id,
      resolution,
      message: message.trim() || undefined,
      evidence: evidenceUrl.trim() ? { evidenceUrl: evidenceUrl.trim() } : {},
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dispute details</DialogTitle>
          <DialogDescription>{dispute.providerDisputeId}</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              {formatCurrency(dispute.disputedAmount, dispute.currencyCode)} is disputed.
              EM360 only recovers available wallet entitlement and records any outstanding amount.
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p><span className="text-gray-500">Reason:</span> {dispute.reason || "Not supplied"}</p>
          <p><span className="text-gray-500">Outstanding wallet recovery:</span> {formatCurrency(dispute.outstandingWalletAmount, dispute.currencyCode)}</p>
          <p><span className="text-gray-500">Evidence due:</span> {formatPaymentDate(dispute.evidenceDueAtUtc)}</p>
        </div>

        {canRespond && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={resolution === PaymentDisputeResolution.Challenge ? "default" : "outline"}
                onClick={() => setResolution(PaymentDisputeResolution.Challenge)}
              >
                Challenge
              </Button>
              <Button
                type="button"
                variant={resolution === PaymentDisputeResolution.Accept ? "default" : "outline"}
                onClick={() => setResolution(PaymentDisputeResolution.Accept)}
              >
                Accept
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label>Response message</Label>
              <Textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} />
            </div>
            {resolution === PaymentDisputeResolution.Challenge && (
              <div className="space-y-1.5">
                <Label>Evidence URL</Label>
                <Input type="url" value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} placeholder="https://..." />
              </div>
            )}
            <Button className="w-full" disabled={isPending} onClick={() => void submit()}>
              {isPending ? "Submitting..." : "Submit dispute response"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
