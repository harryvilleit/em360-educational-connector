import { useCallback, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { Users } from "lucide-react"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useStaffDirectory } from "@/hooks/staff"
import {
  useActivateSubUser,
  useDeactivateSubUser,
  useDeleteSubUser,
} from "@/hooks/userMgt"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable } from "@/components/ui/data-table"
import { SearchInput } from "@/components/ui/search-input"
import { PageHeader } from "@/components/general/PageHeader"
import { FilterSelect } from "@/components/ui/filter-select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getStaffColumns } from "./components/StaffTableColumns"
import { StatsBar } from "./components/StatsBar"
import { isActiveStatusLabel } from "./types/normalize"
import type { StaffDirectoryItemI } from "@/api/staff.api/types"

interface Filters {
  search: string
  roleId: string
  departmentId: string
  status: string
  pageNumber: number
  pageSize: number
}

const INITIAL_FILTERS: Filters = {
  search: "",
  roleId: "",
  departmentId: "",
  status: "",
  pageNumber: 1,
  pageSize: 10,
}

export default function StaffListPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const schoolId = useSchoolId()
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const [staffToDelete, setStaffToDelete] = useState<StaffDirectoryItemI | null>(
    null
  )

  const { directory, isLoading, refetch } = useStaffDirectory({
    schoolId,
    search: filters.search || undefined,
    roleId: filters.roleId || undefined,
    departmentId: filters.departmentId || undefined,
    status: filters.status || undefined,
    pageNumber: filters.pageNumber,
    pageSize: filters.pageSize,
  })

  const { activateSubUserAsync } = useActivateSubUser()
  const { deactivateSubUserAsync } = useDeactivateSubUser()
  const { deleteSubUserAsync, isPending: isDeleting } = useDeleteSubUser()

  const handleFilterChange = useCallback(
    (key: keyof Omit<Filters, "pageNumber">, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value === "all" ? "" : value,
        pageNumber: 1,
      }))
    },
    []
  )

  const handleToggleStatus = async (staff: StaffDirectoryItemI) => {
    try {
      if (isActiveStatusLabel(staff.statusLabel)) {
        await deactivateSubUserAsync({ subUserId: staff.subUserId, schoolId })
      } else {
        await activateSubUserAsync({ subUserId: staff.subUserId, schoolId })
      }
      refetch()
    } catch {
      toast.error("Failed to update staff status.")
    }
  }

  const handleConfirmDelete = async () => {
    if (!staffToDelete) return
    try {
      await deleteSubUserAsync({
        subUserId: staffToDelete.subUserId,
        productId: p,
        schoolId,
      })
      setStaffToDelete(null)
      refetch()
    } catch {
      toast.error("Failed to delete staff member.")
    }
  }

  const columns = getStaffColumns({
    navigate,
    productId: p,
    onToggleStatus: handleToggleStatus,
    onDelete: setStaffToDelete,
  })

  const staff = directory?.staff.items ?? []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ── */}
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <PageHeader
          title="Staff Directory"
          description={`${directory?.totalStaff ?? 0} staff members registered`}
        />
      </div>

      <div className="mx-auto space-y-5 px-4 py-6 sm:px-6">
        {/* ── Stats Bar ── */}
        <StatsBar
          totalStaff={directory?.totalStaff ?? 0}
          activeCount={directory?.activeCount ?? 0}
          inactiveCount={directory?.inactiveCount ?? 0}
          suspendedCount={directory?.suspendedCount ?? 0}
        />
        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4">
          {/* Search */}
          <SearchInput
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(value) => handleFilterChange("search", value)}
          />

          {/* Role filter */}
          <FilterSelect
            value={filters.roleId || "all"}
            onChange={(value) => handleFilterChange("roleId", value)}
            options={[
              { value: "all", label: "All Roles" },
              ...(directory?.availableRoles ?? []).map((r) => ({
                value: r.id,
                label: r.name,
              })),
            ]}
            placeholder="All Roles"
            triggerClassName="w-35"
          />

          {/* Department filter */}
          <FilterSelect
            value={filters.departmentId || "all"}
            onChange={(value) => handleFilterChange("departmentId", value)}
            options={[
              { value: "all", label: "All Departments" },
              ...(directory?.availableDepartments ?? []).map((d) => ({
                value: d.id,
                label: d.name,
              })),
            ]}
            placeholder="All Departments"
            triggerClassName="w-40"
          />

          {/* Status filter */}
          <FilterSelect
            value={filters.status || "all"}
            onChange={(value) => handleFilterChange("status", value)}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
              { value: "Suspended", label: "Suspended" },
            ]}
            placeholder="All Statuses"
            triggerClassName="w-35"
          />
        </div>

        {/* ── Table ── */}
        <DataTable
          columns={columns}
          data={staff}
          isLoading={isLoading}
          getRowKey={(row) => row.subUserId}
          onRowClick={(row) =>
            navigate(DashboardRoutes.toStaffProfile(p, row.subUserId))
          }
          pagination={
            directory
              ? {
                  page: directory.staff.pageNumber,
                  total: directory.staff.totalItems,
                  pageSize: directory.staff.pageSize,
                  onPageChange: (page) =>
                    setFilters((prev) => ({ ...prev, pageNumber: page })),
                }
              : undefined
          }
          emptyState={
            <EmptyState
              icon={Users}
              title="No staff found"
              description="Try adjusting your search or filters to find staff members."
            />
          }
        />
      </div>

      <AlertDialog
        open={!!staffToDelete}
        onOpenChange={(open) => !open && setStaffToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete staff member</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {staffToDelete?.fullName} from the
              school. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
