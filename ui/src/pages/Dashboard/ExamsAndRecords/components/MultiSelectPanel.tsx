import { ChevronDown, ChevronUp, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Field, FieldLabel } from "@/components/ui/field"
import { useState } from "react"

export default function MultiSelectPanel<
  T extends { id: string; name: string },
>({
  label,
  required,
  items,
  selected,
  onChange,
  placeholder,
  error,
}: {
  label: string
  required?: boolean
  items: T[]
  selected: string[]
  onChange: (val: string[]) => void
  placeholder: string
  error?: React.ReactNode
}) {
  const [open, setOpen] = useState<boolean>(false)

  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((v) => v !== id)
        : [...selected, id]
    )
  }

  const remove = (id: string) => onChange(selected.filter((v) => v !== id))

  const selectedItems = items.filter((i) => selected.includes(i.id))

  return (
    <Field>
      <FieldLabel>
        {label}
        {required && <span className="text-destructive">*</span>}
      </FieldLabel>

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-md border border-chart-2 px-3 py-3 text-left text-sm transition-colors hover:bg-muted/40"
      >
        <span className="text-muted-foreground">{placeholder}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Checkbox list */}
      {open && (
        <div className="mt-1 rounded-md border border-border bg-background shadow-sm">
          {items.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No {label.toLowerCase()} found
            </p>
          ) : (
            <ul className="max-h-48 divide-y divide-border overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/40">
                    <Checkbox
                      checked={selected.includes(item.id)}
                      onCheckedChange={() => toggle(item.id)}
                    />
                    <span className="text-sm">{item.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Selected badges */}
      {selectedItems.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedItems.map((item) => (
            <Badge
              key={item.id}
              variant="secondary"
              className="flex items-center gap-1 bg-blue-50 pr-1 text-xs text-blue-700"
            >
              {item.name}
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {error}
    </Field>
  )
}
