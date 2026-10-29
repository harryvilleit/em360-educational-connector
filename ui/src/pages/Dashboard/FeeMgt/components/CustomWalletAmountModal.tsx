import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, Loader2 } from "lucide-react"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface Props {
  open: boolean
  onClose: () => void
  title: string
  description: string
  // Caps the input for a single student (min of wallet balance and
  // outstanding amount) — omitted for the bulk flow, which has no single
  // ceiling since it applies per-student on the backend.
  maxAmount?: number
  isPending?: boolean
  onConfirm: (amount: number) => void
}

export default function CustomWalletAmountModal({
  open,
  onClose,
  title,
  description,
  maxAmount,
  isPending,
  onConfirm,
}: Props) {
  const { currencyCode, formatMoney } = useSchoolMoney()
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")

  // Reset the form when the dialog transitions to open — done during render
  // (React's documented pattern for adjusting state from a prop change)
  // rather than in an effect, so it doesn't cause an extra commit.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setAmount("")
      setError("")
    }
  }

  const handleConfirm = () => {
    const value = parseFloat(amount)
    if (!amount || value <= 0) {
      setError("Enter a valid amount.")
      return
    }
    if (maxAmount !== undefined && value > maxAmount) {
      setError(`Amount cannot exceed ${formatMoney(maxAmount)}.`)
      return
    }
    onConfirm(value)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full rounded-2xl p-4 sm:max-w-sm sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 pt-2">
          <Label className="text-sm font-medium text-gray-700">
            Amount to Deduct ({currencyCode}){" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setError("")
            }}
            placeholder="0.00"
            max={maxAmount}
            className={`w-full rounded-md ${error ? "border-red-400" : "border-gray-200"}`}
          />
          {maxAmount !== undefined && (
            <p className="text-xs text-gray-400">
              Up to {formatMoney(maxAmount)} available.
            </p>
          )}
          {error && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="size-3 shrink-0" />
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-md border-gray-200 sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Confirm Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
