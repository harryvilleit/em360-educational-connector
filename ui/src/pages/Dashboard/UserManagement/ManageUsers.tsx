import { useState, useEffect } from "react"
import { Plus, X, UserX } from "lucide-react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { FilterSelect } from "@/components/ui/filter-select"
import { Checkbox } from "@/components/ui/checkbox"
import { PageHeader } from "@/components/general/PageHeader"
import type { SubUserItem, JobRoleItem } from "@/api/userMgt.api/types"
import CreateUserModal from "./Component/CreateUserModal"
import EditModulesModal from "./Component/EditModules"
import UserTable from "./Component/UserTable"
import ConfirmModal from "./Component/ConfirmModal"
import AssignMultipleRolesModal from "./Component/UpdateRolesModal"
import ChangePasswordModal from "./Component/ChangePasswordModal"
import {
  useGetAllJobRolesById,
  useGetMySubUsers,
  useDeleteSubUser,
  useDeactivateSubUser,
  useActivateSubUser,
  useResendRegistrationEmail,
} from "@/hooks/userMgt"
import { useProductStore } from "@/store/product.store"
import type { CreatedUserCredentials } from "@/types/user-management"
import { useSchoolId } from "@/contexts/SchoolContext"
import { DashboardRoutes } from "@/routes"
import { Can } from "@/components/general/Can"

const PAGE_SIZE = 10

