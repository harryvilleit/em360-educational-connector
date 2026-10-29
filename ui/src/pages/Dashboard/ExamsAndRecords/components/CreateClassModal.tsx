import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useCreateClass, useGetAllCategories, useGetAllSchoolArms } from "@/hooks/examAndRecords"
import { useSchoolId } from "@/contexts/SchoolContext"
import { CLASS_TYPE } from "@/utils/classType.utils"
import { CreateClassFormSchema } from "@/schema/examsRecord.schema"
import type { CreateClassFormSchema as CreateClassFormValues } from "@/schema/examsRecord.schema"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"

interface CreateClassModalProps {
  open: boolean
  onClose: () => void
}

export default function CreateClassModal({ open, onClose }: CreateClassModalProps) {
  const schoolId = useSchoolId()

  const { categories, isLoading: isLoadingCategories } = useGetAllCategories({ schoolId })
  const { schoolArms, isLoading: isLoadingArms } = useGetAllSchoolArms(schoolId)

  const { createClassAsync, isPending } = useCreateClass({
    onSuccess: () => {
      form.reset()
      clearDraft()
      onClose()
    },
  })

  const form = useForm<CreateClassFormValues>({
    resolver: zodResolver(CreateClassFormSchema),
    defaultValues: {
      clsName: "",
      categoryId: "",
      classType: undefined as unknown as number,
      armIds: [],
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
  } = useFormDraft<CreateClassFormValues>({
    formKey: "exams-class-create",
    values: watchedAll as CreateClassFormValues,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    form.reset(draftValues)
    acknowledgeDraft()
  }

  const selectedArmIds: string[] = form.watch("armIds") ?? []

  function toggleArm(id: string) {
    const current = form.getValues("armIds") ?? []
    form.setValue(
      "armIds",
      current.includes(id) ? current.filter((a) => a !== id) : [...current, id],
      { shouldDirty: true }
    )
  }

  const onSubmit = async (data: CreateClassFormValues) => {
    await createClassAsync({
      clsName: data.clsName,
      categoryId: data.categoryId,
      schoolId,
      classType: data.classType,
      armIds: data.armIds ?? [],
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
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>Add a new class to your school</DialogDescription>
        </DialogHeader>

        {hasDraft && draftSavedAt && (
          <FormDraftBanner
            savedAt={draftSavedAt}
            onRestore={handleRestoreDraft}
            onDiscard={discardDraft}
          />
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
          {/* Class Name */}
          <Controller
            name="clsName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Class Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="e.g., JSS 1"
                  className="border-chart-2 py-6"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Category */}
          <Controller
            name="categoryId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Category <span className="text-destructive">*</span>
                </FieldLabel>
                {isLoadingCategories ? (
                  <div className="flex h-11 items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400">
                    Loading categories…
                  </div>
                ) : categories.length === 0 ? (
                  <div className="rounded-md border border-destructive/50 bg-destructive/5 px-4 py-3">
                    <p className="text-sm font-medium text-destructive">No categories found</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Please create a category first before adding a class.
                    </p>
                  </div>
                ) : (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border-chart-2 py-6">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {categories.map((category) => (
                        <SelectItem key={category.Id} value={category.Id}>
                          {category.CatName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Class Type */}
          <Controller
            name="classType"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Class Type <span className="text-destructive">*</span>
                </FieldLabel>
                <Select
                  value={field.value !== undefined ? String(field.value) : undefined}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger className="border-chart-2 py-6">
                    <SelectValue placeholder="Select class type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(CLASS_TYPE.Primary)}>
                      Primary — Core Academic Grade
                    </SelectItem>
                    <SelectItem value={String(CLASS_TYPE.Secondary)}>
                      Secondary — Auxiliary / Club / Support Group
                    </SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Class Arms — optional multi-select */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel className="mb-0">Class Arms</FieldLabel>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>

            {isLoadingArms ? (
              <div className="flex h-10 items-center gap-2 text-sm text-gray-400">
                <Loader2 className="size-3.5 animate-spin" />
                Loading arms…
              </div>
            ) : schoolArms.length === 0 ? (
              <p className="mt-1.5 text-xs text-muted-foreground">
                No arms found. Create arms first in the{" "}
                <span className="font-medium text-gray-700">Class Arms</span> tab.
              </p>
            ) : (
              <>
                <div className="mt-2 flex flex-wrap gap-2">
                  {schoolArms.map((arm) => {
                    const selected = selectedArmIds.includes(arm.Id)
                    return (
                      <button
                        key={arm.Id}
                        type="button"
                        onClick={() => toggleArm(arm.Id)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          selected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        {arm.ArmName}
                      </button>
                    )
                  })}
                </div>
                {selectedArmIds.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {selectedArmIds.length} arm{selectedArmIds.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </>
            )}
          </Field>

          {/* Actions */}
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
              disabled={isPending || isLoadingCategories || categories.length === 0}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isPending ? "Creating…" : "Create Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
