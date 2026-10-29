import { useEffect, useState } from "react"
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { TimeSelect } from "@/components/ui/time-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import RichTextEditor from "@/components/general/RichTextEditor"
import { Controller, useForm, useWatch } from "react-hook-form"
import type { LiveClassSession } from "@/types/elearning"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"
import {
  LMS_LIVE_CLASS_MAX_DURATION_MINUTES,
  liveClassPriceRule,
} from "@/lib/lms-market-policy"
import { formatCurrency } from "@/utils/currency"
import { uploadLiveClassCoverAndGetUrl } from "@/api/files.api"

export interface ScheduleCourseLiveClassForm {
  title: string
  description: string
  coverImageUrl: string
  courseId: string
  scheduledDate: string
  startTime: string
  endTime: string
  targetEnrollmentFrom: string
  targetEnrollmentTo: string
  invitedEmails: string
  maxParticipants: number
  isPaid: boolean
  price: number
}

interface ScheduleCourseLiveClassModalProps {
  open: boolean
  onClose: () => void
  courses: Array<{ id: string; title: string }>
  defaultCourseId?: string
  currency: string
  countryCode: string
  initialSession?: LiveClassSession | null
  isSaving?: boolean
  onSubmit: (data: ScheduleCourseLiveClassForm) => void | Promise<void>
}

const NO_COURSE = "__no_course__"

