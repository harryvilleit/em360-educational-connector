import { useMemo, useState } from "react"
import { Plus, UserCheck, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllHostels, useGetAllHostelSupervisors } from "@/hooks/hostel"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { hostelTypeToGender } from "@/schema/hostelType.schema"
import { SupervisorTable } from "./components/SupervisorTable"
import { SupervisorModal } from "./components/SupervisorModal"

export default function HostelParentsPage() {
  const schoolId = useSchoolId()
  const [modalOpen, setModalOpen] = useState(false)

  const { hostels } = useGetAllHostels({ schoolId, pageSize: 100 })
  const { supervisors, isLoading } = useGetAllHostelSupervisors({
    schoolId,
    pageSize: 100,
  })

  const hostelGenderById = useMemo(
    () => new Map(hostels.map((h) => [h.id, hostelTypeToGender(h.categoryName)])),
    [hostels]
  )
  const enrichedSupervisors = useMemo(
    () =>
      supervisors.map((sup) => ({
        ...sup,
        hostelGender: hostelGenderById.get(sup.hostelId) ?? ("male" as const),
      })),
    [supervisors, hostelGenderById]
  )

  const activeCount = useMemo(
    () =>
      enrichedSupervisors.filter((s) => String(s.status).toLowerCase() === "active")
        .length,
    [enrichedSupervisors]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Supervisors"
        description="All hostels"
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus className="size-3.5" />
            Assign Supervisor
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Supervisors"
          value={enrichedSupervisors.length}
          icon={UserCog}
          color="blue"
        />
        <StatCard
          label="Active"
          value={activeCount}
          icon={UserCheck}
          color="green"
          valueColor="text-green-600"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <SupervisorTable
          supervisors={enrichedSupervisors}
          hostels={hostels}
          isLoading={isLoading}
        />
      </div>

      <SupervisorModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
