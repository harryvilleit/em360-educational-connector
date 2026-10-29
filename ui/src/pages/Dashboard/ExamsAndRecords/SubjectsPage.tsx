import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { PageHeader } from "@/components/general/PageHeader"
import { Plus } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllSubjectsPaginated } from "@/hooks/examAndRecords"
import type { SubjectItem } from "@/api/examAndRecords.api/types"
import SubjectsTable from "./components/SubjectsTable"
import CreateSubjectModal from "./components/CreateSubjectModal"
import EditSubjectModal from "./components/EditSubjectModal"
import DeleteSubjectModal from "./components/DeleteSubjectModal"
import AssignClassesToSubjectModal from "./components/AssignClassesToSubjectModal"
import { Can } from "@/components/general/Can"
import { DashboardRoutes } from "@/routes"

const PAGE_SIZE = 10

export default function SubjectsPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const schoolId = useSchoolId()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAssignClassesOpen, setIsAssignClassesOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null)

  const { subjects, pagination, isLoading } = useGetAllSubjectsPaginated({
    schoolId,
    search: searchQuery || undefined,
    pageNumber: currentPage,
    pageSize: PAGE_SIZE,
  })

  function handleSearch(value: string) {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  function handleEdit(subject: SubjectItem) {
    setSelectedSubject(subject)
    setIsEditModalOpen(true)
  }

  function handleDelete(subject: SubjectItem) {
    setSelectedSubject(subject)
    setIsDeleteModalOpen(true)
  }

  function handleAssignClasses(subject: SubjectItem) {
    setSelectedSubject(subject)
    setIsAssignClassesOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects & Courses"
        description="Manage all subjects and courses"
        actions={
          <Can menuUrl={DashboardRoutes.toSubjects(productId ?? "")} action="Create">
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="size-4" />
              Create Subject
            </Button>
          </Can>
        }
      />

  
      <SearchInput
        placeholder="Search subjects..."
        value={searchQuery}
        onChange={handleSearch}
        containerClassName="md:w-1/2"
      />

      <SubjectsTable
        subjects={subjects}
        isLoading={isLoading}
        searchQuery={searchQuery}
        currentPage={currentPage}
        totalItems={pagination?.totalItems ?? 0}
        onPageChange={setCurrentPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAssignClasses={handleAssignClasses}
        onCreateFirst={() => setIsCreateModalOpen(true)}
      />

      <CreateSubjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <EditSubjectModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        subject={selectedSubject}
      />

      <DeleteSubjectModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        subject={selectedSubject}
      />

      <AssignClassesToSubjectModal
        open={isAssignClassesOpen}
        onClose={() => setIsAssignClassesOpen(false)}
        subjectId={selectedSubject?.Id ?? ""}
        subjectName={selectedSubject?.Name ?? ""}
        schoolId={schoolId}
      />
    </div>
  )
}
