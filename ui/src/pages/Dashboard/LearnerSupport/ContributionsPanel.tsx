import { type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAddLearnerSupportContribution } from "@/hooks/learnerSupport"
import type {
  LearnerSupportCaseDetailI,
  LearnerSupportContributionType,
} from "@/api/learnerSupport.api"
import { EmptySupport, FormField } from "./components"
import { formatDate, inputClass, labelFromCode, textareaClass } from "./utils"

export default function ContributionsPanel({
  item,
  schoolId,
}: {
  item: LearnerSupportCaseDetailI
  schoolId: string
}) {
  const mutation = useAddLearnerSupportContribution()
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    mutation.mutate(
      {
        schoolId,
        caseId: item.id,
        contributorType: data.get(
          "contributorType"
        ) as LearnerSupportContributionType,
        contributorName: String(data.get("contributorName") || "") || undefined,
        content: String(data.get("content")),
        isSharedWithFamily: data.get("isSharedWithFamily") === "on",
      },
      { onSuccess: () => form.reset() }
    )
  }
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Add contribution</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            <FormField label="Contributor">
              <select name="contributorType" className={inputClass}>
                {(
                  [
                    "Learner",
                    "ParentOrGuardian",
                    "Teacher",
                    "SupportStaff",
                    "ExternalProfessional",
                    "CaseManager",
                  ] as LearnerSupportContributionType[]
                ).map((v) => (
                  <option key={v} value={v}>
                    {labelFromCode(v)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Contributor name">
              <input name="contributorName" className={inputClass} />
            </FormField>
            <FormField label="Contribution">
              <textarea name="content" required className={textareaClass} />
            </FormField>
            <label className="flex items-center gap-2 text-sm">
              <input name="isSharedWithFamily" type="checkbox" defaultChecked />{" "}
              Share in family-safe view
            </label>
            <div>
              <Button
                type="submit"
                variant="primary"
                disabled={mutation.isPending}
              >
                Add contribution
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {!item.contributions.length ? (
          <EmptySupport>No contributions recorded.</EmptySupport>
        ) : (
          item.contributions.map((entry) => (
            <Card key={entry.id}>
              <CardContent>
                <p>{entry.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {labelFromCode(entry.contributorType)} ·{" "}
                  {entry.contributorName || "Recorded user"} ·{" "}
                  {formatDate(entry.dateCreated)}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
