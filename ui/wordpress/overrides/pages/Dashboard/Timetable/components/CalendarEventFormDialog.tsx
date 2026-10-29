// WordPress version: Create/Update/Delete permissions on calendar events.
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import { useGetAllClasses } from "@/hooks/examAndRecords"
import {
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from "@/hooks/calendar"
import MultiSelectPanel from "@/pages/Dashboard/ExamsAndRecords/components/MultiSelectPanel"
import type { CalendarEventI } from "@/api/calendar.api/types"
import {
  CalendarEventSchema,
  EVENT_TYPES,
  EMPTY_CALENDAR_EVENT,
  type CalendarEventFormValues,
} from "@/pages/Dashboard/Timetable/components/CalendarEventSchema"
import { DeleteCalendarEventDialog } from "@/pages/Dashboard/Timetable/components/DeleteCalendarEventDialog"
import { withCurrentTimeOption } from "@/pages/Dashboard/Timetable/components/PeriodData"
import { ScrollableTimeSelect } from "@/pages/Dashboard/Timetable/components/ScrollableTimeSelect"

interface CalendarEventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialEvent?: CalendarEventI | null
  initialDate?: string
}

export function CalendarEventFormDialog({
  open,
  onOpenChange,
  initialEvent,
  initialDate,
}: CalendarEventFormDialogProps) {
  const schoolId = useSchoolId()
  const permissions = usePermissions()
  // Editing needs Update; adding needs Create; removing needs Delete.
  const canSave = initialEvent
    ? permissions.canUpdate("/dashboard/timetable/calendar")
    : permissions.canCreate("/dashboard/timetable/calendar")
  const canDelete = permissions.canDelete("/dashboard/timetable/calendar")
  const form = useForm<CalendarEventFormValues>({
    resolver: zodResolver(CalendarEventSchema),
    defaultValues: EMPTY_CALENDAR_EVENT,
  })

  const { classes, isLoading: classesLoading } = useGetAllClasses({
    schoolId,
    pageSize: 200,
  })
  const classItems = useMemo(
    () => classes.map((c) => ({ id: c.Id, name: c.ClsName })),
    [classes]
  )

  const { createCalendarEventAsync, isPending: isCreating } =
    useCreateCalendarEvent()
  const { updateCalendarEventAsync, isPending: isUpdating } =
    useUpdateCalendarEvent()
  const { deleteCalendarEventAsync, isPending: isDeleting } =
    useDeleteCalendarEvent()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    if (open) {
      form.reset(
        initialEvent
          ? {
              title: initialEvent.title,
              date: initialEvent.startDate.slice(0, 10),
              endDate:
                initialEvent.endDate &&
                initialEvent.endDate.slice(0, 10) !==
                  initialEvent.startDate.slice(0, 10)
                  ? initialEvent.endDate.slice(0, 10)
                  : "",
              isAllDay: !initialEvent.startTime,
              startTime: initialEvent.startTime?.slice(0, 5) ?? "",
              endTime: initialEvent.endTime?.slice(0, 5) ?? "",
              eventType: initialEvent.eventType,
              description: initialEvent.description,
              affectsAllClasses: initialEvent.affectsAllClasses,
              schoolClassIds: initialEvent.affectedClasses.map(
                (c) => c.schoolClassId
              ),
            }
          : { ...EMPTY_CALENDAR_EVENT, date: initialDate ?? "" }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialEvent, initialDate])

  const watchAffectsAllClasses = form.watch("affectsAllClasses")
  const watchIsAllDay = form.watch("isAllDay")
  const watchedAll = useWatch({ control: form.control })
  const formKey = initialEvent
    ? `timetable-calendar-event-edit-${initialEvent.id}`
    : "timetable-calendar-event-create"

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<CalendarEventFormValues>({
    formKey,
    values: watchedAll as CalendarEventFormValues,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    form.reset(draftValues)
    acknowledgeDraft()
  }

  const handleSubmit = async (data: CalendarEventFormValues) => {
    if (!canSave) return
    const payload = {
      title: data.title,
      startDate: data.date,
      endDate: data.endDate?.trim() || data.date,
      startTime: data.isAllDay ? undefined : data.startTime,
      endTime: data.isAllDay ? undefined : data.endTime,
      eventType: data.eventType,
      description: data.description,
      affectsAllClasses: data.affectsAllClasses,
      schoolClassIds: data.affectsAllClasses
        ? undefined
        : (data.schoolClassIds ?? []),
    }

    if (initialEvent) {
      await updateCalendarEventAsync({ id: initialEvent.id, ...payload })
    } else {
      await createCalendarEventAsync({ schoolId, ...payload })
    }
    clearDraft()
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (!initialEvent || !canDelete) return
    await deleteCalendarEventAsync(initialEvent.id)
    setConfirmDeleteOpen(false)
    onOpenChange(false)
  }

  const isSaving = isCreating || isUpdating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialEvent ? "Edit Calendar Event" : "Add Calendar Event"}
          </DialogTitle>
          <DialogDescription>
            Publish a school-wide or class-specific calendar event.
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
          onSubmit={form.handleSubmit((data) => handleSubmit(data).catch(() => {}))}
          className="space-y-4"
        >
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Title</FieldLabel>
                  <Input
                    {...field}
                    placeholder="e.g. Annual Sports Day"
                    className="border-gray-200"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Date</FieldLabel>
                    <Input {...field} type="date" className="border-gray-200" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="endDate"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>
                      End Date
                      <span className="ml-1 font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Input {...field} type="date" className="border-gray-200" />
                  </Field>
                )}
              />
            </div>

            <Controller
              name="isAllDay"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <div>
                      <FieldLabel className="!mb-0">All-day event</FieldLabel>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Turn this off to publish a specific 24-hour time.
                      </p>
                    </div>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </Field>
              )}
            />

            {!watchIsAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="startTime"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Start Time</FieldLabel>
                      <ScrollableTimeSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        options={withCurrentTimeOption(field.value ?? "")}
                        placeholder="Select start time"
                        invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="endTime"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>End Time</FieldLabel>
                      <ScrollableTimeSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        options={withCurrentTimeOption(field.value ?? "")}
                        placeholder="Select end time"
                        invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            )}

            <Controller
              name="eventType"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Event Type</FieldLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={String(t.value)}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Brief details about this event"
                    className="resize-none border-gray-200"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="affectsAllClasses"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <FieldLabel className="!mb-0">
                      Affects all classes
                    </FieldLabel>
                  </div>
                </Field>
              )}
            />

            {!watchAffectsAllClasses && (
              <Controller
                name="schoolClassIds"
                control={form.control}
                render={({ field, fieldState }) => (
                  <MultiSelectPanel
                    label="Affected Classes"
                    items={classItems}
                    selected={field.value ?? []}
                    onChange={field.onChange}
                    placeholder={
                      classesLoading ? "Loading classes..." : "Select classes"
                    }
                    error={fieldState.error?.message}
                  />
                )}
              />
            )}
          </FieldGroup>

          <div className="w-full">
            {initialEvent && canDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={isDeleting}
              >
                Delete
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !canSave}>
                {initialEvent ? "Save Changes" : "Add Event"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>

      <DeleteCalendarEventDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        eventTitle={initialEvent?.title}
        onConfirm={() => handleDelete().catch(() => {})}
      />
    </Dialog>
  )
}
