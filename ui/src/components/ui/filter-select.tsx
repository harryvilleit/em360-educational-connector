import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface FilterSelectOption {
  value: string
  label: string
}

interface FilterSelectProps {
  value: string
  onChange: (value: string) => void
  options: FilterSelectOption[]
  placeholder?: string
  className?: string
  triggerClassName?: string
  itemClassName?: string
  disabled?: boolean
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "All",
  className,
  triggerClassName,
  itemClassName,
  disabled = false,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={cn("w-40 rounded-xl border-gray-200 py-5", triggerClassName)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={className}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className={itemClassName}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
