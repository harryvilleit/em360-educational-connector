import { CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import {
  FilterSelect,
  type FilterSelectOption,
} from "@/components/ui/filter-select"
import { DatePicker } from "@/components/ui/date-picker"
import type { TermDateRange } from "@/hooks/elearning/useELearningFilterOptions"
import type { LiveClassFilters } from "../liveClasses.utils"

interface LiveClassesFiltersProps {
  filters: LiveClassFilters
  onChange: (patch: Partial<LiveClassFilters>) => void
  onOpenCalendar?: () => void
  /** Class options from the DB (values are class ids; includes "all"). */
  classOptions: FilterSelectOption[]
  /** Term options from the current session (values are term names; includes "all"). */
  termOptions: FilterSelectOption[]
  /** Start/end window per term name — selecting a term bounds the date range. */
  termRanges: Record<string, TermDateRange>
  loading?: boolean
}

export default function LiveClassesFilters({
  filters,
  onChange,
  onOpenCalendar,
  classOptions,
  termOptions,
  termRanges,
  loading = false,
}: LiveClassesFiltersProps) {
  const handleTermChange = (term: string) => {
    const range = term !== "all" ? termRanges[term] : undefined
    if (range) {
      onChange({ term, startDate: range.startDate, endDate: range.endDate })
      return
    }
    onChange({ term })
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Class</span>
          <FilterSelect
            value={filters.className}
            onChange={(className) => onChange({ className })}
            options={classOptions}
            placeholder={loading ? "Loading…" : "All classes"}
            disabled={loading}
            triggerClassName="h-8 w-36 py-2 text-xs"
            itemClassName="text-xs"
          />

          <span className="ml-1 text-xs font-medium text-gray-500">Term</span>
          <FilterSelect
            value={filters.term}
            onChange={handleTermChange}
            options={termOptions}
            placeholder={loading ? "Loading…" : "Select term"}
            disabled={loading}
            triggerClassName="h-8 w-32 py-2 text-xs"
            itemClassName="text-xs"
          />
        </div>

        {onOpenCalendar && (
          <Button
            type="button"
            variant="outline"
            className="h-8 gap-2 rounded-md text-xs"
            onClick={onOpenCalendar}
          >
            <CalendarDays className="size-3.5" />
            View Full Calendar
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3 border-t border-gray-50 pt-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Start date</p>
          <DatePicker
            value={filters.startDate}
            onChange={(startDate) => onChange({ startDate })}
            placeholder="Start date"
            className="h-9 w-36 text-xs"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">End date</p>
          <DatePicker
            value={filters.endDate}
            onChange={(endDate) => onChange({ endDate })}
            placeholder="End date"
            className="h-9 w-36 text-xs"
          />
        </div>

        <SearchInput
          placeholder="Search by title, subject, class, or teacher…"
          value={filters.search}
          onChange={(search) => onChange({ search })}
          containerClassName="min-w-[200px] flex-1"
          className="h-9 py-0 pl-8"
        />
      </div>
    </div>
  )
}
