import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import Pagination from "@/components/ui/pagination"

export interface DataTableColumn<T> {
  key: string
  header: ReactNode
  headerClassName?: string
  cellClassName?: string
  render: (row: T, index: number) => ReactNode
}

interface DataTablePagination {
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowKey: (row: T, index: number) => string | number
  isLoading?: boolean
  loadingRows?: number
  emptyState: ReactNode
  onRowClick?: (row: T) => void
  rowClassName?: (row: T) => string
  pagination?: DataTablePagination
  wrapperClassName?: string
}

const DEFAULT_WRAPPER =
  "overflow-hidden rounded-2xl border border-gray-100 bg-white "

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  isLoading = false,
  loadingRows = 5,
  emptyState,
  onRowClick,
  rowClassName,
  pagination,
  wrapperClassName = DEFAULT_WRAPPER,
}: DataTableProps<T>) {
  return (
    <div className={cn(wrapperClassName)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold tracking-widest text-gray-400 uppercase",
                    column.headerClassName
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={i}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn("px-4 py-3.5", column.cellClassName)}
                    >
                      <Skeleton className="h-4 w-full max-w-32" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>{emptyState}</td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  role={onRowClick ? "button" : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={
                    onRowClick
                      ? (event) => {
                          const target = event.target as HTMLElement
                          if (
                            target.closest("button, a, input, select, textarea")
                          )
                            return
                          onRowClick(row)
                        }
                      : undefined
                  }
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.target !== event.currentTarget) return
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            onRowClick(row)
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    "transition-colors hover:bg-gray-50/50",
                    onRowClick &&
                      "cursor-pointer focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600",
                    rowClassName?.(row)
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn("px-4 py-3.5", column.cellClassName)}
                    >
                      {column.render(row, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.total > pagination.pageSize && (
        <Pagination
          page={pagination.page}
          total={pagination.total}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  )
}
