import { useEffect, useMemo, useRef } from "react"
import { addWeeks, eachWeekOfInterval, format, subWeeks } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { formatWeekRangeLabel } from "../timetable.utils"

interface WeekStripProps {
  /** ISO date of the Monday that starts the selected week. */
  weekStart: string
  onChange: (weekStartISO: string) => void
  /** ISO dates bounding the strip, e.g. the active term's range. */
  termStart?: string
  termEnd?: string
}

function toISO(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

export function WeekStrip({
  weekStart,
  onChange,
  termStart,
  termEnd,
}: WeekStripProps) {
  const selectedRef = useRef<HTMLButtonElement>(null)

  const weeks = useMemo(() => {
    const selected = new Date(`${weekStart}T00:00:00`)
    if (termStart && termEnd) {
      const start = new Date(`${termStart}T00:00:00`)
      const end = new Date(`${termEnd}T00:00:00`)
      if (start <= end) {
        return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 })
      }
    }
    return eachWeekOfInterval(
      { start: subWeeks(selected, 4), end: addWeeks(selected, 8) },
      { weekStartsOn: 1 }
    )
  }, [weekStart, termStart, termEnd])

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ inline: "center", block: "nearest" })
  }, [weekStart])

  const atStart = termStart ? weekStart <= termStart : false
  const atEnd = termEnd ? weekStart >= termEnd : false

  function step(direction: -1 | 1) {
    const current = new Date(`${weekStart}T00:00:00`)
    const next = direction === 1 ? addWeeks(current, 1) : subWeeks(current, 1)
    onChange(toISO(next))
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold tracking-widest text-gray-700 uppercase">
          Select a Week
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={atStart}
          className="flex shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1">
          {weeks.map((week) => {
            const iso = toISO(week)
            const isSelected = iso === weekStart
            return (
              <button
                key={iso}
                ref={isSelected ? selectedRef : undefined}
                type="button"
                onClick={() => onChange(iso)}
                className={`shrink-0 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {format(week, "d MMM")}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => step(1)}
          disabled={atEnd}
          className="flex shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
