import { type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUpsertLearnerSupportAdjustment } from "@/hooks/learnerSupport"
import type {
  LearnerSupportAdjustmentCategory,
  LearnerSupportAdjustmentScope,
  LearnerSupportCaseDetailI,
} from "@/api/learnerSupport.api"
import { EmptySupport, FormField } from "./components"
import { formatDate, inputClass, labelFromCode, textareaClass, today } from "./utils"

export default function AdjustmentsPanel({
  item,
  schoolId,
}: {
  item: LearnerSupportCaseDetailI
  schoolId: string
}) {
  const mutation = useUpsertLearnerSupportAdjustment()
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    mutation.mutate(
      {
        schoolId,
        caseId: item.id,
        category: data.get("category") as LearnerSupportAdjustmentCategory,
        scope: data.get("scope") as LearnerSupportAdjustmentScope,
        title: String(data.get("title")),
        description: String(data.get("description")),
        extraTimeMinutes: Number(data.get("extraTimeMinutes")) || undefined,
        allowRestBreaks: data.get("allowRestBreaks") === "on",
        allowVoiceResponse: data.get("allowVoiceResponse") === "on",
        requireCaptions: data.get("requireCaptions") === "on",
        isActive: true,
        effectiveFrom: String(data.get("effectiveFrom")),
        effectiveTo: String(data.get("effectiveTo") || "") || undefined,
      },
      { onSuccess: () => form.reset() }
    )
  }
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Add reasonable adjustment</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Category">
                <select name="category" className={inputClass}>
                  {(
                    [
                      "Teaching",
                      "Assessment",
                      "Communication",
                      "Environment",
                      "Timetable",
                      "ELearning",
                      "LiveClass",
                      "Other",
                    ] as LearnerSupportAdjustmentCategory[]
                  ).map((v) => (
                    <option key={v}>{labelFromCode(v)}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Applies to">
                <select name="scope" className={inputClass}>
                  {(
                    [
                      "Classroom",
                      "Assessment",
                      "ELearning",
                      "LiveClass",
                      "Timetable",
                      "AllLearning",
                    ] as LearnerSupportAdjustmentScope[]
                  ).map((v) => (
                    <option key={v}>{labelFromCode(v)}</option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="Title">
              <input name="title" required className={inputClass} />
            </FormField>
            <FormField label="Instructions for staff">
              <textarea name="description" required className={textareaClass} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Extra time (minutes)">
                <input
                  name="extraTimeMinutes"
                  type="number"
                  min="0"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Effective from">
                <input
                  name="effectiveFrom"
                  type="date"
                  defaultValue={today()}
                  required
                  className={inputClass}
                />
              </FormField>
              <FormField label="Effective to">
                <input name="effectiveTo" type="date" className={inputClass} />
              </FormField>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label>
                <input name="allowRestBreaks" type="checkbox" /> Rest breaks
              </label>
              <label>
                <input name="allowVoiceResponse" type="checkbox" /> Voice
                responses
              </label>
              <label>
                <input name="requireCaptions" type="checkbox" /> Captions
              </label>
            </div>
            <div>
              <Button
                type="submit"
                variant="primary"
                disabled={mutation.isPending}
              >
                Save adjustment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {!item.adjustments.length ? (
          <EmptySupport>No adjustments recorded.</EmptySupport>
        ) : (
          item.adjustments.map((value) => (
            <Card key={value.id}>
              <CardContent>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{value.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {labelFromCode(value.category)} ·{" "}
                      {labelFromCode(value.scope)} · from{" "}
                      {formatDate(value.effectiveFrom)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${value.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100"}`}
                  >
                    {value.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-3 text-sm">{value.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {value.extraTimeMinutes ? (
                    <span>{value.extraTimeMinutes} min extra time</span>
                  ) : null}
                  {value.allowRestBreaks && <span>Rest breaks</span>}
                  {value.allowVoiceResponse && <span>Voice response</span>}
                  {value.requireCaptions && <span>Captions</span>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
