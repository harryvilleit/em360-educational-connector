import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FilePlus2,
  Filter,
  Pencil,
  Search,
  Eye,
} from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  FilterSelect,
  type FilterSelectOption,
} from "@/components/ui/filter-select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DashboardRoutes } from "@/routes"
import { stripHtml } from "@/lib/strip-html"
import { sanitizeHtml } from "@/lib/sanitizeHtml"
import {
  LESSON_NOTE_STATUS_STYLE,
  type LessonNote,
  type LessonNoteStatus,
} from "./lessonNotes/data"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuthStore } from "@/store/auth.store"
import {
  lessonNotesApi,
  lessonNoteKeys,
  LESSON_NOTES_MENU,
} from "@/api/schoolLessonNotes.api"
import { toast } from "sonner"

const statusOptions: FilterSelectOption[] = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "returned", label: "Returned" },
]

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return value
  }
}

function PreviewSection({ title, body }: { title: string; body: string }) {
  if (!stripHtml(body).trim()) return null
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {title}
      </h4>
      <div
        className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-ol:my-1 max-w-none text-slate-800"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(body) }}
      />
    </div>
  )
}

export default function LessonNotesPage() {
  const school = useSchoolId()
  const user = useAuthStore((s) => s.user)
  return <LessonNotes key={`${school}:${user?.id ?? ""}`} />
}

