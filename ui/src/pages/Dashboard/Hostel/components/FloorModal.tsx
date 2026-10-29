import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useCreateFloor, useUpdateFloor } from "@/hooks/floor"
import { floorSchema, type FloorFormData } from "@/schema/floor.schema"
import type { FloorItemI } from "@/types/floor"

interface FloorModalProps {
  open: boolean
  onClose: () => void
  floor?: FloorItemI | null
}

export function FloorModal({ open, onClose, floor }: FloorModalProps) {
  const schoolId = useSchoolId()
  const isEdit = !!floor

  const { createFloor, isPending: isCreating } = useCreateFloor({
    onSuccess: () => { onClose(); clearDraft() },
  })
  const { updateFloor, isPending: isUpdating } = useUpdateFloor({
    onSuccess: () => { onClose(); clearDraft() },
  })
  const isPending = isCreating || isUpdating

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FloorFormData>({
    resolver: zodResolver(floorSchema),
    defaultValues: { name: "", description: "" },
  })

  const watchedAll = useWatch({ control })

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<FloorFormData>({
    formKey: floor ? `hostel-floor-edit-${floor.id}` : "hostel-floor-create",
    values: watchedAll as FloorFormData,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    reset(draftValues)
    acknowledgeDraft()
  }

  useEffect(() => {
    if (!open) return
    reset(
      floor
        ? { name: floor.name, description: floor.description ?? "" }
        : { name: "", description: "" }
    )
  }, [open, floor, reset])

  const onSubmit = (data: FloorFormData) => {
    if (isEdit && floor) {
      updateFloor({
        id: floor.id,
        name: data.name,
        description: data.description || undefined,
      })
    } else {
      createFloor({
        schoolId: schoolId ?? "",
        name: data.name,
        description: data.description || undefined,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Floor" : "Create Floor"}</DialogTitle>
        </DialogHeader>

        {hasDraft && draftSavedAt && (
          <FormDraftBanner
            savedAt={draftSavedAt}
            onRestore={handleRestoreDraft}
            onDiscard={discardDraft}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="floor-name">
              Floor Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="floor-name"
              placeholder="e.g. Ground Floor, Block A"
              {...register("name")}
              className={errors.name ? "border-red-400" : ""}
            />
            {errors.name && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="floor-description">Description</Label>
            <Textarea
              id="floor-description"
              placeholder="Optional notes about this floor"
              rows={2}
              className="resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex full gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="w-1/2">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isPending}
              className="w-1/2"
              variant="primary"
            >
              {isEdit ? "Save Changes" : "Create Floor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
