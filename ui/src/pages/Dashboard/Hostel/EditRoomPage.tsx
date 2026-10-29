import { useParams, useNavigate } from "react-router"
import { Edit2 } from "lucide-react"
import { DashboardRoutes } from "@/routes"
import { PageHeader } from "@/components/general/PageHeader"
import { EditRoomForm } from "./components/EditRoomForm"

export default function EditRoomPage() {
  const navigate = useNavigate()
  const { roomId, productId } = useParams<{
    roomId: string
    productId: string
  }>()
  const p = productId ?? ""

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Room"
        description="Update room information and amenities"
        icon={<Edit2 className="h-5 w-5 text-blue-600" />}
        onBack={() => navigate(DashboardRoutes.toHostelRoomDetail(p, roomId ?? ""))}
        backLabel="Back to Room Details"
      />

      {/* Form — owns all edit logic */}
      <EditRoomForm roomId={roomId ?? ""} />
    </div>
  )
}