function LessonNotes() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const school = useSchoolId()
  const user = useAuthStore((s) => s.user)
  const permissions = usePermissions()
  const canView = permissions.canView(LESSON_NOTES_MENU)
  const client = useQueryClient()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [className, setClassName] = useState("all")
  const [subject, setSubject] = useState("all")
  const [term, setTerm] = useState("all")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [preview, setPreview] = useState<LessonNote | null>(null)
  const [remarks, setRemarks] = useState("")
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])
  const filters = {
    page,
    search: debouncedSearch,
    classId: className === "all" ? undefined : className,
    subjectId: subject === "all" ? undefined : subject,
    termId: term === "all" ? undefined : term,
    status: status === "all" ? undefined : status,
  }
  const query = useQuery({
    queryKey: [...lessonNoteKeys(school, user?.id), "list", filters],
    queryFn: () => lessonNotesApi.list(school, filters),
    enabled: !!school && canView,
  })
  const options = useQuery({
    queryKey: [...lessonNoteKeys(school, user?.id), "options"],
    queryFn: () => lessonNotesApi.options(school),
    enabled: !!school && canView,
  })
  const filtered = query.data?.items ?? []
  const stats = query.data?.stats ?? {
    total: 0,
    draft: 0,
    submitted: 0,
    approved: 0,
  }
  const mutation = useMutation<
    LessonNote | void,
    Error,
    { note: LessonNote; action: "approve" | "return" | "delete" }
  >({
    mutationFn: ({
      note,
      action,
    }: {
      note: LessonNote
      action: "approve" | "return" | "delete"
    }) =>
      action === "delete"
        ? lessonNotesApi.remove(school, note)
        : lessonNotesApi.review(school, note, action === "approve", remarks),
    onSuccess: () => {
      setPreview(null)
      client.invalidateQueries({ queryKey: lessonNoteKeys(school, user?.id) })
      toast.success("Lesson note updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })
  if (!canView)
    return <p role="alert">You do not have access to lesson notes.</p>
  if (!school) return <p role="status">Loading school…</p>
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lesson Notes"
        description="Prepare, submit and track weekly lesson notes for your classes."
        actions={
          permissions.canCreate(LESSON_NOTES_MENU) ? (
            <Button
              className="h-9 gap-2"
              onClick={() =>
                navigate(
                  DashboardRoutes.toELearningLessonNoteCreate(productId ?? "")
                )
              }
            >
              <FilePlus2 className="size-4" />
              New lesson note
            </Button>
          ) : undefined
        }
        stats={[
          { label: "Total", value: stats.total },
          { label: "Drafts", value: stats.draft },
          { label: "Submitted", value: stats.submitted },
          { label: "Approved", value: stats.approved },
        ]}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500">
          <Filter className="size-3.5" />
          Filters
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1 space-y-1">
            <Label className="text-xs text-slate-500">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topic, class, teacher…"
                className="h-10 rounded-xl border-slate-200 pl-9"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Class</Label>
            <FilterSelect
              value={className}
              onChange={(v) => {
                setClassName(v)
                setPage(1)
              }}
              options={[
                { value: "all", label: "All classes" },
                ...(options.data?.classes ?? []).map((c) => ({
                  value: c.id,
                  label: c.name,
                })),
              ]}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Subject</Label>
            <FilterSelect
              value={subject}
              onChange={(v) => {
                setSubject(v)
                setPage(1)
              }}
              options={[
                { value: "all", label: "All subjects" },
                ...(options.data?.subjects ?? []).map((s) => ({
                  value: s.id,
                  label: s.name,
                })),
              ]}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Term</Label>
            <FilterSelect
              value={term}
              onChange={(v) => {
                setTerm(v)
                setPage(1)
              }}
              options={[
                { value: "all", label: "All terms" },
                ...(options.data?.terms ?? []).map((t) => ({
                  value: t.id,
                  label: `${t.sessionName} · ${t.name}`,
                })),
              ]}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Status</Label>
            <FilterSelect
              value={status}
              onChange={(v) => {
                setStatus(v)
                setPage(1)
              }}
              options={statusOptions}
            />
          </div>
        </div>
      </div>

      {options.isError && (
        <p role="alert">
          Could not load filters.{" "}
          <Button variant="outline" onClick={() => options.refetch()}>
            Retry filters
          </Button>
        </p>
      )}
      {query.isPending ? (
        <p role="status">Loading lesson notes…</p>
      ) : query.isError ? (
        <div role="alert">
          {query.error.message}{" "}
          <Button variant="outline" onClick={() => query.refetch()}>
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <BookOpen className="mb-3 size-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">
            No lesson notes found
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Try changing filters or create a new lesson note.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((note) => {
            const statusMeta = LESSON_NOTE_STATUS_STYLE[note.status]
            return (
              <article
                key={note.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {note.title || note.topic}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {note.subject} · {note.className}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusMeta.className}`}
                  >
                    {statusMeta.label}
                  </span>
                </div>

                <div className="mb-4 space-y-1.5 text-xs text-slate-600">
                  <p>
                    Week {note.week} · {note.term} · {note.session}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock3 className="size-3.5 text-slate-400" />
                    {formatDate(note.date)} · {note.durationMinutes} mins
                  </p>
                  <p>{note.teacherName}</p>
                </div>

                {note.remarks && (
                  <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {note.remarks}
                  </p>
                )}

                <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3">
                  <Button
                    variant="outline"
                    className="h-8 flex-1 gap-1.5 rounded-lg text-xs"
                    onClick={() => {
                      setPreview(note)
                      setRemarks(note.remarks ?? "")
                    }}
                  >
                    <Eye className="size-3.5" />
                    Preview
                  </Button>
                  {note.authorUserId === user?.id &&
                    ["draft", "returned"].includes(note.status) &&
                    permissions.canUpdate(LESSON_NOTES_MENU) && (
                      <Button
                        variant="outline"
                        className="h-8 flex-1 gap-1.5 rounded-lg text-xs"
                        onClick={() =>
                          navigate(
                            DashboardRoutes.toELearningLessonNoteEdit(
                              productId ?? "",
                              note.id
                            )
                          )
                        }
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                    )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
        <span>
          {query.data?.totalItems ?? 0} results · Page {page}
        </span>
        <Button
          variant="outline"
          disabled={page <= 1 || query.isFetching}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={
            query.isFetching || page * 50 >= (query.data?.totalItems ?? 0)
          }
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
      <Dialog
        open={!!preview}
        onOpenChange={(open) => !open && setPreview(null)}
      >
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8 text-left">
                  {preview.title || preview.topic}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">
                    {preview.subject}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">
                    {preview.className}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">
                    Week {preview.week}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">
                    {preview.durationMinutes} mins
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 font-medium ${LESSON_NOTE_STATUS_STYLE[preview.status].className}`}
                  >
                    {LESSON_NOTE_STATUS_STYLE[preview.status].label}
                  </span>
                </div>

                <PreviewSection title="Topic" body={preview.topic} />
                <PreviewSection
                  title="Behavioural objectives"
                  body={preview.behaviouralObjectives}
                />
                <PreviewSection
                  title="Previous knowledge"
                  body={preview.previousKnowledge}
                />
                <PreviewSection
                  title="Instructional materials"
                  body={preview.instructionalMaterials}
                />
                <PreviewSection
                  title="Introduction"
                  body={preview.introduction}
                />
                <PreviewSection
                  title="Presentation"
                  body={preview.presentation}
                />
                <PreviewSection title="Evaluation" body={preview.evaluation} />
                <PreviewSection title="Assignment" body={preview.assignment} />
                <PreviewSection title="Conclusion" body={preview.conclusion} />
                <PreviewSection title="References" body={preview.references} />

                {preview.remarks && (
                  <p className="rounded-xl bg-amber-50 p-3">
                    Review feedback: {preview.remarks}
                  </p>
                )}
                {query.data?.canReview &&
                  preview.authorUserId !== user?.id &&
                  preview.status === "submitted" &&
                  permissions.canUpdate(LESSON_NOTES_MENU) && (
                    <div className="space-y-3 border-t pt-4">
                      <label className="block">
                        Review feedback
                        <textarea
                          maxLength={2000}
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          className="mt-2 w-full rounded-xl border p-3"
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          disabled={mutation.isPending}
                          onClick={() =>
                            mutation.mutate({
                              note: preview,
                              action: "approve",
                            })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          disabled={mutation.isPending || !remarks.trim()}
                          onClick={() =>
                            mutation.mutate({ note: preview, action: "return" })
                          }
                        >
                          Return for changes
                        </Button>
                      </div>
                    </div>
                  )}
                {preview.authorUserId === user?.id &&
                  ["draft", "returned"].includes(preview.status) &&
                  permissions.canDelete(LESSON_NOTES_MENU) && (
                    <Button
                      variant="destructive"
                      disabled={mutation.isPending}
                      onClick={() => {
                        if (window.confirm("Delete this lesson note?"))
                          mutation.mutate({ note: preview, action: "delete" })
                      }}
                    >
                      Delete note
                    </Button>
                  )}
                {preview.status === "approved" && (
                  <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="size-4" />
                    Approved for teaching
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
