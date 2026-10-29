import { Checkbox } from "@/components/ui/checkbox"
import type { DataTableColumn } from "@/components/ui/data-table"
import type { StudentForPromotionI } from "@/api/studentPromotion.api/types"

type PromotionStudentTableProps = {
  eligibleStudents: StudentForPromotionI[]
  selectedIds: Set<string>
  onToggleStudent: (id: string) => void
  onToggleAllVisible: () => void
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/)
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase()
}

export function PromotionStudentTable({
  eligibleStudents,
  selectedIds,
  onToggleStudent,
  onToggleAllVisible,
}: PromotionStudentTableProps) {
  const columns: DataTableColumn<StudentForPromotionI>[] = [
    {
      key: "select",
      header: (
        <Checkbox
          checked={
            eligibleStudents.length > 0 &&
            eligibleStudents.every((s) => selectedIds.has(s.studentId))
              ? true
              : eligibleStudents.some((s) => selectedIds.has(s.studentId))
                ? "indeterminate"
                : false
          }
          onCheckedChange={onToggleAllVisible}
          aria-label="Select all"
        />
      ),
      headerClassName: "w-10",
      render: (student) => (
        <Checkbox
          checked={selectedIds.has(student.studentId)}
          onCheckedChange={() => onToggleStudent(student.studentId)}
          aria-label={`Select ${student.studentName}`}
        />
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (student) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            {initialsOf(student.studentName)}
          </div>
          <p className="font-medium text-gray-900">{student.studentName}</p>
        </div>
      ),
    },
    {
      key: "studentId",
      header: "Student ID",
      cellClassName: "font-mono text-xs text-gray-500",
      render: (student) => student.admissionNumber || "—",
    },
  ]

  return columns
}