function datePart(value?: string) {
  const date = utcDate(value)
  if (!date) return ""
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function timePart(value?: string) {
  const date = utcDate(value)
  if (!date) return ""
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`
}

function utcDate(value?: string) {
  if (!value?.trim()) return null
  const normalized = value.trim().replace(" ", "T")
  const includesZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized)
  const parsed = new Date(includesZone ? normalized : `${normalized}Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function timeInMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}

export default function ScheduleCourseLiveClassModal({
  open,
  onClose,
  courses,
  defaultCourseId,
  currency,
  countryCode,
  initialSession,
  isSaving = false,
  onSubmit,
}: ScheduleCourseLiveClassModalProps) {
  const priceRule = liveClassPriceRule(currency, countryCode)
  const minimumPriceLabel = formatCurrency(
    priceRule.minimumPrice,
    priceRule.currency
  )
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    setValue,
    clearErrors,
    formState,
  } = useForm<ScheduleCourseLiveClassForm>({
    defaultValues: {
      title: "",
      description: "",
      coverImageUrl: "",
      courseId: defaultCourseId ?? NO_COURSE,
      scheduledDate: "",
      startTime: "",
      endTime: "",
      targetEnrollmentFrom: "",
      targetEnrollmentTo: "",
      invitedEmails: "",
      maxParticipants: 1,
      isPaid: true,
      price: priceRule.minimumPrice,
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      title: initialSession?.title ?? "",
      description: initialSession?.description ?? "",
      coverImageUrl: initialSession?.coverImageUrl ?? "",
      courseId: initialSession?.courseId ?? defaultCourseId ?? NO_COURSE,
      scheduledDate: datePart(initialSession?.scheduledStartUtc),
      startTime: timePart(initialSession?.scheduledStartUtc),
      endTime: timePart(initialSession?.scheduledEndUtc),
      targetEnrollmentFrom: datePart(initialSession?.targetEnrollmentFromUtc),
      targetEnrollmentTo: datePart(initialSession?.targetEnrollmentToUtc),
      invitedEmails: "",
      maxParticipants: initialSession?.maxParticipants ?? 1,
      isPaid: true,
      price: Math.max(initialSession?.price ?? 0, priceRule.minimumPrice),
    })
  }, [defaultCourseId, initialSession, open, priceRule.minimumPrice, reset])

  const selectedCourseId = useWatch({ control, name: "courseId" })
  const coverImageUrl = useWatch({ control, name: "coverImageUrl" })
  const watchedAll = useWatch({ control })
  const hasCourse = selectedCourseId !== NO_COURSE
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<ScheduleCourseLiveClassForm>({
    formKey: initialSession
      ? `lms-live-class-edit-${initialSession.id}`
      : `lms-live-class-create-${defaultCourseId ?? "general"}`,
    values: watchedAll as ScheduleCourseLiveClassForm,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    reset({
      ...draftValues,
      isPaid: true,
      price: Math.max(Number(draftValues.price) || 0, priceRule.minimumPrice),
    })
    acknowledgeDraft()
  }

  async function uploadCover(file?: File) {
    if (!file) return
    clearErrors("coverImageUrl")
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("coverImageUrl", {
        message: "Upload a JPEG, PNG, or WebP image.",
      })
      return
    }
    if (file.size > 1024 * 1024) {
      setError("coverImageUrl", {
        message: "The cover image must not exceed 1 MB.",
      })
      return
    }
    setIsUploadingCover(true)
    try {
      const url = await uploadLiveClassCoverAndGetUrl(file)
      setValue("coverImageUrl", url, {
        shouldDirty: true,
        shouldValidate: true,
      })
    } catch (error) {
      setError("coverImageUrl", {
        message:
          error instanceof Error
            ? error.message
            : "The cover image could not be uploaded.",
      })
    } finally {
      setIsUploadingCover(false)
    }
  }

  const submit = handleSubmit(async (data) => {
    if (data.endTime <= data.startTime) {
      setError("endTime", { message: "End time must be after start time" })
      return
    }
    if (
      timeInMinutes(data.endTime) - timeInMinutes(data.startTime) >
      LMS_LIVE_CLASS_MAX_DURATION_MINUTES
    ) {
      setError("endTime", {
        message: "A live class cannot be longer than 4 hours",
      })
      return
    }
    if (!Number.isFinite(data.price) || data.price < priceRule.minimumPrice) {
      setError("price", { message: `Enter at least ${minimumPriceLabel}` })
      return
    }
    if (hasCourse && (!data.targetEnrollmentFrom || !data.targetEnrollmentTo)) {
      setError("targetEnrollmentFrom", {
        message: "Select the enrollment date range for this course",
      })
      return
    }
    await onSubmit(data)
    clearDraft()
    onClose()
  })

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[640px]">
        <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-lg font-semibold">
            {initialSession ? "Edit live class" : "Schedule live class"}
          </DialogTitle>
          <DialogDescription>
            Schedule a paid public session, optionally connect it to a course,
            notify a targeted enrollment window, and invite people by email.
          </DialogDescription>
        </DialogHeader>

        {hasDraft && draftSavedAt && (
          <div className="shrink-0 px-6 pt-4">
            <FormDraftBanner
              savedAt={draftSavedAt}
              onRestore={handleRestoreDraft}
              onDiscard={discardDraft}
            />
          </div>
        )}

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="live-title">Class title</Label>
              <Input
                id="live-title"
                placeholder="e.g. Building dashboards with PivotTables"
                {...register("title", { required: "Title is required" })}
              />
              {formState.errors.title && (
                <p className="text-xs text-red-600">
                  {formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <p className="text-xs text-muted-foreground">
                Plain text and formatted HTML are both supported.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Cover image</Label>
              <input type="hidden" {...register("coverImageUrl")} />
              {coverImageUrl ? (
                <div className="relative overflow-hidden rounded-xl border bg-slate-100">
                  <img
                    src={coverImageUrl}
                    alt="Live class cover preview"
                    className="aspect-video w-full object-cover"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="absolute top-3 right-3"
                    onClick={() =>
                      setValue("coverImageUrl", "", { shouldDirty: true })
                    }
                  >
                    <Trash2 className="size-4" /> Remove
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="live-class-cover"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
                >
                  {isUploadingCover ? (
                    <LoaderCircle className="size-7 animate-spin text-blue-600" />
                  ) : (
                    <ImagePlus className="size-7 text-blue-600" />
                  )}
                  <span className="mt-2 text-sm font-semibold text-slate-800">
                    {isUploadingCover
                      ? "Uploading cover…"
                      : "Upload cover image"}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    JPEG, PNG, or WebP · 16:9 recommended · maximum 1 MB
                  </span>
                </label>
              )}
              <input
                id="live-class-cover"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={isUploadingCover}
                onChange={(event) => {
                  void uploadCover(event.target.files?.[0])
                  event.target.value = ""
                }}
              />
              {formState.errors.coverImageUrl && (
                <p className="text-xs text-red-600">
                  {formState.errors.coverImageUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Related course</Label>
              <Controller
                name="courseId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_COURSE}>No course</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {hasCourse && (
              <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <div>
                  <Label>Target group — course enrollment date range</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Students enrolled in the selected course during this period
                    receive an in-app and email notification.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Controller
                    name="targetEnrollmentFrom"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enrolled from"
                      />
                    )}
                  />
                  <Controller
                    name="targetEnrollmentTo"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enrolled to"
                      />
                    )}
                  />
                </div>
                {formState.errors.targetEnrollmentFrom && (
                  <p className="text-xs text-red-600">
                    {formState.errors.targetEnrollmentFrom.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Date</Label>
              <Controller
                name="scheduledDate"
                control={control}
                rules={{ required: "Date is required" }}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pick date"
                  />
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start time</Label>
                <Controller
                  name="startTime"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TimeSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Start"
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>End time</Label>
                <Controller
                  name="endTime"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TimeSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="End"
                    />
                  )}
                />
                {formState.errors.endTime && (
                  <p className="text-xs text-red-600">
                    {formState.errors.endTime.message}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              A live class can run for up to 4 hours.
            </p>

            <div className="space-y-2">
              <Label>Additional invited emails</Label>
              <Textarea
                rows={6}
                className="min-h-32 resize-y"
                placeholder="Enter one email per line, or separate emails with commas"
                {...register("invitedEmails")}
              />
            </div>

            <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50/50 p-3">
              <div>
                <p className="text-sm font-medium">Paid session required</p>
                <p className="text-xs text-muted-foreground">
                  Every learner must complete payment before joining this class.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Price ({priceRule.currency})</Label>
              <Input
                type="number"
                min={priceRule.minimumPrice}
                step={priceRule.currency === "NGN" ? "1" : "0.01"}
                aria-invalid={Boolean(formState.errors.price)}
                {...register("price", {
                  required: "Price is required",
                  valueAsNumber: true,
                  validate: (value) =>
                    (Number.isFinite(value) &&
                      value >= priceRule.minimumPrice) ||
                    `Enter at least ${minimumPriceLabel}`,
                })}
              />
              {formState.errors.price && (
                <p className="text-xs text-red-600">
                  {formState.errors.price.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum {minimumPriceLabel}.{" "}
                {priceRule.currency === "NGN" ? "Paystack" : "Stripe"} will
                process this payment.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Maximum participants</Label>
              <Input
                type="number"
                min={1}
                {...register("maxParticipants", {
                  valueAsNumber: true,
                  min: 1,
                })}
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving || isUploadingCover}
            >
              {isUploadingCover
                ? "Uploading cover…"
                : isSaving
                  ? "Saving…"
                  : initialSession
                    ? "Save changes"
                    : "Schedule session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
