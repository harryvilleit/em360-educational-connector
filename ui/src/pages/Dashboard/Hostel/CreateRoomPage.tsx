import { useNavigate, useSearchParams } from "react-router"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllHostels } from "@/hooks/hostel"
import { PageHeader } from "@/components/general/PageHeader"
import { hostelTypeToGender } from "@/schema/hostelType.schema"
import { CreateRoomForm } from "./components/CreateRoomForm"

export default function CreateRoomPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const schoolId = useSchoolId()
  const gender = searchParams.get("gender") === "female" ? "female" : "male"

  const { hostels } = useGetAllHostels({ schoolId, pageSize: 100 })
  const defaultHostel = hostels.find(
    (h) => hostelTypeToGender(h.categoryName) === gender
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Room"
        description="Add a new room to a hostel"
        onBack={() => navigate(-1)}
        backLabel="Back"
      />

      <CreateRoomForm defaultHostelId={defaultHostel?.id} />
    </div>
  )
}
