import { usePermissions } from "@/hooks/usePermissions"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { Plus } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetSchoolStudents,
  useGetStudentDashboardOverview,
  useDeleteStudent,
} from "@/hooks/studentPortal"
import { mapSchoolStudentItem } from "@/utils/studentAdapter"
import { statusToApi } from "@/utils/studentEnums"
import { DashboardRoutes } from "@/routes"
import Pagination from "@/components/ui/pagination"
import { StudentTable } from "./components/StudentTable"
import { StudentStats } from "./components/StudentStat"
import { StudentFilters } from "./components/StudentFilter"
import { DeleteConfirmModal } from "./components/DeleteConfirmModal"
import type { EnrollmentStatus } from "@/types/student"

const PAGE_SIZE = 10

export default function StudentListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { productId } = useParams()
  const schoolId = useSchoolId()
  const { canCreate } = usePermissions()

  useEffect(() => {
    const state = location.state as { focusSearch?: boolean } | null
    if (state?.focusSearch) {
      document.getElementById("student-search-input")?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [filterStatus, setFilterStatus] = useState(
    location.state?.status || "all",
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { overview } = useGetStudentDashboardOverview(schoolId)

  const { students, pagination, isLoading, isError, refetch } =
    useGetSchoolStudents({
      schoolId,
      search: debouncedSearch || undefined,
      status:
        filterStatus !== "all"
          ? statusToApi(filterStatus as EnrollmentStatus)
          : undefined,
      pageNumber: currentPage,
      pageSize: PAGE_SIZE,
    })

  const { deleteStudent } = useDeleteStudent({
    onSuccess: () => setDeleteTarget(null),
  })

  const rows = useMemo(() => students.map(mapSchoolStudentItem), [students])

  function handleSearchChange(value: string) {
    setSearch(value)
    setCurrentPage(1)
  }

  function handleStatusChange(value: string) {
    setFilterStatus(value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage all student records and profiles"
        actions={
          canCreate("/dashboard/students/add") && (
            <Button
              variant="primary"
              onClick={() => navigate(DashboardRoutes.toStudentAdd(productId!))}
              className="w-full justify-center sm:w-auto"
            >
              <Plus className="size-4" />
              Add Student
            </Button>
          )
        }
      />

      <StudentStats overview={overview} />

      <StudentFilters
        search={search}
        filterStatus={filterStatus}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      {isError ? (
        <QueryErrorPanel
          title="Unable to load students"
          message="The student list could not be retrieved. Please try again."
          onRetry={() => void refetch()}
        />
      ) : (
        <StudentTable
          students={rows}
          isFiltered={!!search || filterStatus !== "all"}
          isLoading={isLoading}
          onDeleteRequest={setDeleteTarget}
        />
      )}

      {!isError && pagination.totalItems > PAGE_SIZE && (
        <Pagination
          page={currentPage}
          total={pagination.totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deleteStudent({ studentId: deleteTarget, schoolId })}
        />
      )}
    </div>
  )
}
