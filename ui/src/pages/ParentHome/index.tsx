import { useNavigate } from "react-router"
import {
  Wallet,
  CalendarDays,
  Bell,
  DoorOpen,
  Users,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  FileText,
} from "lucide-react"
import { StatCard } from "@/components/general/StatCard"
import { dashboardCardSurface } from "@/components/general/StatCard"
import { useAuthStore } from "@/store/auth.store"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGuardianPortal } from "@/contexts/GuardianPortalContext"
import { HomeRoutes } from "@/routes"
import { DemoDataBanner } from "@/components/general/DemoDataBanner"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

const SHORTCUTS = [
  {
    label: "School Fees",
    description: "View invoices and payment history",
    icon: Wallet,
    color: "bg-amber-50 text-amber-600",
    to: HomeRoutes.toParentFees,
  },
  {
    label: "Timetable",
    description: "See your child's class schedule",
    icon: CalendarDays,
    color: "bg-blue-50 text-blue-600",
    to: HomeRoutes.toParentTimetable,
  },
  {
    label: "Results",
    description: "Check term results and performance",
    icon: GraduationCap,
    color: "bg-emerald-50 text-emerald-600",
    to: HomeRoutes.toParentResults,
  },
  {
    label: "Messages",
    description: "Chat with staff and school admin",
    icon: MessageSquare,
    color: "bg-indigo-50 text-indigo-600",
    to: HomeRoutes.toParentMessages,
  },
  {
    label: "Notifications",
    description: "Announcements and consent requests",
    icon: Bell,
    color: "bg-purple-50 text-purple-600",
    to: HomeRoutes.toParentNotifications,
  },
  {
    label: "Visitation",
    description: "Request or review a school visit",
    icon: DoorOpen,
    color: "bg-orange-50 text-orange-600",
    to: HomeRoutes.toParentVisitation,
  },
  {
    label: "Consent",
    description: "Respond to consent requests",
    icon: ShieldCheck,
    color: "bg-rose-50 text-rose-600",
    to: HomeRoutes.toParentConsent,
  },
  {
    label: "Transcript Requests",
    description: "Request an official transcript",
    icon: FileText,
    color: "bg-cyan-50 text-cyan-600",
    to: HomeRoutes.toParentTranscript,
  },
] as const

export default function ParentHomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const schoolId = useSchoolId()
  const { formatMoney } = useSchoolMoney()

  const { isLinked, isLoading: guardianLoading, portal } = useGuardianPortal()

  const childrenCount = portal?.myChildrenCount ?? 0
  const pendingFees = portal?.totalPendingFees
  const upcomingVisits = portal?.upcomingVisitsCount ?? 0
  const unreadNotifications = portal?.unreadNotificationsCount ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening with your children.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="My Children"
          value={childrenCount}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Pending Fees"
          value={formatMoney(pendingFees ?? 0)}
          icon={Wallet}
          color="amber"
        />
        <StatCard
          label="Upcoming Visits"
          value={upcomingVisits}
          icon={DoorOpen}
          color="orange"
        />
        <StatCard
          label="Unread Notifications"
          value={unreadNotifications}
          icon={Bell}
          color="purple"
        />
      </div>

      {!guardianLoading && !isLinked && (
        <DemoDataBanner message="Showing demo data — your account isn't linked to a guardian record at this school yet." />
      )}

      <section>
        <h2 className="mb-4 text-sm font-medium tracking-wider text-gray-500 uppercase">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SHORTCUTS.map((s) => (
            <button
              key={s.label}
              onClick={() => navigate(s.to(schoolId))}
              className={`flex items-start gap-4 p-5 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/30 ${dashboardCardSurface}`}
            >
              <div className={`shrink-0 rounded-lg p-2.5 ${s.color}`}>
                <s.icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{s.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                  {s.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
