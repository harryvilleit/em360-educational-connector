import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface ComboboxProps {
  value: string
  onValueChange: (value: string) => void
  options: readonly string[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  /** Custom content for the closed trigger. Falls back to `value` as plain text. */
  renderValue?: (value: string) => React.ReactNode
  /** Custom content for each item in the dropdown list. Falls back to the option as plain text. */
  renderOption?: (option: string) => React.ReactNode
}

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled,
  renderValue,
  renderOption,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options
    const query = search.trim().toLowerCase()
    return options.filter((option) => option.toLowerCase().includes(query))
  }, [options, search])

  return (
    <PopoverPrimitive.Root
      modal={false}
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch("")
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full min-w-0 items-center justify-between gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-chart-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <span
            className={cn(
              "flex min-w-0 items-center gap-1.5 truncate",
              !value && "text-muted-foreground"
            )}
          >
            {value ? (renderValue ? renderValue(value) : value) : placeholder}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          collisionPadding={12}
          className="z-[100] w-(--radix-popover-trigger-width) rounded-md bg-popover p-0 text-popover-foreground shadow-md ring-1 ring-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
        >
          <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div
            className="max-h-60 overflow-y-auto overscroll-contain p-1"
            onWheel={(e) => e.stopPropagation()}
          >
            {filteredOptions.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                {emptyText}
              </p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onValueChange(option)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    option === value && "bg-accent/50"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5 truncate">
                    {renderOption ? renderOption(option) : option}
                  </span>
                  {option === value && (
                    <CheckIcon className="size-4 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
