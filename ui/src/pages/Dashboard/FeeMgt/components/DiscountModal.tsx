import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"
import type { SchoolTransactionI } from "@/api/feeManagement.api/types"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

type Props = {
  open: boolean
  onClose: () => void
  transaction: SchoolTransactionI | null
  onApply: (discount: number) => void
}

export default function TransactionDiscountModal({
  open,
  onClose,
  transaction,
  onApply,
}: Props) {
  const { currencyCode, formatMoney } = useSchoolMoney()
  const [type, setType] = useState<"percent" | "fixed">("percent")
  const [value, setValue] = useState("")

  if (!transaction) return null

  const original = transaction.amount + (transaction.vatAmount || 0)
  const numVal = parseFloat(value) || 0
  const discountAmount =
    type === "percent"
      ? Math.min((original * numVal) / 100, original)
      : Math.min(numVal, original)
  const final = original - discountAmount
  const isValid =
    numVal > 0 && (type === "fixed" ? numVal <= original : numVal <= 100)

  const handleClose = () => {
    setValue("")
    setType("percent")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl p-4 sm:max-w-md sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Apply Discount
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Original amount */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
            <p className="text-xs text-gray-400">Original amount</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">
              {formatMoney(original)}
            </p>
          </div>

          {/* Type toggle */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-700">Discount Type</p>
            <div className="flex gap-2">
              {(["percent", "fixed"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t)
                    setValue("")
                  }}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    type === t
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {t === "percent"
                    ? "Percentage (%)"
                    : `Fixed (${currencyCode})`}
                </button>
              ))}
            </div>
          </div>

          {/* Value input */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-700">
              {type === "percent" ? "Discount Percentage" : "Discount Amount"}
            </p>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-400">
                {type === "percent" ? "%" : currencyCode}
              </span>
              <Input
                type="number"
                min={0}
                max={type === "percent" ? 100 : original}
                className={`w-full rounded-md pl-7 ${!isValid && numVal > 0 ? "border-red-400" : "border-gray-200"}`}
                placeholder={type === "percent" ? "e.g. 10" : "e.g. 5000"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            {type === "percent" && numVal > 100 && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="size-3" /> Percentage cannot exceed 100%
              </p>
            )}
            {type === "fixed" && numVal > original && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="size-3" /> Discount cannot exceed
                original amount
              </p>
            )}
          </div>

          {/* Live preview */}
          {numVal > 0 && isValid && (
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Preview
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Original</span>
                  <span className="text-gray-700">{formatMoney(original)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-medium text-red-500">
                    {formatMoney(-discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
                  <span>After Discount</span>
                  <span>{formatMoney(final)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full rounded-md border-gray-200 sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!isValid}
            onClick={() => {
              onApply(discountAmount)
              handleClose()
            }}
            className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
          >
            Apply Discount
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
