import { useState, type ComponentProps, type ReactNode } from "react"
import { useNavigate, useParams } from "react-router"
import { Save, Send, Printer } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/general/PageHeader"
import RichTextEditor from "@/components/general/RichTextEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DashboardRoutes } from "@/routes"
import { stripHtml } from "@/lib/strip-html"
import {
  emptyLessonNote,
  LESSON_NOTE_STATUS_STYLE,
  type LessonNote,
} from "./lessonNotes/data"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuthStore } from "@/store/auth.store"
import { sanitizeHtml } from "@/lib/sanitizeHtml"
import {
  lessonNotesApi,
  lessonNoteKeys,
  LESSON_NOTES_MENU,
  type LessonNoteOptions,
} from "@/api/schoolLessonNotes.api"

function NoteRichText({
  readOnly,
  ...props
}: ComponentProps<typeof RichTextEditor> & { readOnly: boolean }) {
  return readOnly ? (
    <section>
      <h3 className="mb-2 font-medium">{props.label}</h3>
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(props.value) }}
      />
    </section>
  ) : (
    <RichTextEditor {...props} value={sanitizeHtml(props.value)} />
  )
}
function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-slate-700">{label}</Label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

function isBlankHtml(html: string) {
  return !stripHtml(html).trim()
}

export default function LessonNoteEditorPage() {
  const { noteId } = useParams()
  const school = useSchoolId()
  const user = useAuthStore((s) => s.user)
  const permissions = usePermissions()
  const canView = permissions.canView(LESSON_NOTES_MENU)
  const query = useQuery({
    queryKey: [...lessonNoteKeys(school, user?.id), "detail", noteId],
    queryFn: () => lessonNotesApi.get(school, noteId!),
    enabled: !!school && !!noteId && canView,
    retry: false,
  })
  const options = useQuery({
    queryKey: [...lessonNoteKeys(school, user?.id), "options"],
    queryFn: () => lessonNotesApi.options(school),
    enabled: !!school && canView,
  })
  if (!canView || (!noteId && !permissions.canCreate(LESSON_NOTES_MENU)))
    return (
      <p role="alert">You do not have access to this lesson-note screen.</p>
    )
  if (query.isError || options.isError)
    return (
      <div role="alert">
        {query.error?.message || options.error?.message}
        <Button
          variant="outline"
          onClick={() => {
            if (noteId) query.refetch()
            options.refetch()
          }}
        >
          Retry
        </Button>
      </div>
    )
  if (!school || options.isPending || (noteId && query.isPending))
    return <p role="status">Loading lesson note…</p>
  return (
    <Editor
      key={`${school}:${user?.id ?? ""}:${noteId ?? "new"}`}
      existing={query.data}
      options={options.data!}
    />
  )
}
function Editor({
  existing,
  options,
}: {
  existing?: LessonNote
  options: LessonNoteOptions
}) {
  const { productId } = useParams()
  const school = useSchoolId()
  const user = useAuthStore((s) => s.user)
  const permissions = usePermissions()
  const navigate = useNavigate()
  const client = useQueryClient()
  const [note, setNote] = useState<LessonNote>(
    () =>
      existing ?? {
        ...emptyLessonNote(user?.name),
        authorUserId: user?.id ?? "",
      }
  )
  const [session, setSession] = useState(
    () =>
      options.terms.find((t) => t.id === existing?.schoolSessionTermId)
        ?.sessionId ?? ""
  )
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const isEdit = !!note.id
  const locked =
    isEdit &&
    (note.authorUserId !== user?.id ||
      !["draft", "returned"].includes(note.status) ||
      !permissions.canUpdate(LESSON_NOTES_MENU))
  const sessions = [
    ...new Map(
      options.terms.map((t) => [
        t.sessionId,
        { id: t.sessionId, name: t.sessionName },
      ])
    ).values(),
  ]
  const classes = options.classes.filter(
    (c) =>
      options.isOwner ||
      options.courses.some(
        (course) =>
          course.subjectId === note.subjectId && course.classId === c.id
      )
  )
  const patch = <K extends keyof LessonNote>(key: K, value: LessonNote[K]) => {
    setNote((prev) => ({ ...prev, [key]: value }))
  }

  const goBack = () =>
    navigate(DashboardRoutes.toELearningLessonNotes(productId ?? ""))

  const save = async (submit: boolean) => {
    if (saving || locked) return
    if (
      !note.title.trim() ||
      !note.topic.trim() ||
      !note.subjectId ||
      !note.classId ||
      !note.schoolSessionTermId
    ) {
      toast.error("Enter a title, topic, subject, class, session and term")
      return
    }
    if (
      submit &&
      [note.behaviouralObjectives, note.presentation, note.evaluation].some(
        isBlankHtml
      )
    ) {
      toast.error(
        "Complete objectives, presentation and evaluation before submitting"
      )
      return
    }
    setSaving(true)
    setSaveError("")
    try {
      let saved = await lessonNotesApi.save(school, note)
      setNote(saved)
      await client.invalidateQueries({
        queryKey: lessonNoteKeys(school, user?.id),
      })
      if (submit) {
        saved = await lessonNotesApi.submit(school, saved)
        setNote(saved)
        await client.invalidateQueries({
          queryKey: lessonNoteKeys(school, user?.id),
        })
      }
      toast.success(
        submit
          ? "Lesson note submitted for approval"
          : "Lesson note saved as draft"
      )
      if (submit) goBack()
      else if (!isEdit)
        navigate(
          DashboardRoutes.toELearningLessonNoteEdit(productId ?? "", saved.id),
          { replace: true }
        )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save lesson note"
      setSaveError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }
  const saveDraft = () => save(false)
  const submitNote = () => save(true)

  const handlePrint = () => window.print()

  const statusMeta = LESSON_NOTE_STATUS_STYLE[note.status]

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      <PageHeader
        title={isEdit ? "Edit lesson note" : "New lesson note"}
        description="Fill the standard lesson plan sections. Save progress anytime, then submit for approval."
        onBack={goBack}
        backLabel="Back to lesson notes"
        badge={statusMeta.label}
        badgeColor={statusMeta.className}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-9 gap-2"
              onClick={handlePrint}
              type="button"
            >
              <Printer className="size-4" />
              Print
            </Button>
            <Button
              variant="outline"
              className="h-9 gap-2"
              onClick={saveDraft}
              disabled={saving || locked}
              type="button"
            >
              <Save className="size-4" />
              Save draft
            </Button>
            <Button
              className="h-9 gap-2"
              onClick={submitNote}
              disabled={
                saving || locked || !permissions.canUpdate(LESSON_NOTES_MENU)
              }
              type="button"
            >
              <Send className="size-4" />
              Submit
            </Button>
          </div>
        }
      />

      {locked && (
        <p role="status" className="rounded-xl bg-slate-100 p-4">
          This lesson note is read-only.
        </p>
      )}
      {saveError && (
        <div role="alert" className="rounded-xl bg-amber-50 p-4">
          {saveError} Your current text is still in this form. If the note
          changed elsewhere, copy your text before reloading.
        </div>
      )}
      <fieldset disabled={saving || locked} className="space-y-6">
        {note.remarks && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <span className="font-semibold">Review feedback: </span>
            {note.remarks}
          </div>
        )}

        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Lesson details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input
                className="h-10 rounded-xl"
                maxLength={200}
                aria-label="Title"
                value={note.title}
                onChange={(e) => patch("title", e.target.value)}
                placeholder="e.g. Linear Equations in One Variable"
              />
            </Field>
            <Field label="Topic">
              <Input
                className="h-10 rounded-xl"
                maxLength={500}
                aria-label="Topic"
                value={note.topic}
                onChange={(e) => patch("topic", e.target.value)}
                placeholder="Main topic for this lesson"
              />
            </Field>
            <Field label="Subject">
              <Select
                value={note.subjectId}
                disabled={saving || locked}
                onValueChange={(v) =>
                  setNote((n) => ({ ...n, subjectId: v, classId: "" }))
                }
              >
                <SelectTrigger aria-label="Subject" className="h-10 rounded-xl">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {options.subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Class">
              <Select
                value={note.classId}
                disabled={saving || locked || !note.subjectId}
                onValueChange={(v) => patch("classId", v)}
              >
                <SelectTrigger aria-label="Class" className="h-10 rounded-xl">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Term">
              <Select
                value={note.schoolSessionTermId}
                disabled={saving || locked || !session}
                onValueChange={(v) => patch("schoolSessionTermId", v)}
              >
                <SelectTrigger aria-label="Term" className="h-10 rounded-xl">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {options.terms
                    .filter((t) => t.sessionId === session)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Session">
              <Select
                value={session}
                disabled={saving || locked}
                onValueChange={(v) => {
                  setSession(v)
                  patch("schoolSessionTermId", "")
                }}
              >
                <SelectTrigger aria-label="Session" className="h-10 rounded-xl">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Week">
              <Input
                type="number"
                min={1}
                max={53}
                className="h-10 rounded-xl"
                aria-label="Week"
                value={note.week}
                onChange={(e) => patch("week", Number(e.target.value) || 1)}
              />
            </Field>
            <Field label="Duration (minutes)">
              <Input
                type="number"
                min={1}
                max={480}
                className="h-10 rounded-xl"
                aria-label="Duration (minutes)"
                value={note.durationMinutes}
                onChange={(e) =>
                  patch("durationMinutes", Number(e.target.value) || 40)
                }
              />
            </Field>
            <Field label="Lesson date">
              <Input
                type="date"
                className="h-10 rounded-xl"
                aria-label="Lesson date"
                value={note.date}
                onChange={(e) => patch("date", e.target.value)}
              />
            </Field>
            <Field label="Teacher">
              <Input
                className="h-10 rounded-xl"
                aria-label="Teacher"
                value={note.teacherName}
                readOnly
              />
            </Field>
          </div>
        </section>

        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Lesson content
          </h2>

          <div className="space-y-1">
            <NoteRichText
              readOnly={locked || saving}
              label="Behavioural objectives"
              value={note.behaviouralObjectives}
              onChange={(html) => patch("behaviouralObjectives", html)}
              minHeight={140}
              placeholder="List what learners should be able to do by the end of the lesson…"
            />
            <p className="text-xs text-slate-500">
              What learners should be able to do by the end of the lesson.
            </p>
          </div>

          <NoteRichText
            readOnly={locked || saving}
            label="Previous knowledge"
            value={note.previousKnowledge}
            onChange={(html) => patch("previousKnowledge", html)}
            minHeight={110}
            placeholder="What students already know that this lesson builds on…"
          />

          <NoteRichText
            readOnly={locked || saving}
            label="Instructional materials / teaching aids"
            value={note.instructionalMaterials}
            onChange={(html) => patch("instructionalMaterials", html)}
            minHeight={110}
            placeholder="Whiteboard, charts, textbooks, videos, specimens…"
          />

          <NoteRichText
            readOnly={locked || saving}
            label="Introduction"
            value={note.introduction}
            onChange={(html) => patch("introduction", html)}
            minHeight={130}
            placeholder="How you will introduce the lesson…"
          />

          <div className="space-y-1">
            <NoteRichText
              readOnly={locked || saving}
              label="Presentation / content development"
              value={note.presentation}
              onChange={(html) => patch("presentation", html)}
              minHeight={200}
              placeholder="Step-by-step teaching procedure…"
            />
            <p className="text-xs text-slate-500">
              Step-by-step teaching procedure.
            </p>
          </div>

          <NoteRichText
            readOnly={locked || saving}
            label="Evaluation"
            value={note.evaluation}
            onChange={(html) => patch("evaluation", html)}
            minHeight={130}
            placeholder="How you will check understanding during/after the lesson…"
          />

          <NoteRichText
            readOnly={locked || saving}
            label="Assignment / home work"
            value={note.assignment}
            onChange={(html) => patch("assignment", html)}
            minHeight={110}
            placeholder="Homework or follow-up tasks…"
          />

          <NoteRichText
            readOnly={locked || saving}
            label="Conclusion"
            value={note.conclusion}
            onChange={(html) => patch("conclusion", html)}
            minHeight={110}
            placeholder="How you will wrap up and link to the next lesson…"
          />

          <NoteRichText
            readOnly={locked || saving}
            label="References"
            value={note.references}
            onChange={(html) => patch("references", html)}
            minHeight={110}
            placeholder="Textbooks, curriculum links, online resources…"
          />
        </section>
      </fieldset>
      <div className="sticky bottom-4 flex flex-wrap justify-end gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3">
        <Button
          variant="outline"
          className="h-9"
          onClick={goBack}
          type="button"
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          className="h-9 gap-2"
          onClick={saveDraft}
          disabled={saving || locked}
          type="button"
        >
          <Save className="size-4" />
          Save progress
        </Button>
        <Button
          className="h-9 gap-2"
          onClick={submitNote}
          disabled={
            saving || locked || !permissions.canUpdate(LESSON_NOTES_MENU)
          }
          type="button"
        >
          <Send className="size-4" />
          Submit for approval
        </Button>
      </div>
    </div>
  )
}
