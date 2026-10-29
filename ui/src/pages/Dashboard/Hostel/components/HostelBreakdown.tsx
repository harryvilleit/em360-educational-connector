import { Building2, Plus } from "lucide-react"
import { useNavigate } from "react-router"
import type { HostelItemI } from "@/api/hostel.api/types"
import { DashboardRoutes } from "@/routes"
import { hostelTypeToGender } from "@/schema/hostelType.schema"
import { EmptyState } from "@/components/ui/empty-state"
import { HostelCard } from "./HostelCard"

type OccupancyStats = {
  totalCapacity: number
  occupied: number
  available: number
  percentageUsed: number
}

interface HostelBreakdownProps {
  productId: string
  boysHostel?: HostelItemI
  boysStats: OccupancyStats | null
  girlsHostel?: HostelItemI
  girlsStats: OccupancyStats | null
}

export function HostelBreakdown({
  productId,
  boysHostel,
  boysStats,
  girlsHostel,
  girlsStats,
}: HostelBreakdownProps) {
  const navigate = useNavigate()
  const hasHostels = Boolean(boysHostel) || Boolean(girlsHostel)

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
        Hostel Breakdown
      </h2>
      {hasHostels ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {boysHostel && boysStats && (
            <HostelCard
              hostel={{
                name: boysHostel.name,
                gender: hostelTypeToGender(boysHostel.categoryName),
              }}
              stats={boysStats}
              toRooms={
                DashboardRoutes.toHostelRooms(productId) + "?gender=male"
              }
            />
          )}
          {girlsHostel && girlsStats && (
            <HostelCard
              hostel={{
                name: girlsHostel.name,
                gender: hostelTypeToGender(girlsHostel.categoryName),
              }}
              stats={girlsStats}
              toRooms={
                DashboardRoutes.toHostelRooms(productId) + "?gender=female"
              }
            />
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white">
          <EmptyState
            icon={Building2}
            title="No hostels found"
            description="Set up a hostel type to start managing rooms, beds, and occupancy."
            action={{
              label: "Set Up Hostel Type",
              icon: Plus,
              onClick: () => navigate(DashboardRoutes.toHostelTypes(productId)),
            }}
          />
        </div>
      )}
    </section>
  )
}
