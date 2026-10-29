// WordPress version: students are listed 50 per page.
import { Search, Users } from "lucide-react"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { StudentForPromotionI } from "@/api/studentPromotion.api/types"
import { StepRow } from "@/pages/Dashboard/ExamsAndRecords/components/StepRow"

type StudentSelectionStepProps = {
  pageNumber: number
  totalPages: number
  onPageChange: (page: number) => void
  selectedIds: Set<string>
  eligibleStudents: StudentForPromotionI[]
  studentsLoading: boolean
  sourceClassId: string
  studentSearch: string
  columns: DataTableColumn<StudentForPromotionI>[]
  onStudentSearchChange: (value: string) => void
}

export function StudentSelectionStep({
  pageNumber,
  totalPages,
  onPageChange,
  selectedIds,
  eligibleStudents,
  studentsLoading,
  sourceClassId,
  studentSearch,
  columns,
  onStudentSearchChange,
}: StudentSelectionStepProps) {
  return (
    <StepRow
      index={2}
      accent="slate"
      icon={Users}
      title="Select students"
      subtitle={`${selectedIds.size} students selected · ${eligibleStudents.length} on this page`}
    >
      <div className="relative mb-3">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search students by name or ID..."
          value={studentSearch}
          onChange={(e) => onStudentSearchChange(e.target.value)}
          disabled={!sourceClassId}
          className="border-gray-200 pl-9"
        />
      </div>

      <DataTable
        columns={columns}
        data={eligibleStudents}
        getRowKey={(student) => student.studentId}
        isLoading={studentsLoading}
        emptyState={
          !sourceClassId ? (
            <EmptyState
              icon={Search}
              title="Select a class"
              description="Choose a class above to see its active students."
              size="sm"
            />
          ) : studentSearch ? (
            <EmptyState
              icon={Search}
              title="No matches"
              description="No students match your search."
              size="sm"
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No active students found"
              description="There are no active students currently enrolled in this class."
              size="sm"
            />
          )
        }
      />
      {totalPages > 1 && (
        <nav aria-label="Student pages" className="mt-3 flex items-center justify-end gap-2">
          <Button variant="outline" disabled={studentsLoading || pageNumber <= 1} onClick={() => onPageChange(pageNumber - 1)}>
            Previous
          </Button>
          <span>
            Page {pageNumber} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={studentsLoading || pageNumber >= totalPages}
            onClick={() => onPageChange(pageNumber + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </StepRow>
  )
}