export default function ManageUsersPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const [searchParams] = useSearchParams()
  const schoolId = useSchoolId()
  const [search, setSearch] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") ?? "all"
  )
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [page, setPage] = useState<number>(1)
  const [selected, setSelected] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [editModulesUser, setEditModulesUser] = useState<SubUserItem | null>(
    null
  )
  const [bulkDeactivateOpen, setBulkDeactivateOpen] = useState<boolean>(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState<boolean>(false)
  const [, setCreatedCredentials] =
    useState<CreatedUserCredentials | null>(null)
  const [rolesUser, setRolesUser] = useState<SubUserItem | null>(null)
  const [passwordUser, setPasswordUser] = useState<SubUserItem | null>(null)
  const [resendEmailUser, setResendEmailUser] = useState<SubUserItem | null>(null)

  const [keyword, setKeyword] = useState("")
  useEffect(() => { const timer = setTimeout(() => { setKeyword(search.trim()); setPage(1) }, 300); return () => clearTimeout(timer) }, [search])

  const generalProductId = useProductStore((s) => s.generalProductId)
  const { deleteSubUserAsync } = useDeleteSubUser()
  const { deactivateSubUserAsync } = useDeactivateSubUser()
  const { activateSubUserAsync } = useActivateSubUser()
  const { resendRegistrationEmailAsync } = useResendRegistrationEmail()

  const { subUsers, pagination, isLoading } = useGetMySubUsers({
    schoolId: schoolId,
    keyword,
    schoolJobRoleId: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    pageNumber: page,
    pageSize: PAGE_SIZE,
  })

  const filteredSubUsers = subUsers

  const hasFilters =
    search !== "" || statusFilter !== "all" || roleFilter !== "all"

  const clearFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setRoleFilter("all")
    setPage(1)
  }

  const { allJobRoles } = useGetAllJobRolesById(schoolId)

  const allPageSelected =
    filteredSubUsers.length > 0 &&
    filteredSubUsers.every((u) => selected.includes(u.SubUserId))

  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelected((prev) =>
        prev.filter((id) => !filteredSubUsers.find((u) => u.SubUserId === id))
      )
    } else {
      setSelected((prev) => [
        ...prev,
        ...filteredSubUsers
          .filter((u) => !prev.includes(u.SubUserId))
          .map((u) => u.SubUserId),
      ])
    }
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleBulkDeactivate = async () => {
    await Promise.all(
      selected.map((subUserId) =>
        deactivateSubUserAsync({
          subUserId,
          schoolId: schoolId,
        })
      )
    )
    setSelected([])
    setBulkDeactivateOpen(false)
  }

  const handleBulkDelete = async () => {
    await Promise.all(
      selected.map((subUserId) =>
        deleteSubUserAsync({
          subUserId,
          productId: generalProductId,
          schoolId: schoolId,
        })
      )
    )
    setSelected([])
    setBulkDeleteOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Users"
        description="Create, edit and control access for all users."
        actions={
          <Can menuUrl={DashboardRoutes.toManageUsers(productId ?? "")} action="Create">
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              <Plus className="size-4" />
              Add User
            </Button>
          </Can>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Search by name or email..."
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
        />

        <FilterSelect
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v)
            setPage(1)
          }}
          options={[
            { value: "all", label: "All Status" },
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
            { value: "Pending", label: "Pending" },
          ]}
          placeholder="Status"
          triggerClassName="w-36"
        />

        {/* Role filter */}
        <FilterSelect
          value={roleFilter}
          onChange={(v) => {
            setRoleFilter(v)
            setPage(1)
          }}
          options={[
            { value: "all", label: "All Roles" },
            ...(allJobRoles?.Value ?? []).map((role) => ({
              value: role.Id,
              label: role.Name,
            })),
          ]}
          placeholder="Job Role"
          itemClassName="capitalize"
        />

        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="gap-1.5 rounded-xl border-gray-200 text-xs"
          >
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <Checkbox
            checked={allPageSelected}
            onCheckedChange={toggleSelectAll}
          />
          <p className="flex-1 text-sm font-medium text-blue-700">
            {selected.length} user{selected.length > 1 ? "s" : ""} selected
          </p>
          <Can menuUrl={DashboardRoutes.toManageUsers(productId ?? "")} action="Update">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkDeactivateOpen(true)}
              className="gap-1.5 rounded-xl border-orange-200 bg-white text-xs text-orange-600 hover:bg-orange-50"
            >
              <UserX className="size-3.5" />
              Deactivate Selected
            </Button>
          </Can>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelected([])}
            className="rounded-xl text-xs text-gray-500"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      <UserTable
        users={filteredSubUsers}
        hasFilters={hasFilters}
        isLoading={isLoading}
        selected={selected}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        allPageSelected={allPageSelected}
        onViewDetails={(user) =>
          navigate(
            DashboardRoutes.toManageUsersDetail(productId!, user.SubUserId)
          )
        }
        onEditModules={setEditModulesUser}
        onAddMultipleRoles={setRolesUser}
        onChangePassword={setPasswordUser}
        onResendRegistrationEmail={setResendEmailUser}
        onActivate={async (id) => {
          await activateSubUserAsync({
            subUserId: id,
            schoolId: schoolId,
          })
        }}
        onDeactivate={async (id) => {
          await deactivateSubUserAsync({
            subUserId: id,
            schoolId: schoolId,
          })
        }}
        page={page}
        totalItems={pagination?.totalItems ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* Modals */}
      <CreateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(credentials) => setCreatedCredentials(credentials)}
      />

      <EditModulesModal
        open={!!editModulesUser}
        onClose={() => setEditModulesUser(null)}
        userName={
          editModulesUser
            ? `${editModulesUser.FirstName} ${editModulesUser.LastName}`
            : ""
        }
        subUserId={editModulesUser?.SubUserId ?? ""}
        currentPermissions={[]}
        onSave={() => setEditModulesUser(null)}
      />

      <ConfirmModal
        open={!!resendEmailUser}
        onClose={() => setResendEmailUser(null)}
        onConfirm={async () => {
          if (!resendEmailUser) return
          await resendRegistrationEmailAsync({
            subUserId: resendEmailUser.SubUserId,
            schoolId,
          })
        }}
        variant="resend-email"
        userName={
          resendEmailUser
            ? `${resendEmailUser.FirstName} ${resendEmailUser.LastName}`
            : ""
        }
      />

      <ConfirmModal
        open={bulkDeactivateOpen}
        onClose={() => setBulkDeactivateOpen(false)}
        onConfirm={handleBulkDeactivate}
        variant="deactivate"
        userName={`${selected.length} selected user${selected.length > 1 ? "s" : ""}`}
      />

      <ConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        variant="delete"
        userName={`${selected.length} selected user${selected.length > 1 ? "s" : ""}`}
      />

      <AssignMultipleRolesModal
        open={!!rolesUser}
        onClose={() => setRolesUser(null)}
        user={rolesUser}
        availableRoles={(allJobRoles?.Value ?? []) as JobRoleItem[]}
      />

      <ChangePasswordModal
        open={!!passwordUser}
        onClose={() => setPasswordUser(null)}
        user={passwordUser}
        schoolId={schoolId}
      />
    </div>
  )
}
