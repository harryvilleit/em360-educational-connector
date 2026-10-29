// WordPress version: only active period types, the built-in class type by code, and cleared subjects on type changes.
import { useEffect, useMemo, useState } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
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
import { useGetAllSubjects } from "@/hooks/examAndRecords"
import { useUpdateTimetableSlot } from "@/hooks/timetable"
import { useGetPeriodTypesBySchool } from "@/hooks/timetablePeriodType"
import { useTimetableTypeStore } from "@/store/timetableType.store"
import type { PeriodTemplate } from "@/store/periodBank.store"
import type { TimetableSlotI } from "@/api/timetable.api/types"
import {
  TIMETABLE_TYPE,
  currentWeekMonday,
  dateForDayInWeek,
  dayNameToApiDayOfWeek,
  mondayOfWeekContaining,
  normalizeClassMode,
  normalizeTimeForApi,
  resolveDayName,
} from "@/pages/Dashboard/Timetable/timetable.utils"
import { PeriodFields } from "@/pages/Dashboard/Timetable/components/PeriodFields"
import { makePeriodSchema, type PeriodFormValues } from "@/pages/Dashboard/Timetable/components/PeriodSchema"

export type PeriodTemplateValues = PeriodFormValues & { timetableType: number }

function emptyPeriod(classPeriodTypeId: string): PeriodFormValues {
  return {
    periodTypeId: classPeriodTypeId,
    startTime: "",
    endTime: "",
    subjectId: "",
    classMode: 1,
    venue: "",
    assessmentType: "",
  }
}

function slotToFormValues(slot: TimetableSlotI): PeriodFormValues {
  return {
    periodTypeId: slot.periodTypeId,
    startTime: slot.startTime,
    endTime: slot.endTime,
    subjectId: slot.subjectId ?? "",
    classMode: normalizeClassMode(slot.classMode),
    venue: slot.venue || "",
    assessmentType: slot.assessmentType || "",
  }
}

function templateToFormValues(template: PeriodTemplate): PeriodFormValues {
  return {
    periodTypeId: template.periodTypeId,
    startTime: template.startTime,
    endTime: template.endTime,
    subjectId: template.subjectId ?? "",
    classMode: template.classMode,
    venue: template.venue || "",
    assessmentType: template.assessmentType || "",
  }
}

interface PeriodFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolClassId: string
  initialSlot?: TimetableSlotI | null
  slotTimetableType?: number
  initialTemplate?: PeriodTemplate | null
  onCreateTemplates?: (values: PeriodTemplateValues[]) => void
  onUpdateTemplate?: (id: string, values: PeriodTemplateValues) => void
}

