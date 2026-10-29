import { usePermissions } from "@/hooks/usePermissions"
import { parentMenuForRoute } from "@/utils/parentManagement"
import { managementRouteAvailable } from "@/lib/management-route"
import { useNavigate } from "react-router"
import {
  ChevronRight,
  FileText,
  CalendarCheck2,
  Wallet,
  CalendarDays,
  CalendarRange,
  ShieldCheck,
  DoorOpen,
  Activity,
  Building2,
  GraduationCap,
} from "lucide-react"
import { DashboardRoutes } from "@/routes"

const QUICK_LINKS = [
  {
    label: "Result Record",
    icon: FileText,
    to: DashboardRoutes.toParentResults,
  },
  {
    label: "Attendance",
    icon: CalendarCheck2,
    to: DashboardRoutes.toParentAttendance,
  },
  { label: "School Fees", icon: Wallet, to: DashboardRoutes.toParentFees },
  {
    label: "Timetable & Calendar",
    icon: CalendarDays,
    to: DashboardRoutes.toParentTimetable,
  },
  {
    label: "School Calendar",
    icon: CalendarRange,
    to: DashboardRoutes.toParentCalendar,
  },
  {
    label: "Consent",
    icon: ShieldCheck,
    to: DashboardRoutes.toParentNotificationsDetail,
  },
  {
    label: "Request Visit",
    icon: DoorOpen,
    to: DashboardRoutes.toParentVisitation,
  },
  {
    label: "View Health",
    icon: Activity,
    to: (productId: string) => `/dashboard/${productId}/health-records`,
  },
  { label: "Hostel Record", icon: Building2, to: DashboardRoutes.toHostel },
  {
    label: "Request Transcript",
    icon: GraduationCap,
    to: DashboardRoutes.toParentTranscript,
  },
]

export function QuickLinks({
  productId,
  parentId,
}: {
  productId: string
  parentId: string
}) {
  const navigate = useNavigate(),
    permissions = usePermissions()

  return (
    <div className="flex flex-col gap-2">
      {QUICK_LINKS.filter(
        (x) =>
          managementRouteAvailable(x.to(productId, parentId)) &&
          permissions.canView(parentMenuForRoute(x.to(productId, parentId)))
      ).map(({ label, icon: Icon, to }) => (
        <button
          key={label}
          onClick={() => navigate(to(productId, parentId))}
          className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50"
        >
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
            {label}
          </span>
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
        </button>
      ))}
    </div>
  )
}
