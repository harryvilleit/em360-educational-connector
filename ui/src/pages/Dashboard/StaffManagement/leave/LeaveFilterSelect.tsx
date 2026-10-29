import {
  FilterSelect,
  type FilterSelectOption,
} from "@/components/ui/filter-select"

const EMPTY = "__none__"

interface Props {
  value: string
  onChange: (value: string) => void
  options: FilterSelectOption[]
  placeholder?: string
  className?: string
}

// Radix Select rejects "" item values, so the "All"/"None" option is mapped to a sentinel.
export function LeaveFilterSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "w-48",
}: Props) {
  const hasEmptyOption = options.some((o) => o.value === "")
  return (
    <FilterSelect
      value={value === "" && hasEmptyOption ? EMPTY : value}
      onChange={(v) => onChange(v === EMPTY ? "" : v)}
      options={options.map((o) =>
        o.value === "" ? { ...o, value: EMPTY } : o
      )}
      placeholder={placeholder}
      triggerClassName={className}
    />
  )
}
