import { useCallback, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/general/PageHeader"
import { toast } from "sonner"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetSchoolGradesBySchool,
  useCreateSchoolGrade,
  useUpdateSchoolGrade,
  useGetSchoolAssessmentsBySchool,
  useCreateSchoolAssessment,
  useDeleteSchoolAssessment,
} from "@/hooks/examAndRecords"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import type { SchoolGradeItem } from "@/api/examAndRecords.api/types"
import { AssessmentStructureTab } from "./components/AssessmentStructureTab"
import { GradingScaleTab } from "./components/GradingScaleTab"
import { EditGradeModal } from "./components/EditGradeModal"
import { AutomatedContributionsTab } from "./components/AutomatedContributionsTab"

interface AssessmentRow {
  id: string
  name: string
  weight: string
}

export default function GradeBookSettingsPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const schoolId = useSchoolId()

  const { grades, isLoading: gradesLoading } =
    useGetSchoolGradesBySchool(schoolId)
  const { createSchoolGradeAsync, isPending: isCreating } =
    useCreateSchoolGrade()
  const { updateSchoolGradeAsync, isPending: isUpdating } =
    useUpdateSchoolGrade()

  const { sessions: rawSessions } = useGetAllSchoolSessions({
    schoolId,
    pageSize: 100,
  })
  const sessionOptions = rawSessions.map((s) => ({
    id: s.Id,
    name: s.SessionName,
    isCurrent: s.IsCurrent,
    terms: s.Terms.map((term) => ({
      id: term.Id,
      name: term.TermName,
      isCurrent: term.IsCurrent,
    })),
  }))

  const { assessments, isLoading: assessmentsLoading } =
    useGetSchoolAssessmentsBySchool({ schoolId })
  const { createSchoolAssessmentAsync, isPending: isCreatingAssessment } =
    useCreateSchoolAssessment()
  const { deleteSchoolAssessmentAsync, isPending: isDeletingAssessment } =
    useDeleteSchoolAssessment()

  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false)
  const [structureName, setStructureName] = useState("")
  const [session, setSession] = useState("")
  const [assessmentRows, setAssessmentRows] = useState<AssessmentRow[]>([
    { id: "r1", name: "", weight: "" },
  ])

  const totalEntered = assessmentRows.reduce(
    (sum, r) => sum + (parseFloat(r.weight) || 0),
    0
  )
  const remaining = 100 - totalEntered

  function handleRowChange(
    id: string,
    field: "name" | "weight",
    value: string
  ) {
    setAssessmentRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  function handleAddRow() {
    setAssessmentRows((rows) => [
      ...rows,
      { id: Date.now().toString(), name: "", weight: "" },
    ])
  }

  function handleRemoveRow(id: string) {
    if (assessmentRows.length === 1) return
    setAssessmentRows((rows) => rows.filter((r) => r.id !== id))
  }

  function resetAssessmentForm() {
    setStructureName("")
    setSession("")
    setAssessmentRows([{ id: "r1", name: "", weight: "" }])
  }

  async function handleAddAssessment() {
    if (!structureName.trim()) {
      toast.error("Please enter a structure name")
      return
    }
    if (!session) {
      toast.error("Please select a session")
      return
    }
    const filledRows = assessmentRows.filter((r) => r.name.trim())
    if (filledRows.length === 0) {
      toast.error("Please add at least one assessment item")
      return
    }
    for (const row of filledRows) {
      if (!row.weight || parseFloat(row.weight) <= 0) {
        toast.error(`Weight for "${row.name}" must be greater than 0`)
        return
      }
    }
    if (Math.round(totalEntered) !== 100) {
      toast.error(`Weights must sum to 100% (currently ${totalEntered}%)`)
      return
    }
    await createSchoolAssessmentAsync({
      schoolId,
      structureName: structureName.trim(),
      schoolSessionId: session,
      components: filledRows.map((r) => ({
        assessmentName: r.name.trim(),
        weightPercentage: parseFloat(r.weight),
      })),
    })
    resetAssessmentForm()
    setIsAssessmentModalOpen(false)
  }

  async function handleDeleteAssessment(id: string) {
    await deleteSchoolAssessmentAsync(id)
  }

  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false)
  const [gradingForm, setGradingForm] = useState({
    grade: "",
    minScore: 0,
    maxScore: 0,
    description: "",
  })

  const [editingGrade, setEditingGrade] = useState<SchoolGradeItem | null>(null)
  const [editForm, setEditForm] = useState({
    grade: "",
    minScore: 0,
    maxScore: 0,
    description: "",
  })

  function openEdit(g: SchoolGradeItem) {
    setEditingGrade(g)
    setEditForm({
      grade: g.Grade,
      minScore: g.MinScore,
      maxScore: g.MaxScore,
      description: g.Description,
    })
  }

  async function handleAddGradingScale() {
    if (!gradingForm.grade.trim()) {
      toast.error("Grade is required")
      return
    }
    if (gradingForm.minScore >= gradingForm.maxScore) {
      toast.error("Max score must be greater than min score")
      return
    }
    await createSchoolGradeAsync({
      grade: gradingForm.grade.trim(),
      description: gradingForm.description.trim(),
      minScore: gradingForm.minScore,
      maxScore: gradingForm.maxScore,
      schoolId,
    })
    setGradingForm({ grade: "", minScore: 0, maxScore: 0, description: "" })
    setIsGradingModalOpen(false)
  }

  async function handleEditSave() {
    if (!editingGrade) return
    if (!editForm.grade.trim()) {
      toast.error("Grade is required")
      return
    }
    if (editForm.minScore >= editForm.maxScore) {
      toast.error("Max score must be greater than min score")
      return
    }
    await updateSchoolGradeAsync({
      id: editingGrade.Id,
      grade: editForm.grade.trim(),
      description: editForm.description.trim(),
      minScore: editForm.minScore,
      maxScore: editForm.maxScore,
    })
    setEditingGrade(null)
  }

  const handleViewGradeDetails = useCallback(
    (gradeId: string) => {
      navigate(DashboardRoutes.toGradeDetail(productId ?? "", gradeId))
    },
    [navigate, productId]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gradebook Settings"
        description="Configure assessment structures, grading scales and automated score history"
      />

      <Tabs defaultValue="assessment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessment">Assessment Structure</TabsTrigger>
          <TabsTrigger value="grading">Grading Scale</TabsTrigger>
          <TabsTrigger value="audit">Automated Contributions</TabsTrigger>
        </TabsList>

        <AssessmentStructureTab
          assessments={assessments}
          isLoading={assessmentsLoading}
          isCreating={isCreatingAssessment}
          isDeleting={isDeletingAssessment}
          sessions={sessionOptions.map(({ id, name }) => ({ id, name }))}
          isModalOpen={isAssessmentModalOpen}
          onModalOpenChange={setIsAssessmentModalOpen}
          structureName={structureName}
          onStructureNameChange={setStructureName}
          session={session}
          onSessionChange={setSession}
          assessmentRows={assessmentRows}
          onRowChange={handleRowChange}
          onAddRow={handleAddRow}
          onRemoveRow={handleRemoveRow}
          onAddAssessment={handleAddAssessment}
          onResetForm={resetAssessmentForm}
          onDeleteAssessment={handleDeleteAssessment}
          totalEntered={totalEntered}
          remaining={remaining}
        />

        <GradingScaleTab
          grades={grades}
          isLoading={gradesLoading}
          isCreating={isCreating}
          isGradingModalOpen={isGradingModalOpen}
          onGradingModalOpenChange={setIsGradingModalOpen}
          gradingForm={gradingForm}
          onGradingFormChange={setGradingForm}
          onAddGradingScale={handleAddGradingScale}
          onEdit={openEdit}
          onViewDetails={handleViewGradeDetails}
        />

        <AutomatedContributionsTab
          schoolId={schoolId}
          sessions={sessionOptions}
        />
      </Tabs>

      <EditGradeModal
        editingGrade={editingGrade}
        editForm={editForm}
        onEditFormChange={setEditForm}
        onSave={handleEditSave}
        onClose={() => setEditingGrade(null)}
        isPending={isUpdating}
      />
    </div>
  )
}
