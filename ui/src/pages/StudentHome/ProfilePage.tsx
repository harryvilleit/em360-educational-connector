import { useNavigate } from "react-router"
import {
  Mail,
  Phone,
  MapPin,
  Users,
  ChevronRight,
  Cake,
  Droplet,
} from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import {
  SectionCard,
  InfoRow,
  ProfileHero,
  ProfileSkeleton,
} from "@/components/general/ProfileSections"
import { StudentNotLinked } from "@/components/general/StudentNotLinked"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useCurrentStudentId } from "@/hooks/useCurrentStudentId"
import { useResolvedStudent } from "@/hooks/useResolvedStudent"
import { initialsOfName } from "@/utils/guardianAdapter"
import { HomeRoutes } from "@/routes"
import { Badge } from "@/components/ui/badge"
import { ChangeStudentEmailModal } from "./components/ChangeStudentEmailModal"

export default function StudentProfilePage() {
  const navigate = useNavigate()
  const schoolId = useSchoolId()

  const {
    studentId,
    isLinked,
    isLoading: idLoading,
  } = useCurrentStudentId(schoolId)
  const { student, isLoading: studentLoading } = useResolvedStudent(
    studentId,
    schoolId
  )
  const isLoading = idLoading || studentLoading

  if (isLoading) return <ProfileSkeleton />

  if (!isLinked) return <StudentNotLinked />

  if (!student) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        We couldn't load your profile.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        onBack={() => navigate(HomeRoutes.toStudentHome(schoolId))}
        backLabel="Back to Overview"
      />

      <ProfileHero
        avatarInitials={student.avatarInitials}
        name={student.name}
        subtitle={student.class}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5">
          <SectionCard title="Contact Info">
            <ul className="space-y-3">
              {student.phone && (
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={student.phone}
                />
              )}
              {student.email && (
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium break-all text-gray-700">
                      {student.email}
                    </p>
                    {student.isDefaultEmail === true && (
                      <Badge
                        variant="outline"
                        className="mt-1 border-gray-200 text-gray-500"
                      >
                        Default Email
                      </Badge>
                    )}
                    {isLinked && (
                      <div>
                        <ChangeStudentEmailModal
                          key={student.id}
                          studentId={student.id}
                          schoolId={schoolId}
                          currentEmail={student.email}
                        />
                      </div>
                    )}
                  </div>
                </li>
              )}
              {student.address && (
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Address"
                  value={student.address}
                />
              )}
            </ul>
          </SectionCard>

          <SectionCard title="Personal Information">
            <ul className="space-y-3">
              {student.dob && (
                <InfoRow
                  icon={<Cake className="h-4 w-4" />}
                  label="Date of Birth"
                  value={new Date(student.dob).toLocaleDateString()}
                />
              )}
              {student.gender && (
                <InfoRow
                  icon={<Users className="h-4 w-4" />}
                  label="Gender"
                  value={student.gender}
                />
              )}
              {student.bloodGroup && (
                <InfoRow
                  icon={<Droplet className="h-4 w-4" />}
                  label="Blood Group"
                  value={student.bloodGroup}
                />
              )}
              {student.studentGivenId && (
                <InfoRow
                  icon={<Users className="h-4 w-4" />}
                  label="Student ID"
                  value={student.studentGivenId}
                />
              )}
            </ul>
          </SectionCard>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <SectionCard
            title="My Guardians"
            description="Guardians linked to your account"
          >
            {student.guardians.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-400">No guardians linked yet</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {student.guardians.map((guardian) => (
                  <li
                    key={guardian.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-[11px] font-semibold text-cyan-700">
                        {initialsOfName(guardian.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {guardian.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {guardian.relationship}
                          {guardian.phone && ` · ${guardian.phone}`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