export function PeriodFormDialog({
  open,
  onOpenChange,
  schoolClassId,
  initialSlot,
  slotTimetableType,
  initialTemplate,
  onCreateTemplates,
  onUpdateTemplate,
}: PeriodFormDialogProps) {
  const isEditing = !!initialSlot || !!initialTemplate
  const schoolId = useSchoolId()

  const { subjects } = useGetAllSubjects(schoolId)
  const { periodTypes } = useGetPeriodTypesBySchool({ schoolId })
  const classPeriodTypeId = periodTypes.find((t) => t.isBuiltIn && t.code === "class")?.id ?? ""
  const timetableTypes = useTimetableTypeStore((s) => s.timetableTypes)

  const realTimetableTypes = timetableTypes.filter(
    (t) => t.backendType !== null
  )
  const classTimetableTypeId =
    realTimetableTypes.find((t) => t.backendType === TIMETABLE_TYPE.Class)
      ?.id ?? ""
  const [timetableTypeId, setTimetableTypeId] = useState(classTimetableTypeId)

  const selectedType = realTimetableTypes.find((t) => t.id === timetableTypeId)
  const selectedBackendType = selectedType?.backendType ?? TIMETABLE_TYPE.Class

  // Only used while editing an already-scheduled slot, whose type is fixed
  // — resolved separately from `selectedType` since that path never touches
  // the editable `timetableTypeId` state.
  const editingSlotMatchedType = initialSlot
    ? realTimetableTypes.find((t) => t.backendType === slotTimetableType)
    : undefined

  const { updateTimetableSlotAsync, isPending: isUpdating } =
    useUpdateTimetableSlot()

  const periodTypeOptions = useMemo(
    // Inactive period types are not offered, except the one an existing period already uses.
    () =>
      periodTypes
        .filter((t) => t.statusName === "Active" || t.id === initialSlot?.periodTypeId)
        .map((t) => ({ id: t.id, label: t.name })),
    [periodTypes, initialSlot?.periodTypeId]
  )

  const periodSchema = useMemo(
    () => makePeriodSchema(classPeriodTypeId),
    [classPeriodTypeId]
  )
  const periodsFormSchema = useMemo(
    () => z.object({ periods: z.array(periodSchema).min(1) }),
    [periodSchema]
  )
  type PeriodsFormValues = { periods: PeriodFormValues[] }

  const form = useForm<PeriodsFormValues>({
    resolver: zodResolver(periodsFormSchema),
    defaultValues: { periods: [emptyPeriod(classPeriodTypeId)] },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "periods",
  })

  const watchedPeriods = useWatch({ control: form.control })
  const formKey = initialSlot
    ? `timetable-period-edit-slot-${initialSlot.id}`
    : initialTemplate
      ? `timetable-period-edit-template-${initialTemplate.id}`
      : `timetable-period-create-${schoolClassId}`

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<PeriodsFormValues>({
    formKey,
    values: watchedPeriods as PeriodsFormValues,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    form.reset(draftValues)
    acknowledgeDraft()
  }

  useEffect(() => {
    if (open) {
      form.reset({
        periods: initialSlot
          ? [{ ...slotToFormValues(initialSlot), periodTypeId: initialSlot.periodTypeId || classPeriodTypeId }]
          : initialTemplate
            ? [templateToFormValues(initialTemplate)]
            : [emptyPeriod(classPeriodTypeId)],
      })
      const resolvedTypeId = initialSlot
        ? realTimetableTypes.find((t) => t.backendType === slotTimetableType)
            ?.id
        : initialTemplate
          ? realTimetableTypes.find(
              (t) => t.backendType === initialTemplate.timetableType
            )?.id
          : classTimetableTypeId
      setTimetableTypeId(resolvedTypeId ?? classTimetableTypeId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialSlot, initialTemplate, slotTimetableType, classPeriodTypeId])

  function handleTimetableTypeChange(id: string) {
    setTimetableTypeId(id)

    const type = realTimetableTypes.find((t) => t.id === id)?.backendType
    if (type && type !== TIMETABLE_TYPE.Class) {
      form.getValues("periods").forEach((_, i) => {
        form.setValue(`periods.${i}.periodTypeId`, classPeriodTypeId)
      })
    }
  }

  const handleSubmit = async (data: PeriodsFormValues) => {
    if (initialSlot) {
      const p = data.periods[0]
      const day = resolveDayName(initialSlot)
      const date =
        initialSlot.date?.slice(0, 10) ||
        (day ? dateForDayInWeek(day, currentWeekMonday()) : currentWeekMonday())
      await updateTimetableSlotAsync({
        id: initialSlot.id,
        schoolId,
        dayOfWeek: day ? dayNameToApiDayOfWeek(day) : initialSlot.dayOfWeek,
        date,
        weekStartDate:
          initialSlot.weekStartDate?.slice(0, 10) ||
          mondayOfWeekContaining(date),
        startTime: normalizeTimeForApi(p.startTime),
        endTime: normalizeTimeForApi(p.endTime),
        // An empty subject clears it when a class period becomes another type.
        subjectId: p.periodTypeId === classPeriodTypeId ? p.subjectId : "",
        periodTypeId: p.periodTypeId,
        classMode:
          p.periodTypeId === classPeriodTypeId ? p.classMode : undefined,
        venue:
          slotTimetableType === TIMETABLE_TYPE.Assessment
            ? p.venue
            : undefined,
        assessmentType:
          slotTimetableType === TIMETABLE_TYPE.Assessment
            ? p.assessmentType
            : undefined,
      })
    } else if (initialTemplate) {
      const p = data.periods[0]
      onUpdateTemplate?.(initialTemplate.id, {
        ...p,
        startTime: normalizeTimeForApi(p.startTime),
        endTime: normalizeTimeForApi(p.endTime),
        timetableType: selectedBackendType,
        venue:
          selectedBackendType === TIMETABLE_TYPE.Assessment
            ? p.venue
            : undefined,
        assessmentType:
          selectedBackendType === TIMETABLE_TYPE.Assessment
            ? p.assessmentType
            : undefined,
      })
    } else {
      onCreateTemplates?.(
        data.periods.map((p) => ({
          ...p,
          startTime: normalizeTimeForApi(p.startTime),
          endTime: normalizeTimeForApi(p.endTime),
          timetableType: selectedBackendType,
          venue:
            selectedBackendType === TIMETABLE_TYPE.Assessment
              ? p.venue
              : undefined,
          assessmentType:
            selectedBackendType === TIMETABLE_TYPE.Assessment
              ? p.assessmentType
              : undefined,
        }))
      )
    }
    clearDraft()
    onOpenChange(false)
  }

  const isSaving = isUpdating
  const effectiveTimetableType = initialSlot
    ? slotTimetableType
    : selectedBackendType

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-gray-100 px-6 py-4">
          <DialogTitle>
            {isEditing ? "Edit Period" : "Create Period"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Set the time slot and details for this period."
              : "Pick a timetable type and set the time slot. It will be added to the Periods panel below drag it onto any day to schedule it."}
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

        <form
          onSubmit={form.handleSubmit((values) => handleSubmit(values).catch(() => {}))}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <Field>
              <FieldLabel>Timetable Type</FieldLabel>
              {initialSlot ? (
                <div className="flex h-10 items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-600">
                  {editingSlotMatchedType?.label ?? "—"}
                </div>
              ) : (
                <Select
                  value={timetableTypeId}
                  onValueChange={handleTimetableTypeChange}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Select timetable type" />
                  </SelectTrigger>
                  <SelectContent>
                    {realTimetableTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>

            {fields.map((field, index) => (
              <PeriodFields
                key={field.id}
                index={index}
                control={form.control}
                subjects={subjects}
                periodTypes={periodTypeOptions}
                classPeriodTypeId={classPeriodTypeId}
                timetableTypeValue={
                  effectiveTimetableType ?? TIMETABLE_TYPE.Class
                }
                showRemove={!isEditing && fields.length > 1}
                onRemove={() => remove(index)}
                showHeading={!isEditing}
              />
            ))}

            {!isEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(emptyPeriod(classPeriodTypeId))}
                className="w-full"
              >
                <Plus className="size-3.5" />
                Add Another Period
              </Button>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="w-1/2"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              variant="primary"
              className="w-1/2"
            >
              {isEditing
                ? "Save Changes"
                : fields.length > 1
                  ? `Add ${fields.length} Periods`
                  : "Add Period"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
