import { Tag, MoreVertical, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { formatDate } from "@/utils"
import type { HostelCategoryItemI } from "@/api/hostel.api/types"

interface HostelCategoryTableProps {
  categories: HostelCategoryItemI[]
  isLoading?: boolean
  onCreateCategory: () => void
  onEdit: (category: HostelCategoryItemI) => void
}

export function HostelCategoryTable({
  categories,
  isLoading,
  onCreateCategory,
  onEdit,
}: HostelCategoryTableProps) {
  const columns: DataTableColumn<HostelCategoryItemI>[] = [
    {
      key: "name",
      header: "Category Name",
      render: (category) => (
        <span className="font-semibold text-gray-900">{category.name}</span>
      ),
    },
    {
      key: "dateCreated",
      header: "Date Created",
      cellClassName: "text-sm text-gray-600",
      render: (category) => formatDate(category.dateCreated, "short"),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (category) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onEdit(category)}
              >
                <Pencil className="h-4 w-4 text-gray-400" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={categories}
      getRowKey={(category) => category.id}
      isLoading={isLoading}
      emptyState={
        <EmptyState
          icon={Tag}
          title="No hostel categories created"
          description="Create categories (e.g. Boys Hostel, Girls Hostel, Staff Hostel) to use when creating hostels."
          action={{ label: "Create Category", onClick: onCreateCategory }}
        />
      }
    />
  )
}
