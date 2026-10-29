import { useParentPortalFilterStore } from "@/store/parentPortalFilter.store"
import { useState } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { LinkChildDialog } from "@/pages/Dashboard/Parent/components/LinkChildDialog"
import { Button } from "@/components/ui/button"
import { useNavigate, useParams } from "react-router"
import { Mail, Phone, MapPin, Users, ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import {
  SectionCard,
  InfoRow,
  ProfileField,
  ProfileSkeleton,
  ProfileNotFound,
  ProfileHero,
} from "@/components/general/ProfileSections"
import { DashboardRoutes } from "@/routes"
import {
  useGetGuardianDetails,
  useAdminResetGuardianPassword,
} from "@/hooks/guardian"
import {
  initialsOfName,
  mapGuardianDetailsChildToLinkedChild,
} from "@/utils/guardianAdapter"
import { AdminResetPasswordSection } from "@/components/general/AdminResetPasswordSection"
import { QuickLinks } from "@/pages/Dashboard/Parent/components/QuickLinks"
import { useSchoolId } from "@/contexts/SchoolContext"
import { ApiError } from "@/api/api"
import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"

export default function ParentProfilePage() {
  const { productId, parentId } = useParams<{
    productId: string
    parentId: string
  }>()
  const navigate = useNavigate()
  const schoolId = useSchoolId()
  const permissions = usePermissions(),
    editable = permissions.canUpdate("/dashboard/parents/list")
  const [linking, setLinking] = useState(false)

  const { guardian, isLoading, isError, error, refetch } =
    useGetGuardianDetails({
      guardianId: parentId!,
    })
  const { adminResetGuardianPasswordAsync, isPending: isResettingPassword } =
    useAdminResetGuardianPassword()

  if (isLoading) return <ProfileSkeleton />

  if (isError && !(error instanceof ApiError && error.status === 404)) {
    return (
      <QueryErrorPanel
        title="Unable to load parent details"
        message="The parent record could not be retrieved. Please try again."
        onRetry={() => void refetch()}
      />
    )
  }

  if (!guardian) {
    return (
      <ProfileNotFound
        title="Parent Not Found"
        message="We couldn't find the parent you're looking for. They might have been removed or the link might be incorrect."
        backLabel="Back to Parent List"
        onBack={() => navigate(DashboardRoutes.toParentList(productId!))}
      />
    )
  }

  const linkedChildren = guardian.children.map(
    mapGuardianDetailsChildToLinkedChild
  )
  const registeredOn = guardian.dateCreated
    ? new Date(guardian.dateCreated).toLocaleDateString()
    : ""

  return (
    <div className="space-y-6">
      {linking && (
        <LinkChildDialog
          guardianId={guardian.guardianId}
          linkedIds={linkedChildren.map((c) => c.id)}
          onClose={() => setLinking(false)}
        />
      )}
      <PageHeader
        title={guardian.fullName}
        onBack={() => navigate(DashboardRoutes.toParentList(productId!))}
        backLabel="Parent List"
      />

      <ProfileHero
        avatarInitials={initialsOfName(guardian.fullName)}
        name={guardian.fullName}
        onEdit={
          editable
            ? () =>
                navigate(
                  DashboardRoutes.toParentEdit(productId!, guardian.guardianId)
                )
            : undefined
        }
        subtitle={`Registered ${registeredOn}`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
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

          {editable && (
            <AdminResetPasswordSection
              key={guardian.guardianId}
              onReset={(password) =>
                adminResetGuardianPasswordAsync({
                  guardianId: guardian.guardianId,
                  password,
                  schoolId,
                })
              }
              isPending={isResettingPassword}
            />
          )}

          <QuickLinks productId={productId!} parentId={guardian.guardianId} />
        </div>

        {/* Right Column */}
        <div className="space-y-5 lg:col-span-2">
          <SectionCard title="Personal Information">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {guardian.occupation && (
                <ProfileField label="Occupation" value={guardian.occupation} />
              )}
              <ProfileField
                label="Linked Students"
                value={String(guardian.childrenCount)}
              />
              <ProfileField label="Registered" value={registeredOn} />
            </div>
          </SectionCard>

          <SectionCard
            title="Linked Children"
            description="Students associated with this parent"
          >
            {editable && (
              <Button
                className="mb-4"
                variant="outline"
                onClick={() => setLinking(true)}
              >
                Link a child
              </Button>
            )}
            {linkedChildren.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-400">No children linked yet</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {linkedChildren.map((child) => (
                  <li
                    key={child.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        e.currentTarget.click()
                      }
                    }}
                    onClick={() => {
                      const filters = useParentPortalFilterStore.getState()
                      filters.setGuardian(guardian.guardianId)
                      filters.selectChild(child.id)
                      navigate(
                        DashboardRoutes.toParentResults(
                          productId!,
                          guardian.guardianId
                        )
                      )
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                        {child.avatarInitials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {child.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {child.studentId}
                          {child.class && ` · ${child.class}`}
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
