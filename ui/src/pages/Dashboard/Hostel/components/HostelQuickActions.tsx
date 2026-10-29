import {
  Activity,
  Building2,
  CalendarCheck2,
  ClipboardList,
  DoorOpen,
  LayoutGrid,
  Layers,
  LogOut,
  Plus,
  UserCog,
  Wrench,
} from "lucide-react"
import { useNavigate } from "react-router"
import { DashboardRoutes } from "@/routes"
import { ShortcutCard } from "@/components/general/ShortcutCard"

interface HostelQuickActionsProps {
  productId: string
  totalRooms: number
  totalAvailable: number
  totalParents: number
  onSiteVisitors: number
  openDamage: number
}

export function HostelQuickActions({
  productId,
  totalRooms,
  totalAvailable,
  totalParents,
  onSiteVisitors,
  openDamage,
}: HostelQuickActionsProps) {
  const navigate = useNavigate()

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ShortcutCard
          onClick={() => navigate(DashboardRoutes.toHostelRooms(productId))}
          iconBg="bg-blue-50 group-hover:bg-blue-100"
          icon={<DoorOpen className="size-6 text-blue-600" />}
          borderColor="border-blue-100"
          title="Rooms"
          description={`${totalRooms} total · ${totalAvailable} beds free`}
        />
        <ShortcutCard
          onClick={() =>
            navigate(DashboardRoutes.toHostelCreateRoom(productId))
          }
          iconBg="bg-emerald-50 group-hover:bg-emerald-100"
          icon={<Plus className="size-6 text-emerald-600" />}
          borderColor="border-emerald-100"
          title="Create Room"
          description="Add a new room with bed spaces"
        />
        <ShortcutCard
          onClick={() => navigate(DashboardRoutes.toHostelTypes(productId))}
          iconBg="bg-purple-50 group-hover:bg-purple-100"
          icon={<Building2 className="size-6 text-purple-600" />}
          borderColor="border-purple-100"
          title="Hostel Types"
          description="Manage accommodation categories"
        />
        <ShortcutCard
          onClick={() => navigate(DashboardRoutes.toHostelFloors(productId))}
          iconBg="bg-amber-50 group-hover:bg-amber-100"
          icon={<Layers className="size-6 text-amber-600" />}
          borderColor="border-amber-100"
          title="Floors"
          description="Manage floors used for rooms"
        />
        <ShortcutCard
          onClick={() =>
            navigate(DashboardRoutes.toHostelBedSpaces(productId))
          }
          iconBg="bg-cyan-50 group-hover:bg-cyan-100"
          icon={<LayoutGrid className="size-6 text-cyan-600" />}
          borderColor="border-cyan-100"
          title="Bed Spaces"
          description="View all bed allocations"
        />
        <ShortcutCard
          onClick={() => navigate(DashboardRoutes.toHostelParents(productId))}
          iconBg="bg-violet-50 group-hover:bg-violet-100"
          icon={<UserCog className="size-6 text-violet-600" />}
          borderColor="border-violet-100"
          title="Hostel Parents"
          description={`${totalParents} active staff`}
        />
        <ShortcutCard
          onClick={() =>
            navigate(DashboardRoutes.toHostelVisitors(productId))
          }
          iconBg="bg-orange-50 group-hover:bg-orange-100"
          icon={<ClipboardList className="size-6 text-orange-600" />}
          borderColor="border-orange-100"
          title="Visitors"
          description="Track visitor sign-in and sign-out"
          badge={onSiteVisitors > 0 ? `${onSiteVisitors} on-site` : undefined}
          badgeColor="bg-orange-100 text-orange-700"
        />
        <ShortcutCard
          onClick={() => navigate(DashboardRoutes.toHostelDamage(productId))}
          iconBg="bg-red-50 group-hover:bg-red-100"
          icon={<Wrench className="size-6 text-red-600" />}
          borderColor="border-red-100"
          title="Damage Reports"
          description="Maintenance and damage tracking"
          badge={openDamage > 0 ? `${openDamage} open` : undefined}
          badgeColor="bg-red-100 text-red-700"
        />
        <ShortcutCard
          onClick={() =>
            navigate(DashboardRoutes.toHostelMovement(productId))
          }
          iconBg="bg-indigo-50 group-hover:bg-indigo-100"
          icon={<LogOut className="size-6 text-indigo-600" />}
          borderColor="border-indigo-100"
          title="Sign In / Out"
          description="Student movement log"
        />
        <ShortcutCard
          onClick={() =>
            navigate(DashboardRoutes.toHostelAttendance(productId))
          }
          iconBg="bg-teal-50 group-hover:bg-teal-100"
          icon={<CalendarCheck2 className="size-6 text-teal-600" />}
          borderColor="border-teal-100"
          title="Attendance"
          description="Daily hostel attendance records"
        />
        <ShortcutCard
          onClick={() =>
            navigate(DashboardRoutes.toHostelHealthRecords(productId))
          }
          iconBg="bg-rose-50 group-hover:bg-rose-100"
          icon={<Activity className="size-6 text-rose-600" />}
          borderColor="border-rose-100"
          title="Health Records"
          description="Medical records and sick bay log"
        />
      </div>
    </section>
  )
}
