// WordPress version: the loading state is announced to screen readers.
import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Loader2, Trash2 } from "lucide-react"
import { Controller, useForm, useFieldArray, useWatch } from "react-hook-form"
import {
  useGetSchoolPaymentStructureDetails,
  useUpdateSchoolPaymentStructure,
} from "@/hooks/feeManagement"
import {
  PaymentRequirement,
  type SchoolPaymentStructureI,
} from "@/api/feeManagement.api/types"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface FormValues {
  items: {
    schoolPaymentItemId: string
    label: string
    amount: string
    paymentRequirement: PaymentRequirement
    isApplicableToFutureStudents: boolean
    subscriptionDueDate?: string
  }[]
}

function toDateInput(value?: string) {
  return value ? value.slice(0, 10) : ""
}

interface Props {
  open: boolean
  onClose: () => void
  paymentType: SchoolPaymentStructureI | null
}

export default function EditPaymentTypeModal({
  open,
  onClose,
  paymentType,
}: Props) {
  const { currencySymbol, formatMoney } = useSchoolMoney()
  const { paymentStructure, isLoading } = useGetSchoolPaymentStructureDetails(
    open ? (paymentType?.id ?? "") : ""
  )
  const { updateSchoolPaymentStructureAsync, isPending } =
    useUpdateSchoolPaymentStructure()
  const [done, setDone] = useState(false)

  const { handleSubmit, control, register, reset } = useForm<FormValues>({
    defaultValues: { items: [] },
  })

  const { fields, remove } = useFieldArray({
    control,
    name: "items",
  })

  // Sync form once structure details load — fixes the stale data bug
  useEffect(() => {
    if (paymentStructure) {
      reset({
        items: [
          ...(paymentStructure.compulsoryFees ?? []).map((i) => ({
            ...i,
            paymentRequirement: PaymentRequirement.Mandatory,
          })),
          ...(paymentStructure.optionalFees ?? []).map((i) => ({
            ...i,
            paymentRequirement: PaymentRequirement.Optional,
          })),
        ].map((i) => ({
          schoolPaymentItemId: i.paymentItemId,
          label: i.paymentItemName,
          amount: String(i.amount),
          paymentRequirement: i.paymentRequirement,
          isApplicableToFutureStudents: i.isApplicableToFutureStudents ?? false,
          subscriptionDueDate: toDateInput(i.subscriptionDueDate),
        })),
      })
    }
  }, [paymentStructure, reset])

  const watchedItems = useWatch({ control, name: "items" })
  const watchedAll = useWatch({ control })

  // Only key on the record once its details have actually loaded — the form
  // starts with `items: []` and is reset() to the real values asynchronously
  // (see effect above), so keying by paymentType.id from the first render
  // would let useFormDraft capture that empty pre-load state as its baseline
  // and then "autosave" the just-loaded data as a fake draft.
  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<FormValues>({
    formKey: paymentStructure
      ? `fee-payment-structure-edit-${paymentStructure.id}`
      : "fee-payment-structure-edit-pending",
    values: watchedAll as FormValues,
    enabled: open,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    reset(draftValues)
    acknowledgeDraft()
  }

  const feesTotal = (watchedItems ?? []).reduce(
    (sum, f) => sum + (Number((f?.amount ?? "").replace(/,/g, "")) || 0),
    0
  )

  const onSubmit = async (data: FormValues) => {
    if (!paymentStructure) return
    await updateSchoolPaymentStructureAsync({
      id: paymentStructure.id,
      notes: paymentStructure.notes,
      items: data.items.map((i) => ({
        schoolPaymentItemId: i.schoolPaymentItemId,
        amount: Number(i.amount.replace(/,/g, "")) || 0,
        paymentRequirement: i.paymentRequirement,
        isApplicableToFutureStudents: i.isApplicableToFutureStudents,
        subscriptionDueDate: i.subscriptionDueDate
          ? new Date(i.subscriptionDueDate).toISOString()
          : undefined,
      })),
    })
    clearDraft()
    setDone(true)
  }

  const handleClose = () => {
    setDone(false)
    reset({ items: [] })
    onClose()
  }

  if (!paymentType) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-full overflow-y-auto rounded-2xl p-6 sm:max-w-2xl">
        {done ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="size-7 text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">
              Payment type updated successfully
            </p>
            <Button
              className="rounded-xl bg-blue-600 px-8 py-5 text-white hover:bg-blue-700"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        ) : isLoading || !paymentStructure ? (
          <div className="flex items-center justify-center py-16">
            <span className="sr-only">Loading payment type</span>
            <Loader2 className="size-6 animate-spin text-gray-400" aria-hidden="true" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900">
                    Edit Payment Type
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Update fee amounts for{" "}
                    <span className="font-medium text-gray-700">
                      {paymentStructure.schoolClassName}
                    </span>
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
              {/* Academic Context — locked, not editable */}
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                  Academic Context
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-gray-700">Session</p>
                    <p className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
                      {paymentStructure.schoolSessionName}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-gray-700">Term</p>
                    <p className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
                      {paymentStructure.schoolSessionTermName}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-gray-700">Class</p>
                    <p className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
                      {paymentStructure.schoolClassName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fee amount and optional-fee due date can be edited. */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                    Fees for {paymentStructure.schoolClassName}
                  </p>
                  {!paymentStructure.canDeleteItems && (
                    <p className="mt-1 text-xs text-amber-700">
                      Fee items cannot be deleted because a student has already
                      paid into this class.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="space-y-1.5 rounded-xl border border-gray-200 bg-white p-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-2 text-sm font-medium text-gray-700">
                          {field.label || "—"}
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
                        {paymentStructure.canDeleteItems && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            aria-label={`Delete ${field.label || "fee item"}`}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>

                      <Controller
                        name={`items.${index}.paymentRequirement`}
                        control={control}
                        render={({ field: requirementField }) => (
                          <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-2">
                            <span className="text-[11px] font-medium text-gray-500">
                              Fee type
                            </span>
                            <div className="flex overflow-hidden rounded-lg border border-gray-200">
                              {[
                                {
                                  value: PaymentRequirement.Mandatory,
                                  label: "Mandatory",
                                },
                                {
                                  value: PaymentRequirement.Optional,
                                  label: "Optional",
                                },
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  disabled={!paymentStructure.canDeleteItems}
                                  onClick={() =>
                                    requirementField.onChange(option.value)
                                  }
                                  className={`px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                    requirementField.value === option.value
                                      ? "bg-blue-600 text-white"
                                      : "bg-white text-gray-600 hover:bg-gray-50"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      />

                      {watchedItems?.[index]?.paymentRequirement ===
                        PaymentRequirement.Optional && (
                        <div className="grid gap-1 border-t border-amber-100 bg-amber-50/60 px-3 py-2 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div>
                            <p className="text-xs font-medium text-amber-900">
                              Optional fee due date
                            </p>
                            <p className="text-[11px] text-amber-700">
                              Parents can opt in until this date.
                            </p>
                          </div>
                          <Input
                            type="date"
                            required
                            {...register(`items.${index}.subscriptionDueDate`)}
                            className="h-9 w-full bg-white text-xs sm:w-40"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {fields.length === 0 && (
                    <p className="rounded-xl border border-dashed border-red-200 bg-red-50/50 px-4 py-3 text-xs text-red-700">
                      All fee items will be deleted when you save these changes.
                    </p>
                  )}

                  <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-2.5">
                    <span className="text-xs font-medium text-blue-700">
                      Total
                    </span>
                    <span className="text-xs font-bold text-blue-700">
                      {formatMoney(feesTotal)}
                    </span>
                  </div>
                </div>
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
                  Save Changes
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
