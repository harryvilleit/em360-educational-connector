import { memo, useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Award, Edit, Eye, MoreHorizontal } from "lucide-react"
import { useParams } from "react-router"
import type { SchoolGradeItem } from "@/api/examAndRecords.api/types"
import { usePermissions } from "@/hooks/usePermissions"
import { DashboardRoutes } from "@/routes"

interface GradingScaleTableProps {
  grades: SchoolGradeItem[]
  isLoading: boolean
  onEdit: (grade: SchoolGradeItem) => void
  onViewDetails: (gradeId: string) => void
}

const ActionMenu = memo(function ActionMenu({
  grade,
  onEdit,
  onViewDetails,
}: {
  grade: SchoolGradeItem
  onEdit: (g: SchoolGradeItem) => void
  onViewDetails: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { productId } = useParams<{ productId: string }>()
  const { canUpdate } = usePermissions()
  const canEditGrade = canUpdate(DashboardRoutes.toGradeBookSettings(productId ?? ""))

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} className="relative inline-block">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((p) => !p)}
        className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          <button
            onClick={() => { onViewDetails(grade.Id); setOpen(false) }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs text-gray-600 hover:bg-gray-50"
          >
            <Eye className="size-3.5 text-gray-400" />
            View Details
          </button>
          {canEditGrade && (
            <>
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={() => { onEdit(grade); setOpen(false) }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs text-gray-600 hover:bg-gray-50"
              >
                <Edit className="size-3.5 text-gray-400" />
                Edit Grade
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
})

export function GradingScaleTable({
  grades,
  isLoading,
  onEdit,
  onViewDetails,
}: GradingScaleTableProps) {
  const columns: DataTableColumn<SchoolGradeItem>[] = [
    {
      key: "grade",
      header: "Grade",
      render: (g) => (
        <div onClick={(e) => e.stopPropagation()}>
          <span className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
            {g.Grade}
          </span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      cellClassName: "text-gray-600",
      render: (g) => g.Description || "—",
    },
    {
      key: "minScore",
      header: "Min Score",
      cellClassName: "font-medium",
      render: (g) => g.MinScore,
    },
    {
      key: "maxScore",
      header: "Max Score",
      cellClassName: "font-medium",
      render: (g) => g.MaxScore,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (g) => (
        <div onClick={(e) => e.stopPropagation()}>
          <ActionMenu grade={g} onEdit={onEdit} onViewDetails={onViewDetails} />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={grades}
      getRowKey={(g) => g.Id}
      isLoading={isLoading}
      onRowClick={(g) => onViewDetails(g.Id)}
      emptyState={
        <EmptyState
          icon={Award}
          title="No grading scales yet"
          description='No grading scales defined yet. Click "Add Grade" to create one.'
          size="sm"
        />
      }
    />
  )
}
