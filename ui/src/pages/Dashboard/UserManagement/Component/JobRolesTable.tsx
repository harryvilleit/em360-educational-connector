import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Briefcase, ShieldCheck } from "lucide-react"
import { format } from "date-fns"
import { useParams } from "react-router"
import type { JobRoleItem } from "@/api/jobRoles.api/types"
import { usePermissions } from "@/hooks/usePermissions"
import { DashboardRoutes } from "@/routes"

const SKELETON_ROWS = 5

interface JobRolesTableProps {
  jobRoles: JobRoleItem[]
  isLoading?: boolean
  onEdit: (role: JobRoleItem) => void
  onDelete: (role: JobRoleItem) => void
  onManagePermissions: (role: JobRoleItem) => void
}

export default function JobRolesTable({
  jobRoles,
  isLoading = false,
  onEdit,
  onDelete,
  onManagePermissions,
}: JobRolesTableProps) {
  const [keyword, setKeyword] = useState("")
  const { productId } = useParams<{ productId: string }>()
  const { canUpdate } = usePermissions()
  const canEditJobRole = canUpdate(DashboardRoutes.toJobRoles(productId ?? ""))

  const filtered = useMemo(
    () =>
      keyword
        ? jobRoles.filter((r) =>
            r.Name.toLowerCase().includes(keyword.toLowerCase())
          )
        : jobRoles,
    [jobRoles, keyword]
  )

  const columns: DataTableColumn<JobRoleItem>[] = [
    {
      key: "name",
      header: "Role Name",
      render: (role) => <p className="font-medium text-gray-900">{role.Name}</p>,
    },
    {
      key: "type",
      header: "Role Type",
      render: (role) => (
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
          {role.SystemJobRoleName && role.SystemJobRoleName !== "0"
            ? role.SystemJobRoleName
            : "—"}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      cellClassName: "text-sm text-muted-foreground",
      render: (role) => role.Description || "—",
    },
    {
      key: "created",
      header: "Created",
      cellClassName: "text-xs text-muted-foreground",
      render: (role) => format(new Date(role.DateCreated), "MMM d, yyyy"),
    },
    {
      key: "actions",
      header: "",
      render: (role) =>
        canEditJobRole && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="rounded-lg">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuItem
                className="cursor-pointer gap-2 rounded-lg text-xs"
                onClick={() => onEdit(role)}
              >
                <Pencil className="size-3.5 text-blue-500" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2 rounded-lg text-xs"
                onClick={() => onManagePermissions(role)}
              >
                <ShieldCheck className="size-3.5 text-emerald-500" />
                Permissions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
    },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white ">
      {/* Search bar */}
      <div className="border-b border-gray-100 px-4 py-3">
        <SearchInput
          placeholder="Search by role name..."
          value={keyword}
          onChange={setKeyword}
          containerClassName="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        getRowKey={(role) => role.Id}
        isLoading={isLoading}
        loadingRows={SKELETON_ROWS}
        wrapperClassName=""
        emptyState={
          <EmptyState
            icon={Briefcase}
            title={keyword ? "No roles match your search" : "No job roles yet"}
            description={
              keyword
                ? "Try a different keyword"
                : "Add your first job role to get started"
            }
            size="sm"
            iconContainerClassName="bg-gray-50"
          />
        }
      />
    </div>
  )
}
