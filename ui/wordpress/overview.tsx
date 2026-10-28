import { useNavigate, useParams } from "react-router"
import {
  Users2,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
  GraduationCap,
} from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { ShortcutCard } from "@/components/general/ShortcutCard"
import { useGetManagementDashboard, useGetMySubUsers } from "@/hooks/userMgt"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import { ModuleAccessSummaryCard } from "@/pages/Dashboard/UserManagement/Component/ModuleAccessSummary"
import { RecentlyAddedUsersCard } from "@/pages/Dashboard/UserManagement/Component/RecentlyAddedUsers"

export default function Overview() {
  const schoolId = useSchoolId(),
    navigate = useNavigate()
  const { productId } = useParams()
  const { canView } = usePermissions()
  const query = useGetManagementDashboard({ schoolId })
  const recent = useGetMySubUsers({ schoolId, pageNumber: 1, pageSize: 5 })
  const stats = query.dashboardData?.SubUserStatistics
  const cards = [
    ["Total Users", stats?.TotalCount, Users2, "blue"],
    ["Active Users", stats?.ActiveCount, UserCheck, "green"],
    ["Inactive Users", stats?.InactiveCount, UserX, "red"],
    ["Pending Users", stats?.PendingCount, Clock, "amber"],
  ] as const
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage your school's users, roles, and access control."
      />
      {query.isLoading ? (
        <p role="status">Loading user statistics…</p>
      ) : query.isError ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
          User statistics could not be loaded. Your current EM360 account
          permissions apply.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map(([label, value, icon, color]) => (
            <StatCard
              key={label}
              label={label}
              value={value ?? 0}
              icon={icon}
              color={color}
            />
          ))}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          [
            "manage",
            "Manage Users",
            "View, create and control user access",
            Users2,
          ],
          [
            "job-roles",
            "Job Roles",
            "Manage roles and menu permissions",
            Briefcase,
          ],
          [
            "academic",
            "Academic Sessions",
            "Manage academic sessions and terms",
            GraduationCap,
          ],
        ].map(
          ([path, title, description, Icon]) =>
            canView("/dashboard/users/" + path) && (
              <ShortcutCard
                key={String(path)}
                title={String(title)}
                description={String(description)}
                icon={<Icon className="size-6 text-blue-600" />}
                iconBg="bg-blue-50"
                borderColor="border-blue-100"
                onClick={() =>
                  navigate("/dashboard/" + productId + "/users/" + path)
                }
              />
            ),
        )}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <RecentlyAddedUsersCard
          recentUsers={recent.subUsers}
          onViewAll={() =>
            navigate("/dashboard/" + productId + "/users/manage")
          }
        />
        <ModuleAccessSummaryCard
          moduleAccessSummary={query.dashboardData?.ModuleAccessSummary ?? []}
        />
      </div>
    </div>
  )
}
