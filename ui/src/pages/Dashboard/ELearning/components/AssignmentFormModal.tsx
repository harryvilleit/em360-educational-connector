import { useEffect, useRef, useState } from "react"
import {
  AlertTriangle,
  CheckSquare,
  Clock3,
  FileText,
  FileUp,
  Loader2,
  Mic,
  Plus,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Trash2,
  Video,
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type {
  TeacherCourseAssignmentAnswerModeI,
  TeacherCourseAssignmentImportResponseI,
  TeacherCourseAssignmentTypeI,
} from "@/api/teacherCourse.api"
import type {
  ELearningAssignment,
  ELearningCbtQuestion,
} from "@/types/elearning"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useGetSchoolAssessmentsBySchool } from "@/hooks/examAndRecords"

export interface AssignmentForm {
  title: string
  subject: string
  className: string
  courseId?: string
  dueDate: string
  description: string
  totalStudents: number
  assignmentType: TeacherCourseAssignmentTypeI
  answerMode: TeacherCourseAssignmentAnswerModeI
  durationMinutes: number
  allowVideoRecording: boolean
  maxRetakes: number
  endAttemptOnTabLeave: true
  disableCopyPaste: true
  sourceDocumentName?: string
  sourceDocumentUrl?: string
  workType: "not_applicable" | "handwritten" | "map" | "diagram" | "mixed"
  languageCode: string
  curriculumStandard?: string
  educationLevel?: string
  countryCode?: string
  schoolSessionId?: string
  schoolSessionTermId?: string
  assessmentComponentId?: string
  gradebookContributionPoints?: number
  submissionMethod: "student_online" | "teacher_paper" | "hybrid"
  questions: ELearningCbtQuestion[]
}

export type AssignmentCourseDefaults = {
  schoolId?: string
  courseId: string
  subject: string
  className: string
  totalStudents: number
}

interface AssignmentFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AssignmentForm) => void | Promise<void>
  courseDefaults?: AssignmentCourseDefaults
  onInterpretDocument?: (
    file: File,
    answerMode: TeacherCourseAssignmentAnswerModeI
  ) => Promise<TeacherCourseAssignmentImportResponseI>
  isInterpreting?: boolean
  isSaving?: boolean
  initialAssignment?: ELearningAssignment | null
}

