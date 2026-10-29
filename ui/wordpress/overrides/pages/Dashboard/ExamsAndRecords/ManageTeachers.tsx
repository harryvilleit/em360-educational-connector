// WordPress version: server-side search and paging (see wordpress/exams/hooks.ts).
import { useState } from "react"
import { SearchInput } from "@/components/ui/search-input"
import { PageHeader } from "@/components/general/PageHeader"
import { useExamTeachers } from "../../../../exams/hooks"
import { useSchoolId } from "@/contexts/SchoolContext"
import AssignClassToTeacherModal from "@/pages/Dashboard/ExamsAndRecords/components/AssignClassToTeacherModal"
import AssignSubjectModal from "@/pages/Dashboard/ExamsAndRecords/components/AssignSubjectToTeacherModal"
import AssignDepartmentToTeacherModal from "@/pages/Dashboard/ExamsAndRecords/components/AssignDepartmentToTeacherModal"
import { ManageTeachersTable } from "@/pages/Dashboard/ExamsAndRecords/components/ManageTeachersTable"

const PAGE_SIZE = 10

export default function ManageTeachers() {
  const schoolId = useSchoolId()
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [assignClassTarget, setAssignClassTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [assignSubjectTarget, setAssignSubjectTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [assignDepartmentTarget, setAssignDepartmentTarget] = useState<{
    id: string
    name: string
  } | null>(null)

  // Searched and paged on the server: the WordPress gateway returns at most 200 rows per request.
  const {
    teachers: paginatedTeachers,
    isLoading,
    pagination,
    error,
  } = useExamTeachers(schoolId, searchQuery, currentPage, PAGE_SIZE)
  const totalItems = pagination?.totalItems ?? 0

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Management"
        description="View and manage staff directory"
      />

      {error && <p role="alert">{error.message}</p>}

      {/* Search */}
      <SearchInput
        placeholder="Search by name, email or job role..."
        value={searchQuery}
        onChange={handleSearch}
        containerClassName="md:w-1/2"
      />

      <ManageTeachersTable
        teachers={paginatedTeachers}
        isLoading={isLoading}
        totalItems={totalItems}
        currentPage={currentPage}
        searchQuery={searchQuery}
        onPageChange={setCurrentPage}
        onAssignClass={setAssignClassTarget}
        onAssignSubject={setAssignSubjectTarget}
        onAssignDepartment={setAssignDepartmentTarget}
      />

      {/* Assign Class to Teacher */}
      {assignClassTarget && (
        <AssignClassToTeacherModal
          open
          onClose={() => setAssignClassTarget(null)}
          teacherId={assignClassTarget.id}
          teacherName={assignClassTarget.name}
          schoolId={schoolId}
        />
      )}

      {/* Assign Subject to Teacher */}
      {assignSubjectTarget && (
        <AssignSubjectModal
          open
          onOpenChange={(v) => !v && setAssignSubjectTarget(null)}
          teacherName={assignSubjectTarget.name}
          teacherId={assignSubjectTarget.id}
        />
      )}

      {/* Assign Department to Teacher */}
      {assignDepartmentTarget && (
        <AssignDepartmentToTeacherModal
          open
          onClose={() => setAssignDepartmentTarget(null)}
          teacherId={assignDepartmentTarget.id}
          teacherName={assignDepartmentTarget.name}
          schoolId={schoolId}
        />
      )}
    </div>
  )
}
