import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useGetSchoolTransactionTypes } from "@/hooks/feeManagement"
import { isTransactionTypeActive } from "../utils"

interface Props {
  schoolId: string
  value: string
  onChange: (id: string) => void
  error?: string
}

// Every school transaction now requires a schoolTransactionTypeId (there's
// no generic fallback like the old "Payment" enum value) — this select is
// shared by every flow that creates one, so schools without any active
// types configured get the same clear guidance everywhere.
export default function TransactionTypeSelect({
  schoolId,
  value,
  onChange,
  error,
}: Props) {
  const { transactionTypes, isLoading } = useGetSchoolTransactionTypes({
    schoolId,
  })
  const activeTypes = transactionTypes.filter((t) =>
    isTransactionTypeActive(t.status)
  )

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">
        Transaction Type <span className="text-red-500">*</span>
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading || activeTypes.length === 0}
      >
        <SelectTrigger
          className={`w-full rounded-md ${error ? "border-red-400" : "border-gray-200"}`}
        >
          <SelectValue
            placeholder={
              isLoading ? "Loading..." : "Select a transaction type"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {activeTypes.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!isLoading && activeTypes.length === 0 && (
        <p className="mt-1 text-xs text-amber-600">
          No transaction types configured yet — add one under Fee Management
          → Transaction Types.
        </p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
