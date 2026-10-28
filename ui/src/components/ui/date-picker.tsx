import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { format, parse, isValid, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isSameMonth, isToday } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, "yyyy-MM-dd", new Date())
  return isValid(parsed) ? parsed : undefined
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = parseDate(value)
  const [viewMonth, setViewMonth] = React.useState(selected ?? new Date())

  const days = eachDayOfInterval({
    start: startOfMonth(viewMonth),
    end: endOfMonth(viewMonth),
  })
  const startPad = startOfMonth(viewMonth).getDay()

  const handleSelect = (day: Date) => {
    onChange(format(day, "yyyy-MM-dd"))
    setOpen(false)
  }

  return (
    <PopoverPrimitive.Root modal={false} open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm transition-colors outline-none hover:bg-gray-50 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-chart-2 disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span>{selected ? format(selected, "dd MMM yyyy") : placeholder}</span>
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-[100] w-72 rounded-xl border border-gray-100 bg-white p-3 shadow-lg ring-1 ring-foreground/5 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95"
        >
          <div className="mb-3 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMonth(subMonths(viewMonth, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-semibold">{format(viewMonth, "MMMM yyyy")}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: startPad }).map((_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const isSelected = selected && isSameDay(day, selected)
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors",
                    !isSameMonth(day, viewMonth) && "text-muted-foreground/40",
                    isSelected && "bg-blue-600 font-semibold text-white hover:bg-blue-600",
                    !isSelected && isToday(day) && "bg-blue-50 font-semibold text-blue-600",
                    !isSelected && !isToday(day) && "hover:bg-gray-100"
                  )}
                >
                  {format(day, "d")}
                </button>
              )
            })}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
