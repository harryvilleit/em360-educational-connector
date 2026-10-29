import { useParams } from "react-router"
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
  BookX,
  Edit,
  GraduationCap,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react"
import type { SubjectItem } from "@/api/examAndRecords.api/types"
import { usePermissions } from "@/hooks/usePermissions"
import { DashboardRoutes } from "@/routes"

const PAGE_SIZE = 10

interface SubjectsTableProps {
  subjects: SubjectItem[]
  isLoading: boolean
  searchQuery: string
  currentPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onEdit: (subject: SubjectItem) => void
  onDelete: (subject: SubjectItem) => void
  onAssignClasses: (subject: SubjectItem) => void
  onCreateFirst: () => void
}

export default function SubjectsTable({
  subjects,
  isLoading,
  searchQuery,
  currentPage,
  totalItems,
  onPageChange,
  onEdit,
  onDelete,
  onAssignClasses,
  onCreateFirst,
}: SubjectsTableProps) {
  const { productId } = useParams<{ productId: string }>()
  const { canCreate, canUpdate, canDelete } = usePermissions()
  const subjectsMenuUrl = DashboardRoutes.toSubjects(productId ?? "")

  const columns: DataTableColumn<SubjectItem>[] = [
    {
      key: "icon",
      header: "",
      headerClassName: "w-10",
      render: () => <div></div>,
    },
    {
      key: "name",
      header: "Subject Name",
      cellClassName: "font-medium",
      render: (subject) => subject.Name,
    },
    {
      key: "visibility",
      header: "Public profile",
      render: (subject) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${subject.IsPublic ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}
        >
          {subject.IsPublic ? "Public" : "Private"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "w-10",
      render: (subject) => {
        const canEdit = canUpdate(subjectsMenuUrl)
        const canRemove = canDelete(subjectsMenuUrl)
        if (!canEdit && !canRemove) return null

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={() => onEdit(subject)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={() => onAssignClasses(subject)}
                  >
                    <GraduationCap className="h-4 w-4" />
                    Assign to Classes
                  </DropdownMenuItem>
                </>
              )}
              {canRemove && (
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                  onClick={() => onDelete(subject)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={subjects}
      getRowKey={(subject) => subject.Id}
      isLoading={isLoading}
      pagination={{
        page: currentPage,
        total: totalItems,
        pageSize: PAGE_SIZE,
        onPageChange,
      }}
      emptyState={
        <EmptyState
          icon={BookX}
          title="No subjects found"
          description={
            searchQuery
              ? `No subjects matching "${searchQuery}" were found. Try a different search term.`
              : "You haven't created any subjects yet. Click the button below to add your first subject."
          }
          size="lg"
          iconContainerClassName="bg-green-50"
          iconClassName="text-green-500"
          action={
            !searchQuery && canCreate(subjectsMenuUrl)
              ? { label: "Create Subject", icon: Plus, onClick: onCreateFirst }
              : undefined
          }
        />
      }
    />
  )
}
