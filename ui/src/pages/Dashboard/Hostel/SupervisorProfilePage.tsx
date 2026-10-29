import { useParams, useNavigate, Link } from "react-router"
import {
  Mail,
  Phone,
  User,
  Building2,
  Calendar,
  BedDouble,
  ShieldAlert,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllHostels, useGetHostelSupervisorProfile } from "@/hooks/hostel"
import { DashboardRoutes } from "@/routes"
import { StatusBadge } from "./components/StatusBadge"
import { PageHeader } from "@/components/general/PageHeader"
import { hostelTypeToGender } from "@/schema/hostelType.schema"
import {
  ProfileHero,
  ProfileNotFound,
  SectionCard,
} from "@/components/general/ProfileSections"

export default function SupervisorProfilePage() {
  const navigate = useNavigate()
  const { productId, supervisorId } = useParams<{
    productId: string
    supervisorId: string
  }>()
  const p = productId ?? ""
  const schoolId = useSchoolId()

  const { hostels } = useGetAllHostels({ schoolId, pageSize: 100 })
  const { supervisor, isLoading } = useGetHostelSupervisorProfile(
    supervisorId ?? ""
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!supervisor) {
    return (
      <ProfileNotFound
        title="Supervisor Not Found"
        message="We couldn't find the supervisor you're looking for. They might have been removed or the link might be incorrect."
        backLabel="Back to Supervisors"
        onBack={() => navigate(DashboardRoutes.toHostelParents(p))}
      />
    )
  }

  const primaryHostelId = supervisor.hostelIds[0]
  const primaryHostel = hostels.find((h) => h.id === primaryHostelId)
  const hostelGender = primaryHostel
    ? hostelTypeToGender(primaryHostel.categoryName)
    : "male"

  const initials = supervisor.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-6">
      <PageHeader
        title={supervisor.fullName}
        onBack={() => navigate(DashboardRoutes.toHostelParents(p))}
        backLabel="Supervisors"
      />

      <ProfileHero
        avatarInitials={initials}
        avatarClassName="bg-purple-600"
        name={supervisor.fullName}
        badge={
          <>
            <StatusBadge variant="purple">{supervisor.role}</StatusBadge>
            <StatusBadge
              variant={
                String(supervisor.status).toLowerCase() === "active"
                  ? "success"
                  : "neutral"
              }
              dot
            >
              {supervisor.status}
            </StatusBadge>
          </>
        }
        meta={
          <>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-gray-400" />
              {supervisor.hostelNames.join(", ")}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-gray-400" />
              {supervisor.phoneNumber}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-gray-400" />
              {supervisor.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              Joined {new Date(supervisor.dateJoined).toLocaleDateString("en-NG")}
            </span>
          </>
        }
        actions={
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Link
              to={
                DashboardRoutes.toHostelAttendance(p) +
                `?hostelId=${primaryHostelId ?? ""}`
              }
            >
              Take Attendance
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assigned Rooms */}
        <SectionCard title="Assigned Rooms" icon={BedDouble} iconBg="bg-blue-50" iconColor="text-blue-500">
          <p className="text-sm text-gray-500">
            {supervisor.assignedRoomsMessage || "No rooms specifically assigned."}
          </p>
        </SectionCard>

        {/* Stats */}
        <SectionCard title="Overview" icon={User} iconBg="bg-green-50" iconColor="text-green-500">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {supervisor.studentsUnderCare}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Students Under Care</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {supervisor.reportsFiled}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Reports Filed</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {supervisor.resolvedReports}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Resolved</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
              <p className="text-2xl font-bold text-red-600">
                {supervisor.openReports}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Open Reports</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Reports */}
      <SectionCard title="Reports" icon={ShieldAlert} iconBg="bg-orange-50" iconColor="text-orange-500">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Damage and incident reports are managed on the hostel's Reports page.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link
              to={DashboardRoutes.toHostelDamage(p) + `?gender=${hostelGender}`}
            >
              View All Reports
            </Link>
          </Button>
        </div>
      </SectionCard>
    </div>
  )
}
