import { useEffect } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "react-router"
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
import { z } from "zod"
import type { CategoryItem } from "@/api/examAndRecords.api/types"
import { useUpdateCategory } from "@/hooks/examAndRecords"
import { useSchoolId } from "@/contexts/SchoolContext"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"

const EditCategorySchema = z.object({
  catName: z.string().min(2, "Category name is required"),
})

type EditCategorySchema = z.infer<typeof EditCategorySchema>

interface EditCategoryModalProps {
  open: boolean
  onClose: () => void
  category: CategoryItem | null
}

export default function EditCategoryModal({
  open,
  onClose,
  category,
}: EditCategoryModalProps) {
  const { productId } = useParams<{ productId: string }>()
  const schoolId = useSchoolId()

  const { updateCategoryAsync, isPending } = useUpdateCategory({
    onSuccess: () => onClose(),
  })

  const form = useForm<EditCategorySchema>({
    resolver: zodResolver(EditCategorySchema),
    defaultValues: { catName: "" },
  })

  useEffect(() => {
    if (category) {
      form.reset({ catName: category.CatName })
    }
  }, [category, form])

  const watchedAll = useWatch({ control: form.control })

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<EditCategorySchema>({
    formKey: `exams-category-edit-${category?.Id ?? ""}`,
    values: watchedAll as EditCategorySchema,
    enabled: open && !!category,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    form.reset(draftValues)
    acknowledgeDraft()
  }

  const onSubmit = async (data: EditCategorySchema) => {
    if (!category) return
    await updateCategoryAsync({
      id: category.Id,
      schoolId: schoolId,
      catName: data.catName,
    })
    clearDraft()
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>Update the name of this category.</DialogDescription>
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
            name="catName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Category Name
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="e.g., Junior Secondary"
                  className="border-chart-2 py-6"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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
