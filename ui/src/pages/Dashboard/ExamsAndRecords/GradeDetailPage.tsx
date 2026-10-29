import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { ArrowLeft, Edit, GraduationCap, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/general/PageHeader"
import { toast } from "sonner"
import { DashboardRoutes } from "@/routes"
import {
  useGetSchoolGradeById,
  useUpdateSchoolGrade,
  useDeleteSchoolGrade,
} from "@/hooks/examAndRecords"

import { GradeDetailsCard } from "./components/GradeDetailsCard"
import { EditGradeModal } from "./components/EditGradeModal"
import { DeleteGradeModal } from "./components/DeleteGradeModal"

export default function GradeDetailPage() {
  const { gradeId, productId } = useParams<{
    gradeId: string
    productId: string
  }>()
  const navigate = useNavigate()

  const { grade, isLoading } = useGetSchoolGradeById(gradeId ?? "")
  const { updateSchoolGradeAsync, isPending: isUpdating } =
    useUpdateSchoolGrade()
  const { deleteSchoolGradeAsync, isPending: isDeleting } =
    useDeleteSchoolGrade({
      onSuccess: () =>
        navigate(DashboardRoutes.toGradeBookSettings(productId ?? "")),
    })

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    grade: "",
    description: "",
    minScore: 0,
    maxScore: 0,
  })

  function openEdit() {
    if (!grade) return
    setEditForm({
      grade: grade.Grade,
      description: grade.Description,
      minScore: grade.MinScore,
      maxScore: grade.MaxScore,
    })
    setEditOpen(true)
  }

  async function handleEditSave() {
    if (!editForm.grade.trim()) {
      toast.error("Grade is required")
      return
    }
    if (editForm.minScore >= editForm.maxScore) {
      toast.error("Max score must be greater than min score")
      return
    }
    await updateSchoolGradeAsync({
      id: gradeId ?? "",
      grade: editForm.grade.trim(),
      description: editForm.description.trim(),
      minScore: editForm.minScore,
      maxScore: editForm.maxScore,
    })
    setEditOpen(false)
  }

  async function handleDelete() {
    await deleteSchoolGradeAsync(gradeId ?? "")
    setDeleteOpen(false)
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // ── Not found ─────────────────────────────────────────────────────────────────
  if (!grade) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
          <GraduationCap className="h-10 w-10 text-blue-400" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">
          Grade not found
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          This grade may have been deleted or doesn't exist.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() =>
            navigate(DashboardRoutes.toGradeBookSettings(productId ?? ""))
          }
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gradebook Settings
        </Button>
      </div>
    )
  }

  const scoreColor =
    grade.MaxScore >= 90
      ? "bg-green-50 text-green-700"
      : grade.MaxScore >= 70
        ? "bg-blue-50 text-blue-700"
        : grade.MaxScore >= 50
          ? "bg-amber-50 text-amber-700"
          : "bg-red-50 text-red-700"

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              Grade {grade.Grade}
              <Badge className={scoreColor}>
                {grade.Description || "No description"}
              </Badge>
            </span>
          }
          description={`Score range: ${grade.MinScore} – ${grade.MaxScore}`}
          onBack={() =>
            navigate(DashboardRoutes.toGradeBookSettings(productId ?? ""))
          }
          backLabel="Back to Gradebook Settings"
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={openEdit}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          }
        />

        {/* Detail cards */}
        <GradeDetailsCard grade={grade} />
      </div>

      <EditGradeModal
        editingGrade={editOpen ? grade : null}
        editForm={editForm}
        onEditFormChange={setEditForm}
        onSave={handleEditSave}
        onClose={() => setEditOpen(false)}
        isPending={isUpdating}
        description="Update the grade details below."
      />
      <DeleteGradeModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        gradeName={grade.Grade}
        onDelete={handleDelete}
        isPending={isDeleting}
      />
    </>
  )
}
