import { useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  FileImage,
  Loader2,
  Plus,
  ScanLine,
  Trash2,
  UploadCloud,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type {
  TeacherCourseAssignmentReviewI,
  TeacherCoursePaperScriptUploadI,
} from "@/api/teacherCourse.api"

type ScriptDraft = TeacherCoursePaperScriptUploadI & { id: string }

interface PaperSubmissionsPanelProps {
  review: TeacherCourseAssignmentReviewI
  isUploading: boolean
  isConfirming: boolean
  confirmingSubmissionId?: string
  onUpload: (scripts: TeacherCoursePaperScriptUploadI[]) => Promise<unknown>
  onConfirm: (paperSubmissionId: string, studentId: string) => Promise<unknown>
}

function newScript(): ScriptDraft {
  return {
    id: crypto.randomUUID(),
    clientReference: crypto.randomUUID(),
    pages: [],
  }
}

export default function PaperSubmissionsPanel({
  review,
  isUploading,
  isConfirming,
  confirmingSubmissionId,
  onUpload,
  onConfirm,
}: PaperSubmissionsPanelProps) {
  const [scripts, setScripts] = useState<ScriptDraft[]>([newScript()])
  const [matches, setMatches] = useState<Record<string, string>>({})
  const pending = useMemo(
    () => (review.paperSubmissions ?? []).filter((item) => !item.attemptId),
    [review.paperSubmissions]
  )

  const updateScript = (id: string, update: Partial<ScriptDraft>) =>
    setScripts((current) =>
      current.map((item) => (item.id === id ? { ...item, ...update } : item))
    )

  const upload = async () => {
    const ready = scripts.filter((item) => item.pages.length > 0)
    if (!ready.length) return
    await onUpload(
      ready.map(({ clientReference, studentId, pages }) => ({
        clientReference,
        studentId: studentId || undefined,
        pages,
      }))
    )
    setScripts([newScript()])
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-5 sm:p-7">
      <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ScanLine className="size-5" />
          </span>
          <div>
            <h3 className="font-semibold text-blue-950">Teacher paper intake</h3>
            <p className="mt-1 text-sm leading-6 text-blue-800">
              One card represents one student&apos;s complete script. Add all its
              pages in reading order. Select the student when known, or leave it
              on AI identification and confirm the suggested roster match afterward.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {scripts.map((script, index) => (
          <div key={script.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Paper script {index + 1}</p>
                <p className="text-xs text-muted-foreground">
                  Up to 12 JPEG, PNG or WebP pages, 10 MB each
                </p>
              </div>
              {scripts.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() =>
                    setScripts((current) => current.filter((x) => x.id !== script.id))
                  }
                >
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              )}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-[minmax(220px,0.8fr)_1.2fr]">
              <select
                className="h-10 rounded-md border border-input bg-white px-3 text-sm"
                value={script.studentId ?? ""}
                onChange={(event) =>
                  updateScript(script.id, { studentId: event.target.value || undefined })
                }
              >
                <option value="">Let AI identify name / student ID</option>
                {review.students.map((student) => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.studentName}
                    {student.studentIdentifier ? ` · ${student.studentIdentifier}` : ""}
                  </option>
                ))}
              </select>
              <label className="flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-blue-300 bg-blue-50 px-3 text-sm font-medium text-blue-700 hover:bg-blue-100">
                <UploadCloud className="size-4" />
                {script.pages.length
                  ? `${script.pages.length} page${script.pages.length === 1 ? "" : "s"} selected`
                  : "Choose this script’s pages"}
                <input
                  hidden
                  multiple
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    updateScript(script.id, {
                      pages: Array.from(event.target.files ?? []).slice(0, 12),
                    })
                  }
                />
              </label>
            </div>
            {script.pages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {script.pages.map((file, pageIndex) => (
                  <span
                    key={`${file.name}-${pageIndex}`}
                    className="inline-flex max-w-56 items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs"
                  >
                    <FileImage className="size-3.5 shrink-0" />
                    <span className="truncate">{pageIndex + 1}. {file.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={scripts.length >= 40 || isUploading}
            onClick={() => setScripts((current) => [...current, newScript()])}
          >
            <Plus className="size-4" /> Add another student paper
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isUploading || !scripts.some((item) => item.pages.length)}
            onClick={() => void upload()}
          >
            {isUploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
            {isUploading
              ? "Uploading and identifying…"
              : `Upload ${scripts.filter((item) => item.pages.length).length} paper script${scripts.filter((item) => item.pages.length).length === 1 ? "" : "s"}`}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-semibold">Identity confirmation queue</h3>
          <p className="text-xs text-muted-foreground">
            AI suggestions never create student attempts until a teacher confirms them.
          </p>
        </div>
        {pending.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No paper scripts are waiting for student confirmation.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pending.map((submission) => {
              const confidence = Math.round((submission.identityConfidence ?? 0) * 100)
              const selectedStudentId =
                matches[submission.id] ?? submission.matchedStudentId ?? ""
              return (
                <div key={submission.id} className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">
                          {submission.detectedStudentName || "Student name not detected"}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${submission.status === "matched" ? "bg-green-50 text-green-700" : submission.status === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                          {submission.status === "matched" ? `${confidence}% match` : submission.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Detected ID: {submission.detectedStudentIdentifier || "—"} · {submission.pages.length} page{submission.pages.length === 1 ? "" : "s"}
                      </p>
                      {(submission.failureReason || submission.identityNotes) && (
                        <p className="mt-1 flex items-start gap-1 text-xs text-amber-700">
                          <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                          {submission.failureReason || submission.identityNotes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {submission.pages.slice(0, 3).map((page) => (
                        <a key={page.id} href={page.fileUrl} target="_blank" rel="noreferrer">
                          <img className="size-14 rounded-md border object-cover" src={page.fileUrl} alt={`Paper page ${page.pageNumber}`} />
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      className="h-10 min-w-0 flex-1 rounded-md border border-input bg-white px-3 text-sm"
                      value={selectedStudentId}
                      onChange={(event) =>
                        setMatches((current) => ({ ...current, [submission.id]: event.target.value }))
                      }
                    >
                      <option value="">Select the correct student</option>
                      {review.students.map((student) => (
                        <option key={student.studentId} value={student.studentId}>
                          {student.studentName}{student.studentIdentifier ? ` · ${student.studentIdentifier}` : ""}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      disabled={!selectedStudentId || isConfirming}
                      onClick={() => void onConfirm(submission.id, selectedStudentId)}
                    >
                      {isConfirming && confirmingSubmissionId === submission.id
                        ? <Loader2 className="size-4 animate-spin" />
                        : <CheckCircle2 className="size-4" />}
                      Confirm student
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
