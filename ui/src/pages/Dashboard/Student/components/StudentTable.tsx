import { usePermissions } from "@/hooks/usePermissions"
import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
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
  Eye,
  GraduationCap,
  Edit,
  Layers,
  UserPlus,
  Users2,
} from "lucide-react"
import { DashboardRoutes } from "@/routes"
import type { EnrollmentStatus } from "@/types/student"
import type { StudentListRow } from "@/utils/studentAdapter"
import { ClassEnrollmentModal } from "./ClassEnrollmentModal"
import { EnrollAdditionalClassModal } from "./EnrollAdditionalClassModal"
import { AssignGuardianModal } from "./AssignGuardianModal"

const STATUS_STYLES: Record<EnrollmentStatus | "Pending", string> = {
  Pending: "bg-amber-100 text-amber-700",
  Active: "bg-emerald-100 text-emerald-700",
  Graduated: "bg-blue-100 text-blue-700",
  Withdrawn: "bg-gray-100 text-gray-600",
  Suspended: "bg-red-100 text-red-700",
}

interface StudentTableProps {
  students: StudentListRow[]
  isFiltered: boolean
  isLoading?: boolean
  onDeleteRequest: (studentId: string) => void
}

export function StudentTable({
  students,
  isFiltered,
  isLoading,
}: StudentTableProps) {
  const navigate = useNavigate()
  const { canUpdate, canCreate } = usePermissions()
  const editable = canUpdate("/dashboard/students/list")
  const { productId } = useParams()
  const [enrollmentTarget, setEnrollmentTarget] =
    useState<StudentListRow | null>(null)
  const [additionalClassTarget, setAdditionalClassTarget] =
    useState<StudentListRow | null>(null)
  const [assignGuardianTarget, setAssignGuardianTarget] =
    useState<StudentListRow | null>(null)

  const columns: DataTableColumn<StudentListRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (student) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            {student.firstName[0]}
            {student.lastName[0]}
          </div>
          <p className="font-medium text-gray-900">
            {student.firstName} {student.lastName}
          </p>
        </div>
      ),
    },
    {
      key: "studentId",
      header: "Student ID",
      cellClassName: "font-mono text-xs text-gray-500",
      render: (student) => student.studentGivenId ?? "—",
    },

    {
      key: "guardian",
      header: "Guardian",
      render: (student) => {
        const guardian = student.guardians[0]
        return guardian ? (
          <>
            <p className="text-gray-900">
              {guardian.firstName} {guardian.lastName}
            </p>
            <p className="text-xs text-gray-400">{guardian.phone}</p>
          </>
        ) : (
          <p className="text-xs text-gray-400">No guardian linked</p>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      render: (student) => {
        const label = student.isEnrolled ? student.enrollmentStatus : "Pending"
        return (
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[label]}`}
          >
            {label}
          </span>
        )
      },
    },
    {
      key: "actions",
      header: "",
      render: (student) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 rounded-lg"
            >
              <span className="sr-only">
                Actions for {student.firstName} {student.lastName}
              </span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem
              className="gap-2"
              onClick={() =>
                navigate(
                  DashboardRoutes.toStudentProfile(productId!, student.id),
                )
              }
            >
              <Eye className="size-4" />
              View Profile
            </DropdownMenuItem>

            {editable && (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="gap-2"
                  onClick={() =>
                    navigate(
                      DashboardRoutes.toStudentEdit(productId!, student.id),
                    )
                  }
                >
                  <Edit className="size-4" />
                  Edit Profile
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="gap-2"
                  onClick={() => setAssignGuardianTarget(student)}
                >
                  <UserPlus className="size-4" />
                  Assign Another Guardian to Student
                </DropdownMenuItem>

                {!student.isEnrolled && (
                  <>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="gap-2"
                      onClick={() => setEnrollmentTarget(student)}
                    >
                      <Layers className="size-4" />
                      Class Enrollment
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="gap-2"
                  onClick={() => setAdditionalClassTarget(student)}
                >
                  <Users2 className="size-4" />
                  Enroll to Additional Class
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={students}
        getRowKey={(student) => student.id}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            icon={GraduationCap}
            title={
              isFiltered ? "No students match your filters" : "No students yet"
            }
            action={
              !isFiltered && canCreate("/dashboard/students/add")
                ? {
                    label: "Add your first student",
                    onClick: () =>
                      navigate(DashboardRoutes.toStudentAdd(productId!)),
                  }
                : undefined
            }
          />
        }
      />

      {enrollmentTarget && (
        <ClassEnrollmentModal
          key={enrollmentTarget.id}
          student={enrollmentTarget}
          onClose={() => setEnrollmentTarget(null)}
        />
      )}

      {additionalClassTarget && (
        <EnrollAdditionalClassModal
          key={additionalClassTarget.id}
          student={additionalClassTarget}
          onClose={() => setAdditionalClassTarget(null)}
        />
      )}

      {assignGuardianTarget && (
        <AssignGuardianModal
          key={assignGuardianTarget.id}
          student={assignGuardianTarget}
          onClose={() => setAssignGuardianTarget(null)}
        />
      )}
    </>
  )
}
