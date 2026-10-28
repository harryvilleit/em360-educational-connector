import { useMemo, useState, type ReactNode } from "react"
import { TableCard } from "@/components/general/TableCard"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { FilterSelect } from "@/components/ui/filter-select"
import { SearchInput } from "@/components/ui/search-input"
import { percentOf } from "../../reportFormat"
import { MetricTile } from "./MetricTile"
import { pageMetrics, type ReportDomain } from "../../metrics"
import type { ReportData } from "../../useReportData"

export function Tiles({
  domain,
  data,
}: {
  domain: ReportDomain
  data: ReportData
}) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {pageMetrics(domain).map((m) => (
        <MetricTile key={m.id} metric={m} data={data} />
      ))}
    </div>
  )
}

export function TableEmpty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-gray-400">{text}</p>
}

const DEFAULT_PAGE_SIZE = 10

export interface SectionFilter<T> {
  placeholder: string
  options: { value: string; label: string }[]
  matches: (row: T, value: string) => boolean
}

// A titled card holding one detail table, with optional search and filters.
export function ReportSection<T>({
  title,
  subtitle,
  columns,
  rows,
  rowKey,
  loading,
  empty,
  footer,
  searchBy,
  searchPlaceholder = "Search...",
  filters = [],
  countLabel,
  pageSize = DEFAULT_PAGE_SIZE,
  extraActions,
}: {
  title: string
  subtitle?: string
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  loading?: boolean
  empty: string
  footer?: ReactNode
  searchBy?: (row: T) => string
  searchPlaceholder?: string
  filters?: SectionFilter<T>[]
  countLabel?: string
  pageSize?: number
  extraActions?: ReactNode
}) {
  const [query, setQuery] = useState("")
  const [values, setValues] = useState<Record<number, string>>({})
  const [page, setPage] = useState(1)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(
      (row) =>
        (!q || !searchBy || searchBy(row).toLowerCase().includes(q)) &&
        filters.every((f, i) => {
          const v = values[i] ?? "all"
          return v === "all" || f.matches(row, v)
        })
    )
  }, [rows, query, values, searchBy, filters])
  const narrowed = visible.length !== rows.length || query !== ""
  const paged = !!pageSize && visible.length > pageSize
  const lastPage = pageSize
    ? Math.max(1, Math.ceil(visible.length / pageSize))
    : 1
  const current = Math.min(page, lastPage)
  const shown = pageSize
    ? visible.slice((current - 1) * pageSize, current * pageSize)
    : visible

  return (
    <TableCard
      title={title}
      subtitle={subtitle}
      actions={
        (searchBy || filters.length > 0 || extraActions) && (
          <>
            {extraActions}
            {searchBy && (
              <SearchInput
                value={query}
                onChange={(v) => {
                  setQuery(v)
                  setPage(1)
                }}
                placeholder={searchPlaceholder}
                containerClassName="w-full sm:w-56 flex-none"
              />
            )}
            {filters.map((f, i) => (
              <FilterSelect
                key={f.placeholder}
                value={values[i] ?? "all"}
                onChange={(v) => {
                  setValues((prev) => ({ ...prev, [i]: v }))
                  setPage(1)
                }}
                options={[{ value: "all", label: f.placeholder }, ...f.options]}
                placeholder={f.placeholder}
              />
            ))}
          </>
        )
      }
    >
      <DataTable
        columns={columns}
        data={shown}
        getRowKey={rowKey}
        pagination={
          pageSize
            ? {
                page: current,
                total: visible.length,
                pageSize,
                onPageChange: setPage,
              }
            : undefined
        }
        isLoading={loading}
        wrapperClassName=""
        emptyState={
          <TableEmpty
            text={rows.length > 0 && narrowed ? "No matches found." : empty}
          />
        }
      />
      {((countLabel && (!paged || narrowed)) ||
        (footer && visible.length > 0)) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 text-sm">
          {countLabel && (!paged || narrowed) ? (
            <p className="text-gray-500">
              Showing {visible.length} of {rows.length} {countLabel}
              {rows.length > 0 && visible.length !== rows.length
                ? ` (${percentOf(visible.length, rows.length)})`
                : ""}
            </p>
          ) : (
            <span />
          )}
          {footer && visible.length > 0 && (
            <p className="font-semibold text-gray-800">{footer}</p>
          )}
        </div>
      )}
    </TableCard>
  )
}
