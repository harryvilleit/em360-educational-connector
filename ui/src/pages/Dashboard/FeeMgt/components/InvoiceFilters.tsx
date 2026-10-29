import { SearchInput } from "@/components/ui/search-input"
import { Button } from "@/components/ui/button"
import { FilterSelect } from "@/components/ui/filter-select"
import { X } from "lucide-react"

interface FilterOption {
  value: string
  label: string
}

interface InvoiceFiltersProps {
  search: string
  sessionFilter: string
  termFilter: string
  classFilter: string
  sessionOptions: FilterOption[]
  termOptions: FilterOption[]
  classOptions: FilterOption[]
  hasFilters: boolean
  onSearchChange: (v: string) => void
  onTermChange: (v: string) => void
  onSessionChange: (v: string) => void
  onClassChange: (v: string) => void
  onClearFilters: () => void
}

export default function InvoiceFilters({
  search,
  termFilter,
  sessionFilter,
  classFilter,
  sessionOptions,
  termOptions,
  classOptions,
  hasFilters,
  onSearchChange,
  onTermChange,
  onSessionChange,
  onClassChange,
  onClearFilters,
}: InvoiceFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <SearchInput
        placeholder="Search by name or invoice number..."
        value={search}
        onChange={onSearchChange}
      />

      {/* Session — always a real session; the API requires one */}
      <FilterSelect
        value={sessionFilter}
        onChange={onSessionChange}
        options={sessionOptions}
        placeholder="Session"
        triggerClassName="w-36"
      />

      {/* Term — scoped to the selected session */}
      <FilterSelect
        value={termFilter}
        onChange={onTermChange}
        options={[{ value: "all", label: "All Terms" }, ...termOptions]}
        placeholder="Term"
        triggerClassName="w-32"
      />

      {/* Class */}
      <FilterSelect
        value={classFilter}
        onChange={onClassChange}
        options={[{ value: "all", label: "All Classes" }, ...classOptions]}
        placeholder="Class"
        triggerClassName="w-36"
      />

      {/* Clear filters */}
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
