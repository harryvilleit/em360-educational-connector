import { Controller, useWatch, type Control } from "react-hook-form"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TIMETABLE_TYPE } from "../timetable.utils"
import {
  BLANK_CLASS_MODE,
  CA_TYPES,
  CLASS_MODES,
  withCurrentTimeOption,
} from "./PeriodData"
import { ScrollableTimeSelect } from "./ScrollableTimeSelect"
import type { PeriodFormValues } from "./PeriodSchema"

interface PeriodFieldsProps {
  index: number
  control: Control<{ periods: PeriodFormValues[] }>
  subjects: { Id: string; Name: string }[]
  periodTypes: { id: string; label: string }[]
  classPeriodTypeId: string
  /** Which backend Timetable this period is being scheduled into — governs
   * which fields are relevant (Assessment adds Venue and Assessment Type,
   * both optional and independent; only Class timetables offer non-subject
   * period types like Break/Assembly). */
  timetableTypeValue: number
  showRemove: boolean
  onRemove: () => void
  showHeading: boolean
}

export function PeriodFields({
  index,
  control,
  subjects,
  periodTypes,
  classPeriodTypeId,
  timetableTypeValue,
  showRemove,
  onRemove,
  showHeading,
}: PeriodFieldsProps) {
  const watchType = useWatch({ control, name: `periods.${index}.periodTypeId` })

  const isClassTimetable = timetableTypeValue === TIMETABLE_TYPE.Class
  const isAssessmentTimetable = timetableTypeValue === TIMETABLE_TYPE.Assessment
  const showSubjectFields = isClassTimetable
    ? watchType === classPeriodTypeId
    : true

  return (
    <div className="space-y-4 rounded-xl border border-gray-100 p-4">
      {showHeading && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500">
            Period {index + 1}
          </p>
          {showRemove && (
            <Button
              type="button"
              aria-label={`Remove period ${index + 1}`}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={onRemove}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      <FieldGroup>
        {isClassTimetable && (
          <Controller
            name={`periods.${index}.periodTypeId`}
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Period Type</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name={`periods.${index}.startTime`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Start Time</FieldLabel>
                <ScrollableTimeSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={withCurrentTimeOption(field.value)}
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
            name={`periods.${index}.endTime`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>End Time</FieldLabel>
                <ScrollableTimeSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  options={withCurrentTimeOption(field.value)}
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

        {showSubjectFields && (
          <>
            <Controller
              name={`periods.${index}.subjectId`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Subject</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {subjects.map((s) => (
                        <SelectItem key={s.Id} value={s.Id}>
                          {s.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {isClassTimetable && (
              <Controller
                name={`periods.${index}.classMode`}
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Class Mode</FieldLabel>
                    <Select
                      value={
                        field.value ? String(field.value) : BLANK_CLASS_MODE
                      }
                      onValueChange={(v) =>
                        field.onChange(
                          v === BLANK_CLASS_MODE ? undefined : Number(v)
                        )
                      }
                    >
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_MODES.map((m) => (
                          <SelectItem key={m.value} value={String(m.value)}>
                            {m.label}
                          </SelectItem>
                        ))}
                        <SelectItem value={BLANK_CLASS_MODE}>Blank</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            )}

            {isAssessmentTimetable && (
              <>
                <Controller
                  name={`periods.${index}.venue`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Venue (optional)</FieldLabel>
                      <Input
                        {...field}
                        placeholder="e.g. Exam Hall A"
                        className="border-gray-200"
                      />
                    </Field>
                  )}
                />

                <Controller
                  name={`periods.${index}.assessmentType`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Assessment Type (optional)</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="Select assessment type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CA_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
              </>
            )}
          </>
        )}
      </FieldGroup>
    </div>
  )
}
