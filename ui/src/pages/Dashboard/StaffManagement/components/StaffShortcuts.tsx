import { useNavigate } from "react-router"
import {
  CalendarCheck2,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  Wallet,
} from "lucide-react"
import { ShortcutCard } from "@/components/general/ShortcutCard"
import { usePermissions } from "@/hooks/usePermissions"
import { DashboardRoutes } from "@/routes"

export function StaffShortcuts({
  productId,
  pendingLeave,
}: {
  productId: string
  pendingLeave: number
}) {
  const navigate = useNavigate()
  const { canView } = usePermissions()

  const shortcuts = [
    {
      title: "Staff List",
      description: "Browse, search and manage staff records",
      icon: <UsersRound className="size-5 text-blue-600" />,
      iconBg: "bg-blue-50",
      borderColor: "border-gray-100 hover:border-blue-200",
      path: DashboardRoutes.toStaffList(productId),
    },
    {
      title: "Roles",
      description: "See the roles and permissions assigned to you",
      icon: <ShieldCheck className="size-5 text-indigo-600" />,
      iconBg: "bg-indigo-50",
      borderColor: "border-gray-100 hover:border-indigo-200",
      path: DashboardRoutes.toStaffRoles(productId),
    },
    {
      title: "My Leave",
      description: "Check your balances and apply for leave",
      icon: <CalendarDays className="size-5 text-blue-600" />,
      iconBg: "bg-blue-50",
      borderColor: "border-gray-100 hover:border-blue-200",
      path: DashboardRoutes.toStaffMyLeave(productId),
    },
    {
      title: "Leave Management",
      description: "Review and approve staff leave requests",
      icon: <CalendarCheck2 className="size-5 text-amber-600" />,
      iconBg: "bg-amber-50",
      borderColor: "border-gray-100 hover:border-amber-200",
      path: DashboardRoutes.toStaffLeave(productId),
      badge: pendingLeave > 0 ? `${pendingLeave} pending` : undefined,
      badgeColor: "bg-amber-100 text-amber-700",
    },
    {
      title: "Payroll",
      description: "Salaries, deductions and payment runs",
      icon: <Wallet className="size-5 text-emerald-600" />,
      iconBg: "bg-emerald-50",
      borderColor: "border-gray-100 hover:border-emerald-200",
      path: DashboardRoutes.toStaffPayroll(productId),
    },
    {
      title: "Performance",
      description: "Appraisals, goals and performance tracking",
      icon: <TrendingUp className="size-5 text-purple-600" />,
      iconBg: "bg-purple-50",
      borderColor: "border-gray-100 hover:border-purple-200",
      path: DashboardRoutes.toStaffPerformance(productId),
    },
  ].filter((s) => canView(s.path))

  if (shortcuts.length === 0) return null

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {shortcuts.map((s) => (
          <ShortcutCard
            key={s.title}
            title={s.title}
            description={s.description}
            icon={s.icon}
            iconBg={s.iconBg}
            borderColor={s.borderColor}
            badge={s.badge}
            badgeColor={s.badgeColor}
            onClick={() => navigate(s.path)}
          />
        ))}
      </div>
    </section>
  )
}
