import { SearchInput } from "@/components/ui/search-input"
import { FilterSelect } from "@/components/ui/filter-select"

interface StudentFiltersProps {
  search: string
  filterStatus: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  ...["Active", "Graduated", "Withdrawn", "Suspended"].map((s) => ({
    value: s,
    label: s,
  })),
]

export function StudentFilters({
  search,
  filterStatus,
  onSearchChange,
  onStatusChange,
}: StudentFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <SearchInput
        id="student-search-input"
        value={search}
        onChange={onSearchChange}
        placeholder="Search by name or student ID..."
      />

      <FilterSelect
        value={filterStatus}
        onChange={onStatusChange}
        options={STATUS_OPTIONS}
        placeholder="All Statuses"
        triggerClassName="w-full sm:w-44"
      />
    </div>
  )
}
