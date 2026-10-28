import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  containerClassName?: string
  id?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  containerClassName,
  id,
}: SearchInputProps) {
  return (
    <div className={cn("relative flex-1 min-w-55", containerClassName)}>
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
      <Input
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "border-gray-200 py-5 pl-9 pr-8 [&::-webkit-search-cancel-button]:appearance-none",
          className
        )}
        autoComplete="off"
        data-1p-ignore
        data-lpignore="true"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
