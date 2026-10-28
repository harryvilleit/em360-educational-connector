import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  Mail,
  Phone,
  Briefcase,
  Layout,
  ShieldPlus,
  UserCheck,
  UserX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import {
  SectionCard,
  InfoRow,
  ProfileField,
  ProfileHero,
  ProfileSkeleton,
  ProfileNotFound,
} from "@/components/general/ProfileSections"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetAllJobRolesById,
  useGetMySubUsers,
  useDeactivateSubUser,
  useActivateSubUser,
} from "@/hooks/userMgt"
import type { JobRoleItem, SubUserItem } from "@/api/userMgt.api/types"
import { format } from "date-fns"
import EditModulesModal from "./Component/EditModules"
import UpdateRolesModal from "./Component/UpdateRolesModal"
import ConfirmModal from "./Component/ConfirmModal"


export default function UserDetailsPage() {
  const navigate = useNavigate()
  const { productId, subUserId } = useParams<{
    productId: string
    subUserId: string
  }>()
  const schoolId = useSchoolId()

  const [editModulesOpen, setEditModulesOpen] = useState(false)
  const [rolesModalOpen, setRolesModalOpen] = useState(false)
  const [pendingStatusAction, setPendingStatusAction] = useState<
    "activate" | "deactivate" | null
  >(null)
 

  const { subUsers, isLoading: fetchedLoading } = useGetMySubUsers(
    { schoolId, subUserId, pageNumber: 1, pageSize: 1 },
    !!subUserId
  )
  const isLoading = fetchedLoading
  const { allJobRoles } = useGetAllJobRolesById(schoolId)
  const { deactivateSubUserAsync } = useDeactivateSubUser()
  const { activateSubUserAsync } = useActivateSubUser()

  const user = useMemo(
    () => subUsers.find((u) => u.SubUserId === subUserId),
    [subUsers, subUserId]
  )

  const goBack = () => navigate(DashboardRoutes.toManageUsers(productId!))

  if (isLoading) return <ProfileSkeleton />

  if (!user) {
    return (
      <ProfileNotFound
        title="User Not Found"
        message="We couldn't find the user you're looking for. They might have been removed or the link might be incorrect."
        backLabel="Back to Manage Users"
        onBack={goBack}
      />
    )
  }

  const userStatus = user.Status || user.status || "Pending"
  const initials = `${user.FirstName[0]}${user.LastName[0]}`.toUpperCase()
  const primaryRole = user.JobRoles[0]?.JobRoleName ?? "—"

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user.FirstName} ${user.LastName}`}
        onBack={goBack}
        backLabel="Manage Users"
        actions={
          <>
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-gray-200 text-sm"
              onClick={() => setEditModulesOpen(true)}
            >
              <Layout className="size-4 text-blue-500" />
              Edit Modules
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-gray-200 text-sm"
              onClick={() => setRolesModalOpen(true)}
            >
              <ShieldPlus className="size-4 text-violet-500" />
              Update Roles
            </Button>
            {userStatus === "Active" ? (
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-orange-200 bg-white text-sm text-orange-600 hover:bg-orange-50"
                onClick={() => setPendingStatusAction("deactivate")}
              >
                <UserX className="size-4" />
                Deactivate
              </Button>
            ) : (
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-green-200 bg-white text-sm text-green-600 hover:bg-green-50"
                onClick={() => setPendingStatusAction("activate")}
              >
                <UserCheck className="size-4" />
                Activate
              </Button>
            )}
          </>
        }
      />

      <ProfileHero
        avatarInitials={initials}
        avatarClassName="bg-blue-600"
        name={`${user.FirstName} ${user.LastName}`}
        badge={
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              userStatus === "Active"
                ? "bg-green-50 text-green-700"
                : userStatus === "Inactive"
                  ? "bg-red-50 text-red-600"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {userStatus}
          </span>
        }
        subtitle={<span className="capitalize">{primaryRole}</span>}
      />

      <SectionCard title="Personal Information">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <InfoRow
            icon={<Mail size={16} />}
            label="Email"
            value={user.Email ?? undefined}
          />
          <InfoRow
            icon={<Phone size={16} />}
            label="Phone"
            value={user.PhoneNumber || undefined}
          />
          <div className="flex items-start gap-3 sm:col-span-2">
            <Briefcase size={16} className="mt-0.5 shrink-0 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">
                Job Role{user.JobRoles.length > 1 ? "s" : ""}
              </p>
              {user.JobRoles.length === 0 ? (
                <p className="text-sm font-medium text-gray-800">—</p>
              ) : (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {user.JobRoles.map((role) => (
                    <span
                      key={role.UserJobRoleId}
                      className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 capitalize"
                    >
                      {role.JobRoleName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ProfileField
            label="Date Created"
            value={format(new Date(user.DateCreated), "MMM d, yyyy")}
          />
        </div>
      </SectionCard>

      {/* Modals */}
      <EditModulesModal
        open={editModulesOpen}
        onClose={() => setEditModulesOpen(false)}
        userName={`${user.FirstName} ${user.LastName}`}
        subUserId={user.SubUserId}
        currentPermissions={[]}
        onSave={() => setEditModulesOpen(false)}
      />

      <UpdateRolesModal
        open={rolesModalOpen}
        onClose={() => setRolesModalOpen(false)}
        user={user}
        availableRoles={(allJobRoles?.Value ?? []) as JobRoleItem[]}
      />

      <ConfirmModal
        open={!!pendingStatusAction}
        onClose={() => setPendingStatusAction(null)}
        variant={pendingStatusAction ?? "activate"}
        userName={`${user.FirstName} ${user.LastName}`}
        onConfirm={async () => {
          if (pendingStatusAction === "activate") {
            await activateSubUserAsync({ subUserId: user.SubUserId, schoolId })
          } else if (pendingStatusAction === "deactivate") {
            await deactivateSubUserAsync({
              subUserId: user.SubUserId,
              schoolId,
            })
          }
          setPendingStatusAction(null)
        }}
      />
    </div>
  )
}
