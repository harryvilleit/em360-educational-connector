import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { BedDouble, DoorOpen, Plus, Users } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { FilterSelect } from "@/components/ui/filter-select"
import { Button } from "@/components/ui/button"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllHostels, useGetAllBedSpaces } from "@/hooks/hostel"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { DashboardRoutes } from "@/routes"
import { isBedSpaceOccupied } from "@/schema/bedSpace.schema"
import { BedSpaceTable } from "./components/BedSpaceTable"
import { BedSpaceModal } from "./components/BedSpaceModal"

type StatusFilter = "all" | "available" | "occupied"

export default function BedSpacePage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const schoolId = useSchoolId()

  const { hostels } = useGetAllHostels({ schoolId, pageSize: 100 })
  const { bedSpaces, isLoading } = useGetAllBedSpaces({
    schoolId,
    pageSize: 500,
  })

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [hostelFilter, setHostelFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)

  const availableCount = useMemo(
    () => bedSpaces.filter((b) => !isBedSpaceOccupied(b.status)).length,
    [bedSpaces]
  )
  const occupiedCount = useMemo(
    () => bedSpaces.filter((b) => isBedSpaceOccupied(b.status)).length,
    [bedSpaces]
  )

  const filtered = useMemo(
    () =>
      bedSpaces.filter((b) => {
        if (hostelFilter !== "all" && b.hostelName !== hostelFilter) return false
        const occupied = isBedSpaceOccupied(b.status)
        if (statusFilter === "available" && occupied) return false
        if (statusFilter === "occupied" && !occupied) return false

        if (search.trim()) {
          const q = search.toLowerCase()
          const matchesRoom = b.roomNumber?.toLowerCase().includes(q) ?? false
          const matchesLabel = b.bedLabel.toLowerCase().includes(q)
          const matchesStudent = b.studentName?.toLowerCase().includes(q) ?? false
          if (!matchesRoom && !matchesLabel && !matchesStudent) return false
        }

        return true
      }),
    [bedSpaces, hostelFilter, statusFilter, search]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bed Spaces"
        description="All hostels"
        actions={
          <Button variant="primary"  onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            Create Bed Space
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Beds"
          value={bedSpaces.length}
          icon={BedDouble}
          color="blue"
        />
        <StatCard
          label="Occupied"
          value={occupiedCount}
          icon={Users}
          color="purple"
          valueColor="text-purple-700"
        />
        <StatCard
          label="Available"
          value={availableCount}
          icon={DoorOpen}
          color="green"
          valueColor="text-green-600"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Search bed, room or student…"
          value={search}
          onChange={setSearch}
        />

        {hostels.length > 1 && (
          <FilterSelect
            value={hostelFilter}
            onChange={setHostelFilter}
            options={[
              { value: "all", label: "All Hostels" },
              ...hostels.map((h) => ({ value: h.name, label: h.name })),
            ]}
            placeholder="All Hostels"
            triggerClassName="w-45"
          />
        )}

        <FilterSelect
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
          options={[
            { value: "all", label: "All Beds" },
            { value: "available", label: "Available" },
            { value: "occupied", label: "Occupied" },
          ]}
          triggerClassName="w-40"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white ">
        <BedSpaceTable
          bedSpaces={filtered}
          isLoading={isLoading}
          emptyDescription={
            bedSpaces.length === 0
              ? "Create rooms first, then add bed spaces here."
              : "No bed spaces match your current filter."
          }
          onCreateBedSpace={bedSpaces.length === 0 ? () => setCreateOpen(true) : undefined}
        />
      </div>

      <BedSpaceModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
