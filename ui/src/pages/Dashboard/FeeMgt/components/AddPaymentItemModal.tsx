import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  useGetSchoolPaymentItems,
  useAddSchoolPaymentItems,
  useGetEligibleStudents,
} from "@/hooks/feeManagement"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  PaymentRequirement,
  type SchoolPaymentStructureI,
} from "@/api/feeManagement.api/types"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

// applyTo enum: AllStudentsInClass = 1, SpecificStudents = 2
const APPLY_TO_ALL_STUDENTS = 1
const APPLY_TO_SPECIFIC_STUDENTS = 2

const PaymentItemSchema = z
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

const AddPaymentItemsSchema = z
  .object({
    applyToAll: z.boolean(),
    studentEnrollmentIds: z.array(z.string()),
    items: z
      .array(PaymentItemSchema)
      .min(1, { message: "Add at least one payment item" }),
  })
  .refine((data) => data.applyToAll || data.studentEnrollmentIds.length > 0, {
    message: "Select at least one student",
    path: ["studentEnrollmentIds"],
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>()
    data.items.forEach((item, index) => {
      if (!item.schoolPaymentItemId) return
      if (seen.has(item.schoolPaymentItemId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "This payment item is already added",
          path: ["items", index, "schoolPaymentItemId"],
        })
      }
      seen.add(item.schoolPaymentItemId)
    })
  })
type AddPaymentItemsInput = z.input<typeof AddPaymentItemsSchema>
type AddPaymentItemsOutput = z.output<typeof AddPaymentItemsSchema>

const emptyItem = () => ({
  schoolPaymentItemId: "",
  amount: "",
  paymentRequirement: "mandatory" as const,
  applicableToNewStudent: false,
  subscriptionDueDate: "",
})

interface Props {
  open: boolean
  onClose: () => void
  paymentType: SchoolPaymentStructureI | null
}

