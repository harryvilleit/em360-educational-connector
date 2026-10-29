import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight, MessageSquareText, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { dashboardCardSurface } from "@/components/general/StatCard"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils"
import {
  useAdaptiveQuestionTopics,
  useDraftAdaptiveExplanations,
  useSaveAdaptiveExplanations,
  useSetAdaptiveQuestionTopics,
  useSuggestAdaptiveQuestionTopics,
} from "@/hooks/elearning/useAdaptiveLearning"
import type {
  AdaptiveCourseRefI,
  AdaptiveQuestionTaggingI,
  AdaptiveTaggingQuestionI,
  AdaptiveTopicSuggestionI,
} from "@/api/adaptiveLearning.api"

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

export default function AdaptiveQuestionTagger({ courseRef }: { courseRef: AdaptiveCourseRefI }) {
  const { tagging, isLoading, isError } = useAdaptiveQuestionTopics(courseRef)
  const saveTags = useSetAdaptiveQuestionTopics(courseRef)
  const suggest = useSuggestAdaptiveQuestionTopics(courseRef)
  const draftExplanations = useDraftAdaptiveExplanations(courseRef)
  const saveExplanations = useSaveAdaptiveExplanations(courseRef)

  const [draft, setDraft] = useState<Record<string, string | null>>({})
  const [suggestions, setSuggestions] = useState<Record<string, AdaptiveTopicSuggestionI>>({})
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const [explanationEdits, setExplanationEdits] = useState<Record<string, string>>({})

  const original = useMemo(() => buildOriginal(tagging), [tagging])
  const changes = Object.entries(draft).filter(
    ([questionId, topic]) => (original[questionId] ?? null) !== topic
  )

  const valueFor = (questionId: string) =>
    questionId in draft ? draft[questionId] : (original[questionId] ?? null)

  const setTopic = (questionId: string, topic: string | null) =>
    setDraft((current) => ({ ...current, [questionId]: topic }))

  const toggle = (assignmentId: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(assignmentId)) next.delete(assignmentId)
      else next.add(assignmentId)
      return next
    })

  const save = async () => {
    try {
      const result = await saveTags.mutateAsync(
        changes.map(([questionId, topicSectionId]) => ({ questionId, topicSectionId }))
      )
      setDraft({})
      setSuggestions({})
      toast.success(result.message || "Topics saved")
    } catch (err) {
      toast.error(errorMessage(err, "Could not save topics"))
    }
  }

  const runSuggest = async () => {
    if (!tagging) return
    try {
      const res = await suggest.mutateAsync([])
      const usable = res.value.suggestions.filter((s) => s.topicSectionId)
      if (usable.length === 0) {
        toast.info(res.message || "No confident suggestions. Tag these questions manually.")
        return
      }
      setSuggestions((current) => ({
        ...current,
        ...Object.fromEntries(usable.map((s) => [s.questionId, s])),
      }))
      setDraft((current) => {
        const next = { ...current }
        usable.forEach((s) => {
          if (!valueFor(s.questionId)) next[s.questionId] = s.topicSectionId ?? null
        })
        return next
      })
      const assignmentsWithSuggestions = tagging.assignments
        .filter((a) => a.questions.some((q) => usable.some((s) => s.questionId === q.questionId)))
        .map((a) => a.assignmentId)
      setExpanded((current) => new Set([...current, ...assignmentsWithSuggestions]))
      toast.success(`${usable.length} topic suggestion${usable.length === 1 ? "" : "s"} added. Review, then save.`)
    } catch (err) {
      toast.error(errorMessage(err, "Could not get suggestions"))
    }
  }

  const draftMissing = async (questions: AdaptiveTaggingQuestionI[]) => {
    const missing = questions
      .filter((q) => q.isObjective && !q.practiceExplanation && !(q.questionId in explanationEdits))
      .slice(0, 20)
    if (missing.length === 0) {
      toast.info("Every objective question here already has an explanation.")
      return
    }
    try {
      const res = await draftExplanations.mutateAsync(missing.map((q) => ({ questionId: q.questionId })))
      setExplanationEdits((current) => ({
        ...current,
        ...Object.fromEntries(res.value.drafts.map((d) => [d.key, d.explanation])),
      }))
      toast.success(`${res.value.drafts.length} draft explanation${res.value.drafts.length === 1 ? "" : "s"} ready to review.`)
    } catch (err) {
      toast.error(errorMessage(err, "Could not draft explanations"))
    }
  }

  const saveExplanation = async (questionId: string, explanation: string | null) => {
    try {
      await saveExplanations.mutateAsync([{ questionId, explanation }])
      setExplanationEdits((current) => {
        const next = { ...current }
        delete next[questionId]
        return next
      })
      toast.success(explanation ? "Explanation saved" : "Explanation removed")
    } catch (err) {
      toast.error(errorMessage(err, "Could not save the explanation"))
    }
  }

  const draftOne = async (questionId: string) => {
    try {
      const res = await draftExplanations.mutateAsync([{ questionId }])
      const text = res.value.drafts[0]?.explanation
      if (!text) {
        toast.info("The AI could not draft an explanation for this question.")
        return
      }
      setExplanationEdits((current) => ({ ...current, [questionId]: text }))
    } catch (err) {
      toast.error(errorMessage(err, "Could not draft an explanation"))
    }
  }

  return (
    <div className={dashboardCardSurface}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h3 className="font-semibold">Link questions to topics</h3>
          <p className="text-xs text-muted-foreground">
            Pick the curriculum section each question assesses. Objective questions from closed
            assignments also become practice for students who need that topic.
          </p>
        </div>
        <div className="flex gap-2">
          {tagging?.aiAvailable && (tagging.untaggedQuestionCount ?? 0) > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-md"
              disabled={suggest.isPending}
              onClick={() => void runSuggest()}
            >
              <Sparkles className="size-3.5" />
              {suggest.isPending ? "Suggesting…" : "Suggest topics"}
            </Button>
          )}
          <Button
            size="sm"
            className="h-8 rounded-md"
            disabled={changes.length === 0 || saveTags.isPending}
            onClick={() => void save()}
          >
            {saveTags.isPending
              ? "Saving…"
              : `Save ${changes.length || ""} change${changes.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      </div>

      {isLoading && <p className="px-5 py-8 text-center text-sm text-muted-foreground">Loading questions…</p>}
      {isError && <p className="px-5 py-8 text-center text-sm text-rose-600">Could not load questions.</p>}
      {tagging && tagging.topics.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          Add curriculum sections first. Each section is a topic you can tag questions with.
        </p>
      )}
      {tagging && tagging.topics.length > 0 && tagging.assignments.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">No assignments yet.</p>
      )}

      {tagging && tagging.topics.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {tagging.assignments.map((assignment) => {
            const isOpen = expanded.has(assignment.assignmentId)
            const tagged = assignment.questions.filter((q) => valueFor(q.questionId)).length
            const objective = assignment.questions.filter((q) => q.isObjective)
            const explained = objective.filter((q) => q.practiceExplanation).length
            return (
              <li key={assignment.assignmentId}>
                <button
                  type="button"
                  onClick={() => toggle(assignment.assignmentId)}
                  className="flex w-full items-center gap-2 px-5 py-3 text-left hover:bg-gray-50"
                >
                  {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  <span className="flex-1 text-sm font-medium">{assignment.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {tagged}/{assignment.questions.length} tagged
                    {objective.length > 0 && ` · ${explained}/${objective.length} explained`} · due{" "}
                    {formatDate(assignment.dueDateUtc, "short")}
                  </span>
                </button>
                {isOpen && (
                  <div className="space-y-2 bg-gray-50/60 px-5 pb-4">
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1 text-xs">
                      {tagging.aiAvailable && objective.length > explained && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7"
                          disabled={draftExplanations.isPending}
                          onClick={() => void draftMissing(assignment.questions)}
                        >
                          <Sparkles className="size-3.5" /> Draft missing explanations
                        </Button>
                      )}
                      <span className="text-muted-foreground">Set all to</span>
                      <TopicSelect
                        topics={tagging.topics}
                        value={null}
                        placeholder="Choose topic…"
                        onChange={(topic) =>
                          assignment.questions.forEach((q) => setTopic(q.questionId, topic))
                        }
                      />
                    </div>
                    {assignment.questions.map((question) => {
                      const suggestion = suggestions[question.questionId]
                      const showsSuggestion =
                        suggestion?.topicSectionId &&
                        valueFor(question.questionId) === suggestion.topicSectionId &&
                        original[question.questionId] !== suggestion.topicSectionId
                      return (
                        <div
                          key={question.questionId}
                          className="space-y-2 rounded-lg border border-gray-100 bg-white p-3"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] text-muted-foreground">
                                Q{question.sortOrder} · {question.answerMode.replace(/_/g, " ")}
                              </p>
                              <p className="line-clamp-2 whitespace-pre-line text-sm">{question.prompt}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {showsSuggestion && (
                                <span
                                  className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700"
                                  title={suggestion.reason}
                                >
                                  AI · {Math.round(suggestion.confidence * 100)}%
                                </span>
                              )}
                              <TopicSelect
                                topics={tagging.topics}
                                value={valueFor(question.questionId)}
                                placeholder="No topic"
                                onChange={(topic) => setTopic(question.questionId, topic)}
                              />
                            </div>
                          </div>
                          {question.isObjective && (
                            <ExplanationRow
                              question={question}
                              editing={explanationEdits[question.questionId]}
                              aiAvailable={tagging.aiAvailable}
                              isDrafting={draftExplanations.isPending}
                              isSaving={saveExplanations.isPending}
                              onEdit={(text) =>
                                setExplanationEdits((current) => ({ ...current, [question.questionId]: text }))
                              }
                              onCancel={() =>
                                setExplanationEdits((current) => {
                                  const next = { ...current }
                                  delete next[question.questionId]
                                  return next
                                })
                              }
                              onDraft={() => void draftOne(question.questionId)}
                              onSave={(text) => void saveExplanation(question.questionId, text)}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function ExplanationRow({
  question,
  editing,
  aiAvailable,
  isDrafting,
  isSaving,
  onEdit,
  onCancel,
  onDraft,
  onSave,
}: {
  question: AdaptiveTaggingQuestionI
  editing?: string
  aiAvailable: boolean
  isDrafting: boolean
  isSaving: boolean
  onEdit: (text: string) => void
  onCancel: () => void
  onDraft: () => void
  onSave: (text: string | null) => void
}) {
  if (editing === undefined) {
    return (
      <div className="flex items-start gap-2 border-t border-dashed border-gray-100 pt-2 text-xs">
        <MessageSquareText className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <p className={cn("flex-1", question.practiceExplanation ? "text-slate-700" : "text-muted-foreground")}>
          {question.practiceExplanation ||
            (question.hasReferenceAnswer
              ? "No practice explanation. Students see your reference answer after practising."
              : "No explanation. Students only see which option was correct.")}
        </p>
        <button
          type="button"
          className="font-medium text-blue-700 hover:underline"
          onClick={() => onEdit(question.practiceExplanation ?? "")}
        >
          {question.practiceExplanation ? "Edit" : "Add"}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2 border-t border-dashed border-gray-100 pt-2">
      <textarea
        className="min-h-20 w-full rounded-md border border-gray-200 p-2 text-sm"
        maxLength={4000}
        value={editing}
        placeholder="Explain why the correct answer is right, in a sentence or two."
        onChange={(event) => onEdit(event.target.value)}
      />
      <div className="flex flex-wrap justify-end gap-2">
        {aiAvailable && (
          <Button size="sm" variant="ghost" className="h-7" disabled={isDrafting} onClick={onDraft}>
            <Sparkles className="size-3.5" /> {isDrafting ? "Drafting…" : "Draft with AI"}
          </Button>
        )}
        <Button size="sm" variant="ghost" className="h-7" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          className="h-7"
          disabled={isSaving}
          onClick={() => onSave(editing.trim() ? editing.trim() : null)}
        >
          Save explanation
        </Button>
      </div>
    </div>
  )
}

export function TopicSelect({
  topics,
  value,
  placeholder,
  onChange,
  className,
}: {
  topics: AdaptiveQuestionTaggingI["topics"]
  value: string | null
  placeholder: string
  onChange: (topic: string | null) => void
  className?: string
}) {
  return (
    <select
      className={cn("h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-sm sm:w-56", className)}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value || null)}
    >
      <option value="">{placeholder}</option>
      {topics.map((topic) => (
        <option key={topic.id} value={topic.id}>
          {topic.title}
        </option>
      ))}
    </select>
  )
}

function buildOriginal(tagging?: AdaptiveQuestionTaggingI) {
  const map: Record<string, string | null> = {}
  tagging?.assignments.forEach((assignment) =>
    assignment.questions.forEach((question) => {
      map[question.questionId] = question.topicSectionId ?? null
    })
  )
  return map
}
