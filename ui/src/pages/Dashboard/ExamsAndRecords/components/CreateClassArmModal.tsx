import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { CreateClassArmSchema } from "@/schema/examsRecords.schema"
import { useCreateSchoolArm } from "@/hooks/examAndRecords"
import { useSchoolId } from "@/contexts/SchoolContext"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"

interface CreateClassArmModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function CreateClassArmModal({
  open,
  onClose,
  onSuccess,
}: CreateClassArmModalProps) {
  const schoolId = useSchoolId()

  const { createSchoolArmAsync, isPending } = useCreateSchoolArm({
    onSuccess: () => {
      form.reset()
      clearDraft()
      onSuccess?.()
      onClose()
    },
  })

  const form = useForm<CreateClassArmSchema>({
    resolver: zodResolver(CreateClassArmSchema),
    defaultValues: { name: "", description: "" },
  })

  const watchedAll = useWatch({ control: form.control })

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<CreateClassArmSchema>({
    formKey: "exams-class-arm-create",
    values: watchedAll as CreateClassArmSchema,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    form.reset(draftValues)
    acknowledgeDraft()
  }

  const onSubmit = async (data: CreateClassArmSchema) => {
    await createSchoolArmAsync({
      schoolId,
      armName: data.name,
      description: data.description ?? "",
    })
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Class Arm</DialogTitle>
          <DialogDescription>Add a new class arm to your school</DialogDescription>
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
                  Arm Name
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="e.g., Arm A"
                  className="border-chart-2 py-6"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Description (Optional)</FieldLabel>
                <Input
                  {...field}
                  placeholder="Brief description of the arm"
                  className="border-chart-2 py-6"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="flex gap-4 pt-4">
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
              {isPending ? "Creating..." : "Create Arm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
