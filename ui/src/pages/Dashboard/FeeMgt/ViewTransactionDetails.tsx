import { useNavigate, useParams } from "react-router"
import { Loader2, Receipt } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { EmptyState } from "@/components/ui/empty-state"
import { useGetSchoolTransactionDetails } from "@/hooks/feeManagement"
import { DashboardRoutes } from "@/routes"
import { getTransactionCategoryLabel, isIncomeCategory } from "./utils"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

export default function ViewTransactionDetailsPage() {
  const { formatMoney } = useSchoolMoney()
  const navigate = useNavigate()
  const { productId, transactionId } = useParams<{
    productId: string
    transactionId: string
  }>()
  const { transactionDetails, isLoading } = useGetSchoolTransactionDetails(
    transactionId ?? ""
  )

  const backToList = () =>
    navigate(DashboardRoutes.toBookKeeping(productId ?? ""))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Transaction Details" onBack={backToList} />
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white py-16">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (!transactionDetails) {
    return (
      <div className="space-y-6">
        <PageHeader title="Transaction Details" onBack={backToList} />
        <EmptyState
          icon={Receipt}
          title="Transaction not found"
          description="It may have been deleted."
          action={{ label: "Back to Bookkeeping", onClick: backToList }}
        />
      </div>
    )
  }

  const rows = [
    {
      label: "Date",
      value: new Date(transactionDetails.transactionDate).toLocaleDateString(),
    },
    { label: "Mode", value: transactionDetails.transactionMode || "Unknown" },
    {
      label: "Category",
      value: getTransactionCategoryLabel(
        transactionDetails.transactionCategory
      ),
    },
    { label: "Guardian", value: transactionDetails.guardianName },
    {
      label: "Session / Term",
      value: `${transactionDetails.sessionName} · ${transactionDetails.termName}`,
    },
    { label: "Description", value: transactionDetails.description },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Details"
        description={
          transactionDetails.reference
            ? `Ref: ${transactionDetails.reference}`
            : undefined
        }
        onBack={backToList}
      />

      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {rows.map(({ label, value }) => (
            <div
              key={label}
              className={label === "Description" ? "col-span-2" : ""}
            >
              <p className="text-xs text-gray-400">{label}</p>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                {value}
              </p>
            </div>
          ))}
          <div>
            <p className="text-xs text-gray-400">Type</p>
            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${isIncomeCategory(transactionDetails.transactionCategory) ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
            >
              {isIncomeCategory(transactionDetails.transactionCategory)
                ? "IN"
                : "OUT"}
            </span>
          </div>
        </div>

        {/* Amount breakdown */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
            Amount Breakdown
          </p>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Base Amount</span>
              <span className="font-medium text-gray-900">
                {formatMoney(transactionDetails.amount)}
              </span>
            </div>
            {transactionDetails.vatPercentage > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  VAT ({transactionDetails.vatPercentage}%)
                </span>
                <span className="font-medium text-amber-600">
                  +{formatMoney(transactionDetails.vatAmount)}
                </span>
              </div>
            )}
            {transactionDetails.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="font-medium text-red-500">
                  {formatMoney(-transactionDetails.discountAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2.5 text-sm font-semibold text-gray-900">
              <span>Net Total</span>
              <span>{formatMoney(transactionDetails.netAmount)}</span>
            </div>
          </div>
        </div>

        {/* Allocations */}
        {transactionDetails.allocations.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
              Allocated To
            </p>
            <div className="space-y-2.5">
              {transactionDetails.allocations.map((a) => (
                <div key={a.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{a.studentName}</span>
                  <span className="font-medium text-gray-900">
                    {formatMoney(a.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wallet transactions */}
        {transactionDetails.walletTransactions.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
              Wallet Activity
            </p>
            <div className="space-y-2.5">
              {transactionDetails.walletTransactions.map((w) => (
                <div key={w.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{w.description}</span>
                  <span className="font-medium text-gray-900">
                    {formatMoney(w.balanceBefore)} →{" "}
                    {formatMoney(w.balanceAfter)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
