import { useNavigate, useParams } from "react-router"
import { CreditCard, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { EmptyState } from "@/components/ui/empty-state"
import { useGetSchoolPaymentStructureDetails } from "@/hooks/feeManagement"
import { formatDate } from "@/utils"
import { DashboardRoutes } from "@/routes"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

export default function ViewPaymentTypePage() {
  const { formatMoney } = useSchoolMoney()
  const navigate = useNavigate()
  const { productId, paymentTypeId } = useParams<{
    productId: string
    paymentTypeId: string
  }>()
  const { paymentStructure, isLoading } = useGetSchoolPaymentStructureDetails(
    paymentTypeId ?? ""
  )

  const backToList = () =>
    navigate(`/dashboard/${productId}/${DashboardRoutes.createPaymentType}`)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payment Type" onBack={backToList} />
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white py-16">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (!paymentStructure) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payment Type" onBack={backToList} />
        <EmptyState
          icon={CreditCard}
          title="Payment type not found"
          description="It may have been deleted."
          action={{ label: "Back to Payment Types", onClick: backToList }}
        />
      </div>
    )
  }

  const compulsoryItems = paymentStructure.compulsoryFees ?? []
  const optionalItems = paymentStructure.optionalFees ?? []
  const total = paymentStructure.grandTotal
  const compulsoryTotal = compulsoryItems.reduce((s, i) => s + i.amount, 0)
  const optionalTotal = optionalItems.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title={paymentStructure.schoolClassName}
        description={`${paymentStructure.schoolSessionTermName} · ${paymentStructure.schoolSessionName}`}
        onBack={backToList}
      />

      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {/* Compulsory Fees */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
              Compulsory Fees
            </p>
            <span className="text-xs font-semibold text-gray-500">
              {formatMoney(compulsoryTotal)}
            </span>
          </div>
          <div className="space-y-2">
            {compulsoryItems.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No compulsory fees added.
              </p>
            ) : (
              compulsoryItems.map((item) => (
                <div
                  key={item.schoolPaymentStructureItemId}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-600">{item.paymentItemName}</span>
                  <span className="font-medium text-gray-900">
                    {formatMoney(item.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Optional Fees */}
        {optionalItems.length > 0 && (
          <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-widest text-amber-600 uppercase">
                Optional Fees
              </p>
              <span className="text-xs font-semibold text-amber-700">
                {formatMoney(optionalTotal)}
              </span>
            </div>
            <div className="space-y-2">
              {optionalItems.map((item) => (
                <div
                  key={item.schoolPaymentStructureItemId}
                  className="flex justify-between text-sm"
                >
                  <div>
                    <span className="text-gray-600">
                      {item.paymentItemName}
                    </span>
                    {item.subscriptionDueDate && (
                      <p className="mt-0.5 text-[11px] text-amber-700">
                        Due {formatDate(item.subscriptionDueDate, "short")}
                      </p>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatMoney(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grand Total */}
        <div className="flex items-center justify-between rounded-xl bg-blue-600 px-4 py-3">
          <span className="text-sm font-semibold text-white">Grand Total</span>
          <span className="text-sm font-bold text-white">
            {formatMoney(total)}
          </span>
        </div>

        {/* Notes */}
        {paymentStructure.notes && (
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <p className="mb-1 text-xs font-semibold tracking-widest text-gray-400 uppercase">
              Notes
            </p>
            <p className="text-sm text-gray-700">{paymentStructure.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
              Created
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {formatDate(paymentStructure.dateCreated, "short")}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
              Last Modified
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {formatDate(paymentStructure.dateModified, "short")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
