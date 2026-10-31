import { useNavigate } from "react-router"
import { Mail, Phone, MapPin, Users, ChevronRight, Briefcase } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import {
  SectionCard,
  InfoRow,
  ProfileHero,
  ProfileSkeleton,
} from "@/components/general/ProfileSections"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGuardianPortal } from "@/contexts/GuardianPortalContext"
import { useGetGuardianDetails } from "@/hooks/guardian"
import { initialsOfName } from "@/utils/guardianAdapter"
import { HomeRoutes } from "@/routes"

export default function ParentProfilePage() {
  const navigate = useNavigate()
  const schoolId = useSchoolId()

  const { guardianId, isLoading: guardianLoading } = useGuardianPortal()
  const { guardian, isLoading: guardianDetailsLoading } = useGetGuardianDetails({
    guardianId,
  })
  const isLoading = guardianLoading || guardianDetailsLoading

  if (isLoading) return <ProfileSkeleton />

  if (!guardian) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        We couldn't load your profile.
      </div>
    )
  }

  const registeredOn = guardian.dateCreated
    ? new Date(guardian.dateCreated).toLocaleDateString()
    : ""

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        onBack={() => navigate(HomeRoutes.toParentHome(schoolId))}
        backLabel="Back to Overview"
      />

      <ProfileHero
        avatarInitials={initialsOfName(guardian.fullName)}
        name={guardian.fullName}
        subtitle={registeredOn ? `Registered ${registeredOn}` : undefined}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5">
          <SectionCard title="Contact Info">
            <ul className="space-y-3">
              <InfoRow
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={guardian.phoneNumber}
              />
              <InfoRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={guardian.email}
              />
              {guardian.address && (
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Address"
                  value={guardian.address}
                />
              )}
            </ul>
          </SectionCard>

          <SectionCard title="Personal Information">
            <ul className="space-y-3">
              {guardian.occupation && (
                <InfoRow
                  icon={<Briefcase className="h-4 w-4" />}
                  label="Occupation"
                  value={guardian.occupation}
                />
              )}
              <InfoRow
                icon={<Users className="h-4 w-4" />}
                label="Children"
                value={String(guardian.childrenCount)}
              />
            </ul>
          </SectionCard>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <SectionCard
            title="My Children"
            description="Students linked to your account"
          >
            {guardian.children.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-400">No children linked yet</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {guardian.children.map((child) => (
                  <li
                    key={child.studentId}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                        {initialsOfName(child.fullName)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {child.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {child.studentGivenId}
                          {child.currentClassName && ` · ${child.currentClassName}`}
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
