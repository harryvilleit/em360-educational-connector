import { Combobox } from "@/components/ui/combobox"

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2)
  const minutes = i % 2 === 0 ? "00" : "30"
  return `${String(hours).padStart(2, "0")}:${minutes}`
})

interface TimeSelectProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TimeSelect({ value, onChange, placeholder = "Select time" }: TimeSelectProps) {
  return (
    <Combobox
      value={value ?? ""}
      onValueChange={onChange}
      options={TIME_SLOTS}
      placeholder={placeholder}
      searchPlaceholder="Search time..."
      emptyText="No matching time."
      className="h-9 rounded-md px-3"
    />
  )
}
