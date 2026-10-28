import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  FileQuestion,
  Flag,
  LockKeyhole,
  ImagePlus,
  Mic,
  Radio,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { HomeRoutes } from "@/routes"
import {
  endStudentAssignmentApi,
  saveStudentAssignmentAnswersApi,
  startStudentAssignmentApi,
  submitStudentAssignmentApi,
  uploadStudentVoiceAnswerApi,
  uploadStudentVisualPageApi,
  type StudentAssignmentI,
  type StudentAssignmentQuestionI,
  type StudentSavedAnswerI,
} from "@/api/studentElearning.api"
import {
  studentCourseWorkspaceKey,
  useStudentCourseWorkspace,
} from "@/hooks/elearning/useStudentELearning"
import { useCbtProctoring } from "./useCbtProctoring"

type RunnerPhase = "intro" | "questions" | "review" | "closed" | "submitted"
type AnswerMap = Record<string, StudentSavedAnswerI>
type VoiceDraft = { file: File; previewUrl: string; durationSeconds: number }
type VoiceDraftMap = Record<string, VoiceDraft>
type VisualDraft = { file: File; previewUrl: string }
type VisualDraftMap = Record<string, VisualDraft[]>
type DeviceCheckState = { tested: boolean; microphone: boolean; camera: boolean }

function answerFor(questionId: string, answers: AnswerMap): StudentSavedAnswerI {
  return answers[questionId] ?? {
    questionId,
    selectedOptionIds: [],
    textAnswer: "",
    voiceAnswerUrl: null,
    visualPages: [],
  }
}

function hasAnswer(
  question: StudentAssignmentQuestionI,
  answer?: StudentSavedAnswerI,
  hasLocalVoice = false,
  hasLocalVisual = false
) {
  // Voice drafts stay in the browser until final submission, so there may be no
  // server answer object yet. A retained local recording is still an answer.
  if (question.answerMode === "voice" && hasLocalVoice) return true
  if (question.answerMode === "visual" && hasLocalVisual) return true
  if (!answer) return false
  if (question.answerMode === "single_choice" || question.answerMode === "multiple_choice") {
    return answer.selectedOptionIds.length > 0
  }
  if (question.answerMode === "voice") return Boolean(answer.voiceAnswerUrl)
  if (question.answerMode === "visual") return (answer.visualPages?.length ?? 0) > 0
  return Boolean(answer.textAnswer?.trim())
}

