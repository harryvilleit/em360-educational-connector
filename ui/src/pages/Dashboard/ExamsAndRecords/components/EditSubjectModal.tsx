import { useEffect } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import CoursePublicFields from "./CoursePublicFields"
import { schoolHtmlText } from "@/lib/school-public-content"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { EditSubjectSchema } from "@/schema/examsRecords.schema"
import type { SubjectItem } from "@/api/examAndRecords.api/types"
import { useUpdateSubject } from "@/hooks/examAndRecords"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"

interface EditSubjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: SubjectItem | null
}

export default function EditSubjectModal({
  open,
  onOpenChange,
  subject,
}: EditSubjectModalProps) {
  const { updateSubjectAsync, isPending } = useUpdateSubject({
    onSuccess: () => onOpenChange(false),
  })

  const form = useForm<EditSubjectSchema>({
    resolver: zodResolver(EditSubjectSchema),
    defaultValues: { name: "" },
  })

  useEffect(() => {
    if (subject) {
      form.reset({
        name: subject.Name,
        description: subject.Description ?? "",
        isPublic: subject.IsPublic ?? false,
      })
    }
  }, [subject, form])

  const watchedAll = useWatch({ control: form.control })

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<EditSubjectSchema>({
    formKey: `exams-subject-edit-${subject?.Id ?? ""}`,
    values: watchedAll as EditSubjectSchema,
    enabled: open && !!subject,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    form.reset(draftValues)
    acknowledgeDraft()
  }

  const onSubmit = async (data: EditSubjectSchema) => {
    if (!subject) return
    if (data.isPublic && !schoolHtmlText(data.description)) {
      toast.error("Add a description before showing this course publicly.")
      return
    }
    try {
      await updateSubjectAsync({
        id: subject.Id,
        name: data.name,
        description: data.description ?? "",
        isPublic: data.isPublic ?? false,
      })
      clearDraft()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save the course. Please try again."
      )
    }
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Course details</DialogTitle>
          <DialogDescription>
            Describe your course and choose how it appears publicly.
          </DialogDescription>
        </DialogHeader>

        {hasDraft && draftSavedAt && (
          <FormDraftBanner
            savedAt={draftSavedAt}
            onRestore={handleRestoreDraft}
            onDiscard={discardDraft}
          />
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Subject Name
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="e.g., Mathematics"
                  className="border-chart-2 py-6"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <CoursePublicFields
            description={watchedAll.description ?? ""}
            isPublic={watchedAll.isPublic ?? false}
            onDescriptionChange={(value) =>
              form.setValue("description", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            onVisibilityChange={(value) =>
              form.setValue("isPublic", value, { shouldDirty: true })
            }
            disabled={isPending}
          />
          {form.formState.errors.description && (
            <p role="alert" className="text-sm text-red-600">
              {form.formState.errors.description.message}
            </p>
          )}
          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 cursor-pointer py-6"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 cursor-pointer bg-chart-2 py-6 text-white disabled:opacity-60"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
