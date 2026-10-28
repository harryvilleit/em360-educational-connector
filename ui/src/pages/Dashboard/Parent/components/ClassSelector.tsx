import { FilterSelect, type FilterSelectOption } from "@/components/ui/filter-select"

interface ClassSelectorProps {
  options: FilterSelectOption[]
  value: string
  onChange: (value: string) => void
  triggerClassName?: string
}

export function ClassSelector({
  options,
  value,
  onChange,
  triggerClassName = "h-9 w-48",
}: ClassSelectorProps) {
  if (options.length === 0) return null

  return (
    <FilterSelect
      value={value || options[0].value}
      onChange={onChange}
      options={options}
      placeholder="Select class"
      triggerClassName={triggerClassName}
      disabled={options.length === 1}
    />
  )
}
