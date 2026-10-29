import type { NavigateFunction } from "react-router"
import { DashboardRoutes } from "@/routes"
import type { DataTableColumn } from "@/components/ui/data-table"
import { StaffStatusBadge, EmploymentTypeBadge, Avatar } from "./badges"
import { ActionsDropdown } from "./ActionsDropdown"
import type { StaffDirectoryItemI } from "@/api/staff.api/types"

interface GetStaffColumnsOptions {
  navigate: NavigateFunction
  productId: string
  onToggleStatus: (staff: StaffDirectoryItemI) => void
  onDelete: (staff: StaffDirectoryItemI) => void
}

export function getStaffColumns({
  navigate,
  productId,
  onToggleStatus,
  onDelete,
}: GetStaffColumnsOptions): DataTableColumn<StaffDirectoryItemI>[] {
  return [
    {
      key: "name",
      header: "Staff Member",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.fullName} src={row.profilePicture ?? undefined} />
          <div>
            <p className="text-sm font-medium text-slate-900">
              {row.fullName}
            </p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => <span className="text-sm text-slate-700">{row.role}</span>,
    },
    {
      key: "department",
      header: "Department",
      render: (row) => (
        <span className="text-sm text-slate-600">{row.department}</span>
      ),
    },
    {
      key: "type",
      header: "Employment",
      render: (row) => <EmploymentTypeBadge type={row.employmentType} />,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StaffStatusBadge status={row.statusLabel} />,
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (row) => (
        <ActionsDropdown
          staff={row}
          onView={() =>
            navigate(DashboardRoutes.toStaffProfile(productId, row.subUserId))
          }
          onEdit={() =>
            navigate(DashboardRoutes.toStaffEdit(productId, row.subUserId))
          }
          onToggleStatus={() => onToggleStatus(row)}
          onDelete={() => onDelete(row)}
        />
      ),
    },
  ]
}
