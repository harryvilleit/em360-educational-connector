import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useInitialiseWalletFunding } from "@/hooks/payment"
import type { GuardianChildI } from "@/api/guardian.api/types"
import { normaliseCurrencyCode } from "@/utils/currency"
import { saveWalletFundingReturn } from "@/lib/paymentIntent"
import { toSafeExternalUrl } from "@/lib/safeExternalUrl"

interface FundWalletModalProps {
  open: boolean
  onClose: () => void
  guardianChildren: GuardianChildI[]
  defaultChildId: string
  currencyCode?: string | null
  returnUrl: string
}

export default function FundWalletModal({
  open,
  onClose,
  guardianChildren,
  defaultChildId,
  currencyCode,
  returnUrl,
}: FundWalletModalProps) {
  const schoolId = useSchoolId()
  const currency = normaliseCurrencyCode(currencyCode)
  const [studentId, setStudentId] = useState(defaultChildId)
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")

  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setStudentId(defaultChildId)
      setAmount("")
      setError("")
    }
  }

  const { initialiseWalletFundingAsync, isPending } =
    useInitialiseWalletFunding()

  const handleSubmit = async () => {
    const numericAmount = Number(amount)
    if (!studentId) {
      setError("Select a child.")
      return
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount.")
      return
    }

    setError("")
    try {
      const response = await initialiseWalletFundingAsync({
        studentId,
        schoolId,
        amount: numericAmount,
      })
      if (!response.value?.authorizationUrl) {
        setError("Payment could not be initialised. Please try again.")
        return
      }
      const safeUrl = toSafeExternalUrl(response.value.authorizationUrl)
      if (!safeUrl) {
        setError("The payment provider returned an unsafe checkout link.")
        return
      }
      saveWalletFundingReturn({
        reference: response.value.reference,
        returnUrl,
        currencyCode: response.value.currencyCode || currency,
        createdAtUtc: new Date().toISOString(),
      })
      window.location.assign(safeUrl)
    } catch {
      // The mutation displays the API error.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Fund Wallet
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            EM360 will securely redirect you to the payment provider configured
            by this school.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {guardianChildren.length > 1 && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Child</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="w-full rounded-md border-gray-200">
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                  {guardianChildren.map((child) => (
                    <SelectItem key={child.studentId} value={child.studentId}>
                      {child.fullName}
                      {child.currentClass ? ` — ${child.currentClass}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Amount ({currency})
            </Label>
            <Input
              type="number"
              min="1"
              step="any"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter wallet funding amount"
              className="w-full rounded-md border-gray-200"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl py-5"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isPending}
            className="flex-1 rounded-xl bg-blue-600 py-5 text-white hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {isPending ? "Preparing secure checkout..." : "Continue to Payment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
