import { Layers, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { formatDate } from "@/utils"
import type { FloorItemI } from "@/types/floor"

interface FloorTableProps {
  floors: FloorItemI[]
  isLoading?: boolean
  onCreateFloor: () => void
  onEdit: (floor: FloorItemI) => void
  onDelete: (floor: FloorItemI) => void
}

export function FloorTable({
  floors,
  isLoading,
  onCreateFloor,
  onEdit,
  onDelete,
}: FloorTableProps) {
  const columns: DataTableColumn<FloorItemI>[] = [
    {
      key: "name",
      header: "Floor Name",
      render: (floor) => (
        <span className="font-semibold text-gray-900">{floor.name}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      cellClassName: "max-w-xs truncate text-sm text-gray-600",
      render: (floor) =>
        floor.description || <span className="text-gray-400">—</span>,
    },
    {
      key: "dateCreated",
      header: "Date Created",
      cellClassName: "text-sm text-gray-600",
      render: (floor) => formatDate(floor.dateCreated, "short"),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (floor) => (
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
                onClick={() => onEdit(floor)}
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
      data={floors}
      getRowKey={(floor) => floor.id}
      isLoading={isLoading}
      emptyState={
        <EmptyState
          icon={Layers}
          title="No floors created"
          description="Create floors (e.g. Ground Floor, Block A) to organize hostel rooms."
          action={{ label: "Create Floor", onClick: onCreateFloor }}
        />
      }
    />
  )
}
