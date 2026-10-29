import { useEffect, useId, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { TeacherCourseRefI } from "@/api/teacherCourse.api"
import { teacherCourseWorkspaceKey } from "@/hooks/elearning/useTeacherCourseWorkspace"
import {
  actOnAiCourseDraft,
  aiCourseKey,
  createAiCourseDraft,
  getAiCourseDraft,
  listAiCourseDrafts,
  saveAiCourseDraft,
  type AiCourseBrief,
  type AiCourseContent,
  type AiCourseDraft,
  type AiCourseLesson,
} from "@/api/digitalSchoolAiCourse.api"

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
function Field({
  label,
  value,
  onChange,
  multiline = false,
  maxLength = 200,
  type = "text",
  min,
  max,
  hint,
}: {
  label: string
  value: string | number
  onChange: (value: string) => void
  multiline?: boolean
  maxLength?: number
  type?: string
  min?: number
  max?: number
  hint?: string
}) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className={inputClass + " min-h-28 resize-y leading-relaxed"}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className={inputClass}
          type={type}
          value={value}
          min={min}
          max={max}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
const stateLabels: Record<AiCourseDraft["state"], string> = {
  queued: "Queued",
  generating: "Generating",
  outlineReady: "Outline ready",
  ready: "Ready for review",
  failed: "Needs attention",
  cancelled: "Paused",
  imported: "Added to course",
}
const working = (d?: AiCourseDraft) =>
  d?.state === "queued" || d?.state === "generating"

export default function AiCourseBuilder({
  courseRef,
  courseTitle,
  className,
  variant = "banner",
}: {
  courseRef: TeacherCourseRefI
  courseTitle: string
  className?: string
  /** "card" is the compact side-column version used on the course overview. */
  variant?: "banner" | "card"
}) {
  const [open, setOpen] = useState(false)
  const [unsaved, setUnsaved] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  return (
    <>
      {variant === "card" ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-slate-900 p-5 text-white sm:p-6">
          <Sparkles size={22} className="text-indigo-200" aria-hidden="true" />
          <p className="font-semibold">Build your next course with AI</p>
          <p className="text-[13px] leading-relaxed text-slate-300">
            Plan a curriculum, lessons and assessments, then review every detail.
          </p>
          <Button
            variant="outline"
            className="h-11 rounded-xl border-0 bg-white text-slate-900 hover:bg-slate-100"
            onClick={() => setOpen(true)}
          >
            Open AI Course Builder
          </Button>
        </div>
      ) : (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/5 via-background to-background p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="font-semibold">Build your next course with AI</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Plan a curriculum, create lessons and assessments, then review
              every detail.
            </p>
          </div>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Sparkles size={16} /> AI Course Builder
        </Button>
      </div>
      )}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next && unsaved) setConfirmClose(true)
          else setOpen(next)
        }}
      >
        <DialogContent className="flex h-[90dvh] max-h-[960px] max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
          <DialogHeader className="border-b px-5 py-5 pr-12 sm:px-7">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="text-primary" size={21} /> AI Course Builder
            </DialogTitle>
            <DialogDescription>
              {courseTitle}
              {className ? ` · ${className}` : ""} · Digital School
            </DialogDescription>
          </DialogHeader>
          {open && (
            <BuilderWorkspace
              key={`${courseRef.schoolId}:${courseRef.subjectId}:${courseRef.classId}`}
              courseRef={courseRef}
              courseTitle={courseTitle}
              className={className}
              onDirtyChange={setUnsaved}
            />
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close with unsaved edits?</AlertDialogTitle>
            <AlertDialogDescription>
              Your saved draft will remain available. These latest edits will be
              discarded if you close now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setUnsaved(false)
                setOpen(false)
              }}
            >
              Discard edits & close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
