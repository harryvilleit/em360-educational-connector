import { Building2, Plus } from "lucide-react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllHostels } from "@/hooks/hostel"
import { PageHeader } from "@/components/general/PageHeader"
import { EmptyState } from "@/components/ui/empty-state"
import { DashboardRoutes } from "@/routes"
import { hostelTypeToGender, type HostelGender } from "@/schema/hostelType.schema"
import VisitorsTab from "./components/VisitorsTab"

export default function HostelVisitorsPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const schoolId = useSchoolId()
  const [searchParams] = useSearchParams()
  const gender = (searchParams.get("gender") as HostelGender) || "male"

  const { hostels } = useGetAllHostels({ schoolId, pageSize: 100 })
  const hostel = hostels.find((h) => hostelTypeToGender(h.categoryName) === gender)

  if (!hostel) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Visitors"
          description="all visitors"
        />
        <div className="rounded-2xl border border-gray-100 bg-white">
          <EmptyState
            icon={Building2}
            title="No hostel found"
            description="Set up a hostel type to start tracking visitors."
            action={{
              label: "Set Up Hostel Type",
              icon: Plus,
              onClick: () => navigate(DashboardRoutes.toHostelTypes(p)),
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitors"
        description="All visitors"
      />
      <VisitorsTab hostelId={hostel.id} />
    </div>
  )
}
