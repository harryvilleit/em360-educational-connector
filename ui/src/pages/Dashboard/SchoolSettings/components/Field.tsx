import { Input } from "@/components/ui/input"

export default function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  maxLength,
  inputClassName,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
  placeholder?: string
  maxLength?: number
  inputClassName?: string
}) {
  return (
    <label className="space-y-1.5 text-sm font-medium text-gray-800">
      {label}
      <Input
        type={type}
        required={required}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        className={inputClassName}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
