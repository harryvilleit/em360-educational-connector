import { usePermissions } from "@/hooks/usePermissions"
import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { useNavigate, useParams } from "react-router"
import {
  Plus,
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  Search,
  Upload,
} from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetStudentDashboardOverview } from "@/hooks/studentPortal"
import { DashboardRoutes } from "@/routes"
import { SuspendedAlert } from "./components/SuspendedAlert"
import { StatCard } from "@/components/general/StatCard"
import { PageHeader } from "@/components/general/PageHeader"
import { ShortcutCard } from "@/components/general/ShortcutCard"
import { EnrollmentChartsRow } from "./components/EnrollmentChartsRow"

export default function StudentListPage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const schoolId = useSchoolId()
  const { canView, canCreate } = usePermissions()
  const { overview, isLoading, isError, refetch } =
    useGetStudentDashboardOverview(schoolId)

  if (isLoading)
    return (
      <p role="status" className="p-8">
        Loading student overview…
      </p>
    )
  if (isError)
    return (
      <QueryErrorPanel
        title="Unable to load overview"
        message="Student statistics are unavailable. Please retry."
        onRetry={() => void refetch()}
      />
    )

  const stats = {
    total: overview?.totalStudents ?? 0,
    active: overview?.activeStudents ?? 0,
    suspended: overview?.suspendedStudents ?? 0,
    graduated: overview?.graduatedStudents ?? 0,
    withdrawn: overview?.withdrawnStudents ?? 0,
    male: overview?.maleStudents ?? 0,
    female: overview?.femaleStudents ?? 0,
  }

  const statusSegments = [
    { value: stats.active, color: "#22c55e", label: "Active" },
    { value: stats.graduated, color: "#3b82f6", label: "Graduated" },
    { value: stats.withdrawn, color: "#94a3b8", label: "Withdrawn" },
    { value: stats.suspended, color: "#ef4444", label: "Suspended" },
  ]

  const genderSegments = [
    { value: stats.male, color: "#3b82f6", label: "Male" },
    { value: stats.female, color: "#ec4899", label: "Female" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage student records, enrollment, and academic progress."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Students"
          value={stats.total}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={UserCheck}
          color="emerald"
          meta={
            stats.total
              ? `${Math.round((stats.active / stats.total) * 100)}% of total`
              : undefined
          }
          metaType="up"
        />
        <StatCard
          label="Suspended"
          value={stats.suspended}
          icon={UserX}
          color="red"
          metaType={stats.suspended > 0 ? "down" : "neutral"}
        />
        <StatCard
          label="Graduated"
          value={stats.graduated}
          icon={GraduationCap}
          color="indigo"
          meta={`${stats.withdrawn} withdrawn`}
        />
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Quick Actions
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {canCreate("/dashboard/students/add") && (
            <ShortcutCard
              icon={<Plus className="size-6 text-blue-600" />}
              iconBg="bg-blue-50 group-hover:bg-blue-100"
              borderColor="border-gray-100"
              title="Student Record"
              description="Register a student record"
              onClick={() => navigate(DashboardRoutes.toStudentAdd(productId!))}
            />
          )}
          {canCreate("/dashboard/students/import") && (
            <ShortcutCard
              icon={<Upload className="size-6 text-cyan-600" />}
              iconBg="bg-cyan-50 group-hover:bg-cyan-100"
              borderColor="border-gray-100"
              title="Import Students"
              description="Bulk upload via CSV"
              onClick={() =>
                navigate(DashboardRoutes.toStudentImport(productId!))
              }
            />
          )}
          {canView("/dashboard/students/list") && (
            <ShortcutCard
              icon={<Search className="size-6 text-violet-600" />}
              iconBg="bg-violet-50 group-hover:bg-violet-100"
              borderColor="border-gray-100"
              title="Search Students"
              description="Find by name or ID"
              onClick={() =>
                navigate(DashboardRoutes.toStudentList(productId!), {
                  state: { focusSearch: true },
                })
              }
            />
          )}
        </div>
      </div>

      <EnrollmentChartsRow
        statusSegments={statusSegments}
        genderSegments={genderSegments}
        total={stats.total}
        male={stats.male}
        female={stats.female}
      />

      <SuspendedAlert
        count={stats.suspended}
        onView={() =>
          navigate(DashboardRoutes.toStudentList(productId!), {
            state: { status: "Suspended" },
          })
        }
      />
    </div>
  )
}
