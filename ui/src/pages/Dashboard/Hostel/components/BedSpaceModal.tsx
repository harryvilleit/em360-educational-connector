import { useEffect } from "react"
import { useParams } from "react-router"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useCreateBedSpace,
  useUpdateBedSpace,
  useGetAllHostelRooms,
  useGetBedSpacesByRoom,
} from "@/hooks/hostel"
import type { BedSpaceItemI } from "@/api/hostel.api/types"
import { bedSpaceSchema, type BedSpaceFormData } from "@/schema/bedSpace.schema"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"
import { DashboardRoutes } from "@/routes"
import { FieldWrapper } from "./FieldWrapper"
import { RequiredDataNotice } from "./RequiredDataNotice"

interface BedSpaceModalProps {
  open: boolean
  onClose: () => void
  editing?: BedSpaceItemI | null
  defaultRoomId?: string
}

export function BedSpaceModal({
  open,
  onClose,
  editing,
  defaultRoomId,
}: BedSpaceModalProps) {
  const schoolId = useSchoolId()
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const { rooms } = useGetAllHostelRooms({ schoolId, pageSize: 200 })

  const { createBedSpaceAsync, isPending: isCreating } = useCreateBedSpace({
    onSuccess: () => { onClose(); clearDraft() },
  })
  const { updateBedSpaceAsync, isPending: isUpdating } = useUpdateBedSpace({
    onSuccess: () => { onClose(); clearDraft() },
  })
  const isPending = isCreating || isUpdating

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BedSpaceFormData>({
    resolver: zodResolver(bedSpaceSchema),
    defaultValues: {
      roomId: editing?.roomId ?? defaultRoomId ?? "",
      label: editing?.bedLabel ?? "",
    },
  })

  const watchedAll = useWatch({ control })

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<BedSpaceFormData>({
    formKey: editing
      ? `hostel-bedspace-edit-${editing.id}`
      : "hostel-bedspace-create",
    values: watchedAll as BedSpaceFormData,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    reset(draftValues)
    acknowledgeDraft()
  }

  useEffect(() => {
    if (open) {
      reset({
        roomId: editing?.roomId ?? defaultRoomId ?? "",
        label: editing?.bedLabel ?? "",
      })
    }
  }, [open, editing, defaultRoomId, reset])

  const selectedRoomId = watch("roomId")
  const { bedSpaces: existingBedSpaces } = useGetBedSpacesByRoom(
    selectedRoomId
  )
  const existingLabels = existingBedSpaces
    .filter((b) => b.id !== editing?.id)
    .map((b) => b.bedLabel)

  const onSubmit = async (data: BedSpaceFormData) => {
    if (editing) {
      await updateBedSpaceAsync({
        id: editing.id,
        roomId: editing.roomId,
        bedLabel: data.label,
        status: editing.status,
      })
    } else {
      await createBedSpaceAsync({
        roomId: data.roomId,
        bedLabel: data.label,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Bed Space" : "Create Bed Space"}
          </DialogTitle>
        </DialogHeader>

        {hasDraft && draftSavedAt && (
          <FormDraftBanner
            savedAt={draftSavedAt}
            onRestore={handleRestoreDraft}
            onDiscard={discardDraft}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Room selector (disabled when editing) */}
          <FieldWrapper label="Room" required error={errors.roomId?.message}>
            <Controller
              control={control}
              name="roomId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!!editing}
                >
                  <SelectTrigger
                    className={errors.roomId ? "border-red-400" : "w-full border-gray-300"}
                  >
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        <span className="font-medium">{r.roomNumber}</span>
                        {r.roomName && (
                          <span className="ml-1.5 text-gray-400 w-full">
                            — {r.roomName}
                          </span>
                        )}
                        <span className="ml-2 text-xs text-gray-400">
                          ({r.hostelName})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {rooms.length === 0 && (
              <RequiredDataNotice
                itemLabel="a room"
                pageLabel="Rooms"
                to={DashboardRoutes.toHostelCreateRoom(p)}
              />
            )}
          </FieldWrapper>

          {/* Bed label */}
          <FieldWrapper label="Bed Label" required error={errors.label?.message}>
            <Input
              placeholder="e.g. Bed A, Bed 1, Top Bunk"
              {...register("label")}
              className={errors.label ? "border-red-400" : ""}
            />
            {selectedRoomId && existingLabels.length > 0 && (
              <p className="mt-1 text-xs text-gray-400">
                Existing: {existingLabels.join(", ")}
              </p>
            )}
          </FieldWrapper>

          {/* Duplicate label warning */}
          {selectedRoomId &&
            watch("label") &&
            existingLabels.includes(watch("label")) &&
            !editing && (
              <p className="flex items-center gap-1 text-xs text-orange-500">
                <AlertCircle className="h-3 w-3" />
                A bed with this label already exists in this room
              </p>
            )}

          <div className="flex w-full gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="w-1/2">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isPending}
              className="w-1/2"
              variant="primary"
            >
              {editing ? "Save Changes" : "Create Bed Space"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
