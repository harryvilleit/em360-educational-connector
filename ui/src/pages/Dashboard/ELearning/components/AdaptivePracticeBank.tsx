import { useMemo, useState } from "react"
import { Archive, CheckCircle2, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { dashboardCardSurface } from "@/components/general/StatCard"
import { cn } from "@/lib/utils"
import {
  useAdaptivePracticeBank,
  useDeleteAdaptivePracticeQuestion,
  useDraftAdaptiveExplanations,
  useSaveAdaptivePracticeQuestion,
} from "@/hooks/elearning/useAdaptiveLearning"
import type {
  AdaptiveCourseRefI,
  AdaptivePracticeBankQuestionI,
  AdaptiveTopicOptionI,
  SaveAdaptivePracticeQuestionInputI,
} from "@/api/adaptiveLearning.api"
import { TopicSelect } from "./AdaptiveQuestionTagger"

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

type EditorState = {
  id?: string
  data: SaveAdaptivePracticeQuestionInputI
}

const emptyQuestion = (sectionId = ""): SaveAdaptivePracticeQuestionInputI => ({
  sectionId,
  prompt: "",
  answerMode: "single_choice",
  explanation: "",
  isActive: true,
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
})

export default function AdaptivePracticeBank({
  courseRef,
  readOnly = false,
}: {
  courseRef: AdaptiveCourseRefI
  readOnly?: boolean
}) {
  const { bank, isLoading, isError } = useAdaptivePracticeBank(courseRef)
  const remove = useDeleteAdaptivePracticeQuestion(courseRef)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const grouped = useMemo(() => {
    if (!bank) return []
    return bank.topics
      .map((topic) => ({
        topic,
        questions: bank.questions.filter(
          (q) => q.sectionId === topic.id && (showArchived || q.isActive)
        ),
      }))
      .filter((group) => group.questions.length > 0)
  }, [bank, showArchived])

  const archivedCount = bank?.questions.filter((q) => !q.isActive).length ?? 0

  const onDelete = async (question: AdaptivePracticeBankQuestionI) => {
    try {
      const res = await remove.mutateAsync(question.id)
      toast.success(res.message || (res.value.archived ? "Archived" : "Deleted"))
    } catch (err) {
      toast.error(errorMessage(err, "Could not delete the question"))
    }
  }

  return (
    <div className={dashboardCardSurface}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h3 className="font-semibold">Practice questions</h3>
          <p className="text-xs text-muted-foreground">
            Practice-only questions for a topic. Students can use them straight away, and they
            never count towards grades.
          </p>
        </div>
        <div className="flex gap-2">
          {archivedCount > 0 && (
            <Button size="sm" variant="ghost" className="h-8" onClick={() => setShowArchived((v) => !v)}>
              {showArchived ? "Hide archived" : `Show archived (${archivedCount})`}
            </Button>
          )}
          {!readOnly && bank && bank.topics.length > 0 && (
            <Button
              size="sm"
              className="h-8 rounded-md"
              onClick={() => setEditor({ data: emptyQuestion(bank.topics[0]?.id) })}
            >
              <Plus className="size-3.5" /> Add question
            </Button>
          )}
        </div>
      </div>

      {isLoading && <p className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</p>}
      {isError && <p className="px-5 py-8 text-center text-sm text-rose-600">Could not load practice questions.</p>}
      {bank && bank.topics.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          Add curriculum sections first. Practice questions belong to a topic.
        </p>
      )}
      {bank && bank.topics.length > 0 && grouped.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          No practice questions yet. Add a few for the topics your class finds hardest.
        </p>
      )}

      <div className="divide-y divide-gray-100">
        {grouped.map(({ topic, questions }) => (
          <section key={topic.id} className="px-5 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {topic.title} · {questions.length}
            </p>
            <ul className="space-y-2">
              {questions.map((question) => (
                <li
                  key={question.id}
                  className={cn(
                    "rounded-lg border border-gray-100 p-3",
                    !question.isActive && "bg-gray-50 opacity-70"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="whitespace-pre-line text-sm font-medium">{question.prompt}</p>
                      <ul className="flex flex-wrap gap-1.5">
                        {question.options.map((option) => (
                          <li
                            key={option.id}
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px]",
                              option.isCorrect
                                ? "bg-emerald-50 font-medium text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {option.isCorrect && <CheckCircle2 className="mr-1 inline size-3" />}
                            {option.text}
                          </li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-muted-foreground">
                        {question.isActive ? "Active" : "Archived"} · practised {question.responseCount} time
                        {question.responseCount === 1 ? "" : "s"}
                        {question.explanation ? " · has explanation" : " · no explanation"}
                      </p>
                    </div>
                    {!readOnly && (
                      <div className="flex shrink-0 gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          aria-label="Edit"
                          onClick={() =>
                            setEditor({
                              id: question.id,
                              data: {
                                sectionId: question.sectionId,
                                prompt: question.prompt,
                                answerMode: question.answerMode,
                                explanation: question.explanation ?? "",
                                isActive: question.isActive,
                                options: question.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
                              },
                            })
                          }
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        {question.isActive && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-rose-600"
                            aria-label={question.responseCount > 0 ? "Archive" : "Delete"}
                            title={question.responseCount > 0 ? "Archive (students have practised it)" : "Delete"}
                            disabled={remove.isPending}
                            onClick={() => void onDelete(question)}
                          >
                            {question.responseCount > 0 ? <Archive className="size-3.5" /> : <Trash2 className="size-3.5" />}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {editor && bank && (
        <PracticeQuestionEditor
          courseRef={courseRef}
          topics={bank.topics}
          aiAvailable={bank.aiAvailable}
          initial={editor}
          onClose={() => setEditor(null)}
        />
      )}
    </div>
  )
}

function PracticeQuestionEditor({
  courseRef,
  topics,
  aiAvailable,
  initial,
  onClose,
}: {
  courseRef: AdaptiveCourseRefI
  topics: AdaptiveTopicOptionI[]
  aiAvailable: boolean
  initial: EditorState
  onClose: () => void
}) {
  const save = useSaveAdaptivePracticeQuestion(courseRef)
  const draft = useDraftAdaptiveExplanations(courseRef)
  const [data, setData] = useState<SaveAdaptivePracticeQuestionInputI>(initial.data)

  const update = (patch: Partial<SaveAdaptivePracticeQuestionInputI>) =>
    setData((current) => ({ ...current, ...patch }))

  const setOption = (index: number, patch: { text?: string; isCorrect?: boolean }) =>
    setData((current) => {
      const options = current.options.map((option, i) => {
        if (i === index) return { ...option, ...patch }
        // Single choice: marking one option correct unmarks the others.
        if (patch.isCorrect && current.answerMode === "single_choice") return { ...option, isCorrect: false }
        return option
      })
      return { ...current, options }
    })

  const setMode = (answerMode: SaveAdaptivePracticeQuestionInputI["answerMode"]) =>
    setData((current) => {
      if (answerMode === "multiple_choice") return { ...current, answerMode }
      const firstCorrect = current.options.findIndex((o) => o.isCorrect)
      return {
        ...current,
        answerMode,
        options: current.options.map((o, i) => ({ ...o, isCorrect: i === Math.max(0, firstCorrect) })),
      }
    })

  const draftExplanation = async () => {
    try {
      const res = await draft.mutateAsync([
        {
          prompt: data.prompt,
          answerMode: data.answerMode,
          sectionId: data.sectionId,
          options: data.options.filter((o) => o.text.trim()),
        },
      ])
      const text = res.value.drafts[0]?.explanation
      if (text) update({ explanation: text })
      else toast.info("The AI could not draft an explanation.")
    } catch (err) {
      toast.error(errorMessage(err, "Could not draft an explanation"))
    }
  }

  const submit = async () => {
    try {
      await save.mutateAsync({
        id: initial.id,
        data: { ...data, explanation: data.explanation?.trim() ? data.explanation.trim() : null },
      })
      toast.success("Practice question saved")
      onClose()
    } catch (err) {
      toast.error(errorMessage(err, "Could not save the question"))
    }
  }

  const filledOptions = data.options.filter((o) => o.text.trim()).length

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial.id ? "Edit practice question" : "New practice question"}</DialogTitle>
          <DialogDescription>Practice questions never count towards grades.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Topic</span>
              <TopicSelect
                topics={topics}
                value={data.sectionId || null}
                placeholder="Choose topic…"
                className="sm:w-full"
                onChange={(topic) => update({ sectionId: topic ?? "" })}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Answer type</span>
              <select
                className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-sm"
                value={data.answerMode}
                onChange={(event) => setMode(event.target.value as SaveAdaptivePracticeQuestionInputI["answerMode"])}
              >
                <option value="single_choice">Single choice</option>
                <option value="multiple_choice">Multiple choice</option>
              </select>
            </label>
          </div>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">Question</span>
            <textarea
              className="min-h-20 w-full rounded-md border border-gray-200 p-2 text-sm"
              maxLength={10000}
              value={data.prompt}
              onChange={(event) => update({ prompt: event.target.value })}
            />
          </label>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Options <span className="font-normal text-muted-foreground">(mark the correct answer)</span>
            </p>
            {data.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type={data.answerMode === "single_choice" ? "radio" : "checkbox"}
                  name="correct-option"
                  aria-label={`Option ${index + 1} is correct`}
                  checked={option.isCorrect}
                  onChange={(event) => setOption(index, { isCorrect: event.target.checked })}
                />
                <input
                  className="h-8 flex-1 rounded-md border border-gray-200 px-2 text-sm"
                  maxLength={2000}
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(event) => setOption(index, { text: event.target.value })}
                />
                {data.options.length > 2 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    aria-label="Remove option"
                    onClick={() =>
                      setData((current) => ({
                        ...current,
                        options: current.options.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            ))}
            {data.options.length < 8 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7"
                onClick={() =>
                  setData((current) => ({
                    ...current,
                    options: [...current.options, { text: "", isCorrect: false }],
                  }))
                }
              >
                <Plus className="size-3.5" /> Add option
              </Button>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Explanation shown after answering</span>
              {aiAvailable && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7"
                  disabled={draft.isPending || !data.prompt.trim() || filledOptions < 2}
                  onClick={() => void draftExplanation()}
                >
                  <Sparkles className="size-3.5" /> {draft.isPending ? "Drafting…" : "Draft with AI"}
                </Button>
              )}
            </div>
            <textarea
              className="min-h-20 w-full rounded-md border border-gray-200 p-2 text-sm"
              maxLength={4000}
              value={data.explanation ?? ""}
              placeholder="Why is the correct answer right?"
              onChange={(event) => update({ explanation: event.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.isActive}
              onChange={(event) => update({ isActive: event.target.checked })}
            />
            Offer this question to students
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={save.isPending} onClick={() => void submit()}>
            {save.isPending ? "Saving…" : "Save question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
