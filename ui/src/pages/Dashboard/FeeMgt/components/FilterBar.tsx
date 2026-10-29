import { Input } from "@/components/ui/input"
import { SearchInput } from "@/components/ui/search-input"
import {
  FilterSelect,
  type FilterSelectOption,
} from "@/components/ui/filter-select"
import { SlidersHorizontal } from "lucide-react"
import type { PaymentReminderStatus } from "./StatusBadge"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "owing", label: "Owing" },
  { value: "partial", label: "Part Payment" },
  { value: "paid", label: "Paid" },
]

interface FilterBarProps {
  search: string
  classFilter: string
  termFilter: string
  sessionFilter: string
  statusFilter: PaymentReminderStatus | "all"
  minBalance: string
  maxBalance: string
  sessionOptions: FilterSelectOption[]
  termOptions: FilterSelectOption[]
  classOptions: FilterSelectOption[]
  sessionsLoading?: boolean
  classesLoading?: boolean
  onSearch: (v: string) => void
  onClassFilter: (v: string) => void
  onTermFilter: (v: string) => void
  onSessionFilter: (v: string) => void
  onStatusFilter: (v: PaymentReminderStatus | "all") => void
  onMinBalance: (v: string) => void
  onMaxBalance: (v: string) => void
}

export function FilterBar({
  search,
  classFilter,
  termFilter,
  sessionFilter,
  statusFilter,
  minBalance,
  maxBalance,
  sessionOptions,
  termOptions,
  classOptions,
  sessionsLoading,
  classesLoading,
  onSearch,
  onClassFilter,
  onTermFilter,
  onSessionFilter,
  onStatusFilter,
  onMinBalance,
  onMaxBalance,
}: FilterBarProps) {
  const { currencyCode } = useSchoolMoney()
  const isReady = Boolean(sessionFilter && termFilter && classFilter)

  return (
    <div className="space-y-3 border-b border-gray-50 px-5 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-500">Session</span>
        <FilterSelect
          value={sessionFilter}
          onChange={onSessionFilter}
          options={sessionOptions}
          placeholder={sessionsLoading ? "Loading sessions…" : "Select session"}
          triggerClassName="h-8 w-36 py-2 text-xs"
          itemClassName="text-xs"
          disabled={sessionsLoading}
        />

        <span className="ml-2 text-xs font-medium text-gray-500">Term</span>
        <FilterSelect
          value={termFilter}
          onChange={onTermFilter}
          options={termOptions}
          placeholder="Select term"
          triggerClassName="h-8 w-32 py-2 text-xs"
          itemClassName="text-xs"
          disabled={!sessionFilter}
        />

        <span className="ml-2 text-xs font-medium text-gray-500">Class</span>
        <FilterSelect
          value={classFilter}
          onChange={onClassFilter}
          options={classOptions}
          placeholder={classesLoading ? "Loading classes…" : "Select class"}
          triggerClassName="h-8 w-36 py-2 text-xs"
          itemClassName="text-xs"
          disabled={classesLoading}
        />
      </div>

      {isReady && (
        <div className="flex flex-wrap items-center gap-2 border-t border-gray-50 pt-3">
          <SearchInput
            placeholder="Search by name or admission number…"
            value={search}
            onChange={onSearch}
            containerClassName="min-w-[160px] flex-1"
            className="h-8 rounded-xl py-0 pl-8 text-xs"
          />

          <FilterSelect
            value={statusFilter}
            onChange={(v) => onStatusFilter(v as PaymentReminderStatus | "all")}
            options={STATUS_OPTIONS}
            placeholder="All statuses"
            triggerClassName="h-8 w-36 py-2 text-xs"
            itemClassName="text-xs"
          />

          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5 text-gray-400" />
            <Input
              type="number"
              className="h-8 w-24 rounded-xl text-xs"
              placeholder={`Min ${currencyCode}`}
              value={minBalance}
              onChange={(e) => onMinBalance(e.target.value)}
            />
            <span className="text-xs text-gray-400">–</span>
            <Input
              type="number"
              className="h-8 w-24 rounded-xl text-xs"
              placeholder={`Max ${currencyCode}`}
              value={maxBalance}
              onChange={(e) => onMaxBalance(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
