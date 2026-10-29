import { useMemo } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useGetAllClasses } from "@/hooks/examAndRecords"
import {
  useGetSchoolPaymentItems,
  useCreateSchoolPaymentStructure,
  useGetSchoolPaymentStructures,
} from "@/hooks/feeManagement"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"
import { useSchoolId } from "@/contexts/SchoolContext"
import { PaymentRequirement } from "@/api/feeManagement.api/types"
import { Plus, Trash2 } from "lucide-react"

const PaymentStructureItemSchema = z
  .object({
    schoolPaymentItemId: z
      .string()
      .min(1, { message: "Select a payment item" }),
    amount: z.string().min(1, { message: "Amount is required" }),
    paymentRequirement: z.enum(["mandatory", "optional"]),
    applicableToNewStudent: z.boolean(),
    subscriptionDueDate: z.string().optional(),
  })
  .refine(
    (item) =>
      item.paymentRequirement !== "optional" || !!item.subscriptionDueDate,
    {
      message: "Set a subscription due date for optional fees",
      path: ["subscriptionDueDate"],
    }
  )

const CreatePaymentStructureSchema = z
  .object({
    schoolSessionId: z.string().min(1, { message: "Session is required" }),
    schoolSessionTermId: z.string().min(1, { message: "Term is required" }),
    schoolClassId: z.string().min(1, { message: "Class is required" }),
    notes: z.string().optional(),
    items: z
      .array(PaymentStructureItemSchema)
      .min(1, { message: "Add at least one payment item" }),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>()
    data.items.forEach((item, index) => {
      if (!item.schoolPaymentItemId) return
      if (seen.has(item.schoolPaymentItemId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "This payment item is already added to this structure",
          path: ["items", index, "schoolPaymentItemId"],
        })
      }
      seen.add(item.schoolPaymentItemId)
    })
  })

const emptyItem = () => ({
  schoolPaymentItemId: "",
  amount: "",
  paymentRequirement: "mandatory" as const,
  applicableToNewStudent: false,
  subscriptionDueDate: "",
})

type CreatePaymentStructureInput = z.input<typeof CreatePaymentStructureSchema>
type CreatePaymentStructureOutput = z.output<
  typeof CreatePaymentStructureSchema
>

type Props = {
  open: boolean
  onClose: () => void
  defaultSessionId?: string
  defaultTermId?: string
  defaultClassId?: string
}

