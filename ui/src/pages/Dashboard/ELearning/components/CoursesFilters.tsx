import { SearchInput } from "@/components/ui/search-input"
import {
  FilterSelect,
  type FilterSelectOption,
} from "@/components/ui/filter-select"
import type { CourseFilters } from "../courses.utils"

interface CoursesFiltersProps {
  filters: CourseFilters
  onChange: (patch: Partial<CourseFilters>) => void
  /** Class options from the DB (values are class ids; includes "all"). */
  classOptions: FilterSelectOption[]
  /** Term options from the current session (values are term names; includes "all"). */
  termOptions: FilterSelectOption[]
  loading?: boolean
}

export default function CoursesFilters({
  filters,
  onChange,
  classOptions,
  termOptions,
  loading = false,
}: CoursesFiltersProps) {
  return (
    <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
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
          onChange={(term) => onChange({ term })}
          options={termOptions}
          placeholder={loading ? "Loading…" : "Select term"}
          disabled={loading}
          triggerClassName="h-8 w-32 py-2 text-xs"
          itemClassName="text-xs"
        />
      </div>

      <div className="border-t border-gray-50 pt-3">
        <SearchInput
          placeholder="Search subject, class, or teacher…"
          value={filters.search}
          onChange={(search) => onChange({ search })}
          containerClassName="max-w-md"
          className="h-9 py-0 pl-8"
        />
      </div>
    </div>
  )
}