export default function AddPaymentItemModal({
  open,
  onClose,
  paymentType,
}: Props) {
  const schoolId = useSchoolId()
  const { currencySymbol } = useSchoolMoney()
  const { paymentItems } = useGetSchoolPaymentItems(schoolId)
  const { addSchoolPaymentItemsAsync, isPending } = useAddSchoolPaymentItems()

  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors },
  } = useForm<AddPaymentItemsInput, unknown, AddPaymentItemsOutput>({
    resolver: zodResolver(AddPaymentItemsSchema),
    defaultValues: {
      applyToAll: true,
      studentEnrollmentIds: [],
      items: [emptyItem()],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  const applyToAll = useWatch({ control, name: "applyToAll" })
  const watchedItems = useWatch({ control, name: "items" })
  const watchedAll = useWatch({ control })

  const { eligibleStudents, isLoading: studentsLoading } =
    useGetEligibleStudents(
      open && !applyToAll && paymentType ? paymentType.id : ""
    )

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<AddPaymentItemsInput>({
    formKey: `fee-payment-structure-add-item-${paymentType?.id ?? ""}`,
    values: watchedAll as AddPaymentItemsInput,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    reset(draftValues)
    acknowledgeDraft()
  }

  const handleClose = () => {
    reset({
      applyToAll: true,
      studentEnrollmentIds: [],
      items: [emptyItem()],
    })
    onClose()
  }

  const onSubmit = async (data: AddPaymentItemsOutput) => {
    if (!paymentType) return
    await addSchoolPaymentItemsAsync({
      schoolPaymentStructureId: paymentType.id,
      applyTo: data.applyToAll
        ? APPLY_TO_ALL_STUDENTS
        : APPLY_TO_SPECIFIC_STUDENTS,
      studentEnrollmentIds: data.applyToAll
        ? undefined
        : data.studentEnrollmentIds,
      paymentItems: data.items.map((i) => ({
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
      schoolId,
    })
    clearDraft()
    handleClose()
  }

  if (!paymentType) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-full overflow-y-auto rounded-2xl p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Add Payment Type
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add more fee items to{" "}
            <span className="font-medium text-gray-700">
              {paymentType.className}
            </span>{" "}
            — {paymentType.termName} · {paymentType.sessionName}
          </DialogDescription>
        </DialogHeader>

        {hasDraft && draftSavedAt && (
          <FormDraftBanner
            savedAt={draftSavedAt}
            onRestore={handleRestoreDraft}
            onDiscard={discardDraft}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
              New Fee Items
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
              <span className="font-medium text-blue-600">Payment Items</span>{" "}
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
                            <Select value={f.value} onValueChange={f.onChange}>
                              <SelectTrigger className="w-full border-0 bg-transparent py-4 shadow-none focus-visible:ring-0">
                                <SelectValue placeholder="Select payment item" />
                              </SelectTrigger>
                              <SelectContent>
                                {paymentItems.map((item) => (
                                  <SelectItem
                                    key={item.id}
                                    value={item.id}
                                    disabled={selectedElsewhere.has(item.id)}
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
                      {errors.items?.[index]?.schoolPaymentItemId?.message ??
                        errors.items?.[index]?.amount?.message}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 px-1">
                    <Controller
                      name={`items.${index}.paymentRequirement`}
                      control={control}
                      render={({ field: f }) => (
                        <div className="flex overflow-hidden rounded-lg border border-gray-200">
                          {(["mandatory", "optional"] as const).map((val) => (
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
                              {val === "mandatory" ? "Mandatory" : "Optional"}
                            </button>
                          ))}
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

                  {watchedItems?.[index]?.paymentRequirement === "optional" && (
                    <div className="space-y-1.5 rounded-lg bg-amber-50/60 px-3 py-2">
                      <div className="flex-1 space-y-1">
                        <label className="text-[11px] text-gray-500">
                          Payment due date
                        </label>
                        <Input
                          type="date"
                          {...register(`items.${index}.subscriptionDueDate`)}
                          className="h-8 w-full rounded-lg text-xs"
                        />
                      </div>
                      <p className="text-[11px] text-amber-700">
                        Parents can opt into this fee up to this date. Once
                        opted in it&apos;s added to their total and can&apos;t
                        be self-reversed — only an admin can undo it.
                      </p>
                      {errors.items?.[index]?.subscriptionDueDate && (
                        <p className="text-[11px] text-red-500">
                          {errors.items[index]?.subscriptionDueDate?.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {errors.items?.message && (
                <p className="text-xs text-red-500">{errors.items.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Controller
              name="applyToAll"
              control={control}
              render={({ field: f }) => (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <Checkbox
                    checked={f.value}
                    onCheckedChange={(v) => f.onChange(!!v)}
                  />
                  Applicable to all students
                </label>
              )}
            />

            {!applyToAll && (
              <Controller
                name="studentEnrollmentIds"
                control={control}
                render={({ field: f }) => (
                  <div className="space-y-1">
                    <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-2">
                      {studentsLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="size-5 animate-spin text-gray-400" />
                        </div>
                      ) : eligibleStudents.length === 0 ? (
                        <p className="px-2 py-3 text-xs text-muted-foreground">
                          No eligible students found for this class.
                        </p>
                      ) : (
                        eligibleStudents.map((s) => (
                          <label
                            key={s.studentEnrollmentId}
                            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50"
                          >
                            <Checkbox
                              checked={f.value.includes(s.studentEnrollmentId)}
                              onCheckedChange={(v) =>
                                f.onChange(
                                  v
                                    ? [...f.value, s.studentEnrollmentId]
                                    : f.value.filter(
                                        (id) => id !== s.studentEnrollmentId
                                      )
                                )
                              }
                            />
                            <span className="text-gray-700">{s.fullName}</span>
                            <span className="text-xs text-gray-400">
                              {s.admissionNumber}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                    {errors.studentEnrollmentIds && (
                      <p className="pl-1 text-xs text-red-500">
                        {errors.studentEnrollmentIds.message}
                      </p>
                    )}
                  </div>
                )}
              />
            )}
          </div>

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
              disabled={isPending}
              className="flex-1 rounded-xl bg-blue-600 py-5 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Add Payment Type
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
