import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Edit,
  FolderOpen,
  MoreHorizontal,
  Plus,
} from "lucide-react"
import { format } from "date-fns"
import { useParams } from "react-router"
import type { DepartmentItem } from "@/api/examAndRecords.api/types"
import { usePermissions } from "@/hooks/usePermissions"
import { DashboardRoutes } from "@/routes"

interface DepartmentsTableProps {
  departments: DepartmentItem[]
  isLoading: boolean
  searchQuery: string
  page: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onEdit: (department: DepartmentItem) => void
  onDelete: (department: DepartmentItem) => void
  onCreateFirst: () => void
}

export default function DepartmentsTable({
  departments,
  isLoading,
  searchQuery,
  page,
  totalItems,
  pageSize,
  onPageChange,
  onEdit,
  onCreateFirst,
}: DepartmentsTableProps) {
  const { productId } = useParams<{ productId: string }>()
  const { canCreate, canUpdate } = usePermissions()
  const departmentsMenuUrl = DashboardRoutes.toDepartments(productId ?? "")
  const canCreateDepartment = canCreate(departmentsMenuUrl)
  const canEditDepartment = canUpdate(departmentsMenuUrl)

  const columns: DataTableColumn<DepartmentItem>[] = [
    {
      key: "icon",
      header: "",
      headerClassName: "w-10",
      render: () => (
        <div>
        
        </div>
      ),
    },
    {
      key: "name",
      header: "Department Name",
      cellClassName: "font-medium",
      render: (dept) => dept.Name,
    },
    {
      key: "description",
      header: "Description",
      cellClassName: "max-w-xs text-gray-600",
      render: (dept) => <p className="truncate">{dept.Description || "—"}</p>,
    },
    {
      key: "status",
      header: "Status",
      render: (dept) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            dept.StatusName?.toLowerCase() === "active"
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {dept.StatusName || "—"}
        </span>
      ),
    },
    {
      key: "dateCreated",
      header: "Date Created",
      cellClassName: "text-gray-600",
      render: (dept) => format(new Date(dept.DateCreated), "MMM d, yyyy"),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "w-10",
      render: (dept) =>
        canEditDepartment && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl py-1">
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onEdit(dept)}
              >
                <Edit className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={departments}
      getRowKey={(dept) => dept.Id}
      isLoading={isLoading}
      pagination={{ page, total: totalItems, pageSize, onPageChange }}
      emptyState={
        <EmptyState
          icon={FolderOpen}
          title="No departments found"
          description={
            searchQuery
              ? `No departments matching "${searchQuery}" were found. Try a different search term.`
              : "You haven't created any departments yet. Click the button below to add your first department."
          }
          size="lg"
          iconContainerClassName="bg-blue-50"
          iconClassName="text-blue-500"
          action={
            !searchQuery && canCreateDepartment
              ? { label: "Add Department", icon: Plus, onClick: onCreateFirst }
              : undefined
          }
        />
      }
    />
  )
}
