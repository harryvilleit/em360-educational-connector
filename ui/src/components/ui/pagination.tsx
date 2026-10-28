import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  page: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
      <p className="text-xs text-muted-foreground">
        Showing {start}–{end} of {total}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-lg p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const currentPage = i + 1
          return (
            <button
              key={currentPage}
              onClick={() => onPageChange(currentPage)}
              className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {currentPage}
            </button>
          )
        })}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || totalPages === 0}
          className="rounded-lg p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