function formatTimer(seconds: number) {
  const safe = Math.max(0, seconds)
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const secs = safe % 60
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${minutes}:${String(secs).padStart(2, "0")}`
}

export default function StudentCbtPage() {
  const {
    schoolId = "",
    subjectId = "",
    classId = "",
    assignmentId = "",
  } = useParams<{
    schoolId: string
    subjectId: string
    classId: string
    assignmentId: string
  }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { workspace, isLoading } = useStudentCourseWorkspace(
    schoolId,
    subjectId,
    classId
  )
  const assignment = workspace?.assignments.find((item) => item.id === assignmentId)
  const requiresMicrophone = Boolean(
    assignment?.questions.some((question) => question.answerMode === "voice")
  )
  const requiresCamera = Boolean(assignment?.allowVideoRecording)
  const [phase, setPhase] = useState<RunnerPhase>("intro")
  const [attemptId, setAttemptId] = useState<string>()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [voiceDrafts, setVoiceDrafts] = useState<VoiceDraftMap>({})
  const [visualDrafts, setVisualDrafts] = useState<VisualDraftMap>({})
  const [deviceCheck, setDeviceCheck] = useState<DeviceCheckState>({
    tested: false,
    microphone: false,
    camera: false,
  })
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const [snapshotBaseline, setSnapshotBaseline] = useState(0)
  const [isStarting, setStarting] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState("")
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const hydratedAssignmentRef = useRef<string | undefined>(undefined)
  const endingRef = useRef(false)
  const answersRef = useRef<AnswerMap>({})
  const voiceDraftsRef = useRef<VoiceDraftMap>({})
  const visualDraftsRef = useRef<VisualDraftMap>({})

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    voiceDraftsRef.current = voiceDrafts
  }, [voiceDrafts])

  useEffect(() => {
    visualDraftsRef.current = visualDrafts
  }, [visualDrafts])

  useEffect(() => () => {
    Object.values(voiceDraftsRef.current).forEach((draft) =>
      URL.revokeObjectURL(draft.previewUrl)
    )
    Object.values(visualDraftsRef.current).flat().forEach((draft) =>
      URL.revokeObjectURL(draft.previewUrl)
    )
  }, [])

  useEffect(() => {
    if (!assignment || hydratedAssignmentRef.current === assignment.id) return
    hydratedAssignmentRef.current = assignment.id
    const latest = assignment.latestAttempt
    const restored = Object.fromEntries(
      (latest?.answers ?? []).map((answer) => [answer.questionId, answer])
    )
    setAnswers(restored)
    answersRef.current = restored
    setSnapshotBaseline(latest?.snapshotCount ?? 0)
    if (latest?.status === "in_progress") {
      setAttemptId(latest.id)
      setRemainingSeconds(
        assignment.durationMinutes > 0
          ? latest.remainingSeconds ?? assignment.durationMinutes * 60
          : null
      )
      setPhase("questions")
    } else if (assignment.studentStatus === "submitted") {
      setPhase("submitted")
    } else if (assignment.studentStatus === "ended") {
      setPhase("closed")
    } else {
      setPhase("intro")
    }
  }, [assignment])

  const active = Boolean(attemptId && phase === "questions" || attemptId && phase === "review")
  const saveAllAnswers = useCallback(async () => {
    if (!attemptId) return
    await saveStudentAssignmentAnswersApi(
      schoolId,
      attemptId,
      Object.values(answersRef.current)
    )
  }, [attemptId, schoolId])

  const endAttempt = useCallback(
    async (reason: "tab_leave" | "timer_expired" | "camera_denied" | "network_failure" | "manual_exit") => {
      if (!attemptId || endingRef.current) return
      endingRef.current = true
      try {
        await endStudentAssignmentApi(schoolId, attemptId, reason)
      } finally {
        setPhase("closed")
        if (reason === "timer_expired") toast.error("Time is up. Your assignment has ended.")
        else if (reason === "camera_denied") toast.error("The assignment ended because camera access was not available.")
        else if (reason === "tab_leave") toast.error("Leaving the CBT tab ended this assignment.")
      }
    },
    [attemptId, schoolId]
  )

  const proctoring = useCbtProctoring({
    enabled: Boolean(active && assignment?.allowVideoRecording),
    schoolId,
    attemptId,
    durationMinutes: assignment?.durationMinutes ?? 0,
    remainingSeconds,
    existingSnapshots: snapshotBaseline,
    onFatal: (reason) => void endAttempt(reason),
  })

  useEffect(() => {
    if (!active || !assignment?.disableCopyPaste) return
    const block = (event: Event) => event.preventDefault()
    document.addEventListener("copy", block)
    document.addEventListener("cut", block)
    document.addEventListener("paste", block)
    document.addEventListener("contextmenu", block)
    return () => {
      document.removeEventListener("copy", block)
      document.removeEventListener("cut", block)
      document.removeEventListener("paste", block)
      document.removeEventListener("contextmenu", block)
    }
  }, [active, assignment?.disableCopyPaste])

  useEffect(() => {
    if (!active || !assignment?.endAttemptOnTabLeave) return
    const leave = () => {
      if (document.visibilityState === "hidden") void endAttempt("tab_leave")
    }
    const pageHide = () => void endAttempt("tab_leave")
    document.addEventListener("visibilitychange", leave)
    window.addEventListener("pagehide", pageHide)
    return () => {
      document.removeEventListener("visibilitychange", leave)
      window.removeEventListener("pagehide", pageHide)
    }
  }, [active, assignment?.endAttemptOnTabLeave, endAttempt])

  useEffect(() => {
    if (!active || !attemptId) return
    const timeout = window.setTimeout(() => {
      void saveAllAnswers().catch(() => undefined)
    }, 800)
    return () => window.clearTimeout(timeout)
  }, [active, answers, attemptId, saveAllAnswers])

  useEffect(() => {
    if (!active || remainingSeconds === null) return
    if (remainingSeconds <= 0) {
      void endAttempt("timer_expired")
      return
    }
    const timer = window.setInterval(
      () => setRemainingSeconds((current) => current === null ? null : Math.max(0, current - 1)),
      1000
    )
    return () => window.clearInterval(timer)
  }, [active, endAttempt, remainingSeconds])

  const start = async () => {
    if (!assignment) return
    if ((requiresMicrophone && !deviceCheck.microphone)
      || (requiresCamera && !deviceCheck.camera)) {
      toast.error("Test the required microphone and camera before starting.")
      return
    }
    setStarting(true)
    try {
      const response = await startStudentAssignmentApi(schoolId, assignment.id)
      setAttemptId(response.value.id)
      setRemainingSeconds(
        assignment.durationMinutes > 0 ? assignment.durationMinutes * 60 : null
      )
      setSnapshotBaseline(0)
      endingRef.current = false
      setPhase("questions")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The assignment could not be started")
    } finally {
      setStarting(false)
    }
  }

  const updateAnswer = (questionId: string, update: Partial<StudentSavedAnswerI>) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: { ...answerFor(questionId, current), ...update },
    }))
  }

  const saveVoiceDraft = (questionId: string, draft: VoiceDraft) => {
    setVoiceDrafts((current) => {
      const previous = current[questionId]
      if (previous) URL.revokeObjectURL(previous.previewUrl)
      return { ...current, [questionId]: draft }
    })
  }

  const discardVoiceDraft = (questionId: string) => {
    setVoiceDrafts((current) => {
      const previous = current[questionId]
      if (!previous) return current
      URL.revokeObjectURL(previous.previewUrl)
      const next = { ...current }
      delete next[questionId]
      return next
    })
    updateAnswer(questionId, { voiceAnswerUrl: null })
  }

  const addVisualDrafts = (questionId: string, files: File[]) => {
    const allowed = files.filter((file) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name} is not a supported image`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10 MB`)
        return false
      }
      return true
    })
    setVisualDrafts((current) => {
      const existing = current[questionId] ?? []
      const available = Math.max(
        0,
        12 - (answersRef.current[questionId]?.visualPages?.length ?? 0) - existing.length
      )
      if (allowed.length > available)
        toast.error("A question can have no more than 12 visual pages")
      return {
        ...current,
        [questionId]: [
          ...existing,
          ...allowed.slice(0, available).map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
          })),
        ],
      }
    })
  }

  const discardVisualDraft = (questionId: string, draftIndex: number) => {
    setVisualDrafts((current) => {
      const existing = current[questionId] ?? []
      const removed = existing[draftIndex]
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return {
        ...current,
        [questionId]: existing.filter((_, index) => index !== draftIndex),
      }
    })
  }

  const submit = async () => {
    if (!attemptId || !assignment) return
    setSubmitting(true)
    try {
      const drafts = Object.entries(voiceDraftsRef.current)
      const finalAnswers = { ...answersRef.current }
      for (let index = 0; index < drafts.length; index += 1) {
        const [questionId, draft] = drafts[index]
        setSubmitProgress(`Uploading voice answer ${index + 1} of ${drafts.length}…`)
        const response = await uploadStudentVoiceAnswerApi(
          schoolId,
          attemptId,
          questionId,
          draft.file
        )
        finalAnswers[questionId] = {
          ...answerFor(questionId, finalAnswers),
          voiceAnswerUrl: response.value.voiceAnswerUrl,
        }
      }
      const visualUploads = Object.entries(visualDraftsRef.current).flatMap(
        ([questionId, pages]) => pages.map((page) => ({ questionId, page }))
      )
      for (let index = 0; index < visualUploads.length; index += 1) {
        const { questionId, page } = visualUploads[index]
        setSubmitProgress(`Uploading visual page ${index + 1} of ${visualUploads.length}…`)
        const response = await uploadStudentVisualPageApi(
          schoolId,
          attemptId,
          questionId,
          page.file
        )
        const existing = answerFor(questionId, finalAnswers)
        finalAnswers[questionId] = {
          ...existing,
          visualPages: [...(existing.visualPages ?? []), response.value],
        }
        URL.revokeObjectURL(page.previewUrl)
        const remainingPages = (visualDraftsRef.current[questionId] ?? []).filter(
          (item) => item !== page
        )
        const remainingDrafts = {
          ...visualDraftsRef.current,
          [questionId]: remainingPages,
        }
        visualDraftsRef.current = remainingDrafts
        setVisualDrafts(remainingDrafts)
        answersRef.current = { ...finalAnswers }
        setAnswers({ ...finalAnswers })
      }
      answersRef.current = finalAnswers
      setAnswers(finalAnswers)
      setSubmitProgress("Saving your final answers…")
      await saveStudentAssignmentAnswersApi(
        schoolId,
        attemptId,
        Object.values(finalAnswers)
      )
      setSubmitProgress("Closing the assignment…")
      await submitStudentAssignmentApi(schoolId, attemptId)
      Object.values(voiceDraftsRef.current).forEach((draft) =>
        URL.revokeObjectURL(draft.previewUrl)
      )
      voiceDraftsRef.current = {}
      setVoiceDrafts({})
      Object.values(visualDraftsRef.current).flat().forEach((draft) =>
        URL.revokeObjectURL(draft.previewUrl)
      )
      visualDraftsRef.current = {}
      setVisualDrafts({})
      setSubmitDialogOpen(false)
      setPhase("submitted")
      await queryClient.invalidateQueries({
        queryKey: studentCourseWorkspaceKey(schoolId, subjectId, classId),
      })
      toast.success("Assignment submitted successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The assignment could not be submitted")
    } finally {
      setSubmitting(false)
      setSubmitProgress("")
    }
  }

  const backToCourse = () =>
    navigate(HomeRoutes.toStudentElearningCourse(schoolId, subjectId, classId))

  if (isLoading) {
    return <div className="py-24 text-center text-sm text-slate-400">Loading assignment…</div>
  }
  if (!assignment || !workspace) {
    return (
      <div className="py-24 text-center">
        <p className="font-semibold text-slate-800">Assignment not found</p>
        <Button variant="outline" className="mt-4" onClick={backToCourse}>Back to course</Button>
      </div>
    )
  }

  if (phase === "intro") {
    const due = new Date(assignment.dueDateUtc)
    const overdue = due.getTime() <= Date.now()
    const devicesReady = (!requiresMicrophone || deviceCheck.microphone)
      && (!requiresCamera || deviceCheck.camera)
    return (
      <div className="mx-auto max-w-4xl pb-12">
        <button type="button" onClick={backToCourse} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600">
          <ArrowLeft className="size-4" /> Back to {workspace.subjectName}
        </button>
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-blue-700 to-cyan-500 p-1 shadow-2xl">
          <div className="rounded-[22px] bg-white p-6 sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-violet-700">
                  <Sparkles className="size-3.5" /> {assignment.assignmentType === "voice" ? "Voice CBT" : assignment.assignmentType === "visual" ? `${assignment.workType.replaceAll("_", " ")} assignment` : "CBT Assignment"}
                </span>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">{assignment.title}</h1>
                <p className="mt-2 text-sm text-slate-500">{workspace.subjectName} · {workspace.className}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 px-5 py-4 text-center text-white">
                <p className="text-2xl font-black">{assignment.questions.length}</p>
                <p className="text-xs text-slate-300">questions</p>
              </div>
            </div>

            {assignment.instructions && (
              <div className="mt-7 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">
                {assignment.instructions}
              </div>
            )}

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <InfoCard icon={Clock3} label={assignment.durationMinutes > 0 ? `${assignment.durationMinutes} minutes` : "No time limit"} />
              <InfoCard icon={FileQuestion} label={`Due ${due.toLocaleString()}`} />
              <InfoCard icon={LockKeyhole} label={assignment.disableCopyPaste ? "Copy and paste disabled" : "Standard browser controls"} />
              <InfoCard icon={assignment.allowVideoRecording ? Camera : ShieldCheck} label={assignment.allowVideoRecording ? "Random camera snapshots enabled" : "Camera not required"} />
            </div>

            {assignment.endAttemptOnTabLeave && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                <p><strong>Stay on this page.</strong> Switching tabs, closing the page, or leaving the CBT ends the assignment. Only your teacher can reopen it.</p>
              </div>
            )}

            {(requiresMicrophone || requiresCamera) && (
              <DeviceCheckPanel
                requireMicrophone={requiresMicrophone}
                requireCamera={requiresCamera}
                onStatusChange={setDeviceCheck}
              />
            )}

            <Button
              className="mt-7 h-12 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-base font-black shadow-lg hover:from-violet-700 hover:to-blue-700"
              disabled={isStarting || overdue || !devicesReady}
              onClick={() => void start()}
            >
              {overdue
                ? "Assignment is past due"
                : !devicesReady
                  ? "Test required devices to continue"
                  : isStarting
                    ? "Starting…"
                    : assignment.studentStatus === "reopened"
                      ? "Start reopened assignment"
                      : "Start assignment"}
              {!overdue && <ArrowRight className="size-5" />}
            </Button>
          </div>
        </section>
      </div>
    )
  }

  if (phase === "closed" || phase === "submitted") {
    const submitted = phase === "submitted" || assignment.studentStatus === "submitted"
    const finalAttempt = assignment.latestAttempt
    const hasFinalGrade = finalAttempt?.finalScore != null
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className={cn("mx-auto flex size-20 items-center justify-center rounded-full", submitted ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-700")}>
          {submitted ? <CheckCircle2 className="size-10" /> : <LockKeyhole className="size-9" />}
        </div>
        <h1 className="mt-6 text-3xl font-black text-slate-950">{submitted ? "Assignment submitted!" : "Assignment closed"}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {submitted
            ? "Your answers have been saved. You cannot take this assignment again unless your teacher reopens it."
            : "This attempt has ended. Your saved answers remain available to your teacher, who can reopen the assignment for you."}
        </p>
        {submitted && hasFinalGrade && finalAttempt && (
          <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Final result</p>
                <p className="mt-1 text-sm text-emerald-900">Your marked result and any approved feedback are ready.</p>
              </div>
              <span className="rounded-xl bg-emerald-700 px-4 py-2 text-xl font-black text-white">
                {finalAttempt.finalScore}%
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {assignment.questions.map((question, index) => {
                const answer = finalAttempt.answers.find((item) => item.questionId === question.id)
                if (answer?.awardedPoints == null && !answer?.teacherFeedback) return null
                return (
                  <div key={question.id} className="rounded-xl bg-white p-3 text-sm">
                    <p className="font-semibold text-slate-900">
                      Question {index + 1}: {answer?.awardedPoints ?? 0}/{question.points}
                    </p>
                    {answer?.teacherFeedback && (
                      <p className="mt-1 leading-6 text-slate-600">{answer.teacherFeedback}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        <Button className="mt-7 rounded-xl" onClick={backToCourse}>Return to course</Button>
      </div>
    )
  }

  const answeredCount = assignment.questions.filter((question) =>
    hasAnswer(
      question,
      answers[question.id],
      Boolean(voiceDrafts[question.id]),
      Boolean(visualDrafts[question.id]?.length)
    )
  ).length
  if (phase === "review") {
    return (
      <CbtShell
        assignment={assignment}
        remainingSeconds={remainingSeconds}
        answeredCount={answeredCount}
        proctoring={proctoring}
      >
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-9">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><Flag className="size-7" /></div>
            <h2 className="mt-5 text-3xl font-black text-slate-950">Review your answers</h2>
            <p className="mt-2 text-sm text-slate-500">Select a question number to return to that question and check its answer before submitting.</p>
            <div className="mt-7 grid grid-cols-5 gap-3 sm:grid-cols-8 md:grid-cols-10">
              {assignment.questions.map((question, index) => {
                const answered = hasAnswer(
                  question,
                  answers[question.id],
                  Boolean(voiceDrafts[question.id]),
                  Boolean(visualDrafts[question.id]?.length)
                )
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => { setCurrentIndex(index); setPhase("questions") }}
                    className={cn(
                      "aspect-square rounded-xl text-sm font-black transition hover:-translate-y-0.5",
                      answered ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" : "bg-amber-100 text-amber-800 ring-1 ring-amber-200"
                    )}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-2xl font-black text-emerald-700">{answeredCount}</p><p className="text-xs font-semibold text-emerald-800">Answered</p></div>
              <div className="rounded-2xl bg-amber-50 p-4"><p className="text-2xl font-black text-amber-700">{assignment.questions.length - answeredCount}</p><p className="text-xs font-semibold text-amber-800">Not answered</p></div>
            </div>
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button variant="outline" className="h-11 rounded-xl" onClick={() => { setCurrentIndex(assignment.questions.length - 1); setPhase("questions") }}><ChevronLeft className="size-4" /> Back to questions</Button>
              <Button className="h-11 rounded-xl bg-emerald-600 px-6 font-black hover:bg-emerald-700" onClick={() => setSubmitDialogOpen(true)}><Send className="size-4" /> Submit final answers</Button>
            </div>
          </div>
        </div>
        <SubmitDialog open={submitDialogOpen} unanswered={assignment.questions.length - answeredCount} submitting={isSubmitting} progressText={submitProgress} onClose={() => setSubmitDialogOpen(false)} onSubmit={() => void submit()} />
      </CbtShell>
    )
  }

  const question = assignment.questions[currentIndex]
  const currentAnswer = answerFor(question.id, answers)
  return (
    <CbtShell
      assignment={assignment}
      remainingSeconds={remainingSeconds}
      answeredCount={answeredCount}
      proctoring={proctoring}
    >
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_250px]">
        <section className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">Question {currentIndex + 1} of {assignment.questions.length}</span>
            <span className="text-xs font-semibold text-slate-400">{question.points} {question.points === 1 ? "mark" : "marks"}</span>
          </div>
          <h2 className="mt-6 text-xl font-black leading-8 text-slate-950 sm:text-2xl">{question.prompt}</h2>
          <div className="mt-7">
            <QuestionAnswer
              question={question}
              answer={currentAnswer}
              voiceDraft={voiceDrafts[question.id]}
              visualDrafts={visualDrafts[question.id] ?? []}
              onChange={(update) => updateAnswer(question.id, update)}
              onVoiceRecorded={(draft) => saveVoiceDraft(question.id, draft)}
              onVoiceDiscard={() => discardVoiceDraft(question.id)}
              onVisualFiles={(files) => addVisualDrafts(question.id, files)}
              onVisualDiscard={(index) => discardVisualDraft(question.id, index)}
            />
          </div>
          <div className="mt-9 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <Button variant="outline" className="h-11 rounded-xl" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}><ChevronLeft className="size-4" /> Previous</Button>
            <Button className="h-11 rounded-xl px-5 font-black" onClick={() => currentIndex === assignment.questions.length - 1 ? setPhase("review") : setCurrentIndex((index) => index + 1)}>
              {currentIndex === assignment.questions.length - 1 ? "Review answers" : "Next question"} <ArrowRight className="size-4" />
            </Button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Questions</p>
            <div className="mt-3 grid grid-cols-5 gap-2 lg:grid-cols-4">
              {assignment.questions.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "aspect-square rounded-lg text-xs font-black",
                    index === currentIndex
                      ? "bg-blue-600 text-white"
                      : hasAnswer(
                          item,
                          answers[item.id],
                          Boolean(voiceDrafts[item.id]),
                          Boolean(visualDrafts[item.id]?.length)
                        )
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                  )}
                >{index + 1}</button>
              ))}
            </div>
          </div>
          {assignment.allowVideoRecording && (
            <div className="overflow-hidden rounded-2xl bg-slate-950 p-2 shadow-sm">
              <div className="relative overflow-hidden rounded-xl">
                <video ref={proctoring.videoRef} muted playsInline className="aspect-video w-full object-cover" />
                {proctoring.captureStatus !== "idle" && (
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition",
                    proctoring.captureStatus === "saved" ? "bg-white/35" : "bg-slate-950/30"
                  )}>
                    <span className="rounded-full bg-slate-950/80 px-3 py-1.5 text-[11px] font-black text-white">
                      {proctoring.captureStatus === "saved"
                        ? "Snapshot saved"
                        : proctoring.captureStatus === "retrying"
                          ? "Retrying snapshot…"
                          : "Taking snapshot…"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-2 pb-1 pt-2 text-[11px] font-semibold text-slate-300">
                <span className="inline-flex items-center gap-1.5"><span className={cn("size-2 rounded-full", proctoring.isCameraReady ? "bg-emerald-400" : "bg-amber-400")} /> {proctoring.isCameraReady ? "Camera ready" : "Starting camera…"}</span>
                <span>{proctoring.snapshotCount}/10 snapshots</span>
              </div>
              {proctoring.lastCapturedAt && (
                <p className="px-2 pb-1 text-[10px] text-emerald-300">
                  Last saved {proctoring.lastCapturedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </CbtShell>
  )
}

function CbtShell({ assignment, remainingSeconds, answeredCount, proctoring, children }: { assignment: StudentAssignmentI; remainingSeconds: number | null; answeredCount: number; proctoring: ReturnType<typeof useCbtProctoring>; children: React.ReactNode }) {
  return (
    <div className="-m-4 min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-violet-50 sm:-m-6">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white"><Sparkles className="size-5" /></div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-slate-950">{assignment.title}</p><p className="text-xs text-slate-500">{answeredCount}/{assignment.questions.length} answered</p></div>
          {assignment.allowVideoRecording && <span className="hidden items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 sm:inline-flex"><Radio className="size-3.5 animate-pulse" /> Snapshot monitoring</span>}
          <span className={cn("inline-flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-sm font-black", remainingSeconds !== null && remainingSeconds < 300 ? "bg-rose-100 text-rose-700" : "bg-slate-950 text-white")}><Clock3 className="size-4" /> {remainingSeconds === null ? "Untimed" : formatTimer(remainingSeconds)}</span>
        </div>
        {proctoring.error && <p className="mx-auto mt-2 max-w-6xl text-xs font-semibold text-rose-600">{proctoring.error}</p>}
        {proctoring.warning && <p className="mx-auto mt-2 max-w-6xl text-xs font-semibold text-amber-700">{proctoring.warning}</p>}
      </header>
      {children}
    </div>
  )
}

function QuestionAnswer({
  question,
  answer,
  voiceDraft,
  visualDrafts,
  onChange,
  onVoiceRecorded,
  onVoiceDiscard,
  onVisualFiles,
  onVisualDiscard,
}: {
  question: StudentAssignmentQuestionI
  answer: StudentSavedAnswerI
  voiceDraft?: VoiceDraft
  visualDrafts: VisualDraft[]
  onChange: (update: Partial<StudentSavedAnswerI>) => void
  onVoiceRecorded: (draft: VoiceDraft) => void
  onVoiceDiscard: () => void
  onVisualFiles: (files: File[]) => void
  onVisualDiscard: (index: number) => void
}) {
  if (question.answerMode === "written") {
    return <Textarea value={answer.textAnswer ?? ""} onChange={(event) => onChange({ textAnswer: event.target.value })} placeholder="Write your answer here…" className="min-h-52 resize-y rounded-2xl border-slate-200 p-4 text-base leading-7" />
  }
  if (question.answerMode === "voice") {
    return (
      <VoiceAnswerRecorder
        questionId={question.id}
        existingUrl={answer.voiceAnswerUrl}
        draft={voiceDraft}
        onRecorded={onVoiceRecorded}
        onDiscard={onVoiceDiscard}
      />
    )
  }
  if (question.answerMode === "visual") {
    return (
      <VisualAnswerUploader
        question={question}
        existingPages={answer.visualPages ?? []}
        drafts={visualDrafts}
        onFiles={onVisualFiles}
        onDiscard={onVisualDiscard}
      />
    )
  }
  const multiple = question.answerMode === "multiple_choice"
  return (
    <div className="space-y-3">
      {question.options.map((option, index) => {
        const selected = answer.selectedOptionIds.includes(option.id)
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              const selectedOptionIds = multiple
                ? selected
                  ? answer.selectedOptionIds.filter((id) => id !== option.id)
                  : [...answer.selectedOptionIds, option.id]
                : [option.id]
              onChange({ selectedOptionIds })
            }}
            className={cn("flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5", selected ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-200")}
          >
            <span className={cn("flex size-9 shrink-0 items-center justify-center border text-sm font-black", multiple ? "rounded-lg" : "rounded-full", selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-slate-50 text-slate-500")}>{selected ? <Check className="size-4" /> : String.fromCharCode(65 + index)}</span>
            <span className="font-semibold text-slate-800">{option.text}</span>
          </button>
        )
      })}
      {multiple && <p className="pt-1 text-xs text-slate-500">You may select more than one answer.</p>}
    </div>
  )
}

function VisualAnswerUploader({
  question,
  existingPages,
  drafts,
  onFiles,
  onDiscard,
}: {
  question: StudentAssignmentQuestionI
  existingPages: StudentSavedAnswerI["visualPages"]
  drafts: VisualDraft[]
  onFiles: (files: File[]) => void
  onDiscard: (index: number) => void
}) {
  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const totalPages = (existingPages?.length ?? 0) + drafts.length
  const choose = (files: FileList | null) => {
    if (files?.length) onFiles(Array.from(files))
  }

  return (
    <div className="space-y-4">
      {(question.rubricCriteria?.length ?? 0) > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
            How this work will be marked
          </p>
          <ul className="mt-2 space-y-2">
            {question.rubricCriteria.map((criterion) => (
              <li key={criterion.name} className="flex gap-3 text-sm text-emerald-950">
                <span className="font-black">{criterion.points} pt</span>
                <span>
                  <strong>{criterion.name}</strong>
                  {criterion.description ? ` — ${criterion.description}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-5 text-center">
        <ImagePlus className="mx-auto size-9 text-blue-600" />
        <p className="mt-2 font-black text-slate-900">Add clear, upright images</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Photograph the entire page in good light. JPG, PNG or WebP; up to 10 MB each and 12 pages.
        </p>
        <input
          ref={uploadRef}
          className="hidden"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => {
            choose(event.target.files)
            event.target.value = ""
          }}
        />
        <input
          ref={cameraRef}
          className="hidden"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => {
            choose(event.target.files)
            event.target.value = ""
          }}
        />
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button type="button" variant="outline" className="gap-2 bg-white" disabled={totalPages >= 12} onClick={() => cameraRef.current?.click()}>
            <Camera className="size-4" /> Take photo
          </Button>
          <Button type="button" variant="outline" className="gap-2 bg-white" disabled={totalPages >= 12} onClick={() => uploadRef.current?.click()}>
            <Upload className="size-4" /> Choose images
          </Button>
        </div>
      </div>

      {totalPages > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500">{totalPages}/12 pages</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(existingPages ?? []).map((page) => (
              <div key={page.id} className="overflow-hidden rounded-xl border border-emerald-200 bg-white">
                <img src={page.fileUrl} alt={`Saved page ${page.pageNumber}`} className="aspect-[4/3] w-full object-cover" />
                <p className="truncate px-2 py-1.5 text-[10px] text-emerald-700">Saved page {page.pageNumber}</p>
              </div>
            ))}
            {drafts.map((draft, index) => (
              <div key={`${draft.file.name}-${index}`} className="relative overflow-hidden rounded-xl border border-blue-200 bg-white">
                <img src={draft.previewUrl} alt={`Selected page ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
                <button
                  type="button"
                  aria-label={`Remove ${draft.file.name}`}
                  onClick={() => onDiscard(index)}
                  className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-slate-950/75 text-white"
                >
                  <Trash2 className="size-4" />
                </button>
                <p className="truncate px-2 py-1.5 text-[10px] text-blue-700">{draft.file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function startAudioMeter(stream: MediaStream, onLevel: (level: number) => void) {
  const context = new AudioContext()
  void context.resume()
  const analyser = context.createAnalyser()
  const source = context.createMediaStreamSource(stream)
  const samples = new Uint8Array(analyser.frequencyBinCount)
  analyser.fftSize = 256
  analyser.smoothingTimeConstant = 0.72
  source.connect(analyser)
  let frame = 0

  const read = () => {
    analyser.getByteFrequencyData(samples)
    const average = samples.reduce((sum, value) => sum + value, 0) / samples.length
    onLevel(Math.min(1, average / 105))
    frame = window.requestAnimationFrame(read)
  }
  read()

  return () => {
    window.cancelAnimationFrame(frame)
    source.disconnect()
    void context.close()
    onLevel(0)
  }
}

function VoiceMeter({ level, active }: { level: number; active: boolean }) {
  return (
    <div className="mx-auto mt-5 flex h-12 max-w-xs items-center justify-center gap-1" aria-label={active ? "Live microphone level" : "Microphone inactive"}>
      {Array.from({ length: 18 }, (_, index) => {
        const distance = Math.abs(index - 8.5) / 8.5
        const strength = Math.max(0.08, level * (1.25 - distance * 0.5))
        return (
          <span
            key={index}
            className={cn(
              "w-1.5 rounded-full transition-[height,background-color] duration-75",
              active ? strength > 0.45 ? "bg-rose-500" : "bg-violet-500" : "bg-slate-300"
            )}
            style={{ height: `${active ? 7 + strength * 38 : 7 + (index % 3) * 3}px` }}
          />
        )
      })}
    </div>
  )
}

function VoiceAnswerRecorder({
  questionId,
  existingUrl,
  draft,
  onRecorded,
  onDiscard,
}: {
  questionId: string
  existingUrl?: string | null
  draft?: VoiceDraft
  onRecorded: (draft: VoiceDraft) => void
  onDiscard: () => void
}) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const meterStopRef = useRef<(() => void) | null>(null)
  const recordingStartedRef = useRef(0)
  const timerRef = useRef<number | undefined>(undefined)
  const [recording, setRecording] = useState(false)
  const [level, setLevel] = useState(0)
  const [recordingSeconds, setRecordingSeconds] = useState(0)

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    meterStopRef.current?.()
    const recorder = recorderRef.current
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null
      recorder.stop()
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const start = async () => {
    try {
      if (!("MediaRecorder" in window)) {
        toast.error("Voice recording is not supported by this browser.")
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ]
      const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)
      recorderRef.current = recorder
      recordingStartedRef.current = Date.now()
      setRecordingSeconds(0)
      meterStopRef.current = startAudioMeter(stream, setLevel)
      timerRef.current = window.setInterval(
        () => setRecordingSeconds(Math.floor((Date.now() - recordingStartedRef.current) / 1000)),
        250
      )
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data) }
      recorder.onstop = () => {
        if (timerRef.current) window.clearInterval(timerRef.current)
        meterStopRef.current?.()
        meterStopRef.current = null
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        const cleanType = recorder.mimeType.split(";", 1)[0] || "audio/webm"
        const extension = cleanType.includes("ogg")
          ? "ogg"
          : cleanType.includes("mp4")
            ? "m4a"
            : cleanType.includes("wav")
              ? "wav"
              : "webm"
        const blob = new Blob(chunksRef.current, { type: cleanType })
        if (blob.size < 256) {
          toast.error("No voice was captured. Please record your answer again.")
          return
        }
        if (blob.size > 15 * 1024 * 1024) {
          toast.error("This recording is over 15 MB. Please record a shorter answer.")
          return
        }
        const file = new File(
          [blob],
          `voice-answer-${questionId}-${Date.now()}.${extension}`,
          { type: cleanType }
        )
        onRecorded({
          file,
          previewUrl: URL.createObjectURL(file),
          durationSeconds: Math.max(1, Math.round((Date.now() - recordingStartedRef.current) / 1000)),
        })
        toast.success("Recording saved on this device. It will upload when you submit.")
      }
      recorder.start(250)
      if (draft || existingUrl) onDiscard()
      setRecording(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Microphone access is required for this question")
    }
  }

  const stop = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop()
    setRecording(false)
  }

  const previewUrl = draft?.previewUrl ?? existingUrl

  return (
    <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 p-6 text-center">
      <div className={cn("mx-auto flex size-20 items-center justify-center rounded-full", recording ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "bg-white text-violet-700 shadow-lg")}><Mic className="size-9" /></div>
      <h3 className="mt-4 text-lg font-black text-slate-900">Record your answer</h3>
      <p className="mt-1 text-sm text-slate-500">Speak clearly, stop, then listen before keeping your answer.</p>
      <VoiceMeter level={level} active={recording} />
      {recording && <p className="mt-1 font-mono text-sm font-black text-rose-600">{formatTimer(recordingSeconds)}</p>}
      <Button type="button" className={cn("mt-5 h-11 rounded-full px-6", recording && "bg-rose-600 hover:bg-rose-700")} onClick={() => recording ? stop() : void start()}>{recording ? <><Square className="size-4 fill-current" /> Stop recording</> : previewUrl ? <><RotateCcw className="size-4" /> Record again</> : <><Mic className="size-4" /> Start recording</>}</Button>
      {previewUrl && !recording && (
        <div className="mx-auto mt-5 max-w-md rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-violet-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-800">Your recorded answer</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {draft ? `${formatTimer(draft.durationSeconds)} · kept on this device until final submit` : "Previously saved answer"}
              </p>
            </div>
            <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
          </div>
          <audio controls preload="metadata" src={previewUrl} className="mt-3 w-full" />
        </div>
      )}
    </div>
  )
}

function DeviceCheckPanel({
  requireMicrophone,
  requireCamera,
  onStatusChange,
}: {
  requireMicrophone: boolean
  requireCamera: boolean
  onStatusChange: (status: DeviceCheckState) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const meterStopRef = useRef<(() => void) | null>(null)
  const [testing, setTesting] = useState(false)
  const [tested, setTested] = useState(false)
  const [microphoneReady, setMicrophoneReady] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [level, setLevel] = useState(0)
  const [error, setError] = useState<string>()

  const stopStream = () => {
    meterStopRef.current?.()
    meterStopRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }

  useEffect(() => () => stopStream(), [])

  const testDevices = async () => {
    stopStream()
    setTesting(true)
    setTested(false)
    setMicrophoneReady(false)
    setCameraReady(false)
    setError(undefined)
    onStatusChange({ tested: false, microphone: false, camera: false })
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: requireMicrophone,
        video: requireCamera
          ? { facingMode: "user", width: { ideal: 960 }, height: { ideal: 540 } }
          : false,
      })
      streamRef.current = stream
      const microphone = !requireMicrophone || stream.getAudioTracks().length > 0
      const camera = !requireCamera || stream.getVideoTracks().length > 0
      setMicrophoneReady(microphone)
      setCameraReady(camera)
      if (requireMicrophone) meterStopRef.current = startAudioMeter(stream, setLevel)
      if (requireCamera && videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setTested(true)
      onStatusChange({ tested: true, microphone, camera })
    } catch {
      stopStream()
      setError("Allow access in your browser, then test the devices again.")
      onStatusChange({ tested: true, microphone: false, camera: false })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-black">Check your devices before starting</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">The assignment will only start after the required devices are ready.</p>
        </div>
        <Button type="button" variant="secondary" className="rounded-xl" disabled={testing} onClick={() => void testDevices()}>
          {testing ? "Testing…" : tested ? "Test again" : "Test microphone & camera"}
        </Button>
      </div>
      <div className={cn("mt-4 grid gap-4", requireCamera && requireMicrophone && "sm:grid-cols-2")}>
        {requireCamera && (
          <div className="overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
            <video ref={videoRef} muted playsInline className="aspect-video w-full object-cover" />
            <p className="flex items-center gap-2 px-3 py-2 text-xs font-bold">
              <span className={cn("size-2 rounded-full", cameraReady ? "bg-emerald-400" : "bg-slate-500")} />
              {cameraReady ? "Camera is working" : "Camera waiting for test"}
            </p>
          </div>
        )}
        {requireMicrophone && (
          <div className="flex min-h-36 flex-col justify-center rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-sm font-black"><Mic className="size-4" /> Microphone</div>
            <VoiceMeter level={level} active={microphoneReady} />
            <p className={cn("text-center text-xs font-bold", microphoneReady ? "text-emerald-300" : "text-slate-400")}>
              {microphoneReady ? "Speak now — the bars should move" : "Microphone waiting for test"}
            </p>
          </div>
        )}
      </div>
      {error && <p className="mt-3 text-xs font-semibold text-rose-300">{error}</p>}
      {tested && microphoneReady && cameraReady && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-emerald-300"><CheckCircle2 className="size-4" /> Required devices are ready</p>
      )}
    </div>
  )
}

function InfoCard({ icon: Icon, label }: { icon: typeof Clock3; label: string }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"><span className="flex size-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm"><Icon className="size-5" /></span><span className="text-sm font-bold text-slate-700">{label}</span></div>
}

function SubmitDialog({ open, unanswered, submitting, progressText, onClose, onSubmit }: { open: boolean; unanswered: number; submitting: boolean; progressText: string; onClose: () => void; onSubmit: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader><DialogTitle>Submit your assignment?</DialogTitle><DialogDescription>{unanswered > 0 ? `You still have ${unanswered} unanswered ${unanswered === 1 ? "question" : "questions"}. ` : "All questions have an answer. "}After submission, the assignment is closed unless your teacher reopens it.</DialogDescription></DialogHeader>
        {submitting && progressText && <p className="text-sm font-semibold text-blue-700">{progressText}</p>}
        <DialogFooter><Button variant="outline" disabled={submitting} onClick={onClose}>Keep reviewing</Button><Button className="bg-emerald-600 hover:bg-emerald-700" disabled={submitting} onClick={onSubmit}>{submitting ? "Submitting…" : "Yes, submit"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
