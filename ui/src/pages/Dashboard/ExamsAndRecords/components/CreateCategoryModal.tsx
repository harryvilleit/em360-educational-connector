import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { z } from "zod"
import { useCreateCategory } from "@/hooks/examAndRecords"
import { useSchoolId } from "@/contexts/SchoolContext"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"

const CreateCategoriesFormSchema = z.object({
  categories: z
    .array(z.object({ catName: z.string().min(2, "Category name is required") }))
    .min(1),
})

type CreateCategoriesFormSchema = z.infer<typeof CreateCategoriesFormSchema>

interface CreateCategoryModalProps {
  open: boolean
  onClose: () => void
}

export default function CreateCategoryModal({
  open,
  onClose,
}: CreateCategoryModalProps) {
  const { productId } = useParams<{ productId: string }>()
  const schoolId = useSchoolId()

  const { createCategoryAsync, isPending } = useCreateCategory({
    onSuccess: () => {},
  })

  const form = useForm<CreateCategoriesFormSchema>({
    resolver: zodResolver(CreateCategoriesFormSchema),
    defaultValues: { categories: [{ catName: "" }] },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "categories",
  })

  const watchedAll = useWatch({ control: form.control })

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<CreateCategoriesFormSchema>({
    formKey: "exams-category-create",
    values: watchedAll as CreateCategoriesFormSchema,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    form.reset(draftValues)
    acknowledgeDraft()
  }

  const onSubmit = async (data: CreateCategoriesFormSchema) => {
    await Promise.all(
      data.categories.map((cat) =>
        createCategoryAsync({
          schoolId: schoolId,
          catName: cat.catName,
        })
      )
    )
    form.reset()
    clearDraft()
    onClose()
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Categories</DialogTitle>
          <DialogDescription>
            Add one or more categories or departments
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
              <div className="flex-1">
                <Controller
                  name={`categories.${index}.catName`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      {index === 0 && (
                        <FieldLabel>
                          Category Name{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                      )}
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
              onClick={() => append({ catName: "" })}
            >
              <Plus className="h-4 w-4" />
              Add Another Category
            </Button>
          </div>

          <DialogFooter className="mt-6 flex gap-4 sm:space-x-0">
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
              {isPending
                ? "Creating..."
                : fields.length > 1
                  ? `Create ${fields.length} Categories`
                  : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
