import { useMemo } from "react"
import { BedDouble, DoorOpen, Users } from "lucide-react"
import { useParams } from "react-router"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetAllHostels,
  useGetHostelOverview,
  useGetAllHostelSupervisors,
  useGetAllHostelVisitors,
  useGetAllHostelReports,
} from "@/hooks/hostel"
import { hostelTypeToGender } from "@/schema/hostelType.schema"
import { isReportStatus } from "@/schema/hostelReport.schema"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { HostelQuickActions } from "./components/HostelQuickActions"
import { HostelBreakdown } from "./components/HostelBreakdown"

export default function HostelDashboard() {
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const schoolId = useSchoolId()

  const { hostels } = useGetAllHostels({ schoolId, pageSize: 100 })
  const { overview } = useGetHostelOverview({ schoolId })
  const { supervisors } = useGetAllHostelSupervisors({
    schoolId,
    pageSize: 100,
  })
  const { visitors } = useGetAllHostelVisitors({ pageSize: 100 })
  const { reports } = useGetAllHostelReports({ pageSize: 100 })

  const boysHostel = useMemo(
    () => hostels.find((h) => hostelTypeToGender(h.categoryName) === "male"),
    [hostels]
  )
  const girlsHostel = useMemo(
    () => hostels.find((h) => hostelTypeToGender(h.categoryName) === "female"),
    [hostels]
  )

  const statsFor = (hostelId?: string) => {
    if (!hostelId) return null
    const breakdown = overview?.hostelBreakdowns.find(
      (b) => b.hostelId === hostelId
    )
    if (!breakdown) return null
    return {
      totalCapacity: breakdown.totalBeds,
      occupied: breakdown.occupied,
      available: breakdown.available,
      percentageUsed: breakdown.occupancyRate,
    }
  }

  const boysStats = useMemo(
    () => statsFor(boysHostel?.id),
    [overview, boysHostel]
  )
  const girlsStats = useMemo(
    () => statsFor(girlsHostel?.id),
    [overview, girlsHostel]
  )

  const totalBeds = overview?.overallSummary.totalBeds ?? 0
  const totalOccupied = overview?.overallSummary.occupied ?? 0
  const totalAvailable = overview?.overallSummary.available ?? 0
  const overallPct = Math.round(overview?.overallSummary.occupancyRate ?? 0)

  // NOTE: hostels/supervisors/visitors/reports are fetched with a capped
  // pageSize (100) and aggregated client-side here — fine while counts stay
  // under the cap, but these totals silently undercount beyond it. A real
  // stats endpoint would avoid the cap; flagged, not changed here.
  const totalRooms = useMemo(
    () => hostels.reduce((s, h) => s + h.roomCount, 0),
    [hostels]
  )
  const totalParents = useMemo(
    () =>
      supervisors.filter((s) => String(s.status).toLowerCase() === "active")
        .length,
    [supervisors]
  )
  const onSiteVisitors = useMemo(
    () =>
      visitors.filter((v) => v.actualCheckInTime && !v.actualCheckOutTime)
        .length,
    [visitors]
  )
  const openDamage = useMemo(
    () => reports.filter((r) => !isReportStatus(r.status, "Waived")).length,
    [reports]
  )

  return (
    <div className="space-y-8">
      <PageHeader title="Hostel Management" description="Manage your hostels" />

     
      <section>
        <h2 className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Overall Summary
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Total Beds"
            value={totalBeds}
            icon={BedDouble}
            color="blue"
          />
          <StatCard
            label="Occupied"
            value={totalOccupied}
            icon={Users}
            color="purple"
            valueColor="text-purple-700"
            meta={`${overallPct}% occupancy rate`}
          />
          <StatCard
            label="Available"
            value={totalAvailable}
            icon={DoorOpen}
            color="green"
            valueColor="text-green-600"
            meta="Beds ready to assign"
          />
        </div>
      </section>

      <HostelQuickActions
        productId={p}
        totalRooms={totalRooms}
        totalAvailable={totalAvailable}
        totalParents={totalParents}
        onSiteVisitors={onSiteVisitors}
        openDamage={openDamage}
      />

      <HostelBreakdown
        productId={p}
        boysHostel={boysHostel}
        boysStats={boysStats}
        girlsHostel={girlsHostel}
        girlsStats={girlsStats}
      />
    </div>
  )
}
