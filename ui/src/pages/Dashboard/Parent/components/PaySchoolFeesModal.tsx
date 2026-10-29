import { useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, CreditCard, Wallet } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useInitialiseWalletFunding } from "@/hooks/payment"
import { usePaySchoolFeeFromWallet } from "@/hooks/feeManagement"
import { useAuthStore } from "@/store/auth.store"
import type { StudentFeeBreakdownTermI } from "@/api/guardian.api/types"
import { formatCurrency, normaliseCurrencyCode } from "@/utils/currency"
import { createPaymentIdempotencyKey } from "@/lib/paymentIntent"
import { toSafeExternalUrl } from "@/lib/safeExternalUrl"

interface PaySchoolFeesModalProps {
  open: boolean
  onClose: () => void
  schoolId: string
  studentId: string
  studentName: string
  walletBalance: number
  currencyCode?: string | null
  term: StudentFeeBreakdownTermI | null
  onWalletPaymentComplete?: () => void
}

export default function PaySchoolFeesModal({
  open,
  onClose,
  schoolId,
  studentId,
  studentName,
  walletBalance,
  currencyCode,
  term,
  onWalletPaymentComplete,
}: PaySchoolFeesModalProps) {
  const currency = normaliseCurrencyCode(currencyCode)
  const userId = useAuthStore((state) => state.user?.id) ?? ""
  const [completedAmount, setCompletedAmount] = useState<number | null>(null)
  const [localError, setLocalError] = useState("")
  const outstanding = term?.outstandingAmount ?? 0
  const walletContribution = Math.min(walletBalance, outstanding)
  const walletFundingRequired = Math.max(outstanding - walletBalance, 0)
  const canPayFromWallet = outstanding > 0 && walletFundingRequired === 0

  const summaryRows = useMemo(
    () => [
      { label: "Outstanding fee", value: outstanding },
      { label: "Available wallet balance", value: walletBalance },
      { label: "Used from existing wallet", value: walletContribution },
      { label: "Amount to fund online", value: walletFundingRequired },
    ],
    [outstanding, walletBalance, walletContribution, walletFundingRequired]
  )

  const { initialiseWalletFundingAsync, isPending: isInitialising } =
    useInitialiseWalletFunding()
  const { paySchoolFeeFromWalletAsync, isPending: isPaying } =
    usePaySchoolFeeFromWallet({
      currencyCode: currency,
      onSuccess: (data) => {
        setCompletedAmount(data.value.paidAmount)
        onWalletPaymentComplete?.()
      },
    })

  const isPending = isInitialising || isPaying

  const handlePay = async () => {
    if (!term || !studentId || outstanding <= 0) return
    setLocalError("")

    try {
      if (canPayFromWallet) {
        await paySchoolFeeFromWalletAsync({
          schoolId,
          studentId,
          schoolStudentBillId: term.schoolStudentBillId,
          recordedByUserId: userId,
          idempotencyKey: createPaymentIdempotencyKey("parent-wallet-fee"),
        })
        return
      }

      const response = await initialiseWalletFundingAsync({
        schoolId,
        studentId,
        amount: walletFundingRequired,
        schoolStudentBillId: term.schoolStudentBillId,
      })
      const checkout = response.value
      if (!checkout?.reference || !checkout.authorizationUrl) {
        setLocalError("The payment provider did not return a checkout link.")
        return
      }
      const safeUrl = toSafeExternalUrl(checkout.authorizationUrl)
      if (!safeUrl) {
        setLocalError("The payment provider returned an unsafe checkout link.")
        return
      }

      window.location.assign(safeUrl)
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Unable to start payment."
      )
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isPending) {
      setCompletedAmount(null)
      setLocalError("")
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:max-w-md">
        {completedAmount !== null ? (
          <div className="flex flex-col items-center gap-4 py-5 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Fee payment completed
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {formatCurrency(completedAmount, currency)} was paid from the
                student wallet.
              </p>
            </div>
            <Button className="w-full" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <CreditCard className="size-5 text-blue-600" /> Pay school fees
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {studentName} · {term?.termName ?? "Selected term"}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
              {summaryRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(row.value, currency)}
                  </span>
                </div>
              ))}
            </div>

            {walletFundingRequired > 0 ? (
              <div className="flex gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
                <Wallet className="mt-0.5 size-4 shrink-0" />
                <p>
                  The remaining{" "}
                  {formatCurrency(walletFundingRequired, currency)}
                  will be funded through the school&apos;s configured provider.
                  After server verification, EM360 will apply the wallet balance
                  to this bill.
                </p>
              </div>
            ) : (
              <div className="flex gap-2 rounded-xl border border-green-100 bg-green-50 p-3 text-xs text-green-800">
                <Wallet className="mt-0.5 size-4 shrink-0" />
                <p>Your current wallet balance can cover this fee.</p>
              </div>
            )}

            {localError && (
              <div className="flex gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{localError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isPending}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                disabled={isPending || outstanding <= 0}
                onClick={handlePay}
              >
                {isPending
                  ? "Processing..."
                  : canPayFromWallet
                    ? "Pay from Wallet"
                    : "Continue to Payment"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
