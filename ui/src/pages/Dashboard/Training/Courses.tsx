import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  BookOpen,
  Plus,
  Sparkles,
  CheckCircle2,
  Loader2,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import {
  trainingApi,
  trainingMenus,
  type TrainingCourse,
} from "@/api/training.api"
import type {
  AiCourseLesson,
  AiLessonContent,
} from "@/api/digitalSchoolAiCourse.api"
import {
  AccessDenied,
  Empty,
  Field,
  LoadError,
  Status,
  input,
  panel,
  message,
} from "./shared"
const blankLesson = (): AiCourseLesson => ({
  title: "",
  outcomes: [""],
  content: {
    explanation: "",
    workedExample: "",
    activity: "",
    worksheet: "",
    questions: [
      {
        prompt: "",
        options: ["", "", "", ""],
        correctOption: 0,
        explanation: "",
      },
    ],
    books: [],
    essay: null,
  },
})

export default function TrainingCourses() {
  const schoolId = useSchoolId(),
    permissions = usePermissions(),
    cache = useQueryClient()
  const view = permissions.canView(trainingMenus.courses),
    create = permissions.canCreate(trainingMenus.courses),
    update = permissions.canUpdate(trainingMenus.courses)
  const [search, setSearch] = useState(""),
    [creating, setCreating] = useState(false),
    [title, setTitle] = useState(""),
    [editor, setEditor] = useState<TrainingCourse | null>(null),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false)
  const key = ["training-courses", schoolId]
  const query = useQuery({
    queryKey: key,
    queryFn: () => trainingApi.courses(schoolId),
    enabled: !!schoolId && view,
  })
  const newCourse = useMutation({
    mutationFn: () => trainingApi.create(schoolId, title),
    onSuccess: (course) => {
      setEditor(course)
      setCreating(false)
      setTitle("")
      setDirty(false)
      void cache.invalidateQueries({ queryKey: key })
    },
    onError: (e) => toast.error(message(e)),
  })
  const open = async (id: string) => {
    setBusy(true)
    try {
      setEditor(await trainingApi.course(schoolId, id))
      setDirty(false)
    } catch (e) {
      toast.error(message(e))
    } finally {
      setBusy(false)
    }
  }
  const patch = (action: (c: TrainingCourse) => void) => {
    setEditor((c) => {
      if (!c) return c
      const next = structuredClone(c)
      action(next)
      return next
    })
    setDirty(true)
  }
  const persist = async (published: boolean) => {
    if (!editor) return
    setBusy(true)
    try {
      const saved = await trainingApi.save(schoolId, editor, published)
      setEditor(saved)
      setDirty(false)
      toast.success(
        published
          ? "Reviewed course published. It can now be assigned to staff."
          : "Draft saved."
      )
      void cache.invalidateQueries({ queryKey: key })
      void cache.invalidateQueries({
        queryKey: ["training-assignment-courses", schoolId],
      })
    } catch (e) {
      toast.error(message(e))
    } finally {
      setBusy(false)
    }
  }
  const generate = async (lessonIndex: number | null) => {
    if (!editor) return
    if (
      lessonIndex === null &&
      editor.content?.sections.length &&
      !window.confirm(
        "Replace the current outline and lesson content with a new AI outline?"
      )
    )
      return
    setBusy(true)
    try {
      const saved = await trainingApi.save(schoolId, editor, false)
      setEditor(saved)
      setDirty(false)
      const generated = await trainingApi.generate(schoolId, saved, lessonIndex)
      setEditor(generated)
      toast.success(
        "Generated content saved as a draft. Review it before publishing."
      )
      void cache.invalidateQueries({ queryKey: key })
    } catch (e) {
      toast.error(message(e))
      if (editor) {
        try {
          setEditor(await trainingApi.course(schoolId, editor.id))
          setDirty(false)
        } catch {
          /* Keep the current editor if refresh also fails. */
        }
      }
    } finally {
      setBusy(false)
    }
  }
  const startManual = () => {
    if (
      editor?.content?.sections.length &&
      !window.confirm(
        "Replace your current curriculum and lesson content with a blank template?"
      )
    )
      return
    patch((c) => {
      c.content = {
        overview: "",
        sections: Array.from(
          { length: Math.min(6, Math.max(1, c.brief.sectionCount)) },
          (_, i) => ({
            title: `Section ${i + 1}`,
            lessons: Array.from(
              { length: Math.min(6, Math.max(1, c.brief.lessonsPerSection)) },
              () => {
                const l = blankLesson()
                l.content!.questions = Array.from(
                  {
                    length: Math.min(
                      5,
                      Math.max(1, c.brief.questionsPerLesson)
                    ),
                  },
                  () => ({
                    prompt: "",
                    options: ["", "", "", ""],
                    correctOption: 0,
                    explanation: "",
                  })
                )
                return l
              }
            ),
          })
        ),
      }
    })
  }
  const close = () => {
    if (
      !busy &&
      (!dirty || window.confirm("Discard your unsaved course changes?"))
    )
      setEditor(null)
  }
  if (!view) return <AccessDenied />
  const courses = (query.data ?? []).filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Course Library"
        description="Create practical learning for your organisation. Review every lesson before making a course available."
        icon={<BookOpen className="size-6 text-blue-600" />}
        badge="Training & Development"
        actions={
          create && (
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Create course
            </Button>
          )
        }
      />
      <div className="relative max-w-md">
        <Search className="absolute top-3 left-3 size-4 text-slate-400" />
        <input
          aria-label="Search training courses"
          placeholder="Search courses"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={input + " pl-10"}
        />
      </div>
      {query.isPending && (
        <p role="status" className="text-sm text-slate-500">
          Loading training courses…
        </p>
      )}
      {query.isError && (
        <LoadError error={query.error} retry={() => void query.refetch()} />
      )}
      {query.isSuccess && !courses.length && (
        <Empty title="Build your first staff course">
          Start with your organisation’s policies, onboarding or professional
          development needs.
        </Empty>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((c) => (
          <article key={c.id} className={panel + " flex flex-col gap-4"}>
            <div className="flex justify-between">
              <div className="rounded-xl bg-blue-50 p-3">
                <BookOpen className="size-5 text-blue-600" />
              </div>
              <Status value={c.published ? "published" : "draft"} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">
                {c.title}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {c.lessonCount} lessons · {c.passPercent}% pass mark
              </p>
            </div>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void open(c.id)}
            >
              {update ? "Open course editor" : "View course"}
            </Button>
          </article>
        ))}
      </div>
      <Dialog
        open={creating}
        onOpenChange={(o) => !newCourse.isPending && setCreating(o)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create training course</DialogTitle>
            <DialogDescription>
              Start a private organisational draft, then add your curriculum and
              assessments.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              newCourse.mutate()
            }}
            className="space-y-4"
          >
            <Field label="Course title" value={title} onChange={setTitle} />
            <Button
              type="submit"
              disabled={!title.trim() || newCourse.isPending}
            >
              {newCourse.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Create draft
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editor} onOpenChange={(o) => !o && close()}>
        <DialogContent
          className="max-h-[92vh] overflow-y-auto sm:max-w-5xl"
          onEscapeKeyDown={(e) => {
            if (busy || dirty) e.preventDefault()
          }}
          onInteractOutside={(e) => {
            if (busy || dirty) e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>{editor?.title}</DialogTitle>
            <DialogDescription>
              Build the brief, edit lessons and review assessments. AI output
              remains a draft until you publish.
            </DialogDescription>
          </DialogHeader>
          {editor && (
            <fieldset
              disabled={busy || !update}
              className="min-w-0 space-y-6 disabled:opacity-80"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Course title"
                  value={editor.brief.title}
                  onChange={(v) =>
                    patch((c) => {
                      c.brief.title = v
                    })
                  }
                />
                <Field
                  label="Training topic"
                  value={editor.brief.topic}
                  maxLength={2000}
                  onChange={(v) =>
                    patch((c) => {
                      c.brief.topic = v
                    })
                  }
                />
                <Field
                  label="Audience / level"
                  value={editor.brief.educationLevel}
                  onChange={(v) =>
                    patch((c) => {
                      c.brief.educationLevel = v
                    })
                  }
                />
                <Field
                  label="Policy or curriculum standard"
                  value={editor.brief.curriculumStandard}
                  maxLength={300}
                  onChange={(v) =>
                    patch((c) => {
                      c.brief.curriculumStandard = v
                    })
                  }
                />
                <Field
                  label="Country code (GB or NG)"
                  value={editor.brief.countryCode}
                  maxLength={2}
                  onChange={(v) =>
                    patch((c) => {
                      c.brief.countryCode = v.toUpperCase()
                    })
                  }
                />
                <Field
                  label="Learning goals"
                  value={editor.brief.learningGoals}
                  multiline
                  maxLength={2000}
                  onChange={(v) =>
                    patch((c) => {
                      c.brief.learningGoals = v
                    })
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <Field
                  label="Sections"
                  value={editor.brief.sectionCount}
                  type="number"
                  min={1}
                  max={6}
                  onChange={(v) =>
                    patch((c) => {
                      c.brief.sectionCount = Number(v)
                    })
                  }
                />
                <Field
                  label="Lessons per section"
                  value={editor.brief.lessonsPerSection}
                  type="number"
                  min={1}
                  max={6}
                  onChange={(v) =>
                    patch((c) => {
                      c.brief.lessonsPerSection = Number(v)
                    })
                  }
                />
                <Field
                  label="Questions per lesson"
                  value={editor.brief.questionsPerLesson}
                  type="number"
                  min={1}
                  max={5}
                  onChange={(v) =>
                    patch((c) => {
                      c.brief.questionsPerLesson = Number(v)
                    })
                  }
                />
                <Field
                  label="Pass mark (%)"
                  value={editor.passPercent}
                  type="number"
                  min={1}
                  max={100}
                  onChange={(v) =>
                    patch((c) => {
                      c.passPercent = Number(v)
                    })
                  }
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={startManual}>
                  Start manual curriculum
                </Button>
                <Button variant="outline" onClick={() => void generate(null)}>
                  <Sparkles className="size-4" />
                  Generate AI outline
                </Button>
              </div>
              {!!editor.content?.sections.length && (
                <>
                  <Field
                    label="Course overview"
                    value={editor.content.overview}
                    multiline
                    maxLength={4000}
                    onChange={(v) =>
                      patch((c) => {
                        c.content!.overview = v
                      })
                    }
                  />
                  {editor.content.sections.map((section, si) => (
                    <div
                      key={si}
                      className={panel + " space-y-4 bg-slate-50/50"}
                    >
                      <Field
                        label={`Section ${si + 1} title`}
                        value={section.title}
                        onChange={(v) =>
                          patch((c) => {
                            c.content!.sections[si].title = v
                          })
                        }
                      />
                      {section.lessons.map((lesson, li) => {
                        const index =
                          editor
                            .content!.sections.slice(0, si)
                            .reduce((n, s) => n + s.lessons.length, 0) + li
                        const change = (action: (l: AiCourseLesson) => void) =>
                          patch((c) =>
                            action(c.content!.sections[si].lessons[li])
                          )
                        const editContent = (
                          action: (l: AiLessonContent) => void
                        ) =>
                          change((l) => {
                            l.content ??= blankLesson().content
                            action(l.content!)
                          })
                        return (
                          <details
                            key={li}
                            className="rounded-xl border border-slate-200 bg-white p-4"
                            open={li === 0}
                          >
                            <summary className="cursor-pointer text-sm font-semibold">
                              Lesson {index + 1}:{" "}
                              {lesson.title || "Untitled lesson"}
                            </summary>
                            <div className="mt-4 space-y-4">
                              <Field
                                label="Lesson title"
                                value={lesson.title}
                                onChange={(v) =>
                                  change((l) => {
                                    l.title = v
                                  })
                                }
                              />
                              <Field
                                label="Learning outcomes (one per line)"
                                value={lesson.outcomes.join("\n")}
                                multiline
                                maxLength={3000}
                                onChange={(v) =>
                                  change((l) => {
                                    l.outcomes = v.split("\n")
                                  })
                                }
                              />
                              <Button
                                variant="outline"
                                onClick={() => void generate(index)}
                              >
                                <Sparkles className="size-4" />
                                Generate this lesson
                              </Button>
                              {(
                                [
                                  "explanation",
                                  "workedExample",
                                  "activity",
                                  "worksheet",
                                ] as const
                              ).map((field) => (
                                <Field
                                  key={field}
                                  label={
                                    {
                                      explanation: "Lesson content",
                                      workedExample: "Worked example",
                                      activity: "Practical activity",
                                      worksheet:
                                        "Worksheet / practice material",
                                    }[field]
                                  }
                                  value={lesson.content?.[field] ?? ""}
                                  multiline
                                  maxLength={
                                    field === "explanation"
                                      ? 16000
                                      : field === "worksheet"
                                        ? 8000
                                        : 5000
                                  }
                                  onChange={(v) =>
                                    editContent((c) => {
                                      c[field] = v
                                    })
                                  }
                                />
                              ))}
                              <h3 className="font-semibold text-slate-900">
                                Assessment and marking key
                              </h3>
                              {(lesson.content?.questions ?? []).map(
                                (q, qi) => (
                                  <div
                                    key={qi}
                                    className="space-y-3 rounded-xl bg-slate-50 p-4"
                                  >
                                    <Field
                                      label={`Question ${qi + 1}`}
                                      value={q.prompt}
                                      multiline
                                      maxLength={3000}
                                      onChange={(v) =>
                                        editContent((c) => {
                                          c.questions[qi].prompt = v
                                        })
                                      }
                                    />
                                    <div className="grid gap-3 sm:grid-cols-2">
                                      {q.options.map((option, oi) => (
                                        <Field
                                          key={oi}
                                          label={`Option ${oi + 1}`}
                                          value={option}
                                          maxLength={1000}
                                          onChange={(v) =>
                                            editContent((c) => {
                                              c.questions[qi].options[oi] = v
                                            })
                                          }
                                        />
                                      ))}
                                    </div>
                                    <label className="block space-y-1 text-sm">
                                      Correct option
                                      <select
                                        className={input}
                                        value={q.correctOption}
                                        onChange={(e) =>
                                          editContent((c) => {
                                            c.questions[qi].correctOption =
                                              Number(e.target.value)
                                          })
                                        }
                                      >
                                        {q.options.map((_, oi) => (
                                          <option key={oi} value={oi}>
                                            Option {oi + 1}
                                          </option>
                                        ))}
                                      </select>
                                    </label>
                                    <Field
                                      label="Answer explanation"
                                      value={q.explanation}
                                      multiline
                                      maxLength={3000}
                                      onChange={(v) =>
                                        editContent((c) => {
                                          c.questions[qi].explanation = v
                                        })
                                      }
                                    />
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        editContent((c) => {
                                          c.questions.splice(qi, 1)
                                        })
                                      }
                                    >
                                      Remove question
                                    </Button>
                                  </div>
                                )
                              )}
                              <Button
                                variant="outline"
                                disabled={
                                  (lesson.content?.questions.length ?? 0) >= 5
                                }
                                onClick={() =>
                                  editContent((c) => {
                                    c.questions.push({
                                      prompt: "",
                                      options: ["", "", "", ""],
                                      correctOption: 0,
                                      explanation: "",
                                    })
                                  })
                                }
                              >
                                Add assessment question
                              </Button>
                              <h3 className="font-semibold text-slate-900">
                                Recommended books
                              </h3>
                              {(lesson.content?.books ?? []).map((book, bi) => (
                                <div
                                  className="grid gap-3 rounded-xl bg-slate-50 p-4"
                                  key={bi}
                                >
                                  <Field
                                    label="Book title"
                                    value={book.title}
                                    maxLength={300}
                                    onChange={(v) =>
                                      editContent((c) => {
                                        c.books[bi].title = v
                                      })
                                    }
                                  />
                                  <Field
                                    label="Author"
                                    value={book.author}
                                    onChange={(v) =>
                                      editContent((c) => {
                                        c.books[bi].author = v
                                      })
                                    }
                                  />
                                  <Field
                                    label="Why this book helps"
                                    value={book.reason}
                                    maxLength={1000}
                                    onChange={(v) =>
                                      editContent((c) => {
                                        c.books[bi].reason = v
                                      })
                                    }
                                  />
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      editContent((c) => {
                                        c.books.splice(bi, 1)
                                      })
                                    }
                                  >
                                    Remove book
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                disabled={
                                  (lesson.content?.books.length ?? 0) >= 3
                                }
                                onClick={() =>
                                  editContent((c) => {
                                    c.books.push({
                                      title: "",
                                      author: "",
                                      reason: "",
                                      verified: false,
                                    })
                                  })
                                }
                              >
                                Add book recommendation
                              </Button>
                              <p className="text-xs text-slate-500">
                                Verify book titles and authors before
                                publishing. Recommendations are not included
                                copies of the books.
                              </p>
                            </div>
                          </details>
                        )
                      })}
                    </div>
                  ))}
                </>
              )}
            </fieldset>
          )}
          {editor && (
            <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t bg-white pt-4">
              <Status value={editor.published ? "published" : "draft"} />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" disabled={busy} onClick={close}>
                  Close
                </Button>
                {update && (
                  <>
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => void persist(false)}
                    >
                      Save draft
                    </Button>
                    <Button
                      disabled={busy || !editor.content?.sections.length}
                      onClick={() => void persist(true)}
                    >
                      {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Publish reviewed course
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
