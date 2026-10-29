import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Edit2, Eye, MoreVertical, Search, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { FilterSelect } from "@/components/ui/filter-select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllHostels, useGetAllHostelRooms } from "@/hooks/hostel"
import { DashboardRoutes } from "@/routes"
import {
  hostelTypeLabel,
  hostelTypeToGender,
  type HostelGender,
} from "@/schema/hostelType.schema"
import type { HostelRoomItemI } from "@/api/hostel.api/types"
import { StatusBadge } from "./StatusBadge"

interface Props {
  filterHostelId?: string
  onAssign?: (roomId: string, hostelId: string, gender: HostelGender) => void
}

export function RoomTable({ filterHostelId, onAssign }: Props) {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const schoolId = useSchoolId()

  const { hostels } = useGetAllHostels({ schoolId, pageSize: 100 })
  const { rooms, isLoading } = useGetAllHostelRooms({
    schoolId,
    pageSize: 200,
  })

  const [search, setSearch] = useState("")
  const [hostelFilter, setHostelFilter] = useState<string>(
    filterHostelId ?? "all"
  )

  const filtered = useMemo(
    () =>
      rooms.filter((r) => {
        if (hostelFilter !== "all" && r.hostelId !== hostelFilter) return false
        if (search.trim()) {
          const q = search.toLowerCase()
          return (
            r.roomNumber.toLowerCase().includes(q) ||
            r.roomName.toLowerCase().includes(q) ||
            r.hostelName.toLowerCase().includes(q) ||
            (r.floor?.toLowerCase().includes(q) ?? false)
          )
        }
        return true
      }),
    [rooms, hostelFilter, search]
  )

  const goToDetail = (roomId: string) => {
    navigate(DashboardRoutes.toHostelRoomDetail(p, roomId))
  }

  if (!isLoading && hostels.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No hostels found"
        description="Create a hostel first before adding rooms."
      />
    )
  }

  const columns: DataTableColumn<HostelRoomItemI>[] = [
    {
      key: "room",
      header: "Room",
      render: (room) => (
        <>
          <p className="font-semibold text-gray-900">{room.roomNumber}</p>
          {room.roomName && (
            <p className="text-xs text-gray-400">{room.roomName}</p>
          )}
        </>
      ),
    },
    {
      key: "hostelType",
      header: "Hostel Type",
      render: (room) => {
        const isBoys = hostelTypeToGender(room.hostelType) === "male"
        return (
          <StatusBadge variant={isBoys ? "info" : "purple"} dot>
            {hostelTypeLabel(room.hostelType)}
          </StatusBadge>
        )
      },
    },
    {
      key: "floor",
      header: "Floor",
      cellClassName: "text-xs",
      render: (room) => room.floor || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (room) => {
        const available = room.totalBeds - room.occupiedBeds
        if (room.totalBeds === 0) {
          return (
            <StatusBadge variant="neutral" dot>
              No beds set up
            </StatusBadge>
          )
        }
        return (
          <StatusBadge
            variant={
              available === 0
                ? "danger"
                : available <= 1
                  ? "warning"
                  : "success"
            }
            dot
          >
            {available === 0
              ? "Full"
              : available <= 1
                ? "Almost Full"
                : "Available"}
          </StatusBadge>
        )
      },
    },
    {
      key: "actions",
      header: "",
      render: (room) => (
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
              <DropdownMenuItem
                onClick={() => goToDetail(room.id)}
                className="cursor-pointer gap-2"
              >
                <Eye className="h-4 w-4 text-gray-400" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigate(DashboardRoutes.toHostelRoomEdit(p, room.id))
                }
                className="cursor-pointer gap-2"
              >
                <Edit2 className="h-4 w-4 text-gray-400" />
                Edit Room
              </DropdownMenuItem>
              {room.totalBeds - room.occupiedBeds > 0 && onAssign && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      onAssign(
                        room.id,
                        room.hostelId,
                        hostelTypeToGender(room.hostelType)
                      )
                    }
                    className="cursor-pointer gap-2"
                  >
                    <UserPlus className="h-4 w-4 text-gray-400" />
                    Assign Student
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Search rooms, hostel, floor…"
          value={search}
          onChange={setSearch}
        />

        {!filterHostelId && (
          <FilterSelect
            value={hostelFilter}
            onChange={setHostelFilter}
            options={[
              { value: "all", label: "All Hostels" },
              ...hostels.map((h) => ({ value: h.id, label: h.name })),
            ]}
            placeholder="All Hostels"
            triggerClassName="w-45"
          />
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        getRowKey={(room) => room.id}
        isLoading={isLoading}
        onRowClick={(room) => goToDetail(room.id)}
        rowClassName={() => "hover:bg-blue-50/40"}
        emptyState={
          <EmptyState
            icon={Search}
            title={
              rooms.length === 0
                ? "No rooms created yet"
                : "No rooms match your search"
            }
            description={
              rooms.length === 0
                ? "Create your first room to get started."
                : "Try adjusting your search or filter."
            }
            action={
              rooms.length === 0
                ? {
                    label: "Create Room",
                    onClick: () =>
                      navigate(DashboardRoutes.toHostelCreateRoom(p)),
                  }
                : undefined
            }
          />
        }
      />
    </div>
  )
}
