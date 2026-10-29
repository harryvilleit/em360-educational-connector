import { SearchInput } from "@/components/ui/search-input"
import { Button } from "@/components/ui/button"
import { FilterSelect } from "@/components/ui/filter-select"
import { X } from "lucide-react"

interface FilterOption {
  value: string
  label: string
}

export type MoneyDirectionFilter = "all" | "in" | "out"

interface BookKeepingFiltersProps {
  search: string
  sessionFilter: string
  termFilter: string
  directionFilter: MoneyDirectionFilter
  sessionOptions: FilterOption[]
  termOptions: FilterOption[]
  hasFilters: boolean
  onSearchChange: (v: string) => void
  onSessionChange: (v: string) => void
  onTermChange: (v: string) => void
  onDirectionChange: (v: MoneyDirectionFilter) => void
  onClearFilters: () => void
}

const DIRECTION_OPTIONS: { value: MoneyDirectionFilter; label: string }[] = [
  { value: "all", label: "All Transactions" },
  { value: "in", label: "Money In" },
  { value: "out", label: "Money Out" },
]

export default function BookKeepingFilters({
  search,
  sessionFilter,
  termFilter,
  directionFilter,
  sessionOptions,
  termOptions,
  hasFilters,
  onSearchChange,
  onSessionChange,
  onTermChange,
  onDirectionChange,
  onClearFilters,
}: BookKeepingFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput
        placeholder="Search by description or reference..."
        value={search}
        onChange={onSearchChange}
      />

      <FilterSelect
        value={sessionFilter}
        onChange={onSessionChange}
        options={[{ value: "all", label: "All Sessions" }, ...sessionOptions]}
        placeholder="Session"
        triggerClassName="w-40"
      />

      <FilterSelect
        value={termFilter}
        onChange={onTermChange}
        options={[{ value: "all", label: "All Terms" }, ...termOptions]}
        placeholder="Term"
        triggerClassName="w-32"
      />

      <FilterSelect
        value={directionFilter}
        onChange={(v) => onDirectionChange(v as MoneyDirectionFilter)}
        options={DIRECTION_OPTIONS}
        placeholder="Money In/Out"
        triggerClassName="w-40"
      />

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="gap-1.5 rounded-xl border-gray-200 text-xs"
        >
          <X className="size-3.5" />
          Clear
        </Button>
      )}
    </div>
  )
}