function BuilderWorkspace({
  courseRef,
  courseTitle,
  className,
  onDirtyChange,
}: {
  courseRef: TeacherCourseRefI
  courseTitle: string
  className?: string
  onDirtyChange: (dirty: boolean) => void
}) {
  const client = useQueryClient()
  const [id, setId] = useState<string>()
  const [draft, setDraft] = useState<AiCourseDraft>()
  const [content, setContent] = useState<AiCourseContent>({
    overview: "",
    sections: [],
  })
  const [dirty, setDirty] = useState(false)
  useEffect(() => {
    onDirtyChange(dirty)
  }, [dirty, onDirtyChange])
  const [step, setStep] = useState("brief")
  const [selectedLesson, setSelectedLesson] = useState(0)
  const [lessonTab, setLessonTab] = useState("notes")
  const [instructions, setInstructions] = useState("")
  const [reviewed, setReviewed] = useState(false)
  const [dueDate, setDueDate] = useState(() =>
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  )
  const requestKey = useRef(crypto.randomUUID())
  const [brief, setBrief] = useState<AiCourseBrief>({
    title: courseTitle,
    topic: "",
    educationLevel: className ?? "",
    countryCode: "NG",
    curriculumStandard: "",
    languageCode: "en",
    learningGoals: "",
    sectionCount: 2,
    lessonsPerSection: 2,
    lessonDurationMinutes: 40,
    questionsPerLesson: 3,
    includeEssay: true,
  })
  const list = useQuery({
    queryKey: [...aiCourseKey(courseRef), "list"],
    queryFn: () => listAiCourseDrafts(courseRef),
    retry: 1,
  })
  const poll = useQuery({
    queryKey: [...aiCourseKey(courseRef), id],
    queryFn: () => getAiCourseDraft(courseRef, id!),
    enabled: !!id,
    refetchInterval: (query) => (working(query.state.data) ? 3000 : false),
    retry: 1,
  })
  function adopt(value: AiCourseDraft) {
    setDraft(value)
    setContent(structuredClone(value.content))
    setBrief(value.brief)
    setDirty(false)
    setReviewed(false)
  }
  useEffect(() => {
    if (
      poll.data &&
      poll.data.revision !== draft?.revision &&
      (!dirty || working(draft))
    ) {
      const firstOutline =
        draft?.stage === "outline" &&
        working(draft) &&
        poll.data.state === "outlineReady"
      const firstContent = working(draft) && poll.data.state === "ready"
      adopt(poll.data)
      if (firstOutline) setStep("outline")
      if (firstContent) setStep("lessons")
      if (!working(poll.data))
        void client.invalidateQueries({
          queryKey: [...aiCourseKey(courseRef), "list"],
        })
    }
    // adopt only when a new server revision arrives; local edits are intentionally retained.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll.data?.revision, draft?.revision, dirty])
  const mutation = useMutation({
    mutationFn: (action: () => Promise<AiCourseDraft>) => action(),
    onSuccess: (value) => {
      adopt(value)
      setId(value.id)
      client.setQueryData([...aiCourseKey(courseRef), value.id], value)
      void client.invalidateQueries({
        queryKey: [...aiCourseKey(courseRef), "list"],
      })
      if (value.state === "imported") {
        void client.invalidateQueries({
          queryKey: teacherCourseWorkspaceKey(courseRef),
        })
        setStep("review")
        toast.success("Lessons added. Assessments are saved as drafts.")
      }
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "The course request could not be completed."
      ),
  })
  const pending = mutation.isPending
  const busy = working(draft)
  const editable =
    !!draft &&
    (draft.state === "outlineReady" || draft.state === "ready") &&
    !pending
  const lessons = content.sections.flatMap((s) => s.lessons)
  const lesson = lessons[selectedLesson] ?? lessons[0]
  function edit(action: (next: AiCourseContent) => void) {
    if (!editable) return
    const next = structuredClone(content)
    action(next)
    setContent(next)
    setDirty(true)
    setReviewed(false)
  }
  function editLesson(action: (next: AiCourseLesson) => void) {
    edit((next) =>
      action(
        next.sections.flatMap((s) => s.lessons)[
          Math.min(selectedLesson, lessons.length - 1)
        ]
      )
    )
  }
  function select(value: AiCourseDraft) {
    if (dirty || pending) return
    setId(value.id)
    adopt(value)
    setSelectedLesson(0)
    setStep(
      value.state === "imported"
        ? "review"
        : value.state === "outlineReady"
          ? "outline"
          : working(value)
            ? "brief"
            : "lessons"
    )
  }
  async function saved() {
    return dirty ? await saveAiCourseDraft(courseRef, draft!, content) : draft!
  }
  const steps = [
    { id: "brief", title: "Brief" },
    { id: "outline", title: "Outline" },
    { id: "lessons", title: "Lessons & resources" },
    { id: "review", title: "Review & add" },
  ]
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-5 py-3 sm:px-7">
        <nav
          className="flex flex-wrap gap-1"
          aria-label="Course creation steps"
        >
          {steps.map((s, i) => (
            <button
              key={s.id}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${step === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              disabled={s.id !== "brief" && !draft?.content.sections.length}
              onClick={() => setStep(s.id)}
            >
              <span className="mr-1.5 opacity-70">{i + 1}.</span>
              {s.title}
            </button>
          ))}
        </nav>
        {draft && (
          <span
            className="rounded-full border bg-background px-3 py-1 text-xs font-medium"
            aria-live="polite"
          >
            {stateLabels[draft.state]}
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid min-h-full lg:grid-cols-[230px_1fr]">
          <div className="flex items-center gap-2 border-b bg-muted/15 p-3 lg:hidden">
            <label className="sr-only" htmlFor="ai-course-mobile-draft">
              Your course drafts
            </label>
            <select
              id="ai-course-mobile-draft"
              className={inputClass}
              value={id ?? ""}
              disabled={dirty || pending}
              onChange={(e) => {
                const d = list.data?.find((x) => x.id === e.target.value)
                if (d) select(d)
              }}
            >
              <option value="">Select a saved draft</option>
              {list.data?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.brief.title} · {stateLabels[d.state]}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              disabled={dirty || pending}
              onClick={() => {
                setId(undefined)
                setDraft(undefined)
                setStep("brief")
                requestKey.current = crypto.randomUUID()
              }}
            >
              New draft
            </Button>
          </div>
          <aside className="hidden border-r bg-muted/15 p-5 lg:block">
            <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Your course drafts
            </p>
            <Button
              className="mb-4 w-full"
              variant="outline"
              disabled={dirty || pending}
              onClick={() => {
                setId(undefined)
                setDraft(undefined)
                setContent({ overview: "", sections: [] })
                setStep("brief")
                setReviewed(false)
                requestKey.current = crypto.randomUUID()
              }}
            >
              + New course draft
            </Button>
            {list.isPending && (
              <p className="text-sm text-muted-foreground">Loading drafts…</p>
            )}
            {list.error && (
              <p className="text-sm text-destructive" role="alert">
                {list.error.message}
              </p>
            )}
            {!list.isPending && !list.error && list.data?.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Your saved drafts will appear here. You can close this window
                while AI works.
              </p>
            )}
            <div className="space-y-2">
              {list.data?.map((d) => (
                <button
                  key={d.id}
                  disabled={dirty || pending}
                  onClick={() => select(d)}
                  className={`w-full rounded-xl border p-3 text-left transition ${id === d.id ? "border-primary bg-primary/5" : "border-transparent hover:border-border hover:bg-background"} disabled:opacity-50`}
                >
                  <p className="line-clamp-2 text-sm font-medium">
                    {d.brief.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stateLabels[d.state]} ·{" "}
                    {new Date(d.createdAtUtc).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Only you can open your drafts. Students see lessons after you add
              the reviewed content to the course.
            </p>
          </aside>
          <main className="min-w-0 space-y-6 p-5 sm:p-7">
            {poll.error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
              >
                {poll.error.message}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-3"
                  onClick={() => void poll.refetch()}
                >
                  Retry loading
                </Button>
              </div>
            )}
            {mutation.error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/20 p-4 text-sm text-destructive"
              >
                {mutation.error.message}
              </div>
            )}
            {busy && (
              <div
                className="rounded-xl border border-primary/20 bg-primary/5 p-4"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-2 font-medium">
                  <Loader2 size={17} className="animate-spin" />
                  {draft?.stage === "outline"
                    ? "Planning your curriculum"
                    : "Creating teaching content"}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {draft?.stage === "outline"
                    ? "The outline will be ready for your approval shortly."
                    : `${draft?.completedLessons} of ${draft?.totalLessons} lessons saved. Each lesson includes activities, assessments and reading suggestions.`}{" "}
                  You can close this window and return later.
                </p>
                <progress
                  className="mt-3 h-2 w-full accent-primary"
                  aria-label="Generation progress"
                  max={draft?.totalLessons || 1}
                  value={
                    draft?.stage === "outline"
                      ? undefined
                      : draft?.completedLessons
                  }
                />
                <Button
                  className="mt-3"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    mutation.mutate(() =>
                      actOnAiCourseDraft(courseRef, draft!, "Cancel")
                    )
                  }
                >
                  Cancel generation
                </Button>
              </div>
            )}
            {draft &&
              (draft.state === "failed" || draft.state === "cancelled") && (
                <div
                  role="alert"
                  className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
                >
                  <p className="font-semibold">
                    {draft.state === "cancelled"
                      ? "Generation paused"
                      : "Generation needs attention"}
                  </p>
                  <p className="mt-1">
                    {draft.failureMessage ||
                      "Your saved content is preserved. Resume when you are ready."}
                  </p>
                  <Button
                    className="mt-3"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      mutation.mutate(() =>
                        actOnAiCourseDraft(courseRef, draft, "Retry")
                      )
                    }
                  >
                    <RefreshCw size={14} /> Resume generation
                  </Button>
                </div>
              )}
            {dirty && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                <span>You have unsaved edits.</span>
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    mutation.mutate(() =>
                      saveAiCourseDraft(courseRef, draft!, content)
                    )
                  }
                >
                  Save edits
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => {
                    adopt(poll.data ?? draft!)
                    toast.info("Saved version restored")
                  }}
                >
                  Discard edits & reload
                </Button>
              </div>
            )}
            {step === "brief" && (
              <>
                <div>
                  <h3 className="text-lg font-semibold">
                    Start with your teaching goals
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Specify the curriculum and class. AI creates a draft for
                    your professional review.
                  </p>
                </div>
                <fieldset
                  disabled={!!draft || pending}
                  className="space-y-5 disabled:opacity-80"
                >
                  <Field
                    label="Course title"
                    value={brief.title}
                    onChange={(title) => setBrief({ ...brief, title })}
                  />
                  <Field
                    label="Topic and scope"
                    value={brief.topic}
                    multiline
                    maxLength={2000}
                    onChange={(topic) => setBrief({ ...brief, topic })}
                    hint="For example: Fractions, equivalent fractions and adding fractions with unlike denominators."
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Class / education level"
                      value={brief.educationLevel}
                      onChange={(educationLevel) =>
                        setBrief({ ...brief, educationLevel })
                      }
                    />
                    <Field
                      label="Curriculum / examination standard"
                      value={brief.curriculumStandard}
                      maxLength={300}
                      onChange={(curriculumStandard) =>
                        setBrief({ ...brief, curriculumStandard })
                      }
                      hint="For example: Nigerian NERDC Primary 5 or England National Curriculum Year 5."
                    />
                    <Field
                      label="Country code"
                      value={brief.countryCode}
                      maxLength={2}
                      onChange={(countryCode) =>
                        setBrief({
                          ...brief,
                          countryCode: countryCode.toUpperCase(),
                        })
                      }
                      hint="NG for Nigeria, GB for the United Kingdom."
                    />
                    <Field
                      label="Language code"
                      value={brief.languageCode}
                      maxLength={35}
                      onChange={(languageCode) =>
                        setBrief({ ...brief, languageCode })
                      }
                      hint="For example: en, en-GB or yo-NG."
                    />
                  </div>
                  <Field
                    label="Learning goals and learner needs"
                    multiline
                    maxLength={2000}
                    value={brief.learningGoals}
                    onChange={(learningGoals) =>
                      setBrief({ ...brief, learningGoals })
                    }
                    hint="Describe the skills pupils should gain. Avoid names or personal pupil information."
                  />
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {(
                      [
                        ["Sections", "sectionCount", 1, 6],
                        ["Lessons / section", "lessonsPerSection", 1, 6],
                        ["Minutes / lesson", "lessonDurationMinutes", 5, 180],
                        ["Questions / lesson", "questionsPerLesson", 1, 5],
                      ] as const
                    ).map(([label, key, min, max]) => (
                      <Field
                        key={key}
                        label={label}
                        type="number"
                        min={min}
                        max={max}
                        value={brief[key]}
                        onChange={(v) =>
                          setBrief({ ...brief, [key]: Number(v) })
                        }
                      />
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={brief.includeEssay}
                      onChange={(e) =>
                        setBrief({ ...brief, includeEssay: e.target.checked })
                      }
                    />{" "}
                    Include written assessments with reference answers and
                    marking rubrics
                  </label>
                </fieldset>
                {!draft && (
                  <Button
                    disabled={
                      pending ||
                      brief.sectionCount * brief.lessonsPerSection > 12 ||
                      !brief.topic.trim() ||
                      !brief.learningGoals.trim() ||
                      !brief.curriculumStandard.trim() ||
                      !brief.educationLevel.trim()
                    }
                    onClick={() =>
                      mutation.mutate(() =>
                        createAiCourseDraft(
                          courseRef,
                          brief,
                          requestKey.current
                        )
                      )
                    }
                  >
                    {pending ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Sparkles size={16} />
                    )}{" "}
                    Generate outline
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  Up to 12 lessons per draft. AI content can contain errors;
                  check facts, curriculum alignment and suitability before
                  adding it.
                </p>
              </>
            )}
            {step === "outline" && draft && (
              <>
                <div>
                  <h3 className="text-lg font-semibold">
                    Review your curriculum
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Edit titles and outcomes, and reorder sections or lessons
                    before generating the full content.
                  </p>
                </div>
                <fieldset disabled={!editable} className="space-y-5">
                  <Field
                    label="Course overview"
                    multiline
                    maxLength={4000}
                    value={content.overview}
                    onChange={(v) =>
                      edit((c) => {
                        c.overview = v
                      })
                    }
                  />
                  {content.sections.map((s, si) => (
                    <section
                      key={si}
                      className="space-y-4 rounded-xl border p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="mr-auto text-xs font-semibold text-muted-foreground">
                          SECTION {si + 1}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Move section ${si + 1} up`}
                          disabled={si === 0 || !editable}
                          onClick={() =>
                            edit((c) => {
                              ;[c.sections[si - 1], c.sections[si]] = [
                                c.sections[si],
                                c.sections[si - 1],
                              ]
                            })
                          }
                        >
                          <ArrowUp size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Move section ${si + 1} down`}
                          disabled={
                            si === content.sections.length - 1 || !editable
                          }
                          onClick={() =>
                            edit((c) => {
                              ;[c.sections[si + 1], c.sections[si]] = [
                                c.sections[si],
                                c.sections[si + 1],
                              ]
                            })
                          }
                        >
                          <ArrowDown size={14} />
                        </Button>
                      </div>
                      <Field
                        label="Section title"
                        value={s.title}
                        onChange={(v) =>
                          edit((c) => {
                            c.sections[si].title = v
                          })
                        }
                      />
                      {s.lessons.map((l, li) => (
                        <div
                          key={li}
                          className="space-y-3 rounded-lg bg-muted/25 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Lesson {li + 1}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Move lesson ${li + 1} up`}
                                disabled={li === 0 || !editable}
                                onClick={() =>
                                  edit((c) => {
                                    const a = c.sections[si].lessons
                                    ;[a[li - 1], a[li]] = [a[li], a[li - 1]]
                                  })
                                }
                              >
                                <ArrowUp size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Move lesson ${li + 1} down`}
                                disabled={
                                  li === s.lessons.length - 1 || !editable
                                }
                                onClick={() =>
                                  edit((c) => {
                                    const a = c.sections[si].lessons
                                    ;[a[li + 1], a[li]] = [a[li], a[li + 1]]
                                  })
                                }
                              >
                                <ArrowDown size={14} />
                              </Button>
                            </div>
                          </div>
                          <Field
                            label="Lesson title"
                            value={l.title}
                            onChange={(v) =>
                              edit((c) => {
                                c.sections[si].lessons[li].title = v
                              })
                            }
                          />
                          <Field
                            label="Learning outcomes (one per line)"
                            multiline
                            maxLength={3000}
                            value={l.outcomes.join("\n")}
                            onChange={(v) =>
                              edit((c) => {
                                c.sections[si].lessons[li].outcomes =
                                  v.split("\n")
                              })
                            }
                          />
                        </div>
                      ))}
                    </section>
                  ))}
                </fieldset>
                {draft.state === "outlineReady" && (
                  <Button
                    disabled={pending}
                    onClick={() =>
                      mutation.mutate(async () =>
                        actOnAiCourseDraft(courseRef, await saved(), "Generate")
                      )
                    }
                  >
                    <Sparkles size={16} /> Approve outline & generate content
                  </Button>
                )}
              </>
            )}
            {step === "lessons" && draft && (
              <>
                <div>
                  <h3 className="text-lg font-semibold">
                    Shape the teaching content
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Review the explanation, activities, worksheets and answer
                    keys for every lesson.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lessons.map((l, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedLesson(i)
                        setInstructions("")
                      }}
                      className={`rounded-lg border px-3 py-2 text-sm ${selectedLesson === i ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted"}`}
                    >
                      {i + 1}. {l.title}
                    </button>
                  ))}
                </div>
                {lesson?.content ? (
                  <>
                    <div
                      className="flex gap-1 border-b"
                      role="tablist"
                      aria-label="Lesson content"
                    >
                      {[
                        {
                          id: "notes",
                          name: "Lesson & worksheet",
                          icon: FileText,
                        },
                        {
                          id: "assessments",
                          name: "Assessments",
                          icon: CheckCircle2,
                        },
                        { id: "books", name: "Reading", icon: BookOpen },
                      ].map((t) => (
                        <button
                          key={t.id}
                          role="tab"
                          aria-selected={lessonTab === t.id}
                          onClick={() => setLessonTab(t.id)}
                          className={`flex items-center gap-1.5 border-b-2 px-2 py-3 text-xs sm:px-3 sm:text-sm ${lessonTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
                        >
                          <t.icon size={14} />
                          {t.name}
                        </button>
                      ))}
                    </div>
                    <fieldset disabled={!editable} className="space-y-5">
                      {lessonTab === "notes" &&
                        (
                          [
                            ["Explanation", "explanation", 16000],
                            ["Worked example", "workedExample", 5000],
                            ["Class activity", "activity", 5000],
                            ["Worksheet / practice tasks", "worksheet", 8000],
                          ] as const
                        ).map(([label, key, maxLength]) => (
                          <Field
                            key={key}
                            label={label}
                            multiline
                            maxLength={maxLength}
                            value={lesson.content![key]}
                            onChange={(v) =>
                              editLesson((l) => {
                                l.content![key] = v
                              })
                            }
                          />
                        ))}
                      {lessonTab === "assessments" && (
                        <>
                          <p className="rounded-lg bg-muted p-3 text-sm">
                            Answer keys are visible to you in this draft. They
                            are excluded from learner notes and the downloadable
                            workbook.
                          </p>
                          {lesson.content.questions.map((q, qi) => (
                            <section
                              key={qi}
                              className="space-y-3 rounded-xl border p-4"
                            >
                              <p className="text-sm font-semibold">
                                Objective question {qi + 1}
                              </p>
                              <Field
                                label="Question"
                                multiline
                                maxLength={3000}
                                value={q.prompt}
                                onChange={(v) =>
                                  editLesson((l) => {
                                    l.content!.questions[qi].prompt = v
                                  })
                                }
                              />
                              <p className="text-xs text-muted-foreground">
                                Select the correct answer and edit each option.
                              </p>
                              {q.options.map((o, oi) => (
                                <div
                                  key={oi}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="radio"
                                    name={`answer-${qi}`}
                                    aria-label={`Option ${oi + 1} is correct for question ${qi + 1}`}
                                    checked={q.correctOption === oi}
                                    onChange={() =>
                                      editLesson((l) => {
                                        l.content!.questions[qi].correctOption =
                                          oi
                                      })
                                    }
                                  />
                                  <input
                                    className={inputClass}
                                    aria-label={`Question ${qi + 1}, option ${oi + 1}`}
                                    value={o}
                                    maxLength={1000}
                                    onChange={(e) =>
                                      editLesson((l) => {
                                        l.content!.questions[qi].options[oi] =
                                          e.target.value
                                      })
                                    }
                                  />
                                </div>
                              ))}
                              <Field
                                label="Teacher answer explanation"
                                multiline
                                maxLength={3000}
                                value={q.explanation}
                                onChange={(v) =>
                                  editLesson((l) => {
                                    l.content!.questions[qi].explanation = v
                                  })
                                }
                              />
                            </section>
                          ))}
                          {lesson.content.essay && (
                            <section className="space-y-4 rounded-xl border p-4">
                              <p className="font-semibold">
                                Written assessment
                              </p>
                              <Field
                                label="Essay / written question"
                                multiline
                                maxLength={3000}
                                value={lesson.content.essay.prompt}
                                onChange={(v) =>
                                  editLesson((l) => {
                                    l.content!.essay!.prompt = v
                                  })
                                }
                              />
                              <Field
                                label="Teacher reference answer"
                                multiline
                                maxLength={6000}
                                value={lesson.content.essay.referenceAnswer}
                                onChange={(v) =>
                                  editLesson((l) => {
                                    l.content!.essay!.referenceAnswer = v
                                  })
                                }
                              />
                              <p className="text-sm font-semibold">
                                Marking rubric ·{" "}
                                {lesson.content.essay.rubric.reduce(
                                  (sum, r) => sum + r.points,
                                  0
                                )}{" "}
                                marks
                              </p>
                              {lesson.content.essay.rubric.map((r, ri) => (
                                <div
                                  key={ri}
                                  className="grid gap-3 rounded-lg bg-muted/25 p-3 sm:grid-cols-[1fr_90px]"
                                >
                                  <Field
                                    label="Criterion"
                                    maxLength={100}
                                    value={r.name}
                                    onChange={(v) =>
                                      editLesson((l) => {
                                        l.content!.essay!.rubric[ri].name = v
                                      })
                                    }
                                  />
                                  <Field
                                    label="Marks"
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={r.points}
                                    onChange={(v) =>
                                      editLesson((l) => {
                                        l.content!.essay!.rubric[ri].points =
                                          Number(v)
                                      })
                                    }
                                  />
                                  <div className="sm:col-span-2">
                                    <Field
                                      label="What earns these marks"
                                      multiline
                                      maxLength={1000}
                                      value={r.description}
                                      onChange={(v) =>
                                        editLesson((l) => {
                                          l.content!.essay!.rubric[
                                            ri
                                          ].description = v
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              ))}
                            </section>
                          )}
                        </>
                      )}
                      {lessonTab === "books" && (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Catalogue matches confirm the title and author, not
                            suitability. Check reading level and availability.
                            Unverified suggestions are excluded from learner
                            materials.
                          </p>
                          {!lesson.content.books.length && (
                            <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                              No book suggestions for this lesson. The original
                              lesson notes and worksheets are included.
                            </p>
                          )}
                          {lesson.content.books.map((b, bi) => (
                            <section
                              key={bi}
                              className="space-y-3 rounded-xl border p-4"
                            >
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs ${b.verified ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}
                              >
                                {b.verified
                                  ? "Catalogue match"
                                  : "Unverified suggestion"}
                              </span>
                              <Field
                                label="Book title"
                                maxLength={300}
                                value={b.title}
                                onChange={(v) =>
                                  editLesson((l) => {
                                    const b = l.content!.books[bi]
                                    b.title = v
                                    b.verified = false
                                    b.catalogueUrl = null
                                  })
                                }
                              />
                              <Field
                                label="Author"
                                value={b.author}
                                onChange={(v) =>
                                  editLesson((l) => {
                                    const b = l.content!.books[bi]
                                    b.author = v
                                    b.verified = false
                                    b.catalogueUrl = null
                                  })
                                }
                              />
                              <Field
                                label="Why this book helps"
                                multiline
                                maxLength={1000}
                                value={b.reason}
                                onChange={(v) =>
                                  editLesson((l) => {
                                    l.content!.books[bi].reason = v
                                  })
                                }
                              />
                              {b.verified &&
                                b.catalogueUrl?.startsWith(
                                  "https://books.google.com/books?"
                                ) && (
                                  <a
                                    className="text-sm text-primary underline"
                                    href={b.catalogueUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View catalogue record{" "}
                                    {b.isbn ? `· ISBN ${b.isbn}` : ""}
                                  </a>
                                )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  editLesson((l) => {
                                    l.content!.books.splice(bi, 1)
                                  })
                                }
                              >
                                Remove suggestion
                              </Button>
                            </section>
                          ))}
                        </>
                      )}
                    </fieldset>
                    {draft.state === "ready" && (
                      <div className="space-y-3 rounded-xl border border-dashed p-4">
                        <Field
                          label="Regenerate only this lesson"
                          value={instructions}
                          multiline
                          maxLength={1500}
                          onChange={setInstructions}
                          hint="For example: Use simpler examples and include a hands-on group activity. This replaces the selected lesson's notes, assessments and reading suggestions."
                        />
                        <Button
                          variant="outline"
                          disabled={pending}
                          onClick={() =>
                            mutation.mutate(async () =>
                              actOnAiCourseDraft(
                                courseRef,
                                await saved(),
                                "Generate",
                                { lessonIndex: selectedLesson, instructions }
                              )
                            )
                          }
                        >
                          <RefreshCw size={14} /> Regenerate lesson{" "}
                          {selectedLesson + 1}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                    {draft.state === "outlineReady"
                      ? "Approve your outline to generate lesson content."
                      : "This lesson has not been generated yet. Completed lessons remain available above."}
                  </div>
                )}
                {draft.state === "ready" && (
                  <Button onClick={() => setStep("review")}>
                    Continue to final review
                  </Button>
                )}
              </>
            )}
            {step === "review" && draft && (
              <>
                <div>
                  <h3 className="text-lg font-semibold">
                    {draft.state === "imported"
                      ? "Your content is in the course"
                      : "Review before adding to your course"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {draft.state === "imported"
                      ? "Use the course workspace to teach the lessons and finish publishing your assessments."
                      : "Adding the course makes lessons and the workbook available through your existing student access rules."}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    [content.sections.length, "Sections"],
                    [lessons.length, "Lessons"],
                    [
                      lessons.reduce(
                        (sum, l) =>
                          sum + (l.content ? 1 + (l.content.essay ? 1 : 0) : 0),
                        0
                      ),
                      "Draft assessments",
                    ],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-xl border p-4">
                      <p className="text-2xl font-semibold">{value}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border p-4">
                  <h4 className="font-medium">{draft.brief.title}</h4>
                  <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                    {content.overview}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {content.sections.map((s, i) => (
                      <li key={i}>
                        <p className="text-sm font-medium">{s.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {s.lessons.map((l) => l.title).join(" · ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                {draft.state === "imported" ? (
                  <div
                    role="status"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"
                  >
                    <CheckCircle2 className="mb-2" />
                    <p className="font-medium">
                      Reviewed lessons and materials added successfully.
                    </p>
                    <p className="mt-2 text-sm">
                      Assessments remain drafts. In Assignments, confirm the due
                      dates, session, term and gradebook settings, then publish
                      them.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="rounded-xl bg-muted p-4 text-sm">
                      Existing course content is preserved. New sections are
                      appended. Assessment answer keys remain private, and
                      assessments need your normal publishing approval.
                    </p>
                    <Field
                      label="Assessment due date (UTC)"
                      type="date"
                      value={dueDate}
                      onChange={setDueDate}
                    />
                    <label className="flex items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed">
                      <input
                        className="mt-1"
                        type="checkbox"
                        disabled={draft.state !== "ready" || pending}
                        checked={reviewed}
                        onChange={(e) => setReviewed(e.target.checked)}
                      />
                      I have reviewed the facts, curriculum alignment, lesson
                      content, questions, correct answers, rubrics and reading
                      recommendations. I approve making these lessons and
                      materials available to pupils.
                    </label>
                    <Button
                      disabled={
                        draft.state !== "ready" ||
                        !reviewed ||
                        pending ||
                        !dueDate
                      }
                      onClick={() =>
                        mutation.mutate(async () =>
                          actOnAiCourseDraft(
                            courseRef,
                            await saved(),
                            "Import",
                            {
                              reviewed: true,
                              dueDateUtc: new Date(
                                `${dueDate}T23:59:00Z`
                              ).toISOString(),
                            }
                          )
                        )
                      }
                    >
                      {pending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}{" "}
                      Add reviewed content to course
                    </Button>
                  </>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t bg-background px-5 py-3 text-xs text-muted-foreground sm:px-7">
        <span>
          {dirty
            ? "Unsaved edits — save before closing"
            : draft
              ? "Draft saved in Digital School"
              : "Your first outline starts with a teaching brief"}
        </span>
        {pending && (
          <span className="flex items-center gap-2" role="status">
            <Loader2 size={13} className="animate-spin" /> Saving…
          </span>
        )}
      </div>
    </div>
  )
}
