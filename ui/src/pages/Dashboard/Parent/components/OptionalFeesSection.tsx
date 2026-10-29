import { Button } from "@/components/ui/button"
import { useSubscribeToPaymentItem } from "@/hooks/guardian"
import type { StudentFeeBreakdownTermI } from "@/api/guardian.api/types"
import { formatCurrency } from "@/utils/currency"
import { formatDate } from "@/utils"

export function OptionalFeesSection({
  term,
  currencyCode,
}: {
  term: StudentFeeBreakdownTermI
  currencyCode?: string | null
}) {
  const { subscribeToPaymentItemAsync, isPending } = useSubscribeToPaymentItem()
  const available = term.billItems.filter(
    (item) =>
      !item.isSelected && item.paymentRequirement.toLowerCase() === "optional"
  )

  if (available.length === 0) return null

  const handleSubscribe = async (schoolStudentBillItemId: string) => {
    try {
      await subscribeToPaymentItemAsync({
        schoolStudentBillItemId,
        schoolStudentBillId: term.schoolStudentBillId,
      })
    } catch {
      // The mutation surfaces the API error.
    }
  }

  return (
    <div className="border-t border-gray-100 px-5 py-3 dark:border-white/5">
      <div className="mb-2 flex items-center gap-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Optional Fees Available
        </p>
      </div>
      <div className="space-y-2">
        {available.map((fee) => (
          <div
            key={fee.schoolStudentBillItemId}
            className="flex flex-col gap-3 rounded-lg border border-gray-200 px-3 py-3 text-sm sm:flex-row sm:items-start sm:justify-between dark:border-white/10"
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium text-gray-700 dark:text-gray-300">
                {fee.paymentItemName}
              </p>
              <p className="text-xs break-words whitespace-pre-line text-gray-500 dark:text-gray-400">
                {fee.description?.trim() ||
                  fee.notes?.trim() ||
                  "No description provided."}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">Subscription expiry date: </span>
                {formatDate(fee.subscriptionDueDate, "short") || "Not provided"}
              </p>
            </div>
            <span className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(fee.amount, currencyCode)}
              </span>
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={() => handleSubscribe(fee.schoolStudentBillItemId)}
              >
                {isPending ? "Adding..." : "Add fee"}
              </Button>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
        Added fees cannot be removed here. Please contact the school for help.
      </p>
    </div>
  )
}
