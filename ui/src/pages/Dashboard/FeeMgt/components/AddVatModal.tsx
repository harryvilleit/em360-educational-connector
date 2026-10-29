import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-button"

const VAT_OPTIONS = [
  { label: "0% VAT", value: "0" },
  { label: "5% VAT", value: "5" },
  { label: "12.5% VAT", value: "12.5" },
  { label: "20% VAT", value: "20" },
  { label: "VAT Exempt", value: "exempt" },
  { label: "Out of Scope for VAT", value: "out" },
]

interface Props {
  open: boolean
  onClose: () => void
  onApply: (rate: number) => void
}

export default function AddVatModal({ open, onClose, onApply }: Props) {
  const [selected, setSelected] = useState("5")

  const handleApply = () => {
    const numericRate = ["exempt", "out"].includes(selected)
      ? 0
      : parseFloat(selected)
    onApply(numericRate)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl p-4 sm:max-w-md sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Add VAT
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <RadioGroup
            value={selected}
            onValueChange={setSelected}
            className="space-y-2"
          >
            {VAT_OPTIONS.map((option) => (
              <div
                key={option.value}
                onClick={() => setSelected(option.value)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                  selected === option.value
                    ? "border-blue-500 bg-blue-50/60"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={`vat-${option.value}`}
                />
                <Label
                  htmlFor={`vat-${option.value}`}
                  className="flex w-full cursor-pointer items-center justify-between"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {option.label}
                  </span>
                  {selected === option.value && (
                    <span className="text-xs font-medium text-blue-600">
                      Selected
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full rounded-md border-gray-200 sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
          >
            Apply VAT
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
