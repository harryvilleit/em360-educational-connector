import {
  Building2,
  DoorOpen,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { Link } from "react-router"
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
import { hostelTypeToGender } from "@/schema/hostelType.schema"
import type { HostelItemI } from "@/api/hostel.api/types"
import { StatusBadge } from "./StatusBadge"

// ── Table ─────────────────────────────────────────────────────────────────────

interface HostelTableProps {
  hostels: HostelItemI[]
  isLoading?: boolean
  onCreateHostel: () => void
  onEdit: (hostel: HostelItemI) => void
  onDelete: (hostel: HostelItemI) => void
  toRooms: (hostel: HostelItemI) => string
  toCreateRoom: (hostel: HostelItemI) => string
}

export function HostelTable({
  hostels,
  isLoading,
  onCreateHostel,
  onEdit,
  onDelete,
  toRooms,
  toCreateRoom,
}: HostelTableProps) {
  const columns: DataTableColumn<HostelItemI>[] = [
    {
      key: "name",
      header: "Hostel Name",
      render: (hostel) => (
        <span className="font-semibold text-gray-900">{hostel.name}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (hostel) => {
        const isBoys = hostelTypeToGender(hostel.categoryName) === "male"
        return (
          <StatusBadge variant={isBoys ? "info" : "purple"} dot>
            {hostel.categoryName}
          </StatusBadge>
        )
      },
    },
    {
      key: "rooms",
      header: "Rooms",
      headerClassName: "text-center",
      cellClassName: "text-center font-medium text-gray-700",
      render: (hostel) => hostel.roomCount,
    },
    {
      key: "dateCreated",
      header: "Date Created",
      cellClassName: "text-sm text-gray-600",
      render: (hostel) => formatDate(hostel.dateCreated, "short"),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (hostel) => (
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
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild className="cursor-pointer gap-2">
                <Link to={toRooms(hostel)}>
                  <DoorOpen className="h-4 w-4 text-gray-400" />
                  View Rooms
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer gap-2">
                <Link to={toCreateRoom(hostel)}>
                  <Plus className="h-4 w-4 text-gray-400" />
                  Create Room
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onEdit(hostel)}
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
      data={hostels}
      getRowKey={(hostel) => hostel.id}
      isLoading={isLoading}
      emptyState={
        <EmptyState
          icon={Building2}
          title="No hostels created"
          description="Create your first hostel by choosing Boys or Girls."
          action={{ label: "Create Hostel", onClick: onCreateHostel }}
        />
      }
    />
  )
}
