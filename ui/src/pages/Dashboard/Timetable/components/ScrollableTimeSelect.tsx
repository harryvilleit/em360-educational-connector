import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimeOption {
  value: string
  label: string
}

interface ScrollableTimeSelectProps {
  value?: string
  onValueChange: (value: string) => void
  options: TimeOption[]
  placeholder: string
  invalid?: boolean
  className?: string
}

/** A 24-hour picker with a permanently visible, draggable vertical scrollbar. */
export function ScrollableTimeSelect({
  value,
  onValueChange,
  options,
  placeholder,
  invalid = false,
  className,
}: ScrollableTimeSelectProps) {
  return (
    <Select value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label={placeholder}
        aria-invalid={invalid}
        className={cn("w-full border-gray-200", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="max-h-72 overflow-hidden"
        viewportClassName="max-h-64 overflow-y-scroll [scrollbar-color:#94a3b8_#f1f5f9] [scrollbar-width:auto] [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-track]:bg-slate-100"
      >
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
