import { useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Lets a user build up a list of names (one per chip) before submitting,
// for forms that create several records of the same shape at once.
export function NameChipInput({
  names,
  onAdd,
  onRemove,
  placeholder = "Type a name — press Enter to add",
}: {
  names: string[]
  onAdd: (name: string) => void
  onRemove: (index: number) => void
  placeholder?: string
}) {
  const [input, setInput] = useState("")

  function handleAdd() {
    const value = input.trim()
    if (!value) return
    onAdd(value)
    setInput("")
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAdd()
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={handleAdd}>
          Add
        </Button>
      </div>

      {names.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {names.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600"
            >
              {name}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="ml-0.5 hover:text-blue-900"
                aria-label={`Remove ${name}`}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
