import { useNavigate, useParams } from "react-router"
import {
  BookOpen,
  Building2,
  Eye,
  GraduationCap,
  MoreHorizontal,
  Pencil,
  UserRound,
  Users,
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import type { ManageTeacherItemI } from "@/api/userMgt.api/types"
import { usePermissions } from "@/hooks/usePermissions"
import { DashboardRoutes } from "@/routes"

const PAGE_SIZE = 10

function statusColor(status: string) {
  if (status === "Active") return "bg-green-50 text-green-700"
  if (status === "Inactive") return "bg-red-50 text-red-600"
  return "bg-amber-50 text-amber-700"
}

interface ManageTeachersTableProps {
  teachers: ManageTeacherItemI[]
  isLoading: boolean
  totalItems: number
  currentPage: number
  searchQuery: string
  onPageChange: (page: number) => void
  onAssignClass: (teacher: { id: string; name: string }) => void
  onAssignSubject: (teacher: { id: string; name: string }) => void
  onAssignDepartment: (teacher: { id: string; name: string }) => void
}

export function ManageTeachersTable({
  teachers,
  isLoading,
  totalItems,
  currentPage,
  searchQuery,
  onPageChange,
  onAssignClass,
  onAssignSubject,
  onAssignDepartment,
}: ManageTeachersTableProps) {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const { canUpdate } = usePermissions()
  const canManageTeacher = canUpdate(
    DashboardRoutes.toManageTeachers(productId ?? "")
  )

  const columns: DataTableColumn<ManageTeacherItemI>[] = [
    {
      key: "avatar",
      header: "",
      render: () => (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
          <UserRound className="h-4 w-4 text-blue-600" />
        </div>
      ),
    },
    {
      key: "name",
      header: "Full Name",
      render: (teacher) => (
        <span className="font-medium text-gray-900">
          {teacher.firstName} {teacher.lastName}
        </span>
      ),
    },
    {
      key: "role",
      header: "Job Role",
      cellClassName: "text-gray-600 capitalize",
      render: (teacher) => teacher.jobRoles[0]?.jobRoleName ?? "—",
    },
    {
      key: "email",
      header: "Email Address",
      cellClassName: "text-gray-600",
      render: (teacher) => teacher.email || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (teacher) => {
        const status = teacher.status || "Pending"
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(status)}`}
          >
            {status}
          </span>
        )
      },
    },
    {
      key: "date",
      header: "Date Joined",
      cellClassName: "text-gray-600",
      render: (teacher) => format(new Date(teacher.dateCreated), "MMM d, yyyy"),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (teacher) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="rounded-lg">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl">
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-xs"
              onClick={() =>
                navigate(
                  `/dashboard/${productId}/exams_and_records/manage-teachers/${teacher.subUserId}`
                )
              }
            >
              <Eye className="size-3.5 text-gray-500" />
              View Details
            </DropdownMenuItem>
            {canManageTeacher && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg text-xs"
                  onClick={() =>
                    navigate(
                      `/dashboard/${productId}/exams_and_records/manage-teachers/${teacher.subUserId}?edit=1`
                    )
                  }
                >
                  <Pencil className="size-3.5 text-gray-500" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg text-xs"
                  onClick={() =>
                    onAssignClass({
                      id: teacher.productUserSubUserId,
                      name: `${teacher.firstName} ${teacher.lastName}`,
                    })
                  }
                >
                  <GraduationCap className="size-3.5 text-gray-500" />
                  Assign Class
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg text-xs"
                  onClick={() =>
                    onAssignSubject({
                      id: teacher.productUserSubUserId,
                      name: `${teacher.firstName} ${teacher.lastName}`,
                    })
                  }
                >
                  <BookOpen className="size-3.5 text-gray-500" />
                  Assign Subject
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg text-xs"
                  onClick={() =>
                    onAssignDepartment({
                      id: teacher.productUserSubUserId,
                      name: `${teacher.firstName} ${teacher.lastName}`,
                    })
                  }
                >
                  <Building2 className="size-3.5 text-gray-500" />
                  Assign Department
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={teachers}
      getRowKey={(t) => t.subUserId}
      isLoading={isLoading}
      loadingRows={6}
      pagination={
        totalItems > PAGE_SIZE
          ? {
              page: currentPage,
              total: totalItems,
              pageSize: PAGE_SIZE,
              onPageChange,
            }
          : undefined
      }
      emptyState={
        <EmptyState
          icon={Users}
          title="No teachers found"
          description={
            searchQuery
              ? `No results matching "${searchQuery}".`
              : "No users have been assigned a teacher job role yet."
          }
          size="sm"
          iconContainerClassName="bg-blue-50"
          iconClassName="text-blue-500"
        />
      }
    />
  )
}
