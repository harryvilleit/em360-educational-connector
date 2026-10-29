import { useState } from "react"
import { useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { PageHeader } from "@/components/general/PageHeader"
import { Plus } from "lucide-react"
import type { DepartmentItem } from "@/api/examAndRecords.api/types"
import { useGetDepartmentsBySchoolPaginated } from "@/hooks/examAndRecords"
import { useSchoolId } from "@/contexts/SchoolContext"
import CreateDepartmentModal from "./components/CreateDepartmentModal"
import EditDepartmentModal from "./components/EditDepartmentModal"
import DeleteDepartmentModal from "./components/DeleteDepartmentModal"
import DepartmentsTable from "./components/DepartmentsTable"
import { Can } from "@/components/general/Can"
import { DashboardRoutes } from "@/routes"

const PAGE_SIZE = 10

export default function DepartmentsPage() {
  const { productId } = useParams<{ productId: string }>()
  const schoolId = useSchoolId()

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DepartmentItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DepartmentItem | null>(null)

  const { departments, pagination, isLoading } =
    useGetDepartmentsBySchoolPaginated({
      schoolId: schoolId,
      keyword: searchQuery || undefined,
      pageNumber: currentPage,
      pageSize: PAGE_SIZE,
    })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage school departments"
        actions={
          <Can menuUrl={DashboardRoutes.toDepartments(productId ?? "")} action="Create">
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              <Plus className="size-4" />
              Add Department
            </Button>
          </Can>
        }
      />

      <SearchInput
        placeholder="Search departments..."
        value={searchQuery}
        onChange={(value) => {
          setSearchQuery(value)
          setCurrentPage(1)
        }}
        containerClassName="md:w-1/2"
      />

      <DepartmentsTable
        departments={departments}
        isLoading={isLoading}
        searchQuery={searchQuery}
        page={currentPage}
        totalItems={pagination?.totalItems ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
        onCreateFirst={() => setIsCreateOpen(true)}
      />

      <CreateDepartmentModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        schoolId={schoolId}
      />

      <EditDepartmentModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        department={editTarget}
      />

      <DeleteDepartmentModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        department={deleteTarget}
      />
    </div>
  )
}
