import { type FormEvent } from "react"
import { FileText, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUploadLearnerSupportDocument } from "@/hooks/learnerSupport"
import type {
  LearnerSupportCaseDetailI,
  LearnerSupportDocumentCategory,
} from "@/api/learnerSupport.api"
import { EmptySupport, FormField } from "./components"
import { formatDate, inputClass, labelFromCode } from "./utils"

export default function DocumentsPanel({
  item,
  schoolId,
}: {
  item: LearnerSupportCaseDetailI
  schoolId: string
}) {
  const mutation = useUploadLearnerSupportDocument()
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const file = data.get("file")
    if (!(file instanceof File) || !file.size) return
    mutation.mutate(
      {
        schoolId,
        caseId: item.id,
        category: data.get("category") as LearnerSupportDocumentCategory,
        title: String(data.get("title")),
        isVisibleToFamily: data.get("isVisibleToFamily") === "on",
        file,
      },
      { onSuccess: () => form.reset() }
    )
  }
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Upload evidence</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
            <FormField label="Category">
              <select name="category" className={inputClass}>
                {(
                  [
                    "ReferralEvidence",
                    "Assessment",
                    "SupportPlan",
                    "ReviewEvidence",
                    "ProfessionalReport",
                    "LearnerVoice",
                    "ParentContribution",
                    "Other",
                  ] as LearnerSupportDocumentCategory[]
                ).map((v) => (
                  <option key={v} value={v}>
                    {labelFromCode(v)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Document title">
              <input name="title" required className={inputClass} />
            </FormField>
            <FormField label="File">
              <input
                name="file"
                required
                type="file"
                className={`${inputClass} py-2`}
              />
            </FormField>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input name="isVisibleToFamily" type="checkbox" /> Visible to
                learner/family
              </label>
              <Button
                type="submit"
                variant="primary"
                disabled={mutation.isPending}
              >
                <Upload className="size-4" /> Upload
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {!item.documents.length ? (
        <EmptySupport>No evidence documents uploaded.</EmptySupport>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {item.documents.map((document) => (
            <a
              key={document.id}
              href={document.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl border p-4 hover:bg-gray-50"
            >
              <FileText className="size-5 text-blue-700" />
              <div>
                <p className="font-medium">{document.title}</p>
                <p className="text-xs text-muted-foreground">
                  {labelFromCode(document.category)} · v{document.version} ·{" "}
                  {formatDate(document.dateCreated)}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