function toDateTimeLocal(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

const answerModes: {
  value: Exclude<TeacherCourseAssignmentAnswerModeI, "voice" | "visual">
  title: string
  description: string
}[] = [
  {
    value: "single_choice",
    title: "Single answer",
    description: "Students select one correct option.",
  },
  {
    value: "multiple_choice",
    title: "Multiple answers",
    description: "Students may select several correct options.",
  },
  {
    value: "written",
    title: "Written answer",
    description: "Students type an answer instead of selecting options.",
  },
]

function emptyQuestion(
  answerMode: TeacherCourseAssignmentAnswerModeI
): ELearningCbtQuestion {
  return {
    prompt: "",
    referenceAnswer: "",
    points: 1,
    rubricCriteria:
      answerMode === "visual"
        ? [{ name: "Accuracy and completeness", description: "", points: 1 }]
        : [],
    options:
      answerMode === "single_choice" || answerMode === "multiple_choice"
        ? Array.from({ length: 4 }, () => ({ text: "", isCorrect: false }))
        : [],
  }
}

function isChoiceMode(answerMode: TeacherCourseAssignmentAnswerModeI) {
  return answerMode === "single_choice" || answerMode === "multiple_choice"
}

export default function AssignmentFormModal({
  open,
  onClose,
  onSubmit,
  courseDefaults,
  onInterpretDocument,
  isInterpreting = false,
  isSaving = false,
  initialAssignment,
}: AssignmentFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState("")
  const [instructions, setInstructions] = useState("")
  const [assignmentType, setAssignmentType] =
    useState<TeacherCourseAssignmentTypeI>("objective")
  const [answerMode, setAnswerMode] =
    useState<TeacherCourseAssignmentAnswerModeI>("single_choice")
  const [dueDate, setDueDate] = useState("")
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [allowVideoRecording, setAllowVideoRecording] = useState(false)
  const [maxRetakes, setMaxRetakes] = useState(0)
  const [sourceDocumentName, setSourceDocumentName] = useState<string>()
  const [sourceDocumentUrl, setSourceDocumentUrl] = useState<string>()
  const [submissionMethod, setSubmissionMethod] =
    useState<AssignmentForm["submissionMethod"]>("student_online")
  const [workType, setWorkType] = useState<AssignmentForm["workType"]>(
    "not_applicable"
  )
  const [languageCode, setLanguageCode] = useState("en")
  const [curriculumStandard, setCurriculumStandard] = useState("")
  const [educationLevel, setEducationLevel] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [schoolSessionId, setSchoolSessionId] = useState("")
  const [schoolSessionTermId, setSchoolSessionTermId] = useState("")
  const [assessmentComponentId, setAssessmentComponentId] = useState("")
  const [gradebookContributionPoints, setGradebookContributionPoints] =
    useState("")
  const [questions, setQuestions] = useState<ELearningCbtQuestion[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const { sessions } = useGetAllSchoolSessions({
    schoolId: courseDefaults?.schoolId,
    pageSize: 100,
  })
  const { assessments } = useGetSchoolAssessmentsBySchool({
    schoolId: courseDefaults?.schoolId ?? "",
  })
  const selectedSession = sessions.find((item) => item.Id === schoolSessionId)
  const selectedAssessment = assessments.find(
    (item) => item.SchoolSessionId === schoolSessionId
  )
  const selectedComponent = selectedAssessment?.Components.find(
    (item) => item.Id === assessmentComponentId
  )

  const resetForm = () => {
    setTitle("")
    setInstructions("")
    setAssignmentType("objective")
    setAnswerMode("single_choice")
    setDueDate("")
    setDurationMinutes(0)
    setAllowVideoRecording(false)
    setMaxRetakes(0)
    setSourceDocumentName(undefined)
    setSourceDocumentUrl(undefined)
    setSubmissionMethod("student_online")
    setWorkType("not_applicable")
    setLanguageCode("en")
    setCurriculumStandard("")
    setEducationLevel("")
    setCountryCode("")
    setSchoolSessionId("")
    setSchoolSessionTermId("")
    setAssessmentComponentId("")
    setGradebookContributionPoints("")
    setQuestions([])
    setWarnings([])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  useEffect(() => {
    if (!open) return
    if (!initialAssignment) {
      resetForm()
      return
    }
    setTitle(initialAssignment.title)
    setInstructions(initialAssignment.description)
    setAssignmentType(initialAssignment.assignmentType ?? "objective")
    setAnswerMode(initialAssignment.answerMode ?? "single_choice")
    setDueDate(toDateTimeLocal(initialAssignment.dueDate))
    setDurationMinutes(initialAssignment.durationMinutes ?? 0)
    setAllowVideoRecording(initialAssignment.allowVideoRecording ?? false)
    setMaxRetakes(initialAssignment.maxRetakes ?? 0)
    setSourceDocumentName(initialAssignment.sourceDocumentName)
    setSourceDocumentUrl(initialAssignment.sourceDocumentUrl)
    setSubmissionMethod(initialAssignment.submissionMethod ?? "student_online")
    setWorkType(initialAssignment.workType ?? "not_applicable")
    setLanguageCode(initialAssignment.languageCode ?? "en")
    setCurriculumStandard(initialAssignment.curriculumStandard ?? "")
    setEducationLevel(initialAssignment.educationLevel ?? "")
    setCountryCode(initialAssignment.countryCode ?? "")
    setSchoolSessionId(initialAssignment.schoolSessionId ?? "")
    setSchoolSessionTermId(initialAssignment.schoolSessionTermId ?? "")
    setAssessmentComponentId(initialAssignment.assessmentComponentId ?? "")
    setGradebookContributionPoints(
      initialAssignment.gradebookContributionPoints?.toString() ?? ""
    )
    setQuestions(
      (initialAssignment.questions ?? []).map((question) => ({
        ...question,
        rubricCriteria: question.rubricCriteria?.map((criterion) => ({
          ...criterion,
        })),
        options: question.options.map((option) => ({ ...option })),
      }))
    )
    setWarnings([])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [initialAssignment, open])

  const changeAssignmentType = (next: TeacherCourseAssignmentTypeI) => {
    setAssignmentType(next)
    const nextMode: TeacherCourseAssignmentAnswerModeI =
      next === "voice" ? "voice" : next === "visual" ? "visual" : "single_choice"
    setAnswerMode(nextMode)
    setWorkType(next === "visual" ? "handwritten" : "not_applicable")
    setSubmissionMethod("student_online")
    setQuestions([])
    setSourceDocumentName(undefined)
    setSourceDocumentUrl(undefined)
    setWarnings([])
  }

  const changeAnswerMode = (
    next: Exclude<TeacherCourseAssignmentAnswerModeI, "voice" | "visual">
  ) => {
    setAnswerMode(next)
    setQuestions((current) =>
      current.map((question) => ({
        ...question,
        options: isChoiceMode(next)
          ? question.options.length >= 2
            ? question.options
            : Array.from({ length: 4 }, () => ({
                text: "",
                isCorrect: false,
              }))
          : [],
      }))
    )
    setWarnings([])
  }

  const updateQuestion = (
    questionIndex: number,
    change: (question: ELearningCbtQuestion) => ELearningCbtQuestion
  ) => {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex ? change(question) : question
      )
    )
  }

  const handleDocument = async (file: File) => {
    if (!onInterpretDocument) {
      toast.error("Document interpretation is available for database courses")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("The question document must be 5 MB or smaller")
      return
    }

    try {
      const result = await onInterpretDocument(file, answerMode)
      setSourceDocumentName(result.value.sourceDocumentName)
      setSourceDocumentUrl(result.value.sourceDocumentUrl)
      setWarnings(result.value.warnings ?? [])
      setQuestions(
        result.value.questions.map((question) => ({
          prompt: question.prompt,
          referenceAnswer: question.referenceAnswer ?? "",
          points: 1,
          rubricCriteria:
            answerMode === "visual"
              ? [{ name: "Accuracy and completeness", description: "", points: 1 }]
              : [],
          options: question.options.map((option) => ({
            text: option.text,
            isCorrect: option.isCorrect,
          })),
        }))
      )
      toast.success(
        `${result.value.questions.length} question${
          result.value.questions.length === 1 ? "" : "s"
        } imported. Review before publishing.`
      )
    } catch {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const validate = () => {
    if (!title.trim()) return "Enter an assignment title"
    if (!dueDate) return "Select the assignment due date"
    if (durationMinutes < 0 || durationMinutes > 1440)
      return "Duration must be between 0 and 1,440 minutes"
    if (maxRetakes < 0 || maxRetakes > 20)
      return "Retakes must be between 0 and 20"
    if (questions.length === 0) return "Import or add at least one question"
    if (!/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(languageCode.trim()))
      return "Enter a valid language tag such as en, en-GB, fr, ar, or yo-NG"
    if (countryCode.trim() && !/^[A-Za-z]{2}$/.test(countryCode.trim()))
      return "Country must be a two-letter ISO code such as NG, GB, or US"
    if (
      assessmentComponentId &&
      (!schoolSessionId ||
        !schoolSessionTermId ||
        !Number(gradebookContributionPoints))
    )
      return "Select the session, term, component, and contribution points"
    if (
      selectedComponent &&
      Number(gradebookContributionPoints) > selectedComponent.WeightPercentage
    )
      return `Contribution cannot exceed ${selectedComponent.WeightPercentage} points`

    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index]
      if (!question.prompt.trim())
        return `Question ${index + 1} needs question text`
      if (isChoiceMode(answerMode)) {
        const options = question.options.filter((option) => option.text.trim())
        if (options.length < 2)
          return `Question ${index + 1} needs at least two options`
        const correctCount = options.filter((option) => option.isCorrect).length
        if (answerMode === "single_choice" && correctCount !== 1)
          return `Question ${index + 1} must have one correct option`
        if (answerMode === "multiple_choice" && correctCount < 1)
          return `Question ${index + 1} needs at least one correct option`
      } else if (!question.referenceAnswer?.trim()) {
        return `Question ${index + 1} needs a reference answer for marking`
      }
      if (answerMode === "visual") {
        const criteria = question.rubricCriteria ?? []
        if (!criteria.length || criteria.some((item) => !item.name.trim() || item.points <= 0))
          return `Question ${index + 1} needs valid marking criteria`
        const rubricTotal = criteria.reduce((sum, item) => sum + Number(item.points), 0)
        if (Math.abs(rubricTotal - Number(question.points)) > 0.01)
          return `Question ${index + 1} rubric must total ${question.points} points`
      }
    }
    return null
  }

  const publish = async () => {
    const error = validate()
    if (error) {
      toast.error(error)
      return
    }

    setSubmitting(true)
    try {
      const dueDateUtc = new Date(dueDate).toISOString()
      await onSubmit({
        title: title.trim(),
        subject: courseDefaults?.subject ?? "",
        className: courseDefaults?.className ?? "",
        courseId: courseDefaults?.courseId,
        dueDate: dueDateUtc,
        description: instructions.trim(),
        totalStudents: courseDefaults?.totalStudents ?? 0,
        assignmentType,
        answerMode,
        durationMinutes,
        allowVideoRecording,
        maxRetakes,
        endAttemptOnTabLeave: true,
        disableCopyPaste: true,
        sourceDocumentName,
        sourceDocumentUrl,
        submissionMethod,
        workType,
        languageCode: languageCode.trim(),
        curriculumStandard: curriculumStandard.trim() || undefined,
        educationLevel: educationLevel.trim() || undefined,
        countryCode: countryCode.trim().toUpperCase() || undefined,
        schoolSessionId: schoolSessionId || undefined,
        schoolSessionTermId: schoolSessionTermId || undefined,
        assessmentComponentId: assessmentComponentId || undefined,
        gradebookContributionPoints: assessmentComponentId
          ? Number(gradebookContributionPoints)
          : undefined,
        questions: questions.map((question) => ({
          ...question,
          prompt: question.prompt.trim(),
          referenceAnswer: question.referenceAnswer?.trim() || undefined,
          points: Number(question.points) || 1,
          rubricCriteria:
            answerMode === "visual"
              ? (question.rubricCriteria ?? []).map((criterion) => ({
                  name: criterion.name.trim(),
                  description: criterion.description?.trim() || undefined,
                  points: Number(criterion.points),
                }))
              : [],
          options: isChoiceMode(answerMode)
            ? question.options
                .filter((option) => option.text.trim())
                .map((option) => ({
                  text: option.text.trim(),
                  isCorrect: option.isCorrect,
                }))
            : [],
        })),
      })
      resetForm()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const busy = isInterpreting || isSaving || submitting

  return (
    <Dialog open={open} onOpenChange={(value) => !value && !busy && onClose()}>
      <DialogContent className="flex max-h-[94vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl font-semibold">
            {initialAssignment
              ? "Edit CBT assignment"
              : "Create CBT assignment"}
          </DialogTitle>
          <DialogDescription>
            Import questions, correct the preview, then save the assignment as a
            draft for approval.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">1. Assignment type</h3>
              <p className="text-xs text-muted-foreground">
                Choose how students will answer every question.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <button
                type="button"
                className={`rounded-xl border p-4 text-left transition-colors ${
                  assignmentType === "objective"
                    ? "border-blue-400 bg-blue-50 ring-1 ring-blue-100"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => changeAssignmentType("objective")}
              >
                <CheckSquare className="mb-3 size-5 text-blue-600" />
                <p className="text-sm font-semibold">Objective / written CBT</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Single choice, multiple answers, or typed answers.
                </p>
              </button>
              <button
                type="button"
                className={`rounded-xl border p-4 text-left transition-colors ${
                  assignmentType === "voice"
                    ? "border-violet-400 bg-violet-50 ring-1 ring-violet-100"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => changeAssignmentType("voice")}
              >
                <Mic className="mb-3 size-5 text-violet-600" />
                <p className="text-sm font-semibold">Voice-answer CBT</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Students record a voice answer for each question.
                </p>
              </button>
              <button
                type="button"
                className={`rounded-xl border p-4 text-left transition-colors ${
                  assignmentType === "visual"
                    ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-100"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => changeAssignmentType("visual")}
              >
                <ScanLine className="mb-3 size-5 text-emerald-600" />
                <p className="text-sm font-semibold">Handwriting, map or diagram</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Students photograph one or more pages for rubric-based AI review.
                </p>
              </button>
            </div>

            {assignmentType === "objective" && (
              <div className="grid gap-2 md:grid-cols-3">
                {answerModes.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    className={`rounded-lg border px-3 py-3 text-left ${
                      answerMode === mode.value
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => changeAnswerMode(mode.value)}
                  >
                    <p className="text-sm font-medium">{mode.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {mode.description}
                    </p>
                  </button>
                ))}
              </div>
            )}
            {assignmentType === "visual" && (
              <div className="grid gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="visual-work-type">Work being marked</Label>
                  <select
                    id="visual-work-type"
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                    value={workType}
                    onChange={(event) =>
                      setWorkType(event.target.value as AssignmentForm["workType"])
                    }
                  >
                    <option value="handwritten">Handwritten work</option>
                    <option value="map">Map</option>
                    <option value="diagram">Diagram</option>
                    <option value="mixed">Mixed visual work</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submission-method">How work is submitted</Label>
                  <select
                    id="submission-method"
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                    value={submissionMethod}
                    onChange={(event) =>
                      setSubmissionMethod(
                        event.target.value as AssignmentForm["submissionMethod"]
                      )
                    }
                  >
                    <option value="student_online">Students upload online</option>
                    <option value="teacher_paper">Teacher uploads paper scripts</option>
                    <option value="hybrid">Online and teacher paper upload</option>
                  </select>
                </div>
                <div className="rounded-lg bg-white p-3 text-xs leading-5 text-emerald-900">
                  {submissionMethod === "teacher_paper"
                    ? "Students do not see an online submission. After approval, the teacher opens View → Paper intake to upload grouped scripts."
                    : submissionMethod === "hybrid"
                      ? "Students may upload online, and teachers may also upload scanned paper scripts."
                      : "Students can take photos or upload up to 12 image pages per question."} AI suggestions never become final until a teacher approves them.
                </div>
              </div>
            )}
          </section>

          <section className="grid gap-4 rounded-xl border border-gray-100 bg-white p-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cbt-title">Assignment title *</Label>
              <Input
                id="cbt-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Biology introductory knowledge CBT"
              />
            </div>
            {courseDefaults && (
              <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm md:col-span-2">
                <p className="font-medium">
                  {courseDefaults.subject} · {courseDefaults.className}
                </p>
                <p className="text-xs text-muted-foreground">
                  Available to {courseDefaults.totalStudents} enrolled students
                  after approval.
                </p>
              </div>
            )}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cbt-instructions">Instructions</Label>
              <Textarea
                id="cbt-instructions"
                rows={3}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="Tell students what they need to do..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marking-language">Marking language (BCP-47) *</Label>
              <Input
                id="marking-language"
                value={languageCode}
                onChange={(event) => setLanguageCode(event.target.value)}
                placeholder="en, fr, ar, es-MX, yo-NG"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country-code">Country / jurisdiction (optional)</Label>
              <Input
                id="country-code"
                maxLength={2}
                value={countryCode}
                onChange={(event) => setCountryCode(event.target.value.toUpperCase())}
                placeholder="ISO-2, e.g. NG"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="curriculum-standard">Curriculum or exam standard</Label>
              <Input
                id="curriculum-standard"
                value={curriculumStandard}
                onChange={(event) => setCurriculumStandard(event.target.value)}
                placeholder="e.g. WAEC, IB MYP, national curriculum"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education-level">Education level / grade</Label>
              <Input
                id="education-level"
                value={educationLevel}
                onChange={(event) => setEducationLevel(event.target.value)}
                placeholder="e.g. Grade 8, Year 10, JSS 2"
              />
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-semibold">2. Build and review questions</h3>
                <p className="text-xs text-muted-foreground">
                  Import PDF or Word questions (maximum 5 MB), or add them manually.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void handleDocument(file)
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-2 bg-white"
                disabled={busy}
                onClick={() => fileInputRef.current?.click()}
              >
                {isInterpreting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileUp className="size-4" />
                )}
                {sourceDocumentName ? "Replace document" : "Upload questions"}
              </Button>
            </div>

            {sourceDocumentName && (
              <div className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-800">
                <FileText className="size-4 shrink-0" />
                <span className="truncate">{sourceDocumentName}</span>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <p className="mb-1 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="size-3.5" />
                  Check the imported questions
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  {warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-3">
              {questions.map((question, questionIndex) => (
                <div
                  key={`${questionIndex}-${question.id ?? "new"}`}
                  className="space-y-4 rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">
                      Question {questionIndex + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-600"
                      onClick={() =>
                        setQuestions((current) =>
                          current.filter((_, index) => index !== questionIndex)
                        )
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
                    <div className="space-y-1.5">
                      <Label>Question text *</Label>
                      <Textarea
                        rows={2}
                        value={question.prompt}
                        onChange={(event) =>
                          updateQuestion(questionIndex, (current) => ({
                            ...current,
                            prompt: event.target.value,
                          }))
                        }
                      />
                      {answerMode === "visual" && (
                        <div className="mt-4 space-y-2 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <Label>Marking rubric *</Label>
                              <p className="text-[11px] text-muted-foreground">
                                Criteria must total {question.points} points.
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-emerald-800">
                              {(question.rubricCriteria ?? []).reduce(
                                (sum, item) => sum + (Number(item.points) || 0),
                                0
                              )}
                              /{question.points}
                            </span>
                          </div>
                          {(question.rubricCriteria ?? []).map((criterion, criterionIndex) => (
                            <div
                              key={criterionIndex}
                              className="grid gap-2 rounded-md bg-white p-2 sm:grid-cols-[1fr_1.4fr_90px_32px]"
                            >
                              <Input
                                aria-label="Criterion name"
                                placeholder="Criterion"
                                value={criterion.name}
                                onChange={(event) =>
                                  updateQuestion(questionIndex, (current) => ({
                                    ...current,
                                    rubricCriteria: (current.rubricCriteria ?? []).map(
                                      (item, index) =>
                                        index === criterionIndex
                                          ? { ...item, name: event.target.value }
                                          : item
                                    ),
                                  }))
                                }
                              />
                              <Input
                                aria-label="Criterion description"
                                placeholder="What evidence earns these points?"
                                value={criterion.description ?? ""}
                                onChange={(event) =>
                                  updateQuestion(questionIndex, (current) => ({
                                    ...current,
                                    rubricCriteria: (current.rubricCriteria ?? []).map(
                                      (item, index) =>
                                        index === criterionIndex
                                          ? { ...item, description: event.target.value }
                                          : item
                                    ),
                                  }))
                                }
                              />
                              <Input
                                aria-label="Criterion points"
                                type="number"
                                min={0.01}
                                step={0.5}
                                value={criterion.points}
                                onChange={(event) =>
                                  updateQuestion(questionIndex, (current) => ({
                                    ...current,
                                    rubricCriteria: (current.rubricCriteria ?? []).map(
                                      (item, index) =>
                                        index === criterionIndex
                                          ? { ...item, points: Number(event.target.value) }
                                          : item
                                    ),
                                  }))
                                }
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 text-red-500"
                                aria-label="Remove criterion"
                                onClick={() =>
                                  updateQuestion(questionIndex, (current) => ({
                                    ...current,
                                    rubricCriteria: (current.rubricCriteria ?? []).filter(
                                      (_, index) => index !== criterionIndex
                                    ),
                                  }))
                                }
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 bg-white"
                            disabled={(question.rubricCriteria?.length ?? 0) >= 20}
                            onClick={() =>
                              updateQuestion(questionIndex, (current) => ({
                                ...current,
                                rubricCriteria: [
                                  ...(current.rubricCriteria ?? []),
                                  { name: "", description: "", points: 1 },
                                ],
                              }))
                            }
                          >
                            <Plus className="size-3.5" /> Add criterion
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min={0.01}
                        step={0.5}
                        value={question.points}
                        onChange={(event) =>
                          updateQuestion(questionIndex, (current) => ({
                            ...current,
                            points: Number(event.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  {isChoiceMode(answerMode) ? (
                    <div className="space-y-2">
                      <Label>
                        Options — mark{" "}
                        {answerMode === "single_choice" ? "one" : "all"} correct
                        answer{answerMode === "single_choice" ? "" : "s"}
                      </Label>
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center gap-2"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-bold">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <Input
                            value={option.text}
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            onChange={(event) =>
                              updateQuestion(questionIndex, (current) => ({
                                ...current,
                                options: current.options.map((item, index) =>
                                  index === optionIndex
                                    ? { ...item, text: event.target.value }
                                    : item
                                ),
                              }))
                            }
                          />
                          <label className="flex shrink-0 items-center gap-1.5 text-xs">
                            <input
                              type={
                                answerMode === "single_choice"
                                  ? "radio"
                                  : "checkbox"
                              }
                              name={`question-${questionIndex}-correct`}
                              checked={option.isCorrect}
                              onChange={() =>
                                updateQuestion(questionIndex, (current) => ({
                                  ...current,
                                  options: current.options.map(
                                    (item, index) => ({
                                      ...item,
                                      isCorrect:
                                        answerMode === "single_choice"
                                          ? index === optionIndex
                                          : index === optionIndex
                                            ? !item.isCorrect
                                            : item.isCorrect,
                                    })
                                  ),
                                }))
                              }
                            />
                            Correct
                          </label>
                          {question.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0 text-red-500"
                              onClick={() =>
                                updateQuestion(questionIndex, (current) => ({
                                  ...current,
                                  options: current.options.filter(
                                    (_, index) => index !== optionIndex
                                  ),
                                }))
                              }
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {question.options.length < 8 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() =>
                            updateQuestion(questionIndex, (current) => ({
                              ...current,
                              options: [
                                ...current.options,
                                { text: "", isCorrect: false },
                              ],
                            }))
                          }
                        >
                          <Plus className="size-3.5" />
                          Add option
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label>
                        Correct/reference answer *
                        {answerMode === "voice" && (
                          <span className="ml-1 font-normal text-muted-foreground">
                            (used by the teacher while marking the recording)
                          </span>
                        )}
                      </Label>
                      <Textarea
                        rows={2}
                        value={question.referenceAnswer ?? ""}
                        onChange={(event) =>
                          updateQuestion(questionIndex, (current) => ({
                            ...current,
                            referenceAnswer: event.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="gap-2 bg-white"
                onClick={() =>
                  setQuestions((current) => [
                    ...current,
                    emptyQuestion(answerMode),
                  ])
                }
              >
                <Plus className="size-4" />
                Add question manually
              </Button>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-gray-100 bg-white p-5">
            <div>
              <h3 className="text-sm font-semibold">3. Assignment settings</h3>
              <p className="text-xs text-muted-foreground">
                These settings apply to every assignment type.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cbt-due-date">Due date and time *</Label>
                <Input
                  id="cbt-due-date"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cbt-duration">Duration (minutes)</Label>
                <Input
                  id="cbt-duration"
                  type="number"
                  min={0}
                  max={1440}
                  value={durationMinutes}
                  onChange={(event) =>
                    setDurationMinutes(Number(event.target.value) || 0)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  0 means the assignment is not timed.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cbt-retakes">Allowed retakes</Label>
                <Input
                  id="cbt-retakes"
                  type="number"
                  min={0}
                  max={20}
                  value={maxRetakes}
                  onChange={(event) =>
                    setMaxRetakes(Number(event.target.value) || 0)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  0 means no retake after the first attempt.
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4">
              <input
                type="checkbox"
                className="mt-1"
                checked={allowVideoRecording}
                onChange={(event) =>
                  setAllowVideoRecording(event.target.checked)
                }
              />
              <Video className="mt-0.5 size-4 shrink-0 text-blue-600" />
              <span>
                <span className="block text-sm font-medium">
                  Allow video recording during the CBT
                </span>
                <span className="block text-xs text-muted-foreground">
                  Students may record video while completing this assignment.
                </span>
              </span>
            </label>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex gap-2 rounded-lg bg-gray-50 p-3">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-gray-600" />
                <div>
                  <p className="text-xs font-semibold">Timer enforced</p>
                  <p className="text-xs text-muted-foreground">
                    Auto-submits at zero; disabled when duration is 0.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 rounded-lg bg-gray-50 p-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gray-600" />
                <div>
                  <p className="text-xs font-semibold">Tab-leave protection</p>
                  <p className="text-xs text-muted-foreground">
                    Leaving the active CBT tab ends the attempt.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 rounded-lg bg-gray-50 p-3">
                <RotateCcw className="mt-0.5 size-4 shrink-0 text-gray-600" />
                <div>
                  <p className="text-xs font-semibold">
                    Copy and paste blocked
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Copy, cut, paste, and context-menu actions are disabled.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {courseDefaults?.schoolId && (
            <section className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/30 p-5">
              <div>
                <h3 className="text-sm font-semibold">4. Gradebook destination (optional)</h3>
                <p className="text-xs text-muted-foreground">
                  Accumulate the teacher-approved result into any component in the
                  school&apos;s session assessment structure. The school&apos;s dynamic
                  grading scale applies to the resulting gradebook total.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="gradebook-session">Academic session</Label>
                  <select
                    id="gradebook-session"
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                    value={schoolSessionId}
                    onChange={(event) => {
                      setSchoolSessionId(event.target.value)
                      setSchoolSessionTermId("")
                      setAssessmentComponentId("")
                      setGradebookContributionPoints("")
                    }}
                  >
                    <option value="">Does not count toward gradebook</option>
                    {sessions.map((session) => (
                      <option key={session.Id} value={session.Id}>
                        {session.SessionName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradebook-term">Term / reporting period</Label>
                  <select
                    id="gradebook-term"
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm disabled:bg-gray-100"
                    value={schoolSessionTermId}
                    disabled={!schoolSessionId}
                    onChange={(event) => setSchoolSessionTermId(event.target.value)}
                  >
                    <option value="">Select term</option>
                    {(selectedSession?.Terms ?? []).map((term) => (
                      <option key={term.Id} value={term.Id}>
                        {term.TermName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradebook-component">Assessment component</Label>
                  <select
                    id="gradebook-component"
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm disabled:bg-gray-100"
                    value={assessmentComponentId}
                    disabled={!schoolSessionId || !selectedAssessment}
                    onChange={(event) => {
                      setAssessmentComponentId(event.target.value)
                      setGradebookContributionPoints("")
                    }}
                  >
                    <option value="">
                      {schoolSessionId && !selectedAssessment
                        ? "No assessment structure for this session"
                        : "Select component"}
                    </option>
                    {(selectedAssessment?.Components ?? []).map((component) => (
                      <option key={component.Id} value={component.Id}>
                        {component.AssessmentName} ({component.WeightPercentage}%)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradebook-points">Contribution points</Label>
                  <Input
                    id="gradebook-points"
                    type="number"
                    min={0.01}
                    step={0.01}
                    max={selectedComponent?.WeightPercentage}
                    disabled={!assessmentComponentId}
                    value={gradebookContributionPoints}
                    onChange={(event) => setGradebookContributionPoints(event.target.value)}
                    placeholder={selectedComponent ? `Up to ${selectedComponent.WeightPercentage}` : "Select component"}
                  />
                </div>
              </div>
              {selectedComponent && (
                <p className="rounded-lg bg-white px-3 py-2 text-xs text-indigo-900">
                  A score of 80% contributes {(0.8 * (Number(gradebookContributionPoints) || 0)).toFixed(2)} points to {selectedComponent.AssessmentName}. Multiple linked assignments accumulate up to this component&apos;s {selectedComponent.WeightPercentage}% weight.
                </p>
              )}
            </section>
          )}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {questions.length} question{questions.length === 1 ? "" : "s"} ready
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void publish()}
            >
              {isSaving || submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckSquare className="size-4" />
              )}
              {initialAssignment ? "Save changes" : "Save draft"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
