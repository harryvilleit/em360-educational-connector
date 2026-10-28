import { type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUpdateLearnerSupportPassport } from "@/hooks/learnerSupport"
import type { LearnerSupportCaseDetailI } from "@/api/learnerSupport.api"
import { FormField } from "./components"
import { textareaClass } from "./utils"

export default function PassportPanel({
  item,
  schoolId,
}: {
  item: LearnerSupportCaseDetailI
  schoolId: string
}) {
  const mutation = useUpdateLearnerSupportPassport()
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    mutation.mutate({
      schoolId,
      caseId: item.id,
      supportSummary: String(data.get("supportSummary") || ""),
      communicationPreferences: String(
        data.get("communicationPreferences") || ""
      ),
      triggers: String(data.get("triggers") || ""),
      effectiveStrategies: String(data.get("effectiveStrategies") || ""),
      learnerVoice: String(data.get("learnerVoice") || ""),
      parentVoice: String(data.get("parentVoice") || ""),
    })
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learner passport</CardTitle>
        <p className="text-sm text-muted-foreground">
          The concise, practical view staff use to support the learner day to
          day.
        </p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit}>
          <FormField label="Support summary">
            <textarea
              name="supportSummary"
              className={textareaClass}
              defaultValue={item.supportSummary}
              placeholder="What staff need to know at a glance"
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Communication preferences">
              <textarea
                name="communicationPreferences"
                className={textareaClass}
                defaultValue={item.communicationPreferences}
              />
            </FormField>
            <FormField label="Known triggers or barriers">
              <textarea
                name="triggers"
                className={textareaClass}
                defaultValue={item.triggers}
              />
            </FormField>
            <FormField label="Effective strategies">
              <textarea
                name="effectiveStrategies"
                className={textareaClass}
                defaultValue={item.effectiveStrategies}
              />
            </FormField>
            <FormField label="Learner voice">
              <textarea
                name="learnerVoice"
                className={textareaClass}
                defaultValue={item.learnerVoice}
              />
            </FormField>
          </div>
          <FormField label="Parent or guardian voice">
            <textarea
              name="parentVoice"
              className={textareaClass}
              defaultValue={item.parentVoice}
            />
          </FormField>
          <div>
            <Button
              type="submit"
              variant="primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving…" : "Save passport"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
