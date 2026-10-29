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
import type { DepartmentItem } from "@/api/examAndRecords.api/types"
import { EditDepartmentSchema } from "@/schema/examsRecords.schema"
import { useUpdateDepartment } from "@/hooks/examAndRecords"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"

interface EditDepartmentModalProps {
  open: boolean
  onClose: () => void
  department: DepartmentItem | null
}

export default function EditDepartmentModal({
  open,
  onClose,
  department,
}: EditDepartmentModalProps) {
  const { updateDepartmentAsync, isPending } = useUpdateDepartment({
    onSuccess: () => {
      form.reset()
      clearDraft()
      onClose()
    },
  })

  const form = useForm<EditDepartmentSchema>({
    resolver: zodResolver(EditDepartmentSchema),
    values: {
      name: department?.Name ?? "",
      description: department?.Description ?? "",
    },
  })

  const watchedAll = useWatch({ control: form.control })

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<EditDepartmentSchema>({
    formKey: `exams-department-edit-${department?.Id ?? ""}`,
    values: watchedAll as EditDepartmentSchema,
    enabled: open && !!department,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    form.reset(draftValues)
    acknowledgeDraft()
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>
            Update the details for this department.
          </DialogDescription>
        </DialogHeader>

        {hasDraft && draftSavedAt && (
          <FormDraftBanner
            savedAt={draftSavedAt}
            onRestore={handleRestoreDraft}
            onDiscard={discardDraft}
          />
        )}

        <form
          onSubmit={form.handleSubmit((data) => {
            if (!department) return
            updateDepartmentAsync({
              id: department.Id,
              name: data.name,
              description: data.description ?? "",
              status: department.Status,
            })
          })}
          className="space-y-5 py-4"
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Department Name
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="e.g., Science Department"
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
            render={({ field }) => (
              <Field>
                <FieldLabel>Description (Optional)</FieldLabel>
                <Input
                  {...field}
                  placeholder="Brief description of the department"
                  className="border-chart-2 py-6"
                />
              </Field>
            )}
          />

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
