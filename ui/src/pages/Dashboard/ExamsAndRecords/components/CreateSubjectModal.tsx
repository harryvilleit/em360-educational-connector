import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import CoursePublicFields from "./CoursePublicFields"
import { schoolHtmlText } from "@/lib/school-public-content"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Loader2, Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { CreateSubjectsSchema } from "@/schema/examsRecords.schema"
import { useBulkCreateSubjects } from "@/hooks/examAndRecords"
import { useSchoolId } from "@/contexts/SchoolContext"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"

interface CreateSubjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateSubjectModal({
  open,
  onOpenChange,
}: CreateSubjectModalProps) {
  const schoolId = useSchoolId()

  const { bulkCreateSubjectsAsync, isPending } = useBulkCreateSubjects({
    onSuccess: () => {
      form.reset()
      clearDraft()
      onOpenChange(false)
    },
  })

  const form = useForm<CreateSubjectsSchema>({
    resolver: zodResolver(CreateSubjectsSchema),
    defaultValues: {
      subjects: [{ name: "", code: "", description: "", isPublic: false }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subjects",
  })

  const watchedAll = useWatch({ control: form.control })

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<CreateSubjectsSchema>({
    formKey: "exams-subject-create",
    values: watchedAll as CreateSubjectsSchema,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    form.reset(draftValues)
    acknowledgeDraft()
  }

  const onSubmit = async (data: CreateSubjectsSchema) => {
    if (
      data.subjects.some((s) => s.isPublic && !schoolHtmlText(s.description))
    ) {
      toast.error("Add a description for each public course.")
      return
    }
    try {
      await bulkCreateSubjectsAsync({
        schoolId: schoolId,
        subjects: data.subjects.map((s) => ({
          name: s.name,
          description: s.description ?? "",
          isPublic: s.isPublic ?? false,
        })),
      })
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save the course. Please try again."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create subjects & courses</DialogTitle>
          <DialogDescription>
            Add one or more subjects or courses
          </DialogDescription>
        </DialogHeader>

        {hasDraft && draftSavedAt && (
          <FormDraftBanner
            savedAt={draftSavedAt}
            onRestore={handleRestoreDraft}
            onDiscard={discardDraft}
          />
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="min-w-0 flex-1 space-y-5">
                <Controller
                  name={`subjects.${index}.name`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      {index === 0 && (
                        <FieldLabel>
                          Subject Name{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                      )}
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
                  description={watchedAll.subjects?.[index]?.description ?? ""}
                  isPublic={watchedAll.subjects?.[index]?.isPublic ?? false}
                  onDescriptionChange={(value) =>
                    form.setValue(`subjects.${index}.description`, value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  onVisibilityChange={(value) =>
                    form.setValue(`subjects.${index}.isPublic`, value, {
                      shouldDirty: true,
                    })
                  }
                  disabled={isPending}
                />
                {form.formState.errors.subjects?.[index]?.description && (
                  <p role="alert" className="text-sm text-red-600">
                    {
                      form.formState.errors.subjects[index]?.description
                        ?.message
                    }
                  </p>
                )}
              </div>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 shrink-0 p-0 text-red-500 hover:text-red-600 ${index === 0 ? "mt-8" : "mt-1"}`}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <div className="flex justify-end px-2 py-2">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-dashed border-chart-2 text-chart-2 hover:bg-white hover:text-chart-2 hover:shadow-sm"
              onClick={() =>
                append({ name: "", code: "", description: "", isPublic: false })
              }
            >
              <Plus className="h-4 w-4" />
              Add Another Subject
            </Button>
          </div>

          <DialogFooter className="mt-6 flex gap-4 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              className="flex-1 cursor-pointer py-6"
              onClick={() => {
                form.reset()
                onOpenChange(false)
              }}
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
              {isPending
                ? "Creating..."
                : fields.length > 1
                  ? `Create ${fields.length} Subjects`
                  : "Create Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
