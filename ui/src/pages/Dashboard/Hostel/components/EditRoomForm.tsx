import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGetHostelRoomById, useUpdateHostelRoom } from "@/hooks/hostel"
import { useGetAllFloors } from "@/hooks/floor"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"
import { useSchoolId } from "@/contexts/SchoolContext"
import { DashboardRoutes } from "@/routes"
import {
  roomSchema,
  type RoomFormData,
  ROOM_AMENITIES,
} from "../../../../schema/createRoom.schema"
import { hostelTypeLabel, hostelTypeToGender } from "@/schema/hostelType.schema"
import { FieldWrapper } from "./FieldWrapper"
import { StatusBadge } from "./StatusBadge"
import { RequiredDataNotice } from "./RequiredDataNotice"

// ── Props ─────────────────────────────────────────────────────────────────────

interface EditRoomFormProps {
  roomId: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EditRoomForm({ roomId }: EditRoomFormProps) {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const schoolId = useSchoolId()

  const { room, isLoading } = useGetHostelRoomById(roomId)
  const { floors } = useGetAllFloors(schoolId)
  const { updateHostelRoomAsync, isPending } = useUpdateHostelRoom({
    onSuccess: () => {
      clearDraft()
      navigate(DashboardRoutes.toHostelRoomDetail(p, roomId))
    },
  })
  const [customAmenity, setCustomAmenity] = useState("")

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      hostelId: "",
      roomNumber: "",
      roomName: "",
      floor: "",
      description: "",
      amenities: [] as string[],
    },
  })

  // Populate form once the room is available
  useEffect(() => {
    if (room) {
      reset({
        hostelId: room.hostelId,
        roomNumber: room.roomNumber,
        roomName: room.roomName,
        floor: room.floor ?? "",
        description: room.description ?? "",
        amenities: room.amenities ?? [],
      })
    }
  }, [room, reset])

  const watchedAll = useWatch({ control })

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<RoomFormData>({
    formKey: `hostel-room-edit-${roomId}`,
    values: watchedAll as RoomFormData,
    enabled: true,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    reset(draftValues)
    acknowledgeDraft()
  }

  const amenities = watch("amenities")

  const toggleAmenity = (item: string) => {
    const next = amenities.includes(item)
      ? amenities.filter((a) => a !== item)
      : [...amenities, item]
    setValue("amenities", next)
  }

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim()
    if (trimmed && !amenities.includes(trimmed)) {
      setValue("amenities", [...amenities, trimmed])
    }
    setCustomAmenity("")
  }

  const onSubmit = async (data: RoomFormData) => {
    if (!room) return
    await updateHostelRoomAsync({
      id: room.id,
      hostelId: room.hostelId,
      roomNumber: data.roomNumber,
      roomName: data.roomName,
      floor: data.floor || undefined,
      description: data.description || undefined,
      amenities: data.amenities,
      status: room.status,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!room) {
    return <p className="text-sm text-red-500">Room not found.</p>
  }

  const isBoys = hostelTypeToGender(room.hostelType) === "male"

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      {hasDraft && draftSavedAt && (
        <div className="lg:col-span-3">
          <FormDraftBanner
            savedAt={draftSavedAt}
            onRestore={handleRestoreDraft}
            onDiscard={discardDraft}
          />
        </div>
      )}

      {/* ── Left column ──────────────────────────────────────────────────── */}
      <div className="space-y-5 lg:col-span-2">
        {/* Basic Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Basic Information
            </h2>
            {/* Hostel badge — read only, can't change which hostel a room is in */}
            <StatusBadge variant={isBoys ? "info" : "purple"} dot>
              {room.hostelName}
            </StatusBadge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Room Number */}
            <FieldWrapper
              label="Room Number"
              required
              error={errors.roomNumber?.message}
            >
              <Input
                placeholder="e.g. B101, G202"
                {...register("roomNumber")}
                className={errors.roomNumber ? "border-red-400" : ""}
              />
            </FieldWrapper>

            {/* Room Name */}
            <FieldWrapper
              label="Room Name"
              required
              error={errors.roomName?.message}
            >
              <Input placeholder="e.g. Eagle Room" {...register("roomName")} />
            </FieldWrapper>

            {/* Floor */}
            <FieldWrapper label="Floor" error={errors.floor?.message}>
              <Controller
                control={control}
                name="floor"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={floors.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          floors.length === 0
                            ? "No floors created yet"
                            : "Select floor (optional)"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {floors.map((f) => (
                        <SelectItem key={f.id} value={f.name}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {floors.length === 0 && (
                <RequiredDataNotice
                  itemLabel="a floor"
                  pageLabel="Floors"
                  to={DashboardRoutes.toHostelFloors(p)}
                />
              )}
            </FieldWrapper>
          </div>

          {/* Description */}
          <div className="mt-4">
            <FieldWrapper
              label="Description"
              error={errors.description?.message}
            >
              <Textarea
                placeholder="Optional notes about this room"
                rows={2}
                {...register("description")}
              />
            </FieldWrapper>
          </div>
        </div>

        {/* Amenities */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Room Amenities
          </h2>
          <div className="flex flex-wrap gap-2">
            {ROOM_AMENITIES.map((item) => {
              const selected = amenities.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleAmenity(item)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selected
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {selected && <CheckSquare className="h-3 w-3" />}
                  {item}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Custom amenity…"
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomAmenity()
                }
              }}
              className="h-8 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomAmenity}
            >
              Add
            </Button>
          </div>

          {amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {amenities.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                >
                  {a}
                  <button
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className="ml-0.5 rounded-full hover:text-red-600"
                    aria-label={`Remove ${a}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right column ─────────────────────────────────────────────────── */}
      <div className="space-y-5">
        {/* Summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Room #</span>
              <span className="font-medium text-gray-800">
                {room.roomNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Occupied</span>
              <span className="font-medium text-gray-800">
                {room.occupiedBeds} / {room.totalBeds}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type</span>
              <span className="font-medium text-gray-800">
                {hostelTypeLabel(room.hostelType)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            disabled={isSubmitting || isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting || isPending ? "Saving…" : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() =>
              navigate(DashboardRoutes.toHostelRoomDetail(p, room.id))
            }
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
