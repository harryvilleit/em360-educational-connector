import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { BedDouble, DoorOpen, LayoutGrid, Plus, Upload, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllHostels, useGetAllHostelRooms } from "@/hooks/hostel"
import { DashboardRoutes } from "@/routes"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { hostelTypeToGender, type HostelGender } from "@/schema/hostelType.schema"
import { RoomTable } from "./components/RoomTable"
import AssignmentModal from "./components/AssignmentModal"
import BulkUploadModal from "./components/BulkModal"

export default function HostelRoomsPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const schoolId = useSchoolId()

  const { hostels } = useGetAllHostels({ schoolId, pageSize: 100 })
  const { rooms } = useGetAllHostelRooms({ schoolId, pageSize: 200 })

  const [assignOpen, setAssignOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [assignContext, setAssignContext] = useState<{
    hostelId: string
    gender: HostelGender
    roomId?: string
  } | null>(null)

  const totalRooms = rooms.length
  const totalBeds = useMemo(
    () => rooms.reduce((s, r) => s + r.totalBeds, 0),
    [rooms]
  )
  const totalOccupied = useMemo(
    () => rooms.reduce((s, r) => s + r.occupiedBeds, 0),
    [rooms]
  )
  const totalAvailable = totalBeds - totalOccupied

  const handleAssign = (
    roomId: string,
    hostelId: string,
    gender: HostelGender
  ) => {
    setAssignContext({ hostelId, gender, roomId })
    setAssignOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rooms"
        description="All rooms across all hostels"
        actions={
          <>
            <Button
              variant="primary"
              onClick={() => navigate(DashboardRoutes.toHostelCreateRoom(p))}
            >
              <Plus className="size-3.5" />
              Create Room
            </Button>
            <Button
              onClick={() => setBulkOpen(true)}
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Rooms" value={totalRooms} icon={LayoutGrid} color="blue" />
        <StatCard label="Total Beds" value={totalBeds} icon={BedDouble} color="indigo" />
        <StatCard
          label="Occupied"
          value={totalOccupied}
          icon={Users}
          color="purple"
          valueColor="text-purple-700"
        />
        <StatCard
          label="Available"
          value={totalAvailable}
          icon={DoorOpen}
          color="green"
          valueColor="text-green-600"
        />
      </div>

      <RoomTable onAssign={handleAssign} />

      {assignContext && (
        <AssignmentModal
          hostelId={assignContext.hostelId}
          gender={assignContext.gender}
          open={assignOpen}
          onOpenChange={(v) => {
            setAssignOpen(v)
            if (!v) setAssignContext(null)
          }}
          preselectedRoomId={assignContext.roomId}
        />
      )}

      {hostels[0] && (
        <BulkUploadModal
          hostelId={hostels[0].id}
          gender={hostelTypeToGender(hostels[0].categoryName)}
          open={bulkOpen}
          onOpenChange={setBulkOpen}
        />
      )}
    </div>
  )
}