export default function CreatePaymentTypeModal({
  open,
  onClose,
  defaultSessionId,
  defaultTermId,
  defaultClassId,
}: Props) {
  const schoolId = useSchoolId()
  const { currencySymbol, formatMoney } = useSchoolMoney()
  const { paymentStructures } = useGetSchoolPaymentStructures(schoolId)
  const { paymentItems } = useGetSchoolPaymentItems(schoolId)
  const { createSchoolPaymentStructureAsync, isPending } =
    useCreateSchoolPaymentStructure()

  const { sessions, isLoading: sessionsLoading } = useGetAllSchoolSessions({
    schoolId,
    pageSize: 100,
  })
  const { classes: classItems, isLoading: classesLoading } = useGetAllClasses({
    schoolId,
    pageSize: 100,
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<
    CreatePaymentStructureInput,
    unknown,
    CreatePaymentStructureOutput
  >({
    resolver: zodResolver(CreatePaymentStructureSchema),
    defaultValues: {
      schoolSessionId: defaultSessionId ?? "",
      schoolSessionTermId: defaultTermId ?? "",
      schoolClassId: defaultClassId ?? "",
      notes: "",
      items: [emptyItem()],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const selectedSessionId = useWatch({ control, name: "schoolSessionId" })
  const selectedClassId = useWatch({ control, name: "schoolClassId" })
  const watchedItems = useWatch({ control, name: "items" })
  const watchedAll = useWatch({ control })

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<CreatePaymentStructureInput>({
    formKey: "fee-payment-type-create",
    values: watchedAll as CreatePaymentStructureInput,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    reset(draftValues)
    acknowledgeDraft()
  }

  const termOptions = useMemo(() => {
    const session = sessions.find((s) => s.Id === selectedSessionId)
    return session?.Terms ?? []
  }, [sessions, selectedSessionId])

  const itemsTotal = useMemo(
    () =>
      (watchedItems ?? []).reduce(
        (sum, i) => sum + (Number((i?.amount ?? "").replace(/,/g, "")) || 0),
        0
      ),
    [watchedItems]
  )

  const onSubmit = async (data: CreatePaymentStructureOutput) => {
    const duplicate = paymentStructures.some(
      (ps) =>
        ps.classId === data.schoolClassId &&
        ps.termId === data.schoolSessionTermId &&
        ps.sessionId === data.schoolSessionId
    )
    if (duplicate) {
      toast.error(
        "A payment structure already exists for this class, term and session."
      )
      return
    }

    await createSchoolPaymentStructureAsync({
      schoolId,
      schoolSessionId: data.schoolSessionId,
      schoolSessionTermId: data.schoolSessionTermId,
      schoolClassId: data.schoolClassId,
      notes: data.notes,
      items: data.items.map((i) => ({
        schoolPaymentItemId: i.schoolPaymentItemId,
        amount: Number(i.amount.replace(/,/g, "")) || 0,
        paymentRequirement:
          i.paymentRequirement === "optional"
            ? PaymentRequirement.Optional
            : PaymentRequirement.Mandatory,
        isApplicableToFutureStudents: i.applicableToNewStudent,
        subscriptionDueDate: i.subscriptionDueDate
          ? new Date(i.subscriptionDueDate).toISOString()
          : undefined,
      })),
    })
    reset()
    clearDraft()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-full overflow-y-auto rounded-2xl p-6 sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Create Payment Type
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Assign one or more fees to a class for a term.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {hasDraft && draftSavedAt && (
          <FormDraftBanner
            savedAt={draftSavedAt}
            onRestore={handleRestoreDraft}
            onDiscard={discardDraft}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-6">
          {/* Academic Context */}
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
              Academic Context
            </p>

            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Controller
                  name="schoolSessionId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Session</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v)
                          setValue("schoolSessionTermId", "")
                        }}
                        disabled={sessionsLoading}
                      >
                        <SelectTrigger className="border-gray-200 py-5">
                          <SelectValue
                            placeholder={
                              sessionsLoading
                                ? "Loading sessions…"
                                : "Select session"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {sessions.map((s) => (
                            <SelectItem key={s.Id} value={s.Id}>
                              {s.SessionName}
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

                <Controller
                  name="schoolSessionTermId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Term</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!selectedSessionId}
                      >
                        <SelectTrigger className="border-gray-200 py-5">
                          <SelectValue
                            placeholder={
                              selectedSessionId
                                ? "Select term"
                                : "Select a session first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {termOptions.map((t) => (
                            <SelectItem key={t.Id} value={t.Id}>
                              {t.TermName}
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

                <Controller
                  name="schoolClassId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Class</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={classesLoading}
                      >
                        <SelectTrigger className="border-gray-200 py-5">
                          <SelectValue
                            placeholder={
                              classesLoading
                                ? "Loading classes…"
                                : "Select class"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {classItems.map((c) => (
                            <SelectItem key={c.Id} value={c.Id}>
                              {c.ClsName}
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
              </div>
            </FieldGroup>
          </div>

          {/* Fees — only once a class is picked */}
          {selectedClassId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                  Fees
                </p>
                <button
                  type="button"
                  onClick={() => append(emptyItem())}
                  className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                >
                  <Plus className="size-3.5" />
                  Add another
                </button>
              </div>

              {paymentItems.length === 0 ? (
                <p className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-xs text-muted-foreground">
                  No payment items yet. Go to{" "}
                  <span className="font-medium text-blue-600">
                    Payment Items
                  </span>{" "}
                  page to create items like Uniform, Stationeries, etc.
                </p>
              ) : (
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-1">
                      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2">
                        <div className="flex-1">
                          <Controller
                            name={`items.${index}.schoolPaymentItemId`}
                            control={control}
                            render={({ field: f }) => {
                              const selectedElsewhere = new Set(
                                (watchedItems ?? [])
                                  .filter((_, i) => i !== index)
                                  .map((i) => i?.schoolPaymentItemId)
                                  .filter(Boolean)
                              )
                              return (
                                <Select
                                  value={f.value}
                                  onValueChange={f.onChange}
                                >
                                  <SelectTrigger className="w-full border-0 bg-transparent py-4 shadow-none focus-visible:ring-0">
                                    <SelectValue placeholder="Select payment item" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {paymentItems.map((item) => (
                                      <SelectItem
                                        key={item.id}
                                        value={item.id}
                                        disabled={selectedElsewhere.has(
                                          item.id
                                        )}
                                      >
                                        {item.name}
                                        {selectedElsewhere.has(item.id) &&
                                          " (already added)"}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )
                            }}
                          />
                        </div>
                        <div className="relative w-40 shrink-0">
                          <span className="pointer-events-none absolute inset-y-0 left-3 flex min-w-5 items-center justify-center text-sm font-medium text-gray-500">
                            {currencySymbol}
                          </span>
                          <Input
                            type="number"
                            placeholder="0"
                            {...register(`items.${index}.amount`)}
                            className="border-0 bg-gray-50 py-4 pl-11 text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      {(errors.items?.[index]?.schoolPaymentItemId ||
                        errors.items?.[index]?.amount) && (
                        <p className="pl-1 text-xs text-red-500">
                          {errors.items?.[index]?.schoolPaymentItemId
                            ?.message ?? errors.items?.[index]?.amount?.message}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 px-1">
                        <Controller
                          name={`items.${index}.paymentRequirement`}
                          control={control}
                          render={({ field: f }) => (
                            <div className="flex overflow-hidden rounded-lg border border-gray-200">
                              {(["mandatory", "optional"] as const).map(
                                (val) => (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => f.onChange(val)}
                                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                                      f.value === val
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                                  >
                                    {val === "mandatory"
                                      ? "Mandatory"
                                      : "Optional"}
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        />

                        <Controller
                          name={`items.${index}.applicableToNewStudent`}
                          control={control}
                          render={({ field: f }) => (
                            <label className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Checkbox
                                checked={f.value}
                                onCheckedChange={(v) => f.onChange(!!v)}
                              />
                              Applicable to new student
                            </label>
                          )}
                        />
                      </div>

                      {watchedItems?.[index]?.paymentRequirement ===
                        "optional" && (
                        <div className="space-y-1.5 rounded-lg bg-amber-50/60 px-3 py-2">
                          <div className="flex-1 space-y-1">
                            <label className="text-[11px] text-gray-500">
                              Payment due date
                            </label>
                            <Input
                              type="date"
                              {...register(
                                `items.${index}.subscriptionDueDate`
                              )}
                              className="h-8 w-full rounded-lg text-xs"
                            />
                          </div>
                          <p className="text-[11px] text-amber-700">
                            Parents can opt into this fee up to this date. Once
                            opted in it&apos;s added to their total and
                            can&apos;t be self-reversed — only an admin can undo
                            it.
                          </p>
                          {errors.items?.[index]?.subscriptionDueDate && (
                            <p className="text-[11px] text-red-500">
                              {
                                errors.items[index]?.subscriptionDueDate
                                  ?.message
                              }
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {errors.items?.message && (
                    <p className="text-xs text-red-500">
                      {errors.items.message}
                    </p>
                  )}

                  <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-2.5">
                    <span className="text-xs font-medium text-blue-700">
                      Total
                    </span>
                    <span className="text-xs font-bold text-blue-700">
                      {formatMoney(itemsTotal)}
                    </span>
                  </div>
                </div>
              )}

              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>
                      Notes
                      <span className="ml-1 font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </FieldLabel>
                    <Input
                      {...field}
                      placeholder="Any additional notes"
                      className="border-gray-200 py-5"
                    />
                  </Field>
                )}
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl py-5"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isPending}
              className="flex-1 rounded-xl bg-blue-600 py-5 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Save Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
