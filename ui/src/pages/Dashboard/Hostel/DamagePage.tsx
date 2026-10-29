import {
  AlertTriangle,
  Building2,
  ClipboardList,
  DollarSign,
  Plus,
} from "lucide-react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllHostels } from "@/hooks/hostel"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { EmptyState } from "@/components/ui/empty-state"
import { DashboardRoutes } from "@/routes"
import { hostelTypeToGender, type HostelGender } from "@/schema/hostelType.schema"
import DamageTab from "./components/DamageTab"

export default function HostelDamagePage() {
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
          title="Reports"
          description="No hostel found"
         
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Total Reports"
            value={0}
            icon={ClipboardList}
            color="gray"
            valueColor="text-gray-900"
          />
          <StatCard
            label="Property Damage"
            value={0}
            icon={DollarSign}
            color="red"
            valueColor="text-red-600"
          />
          <StatCard
            label="Incidents"
            value={0}
            icon={AlertTriangle}
            color="orange"
            valueColor="text-orange-600"
          />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white">
          <EmptyState
            icon={Building2}
            title="No hostel found"
            description="Set up a hostel type to start filing damage and incident reports."
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
        title="Reports"
        icon={<ClipboardList className="h-5 w-5 text-orange-600" />}
        iconBg="bg-orange-50"
        description={hostel.name}
        onBack={() => navigate(DashboardRoutes.toHostel(p))}
      />
      <DamageTab hostelId={hostel.id} />
    </div>
  )
}
