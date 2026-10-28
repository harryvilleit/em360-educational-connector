import { openExternalPage } from "@/lib/portal-navigation"
import { createSubscriptionBillingPortalApi, getStudentAdditionQuoteApi, purchaseStudentPlacesApi } from "@/api/subscriptions.api"
import { useState } from "react"
import { AlertCircle, CheckCircle2, CreditCard, Users } from "lucide-react"
import type {
  StudentAdditionQuoteI,
  SchoolSubscriptionStatus,
  SubscriptionPlanI,
} from "@/api/subscriptions.api/types"
import SubscriptionPlanCard from "@/components/subscriptions/SubscriptionPlanCard"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useSchoolSubscription,
  useInitializeSchoolSubscriptionCheckout,
  useSelectSchoolSubscription,
  useSubscriptionPlans,
} from "@/hooks/subscriptions"
import { formatCurrency } from "@/utils/currency"
import SettingsCard from "./SettingsCard"
import { createPaymentIdempotencyKey } from "@/lib/paymentIntent"
import { toSafeExternalUrl } from "@/lib/safeExternalUrl"

const statusLabels: Record<SchoolSubscriptionStatus, string> = {
  PendingPayment: "Pending payment",
  Active: "Active",
  PastDue: "Past due",
  Cancelled: "Cancelled",
  Expired: "Expired",
}

function formatDate(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function UsageItem({
  label,
  current,
  limit,
}: {
  label: string
  current: number
  limit: number | null
}) {
  const percentage = limit ? Math.min(100, (current / limit) * 100) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="font-semibold text-gray-900">
          {current.toLocaleString()} / {limit?.toLocaleString() ?? "Unlimited"}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: limit ? String(percentage) + "%" : "8%" }}
        />
      </div>
    </div>
  )
}

export default function SubscriptionPlanSettings() {
  const [plansOpen, setPlansOpen] = useState(false)
  const [addedStudents, setAddedStudents] = useState(2)
  const [quote, setQuote] = useState<StudentAdditionQuoteI | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [additionKey, setAdditionKey] = useState("")
  const [quoteError, setQuoteError] = useState("")
  const [quoting, setQuoting] = useState(false)
  const [openingBilling, setOpeningBilling] = useState(false)
  const [billingError, setBillingError] = useState("")
  const schoolId = useSchoolId()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanI | null>(
    null
  )
  const {
    plans,
    isLoading: plansLoading,
    isError: plansError,
    refetch,
  } = useSubscriptionPlans(undefined, schoolId)
  const {
    overview,
    isLoading: overviewLoading,
    isError: overviewError,
    refetch: refetchOverview,
  } = useSchoolSubscription(schoolId)
  const { selectSubscriptionAsync, isPending } = useSelectSchoolSubscription()
  const { initializeCheckoutAsync, isPending: isStartingCheckout } =
    useInitializeSchoolSubscriptionCheckout()

  const current = overview?.currentSubscription ?? null
  const pending = overview?.pendingSelection ?? null
  const hasExistingBilling = !!current?.startedAtUtc && current.status !== "Cancelled"
  const selectionStale = !!pending && pending.billableUserCount !== overview?.currentStudents
  const loading = plansLoading || overviewLoading
  const hasError = plansError || overviewError

  async function manageExistingPayment() {
    setOpeningBilling(true)
    setBillingError("")
    try {
      const result = await createSubscriptionBillingPortalApi(schoolId)
      if (!result.isSuccess) throw new Error(result.message || "Payment management is unavailable.")
      const url = toSafeExternalUrl(result.value.url)
      if (!url) throw new Error("The provider returned an invalid payment management link.")
      openExternalPage(url)
    } catch (error) {
      setBillingError(error instanceof Error ? error.message : "Could not open payment management.")
    } finally {
      setOpeningBilling(false)
    }
  }

  async function previewStudentCharge() {
    setQuote(null)
    setQuoteError("")
    setQuoting(true)
    try {
      const result = await getStudentAdditionQuoteApi(schoolId, addedStudents)
      if (!result.isSuccess) throw new Error(result.message || "Could not calculate the charge.")
      setQuote(result.value)
      setAdditionKey(createPaymentIdempotencyKey("student-addition"))
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "Could not calculate the charge.")
    } finally {
      setQuoting(false)
    }
  }

  async function purchasePlaces() {
    if (!quote || purchasing || !additionKey) return
    setPurchasing(true)
    setQuoteError("")
    try {
      const result = await purchaseStudentPlacesApi(schoolId, quote, additionKey)
      if (!result.isSuccess) throw new Error(result.message || "Could not start payment.")
      const url = toSafeExternalUrl(result.value.checkoutUrl)
      if (!url) throw new Error("The provider returned an invalid checkout URL.")
      openExternalPage(url)
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "Payment could not be started.")
      await refetchOverview()
    } finally {
      setPurchasing(false)
    }
  }

  async function confirmSelection() {
    if (!selectedPlan || !schoolId) return
    const plan = selectedPlan
    setSelectedPlan(null)
    try {
      await selectSubscriptionAsync({
        schoolId,
        planCode: plan.code,
      })
    } catch {
      // The mutation displays the API error; keep the event handler settled.
    }
  }

  async function continueToPayment() {
    if (!pending || !schoolId) return
    try {
      const response = await initializeCheckoutAsync({
        schoolId,
        subscriptionId: pending.id,
        idempotencyKey: createPaymentIdempotencyKey("school-subscription"),
      })
      const checkoutUrl = toSafeExternalUrl(response.value.checkoutUrl)
      if (!checkoutUrl) {
        throw new Error("The payment provider returned an invalid checkout URL.")
      }
      openExternalPage(checkoutUrl)
    } catch {
      // Mutation/API error is displayed by the hook.
    }
  }

  return (
    <SettingsCard
      title="School Subscription"
      description="Choose one monthly plan. Only active students are billable; staff accounts are included."
    >
      {loading ? (
        <div className="space-y-5">
          <Skeleton className="h-28 rounded-2xl" />
          <div className="grid gap-4 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-120 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : hasError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <div className="flex gap-3">
            <AlertCircle className="size-5 shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                Subscription details could not be loaded
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Check the API deployment and try again.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => void Promise.all([refetch(), refetchOverview()])}
              >
                Try again
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {hasExistingBilling && overview?.canManageSubscription && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold">Manage your existing subscription payment</h3>
              <p className="mt-1 text-sm text-gray-700">
                Update your payment method with the provider. For unpaid invoices, use the
                provider's available payment options or contact EM360 support. Access is
                restored after a successful payment is verified.
              </p>
              <Button type="button" className="mt-3" disabled={openingBilling}
                onClick={() => void manageExistingPayment()}>
                {openingBilling ? "Opening…" : "Manage payment"}
              </Button>
              {billingError && <p role="alert" className="mt-2 text-sm text-red-700">{billingError}</p>}
            </section>
          )}
          {overview?.access?.accessEndsAtUtc && (
            <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-950">
              {overview.access.reason === "Trial" ? "Full-feature trial ends" :
                overview.access.reason === "RenewalGrace" ? "Payment grace ends" : "Access deadline"}
              {" "}{formatDate(overview.access.accessEndsAtUtc)}.
              {overview.access.reason === "RenewalGrace" && " Please arrange payment before this date."}
            </p>
          )}
          {current?.status === "Active" && overview?.canManageSubscription && (
            <section className="space-y-3 rounded-xl border p-4" aria-label="Purchase student places">
              <h3 className="font-semibold">Add student places</h3>
              <p className="text-sm text-gray-600">
                Uses the remaining calendar days in your existing billing period.
                Preview the charge, then pay to make additional places available. Your monthly payment will increase from the next renewal.
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <label className="grid gap-1 text-sm">
                  Additional students
                  <input type="number" min={1} max={100000} step={1}
                    className="w-36 rounded-lg border p-2"
                    value={addedStudents}
                    onChange={(event) => { setAddedStudents(Number(event.target.value)); setQuote(null) }} />
                </label>
                <Button type="button" onClick={() => void previewStudentCharge()}
                  disabled={purchasing || quoting || !Number.isInteger(addedStudents) || addedStudents < 1}>
                  {quoting ? "Calculating…" : "Preview charge"}
                </Button>
              </div>
              {quoteError && <p role="alert" className="text-sm text-red-700">{quoteError}</p>}
              {quote && <p role="status" className="text-sm leading-6">
                {quote.usedDays} of {quote.periodDays} days used; {quote.remainingDays} days remaining.
                {" "}Additional charge: <strong>{formatCurrency(quote.amountDue, quote.currency)}</strong>.
                {" "}Next full monthly total: <strong>{formatCurrency(quote.nextMonthlyTotal, quote.currency)}</strong>.
                {" "}Renewal date stays {formatDate(quote.periodEndUtc)}.
              </p>}
              {quote && (
                <Button type="button" disabled={purchasing || quote.amountDue <= 0}
                  onClick={() => void purchasePlaces()}>
                  {purchasing ? "Opening payment…" : `Pay ${formatCurrency(quote.amountDue, quote.currency)} for ${quote.addedStudents} places`}
                </Button>
              )}
              <p className="text-xs text-gray-500">
                Places become available after payment and the monthly billing update are confirmed.
                Purchased places remain on the subscription until its quantity is changed; removing a student does not issue an automatic refund.
              </p>
            </section>
          )}
          {overview?.canManageSubscription && Boolean(overview.studentAdditions?.length) && (
            <section className="space-y-3 rounded-xl border p-4" aria-label="Student addition payments">
              <h3 className="font-semibold">Recent student additions</h3>
              <Button type="button" variant="outline" onClick={() => void refetchOverview()}>
                Refresh payment status
              </Button>
              {overview.studentAdditions.map((payment) => (
                <div key={payment.paymentReference} className="rounded-lg bg-gray-50 p-3 text-sm">
                  <p className="font-medium">{payment.addedStudents} places · {formatCurrency(payment.amount, payment.currency)}</p>
                  <p>{payment.state === "Applied" ? "Places available" :
                    payment.state === "SyncPending" ? "Paid · updating monthly billing" :
                    payment.state === "ReviewRequired" ? "EM360 review required" :
                    payment.state === "ClosedUnpaid" ? "Unpaid checkout closed" : "Awaiting payment confirmation"}</p>
                  {payment.message && <p className="mt-1 text-amber-800">{payment.message}</p>}
                  <p className="mt-1 break-all text-xs text-gray-500">Reference: {payment.paymentReference}</p>
                  {payment.checkoutUrl && toSafeExternalUrl(payment.checkoutUrl) && (
                    <a className="mt-2 inline-block font-medium text-blue-700 underline"
                      href={toSafeExternalUrl(payment.checkoutUrl)!}>Resume existing payment</a>
                  )}
                </div>
              ))}
            </section>
          )}
          {current ? (
            <div
              className={
                current.status === "Active"
                  ? "rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5"
                  : "rounded-2xl border border-amber-200 bg-amber-50/70 p-5"
              }
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-3">
                  <span
                    className={
                      current.status === "Active"
                        ? "flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100"
                        : "flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100"
                    }
                  >
                    {current.status === "Active" ? (
                      <CheckCircle2 className="size-5 text-emerald-700" />
                    ) : (
                      <AlertCircle className="size-5 text-amber-700" />
                    )}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-gray-950">
                        {current.plan.name}
                      </h3>
                      <Badge
                        className={
                          current.status === "Active"
                            ? "border-0 bg-emerald-600 text-white"
                            : "border-0 bg-amber-600 text-white"
                        }
                      >
                        {statusLabels[current.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatCurrency(current.unitPrice, current.currency, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      × {current.billableUserCount.toLocaleString()} active
                      students ={" "}
                      {formatCurrency(current.monthlyTotal, current.currency, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      /month
                      {formatDate(current.currentPeriodEndUtc)
                        ? " · Current period ends " +
                          formatDate(current.currentPeriodEndUtc)
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="grid min-w-64 gap-3">
                  <UsageItem
                    label="Students"
                    current={overview?.currentStudents ?? 0}
                    limit={current.plan.maxStudents}
                  />
                  <UsageItem
                    label="Staff"
                    current={overview?.currentStaff ?? 0}
                    limit={current.plan.maxStaff}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <CreditCard className="size-5 shrink-0 text-blue-600" />
              <div className="flex-1">
                <p className="font-semibold text-gray-950">
                  No active subscription yet
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Open available plans to compare options. Access is activated only after payment is
                  confirmed.
                </p>
              </div>
            </div>
          )}

          {pending && (
            <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <AlertCircle className="size-5 shrink-0 text-amber-700" />
              <div>
                <p className="font-semibold text-gray-950">
                  {pending.plan.name} · {statusLabels[pending.status]}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {formatCurrency(pending.unitPrice, pending.currency, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  × {pending.billableUserCount.toLocaleString()} active students
                  ={" "}
                  {formatCurrency(pending.monthlyTotal, pending.currency, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  /month. Complete payment to activate it.
                </p>
                {overview?.canManageSubscription && (
                  <Button
                    type="button"
                    className="mt-4"
                    disabled={isStartingCheckout || pending.billableUserCount < 1}
                    onClick={() => void continueToPayment()}
                  >
                    {isStartingCheckout ? "Opening secure checkout..." : "Continue to payment"}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-gray-950">Find the right school plan</h3>
              <p className="mt-1 text-sm text-gray-600">Compare all plans in a full-screen view.</p>
            </div>
            <Button type="button" onClick={() => setPlansOpen(true)} className="shrink-0 rounded-xl">
              Available plans
            </Button>
          </div>
          <Dialog open={plansOpen} onOpenChange={setPlansOpen}>
            <DialogContent className="flex h-dvh max-h-dvh w-screen max-w-none flex-col gap-0 rounded-none p-0 sm:max-w-none">
              <DialogHeader className="shrink-0 border-b bg-white px-5 py-5 pr-14 md:px-10">
                <DialogTitle className="text-2xl font-bold">Choose your school plan</DialogTitle>
                <DialogDescription>
                  Compare monthly plans. Staff are included; only active students are billable.
                </DialogDescription>
                <p className="text-sm text-gray-500"><Users className="mr-1 inline size-4" />
                  {overview?.currentStudents ?? 0} students · {overview?.currentStaff ?? 0} staff
                </p>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-5 py-8 md:px-10">
                <div className="mx-auto max-w-7xl space-y-5">
                  <p className="text-sm text-gray-600">Cloudflare video storage is purchased separately in minutes from Billing & Plan.</p>
          {!overview?.canManageSubscription && (
            <p className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-600">
              Only the school owner can select a plan or make a subscription payment.
            </p>
          )}

          {plans.length === 0 ? (
            <p className="rounded-xl bg-gray-100 px-4 py-6 text-center text-sm text-gray-600">
              No active subscription plans are configured.
            </p>
          ) : (
            <div className="grid items-stretch gap-6 lg:grid-cols-3">
              {plans.map((plan) => {
                const isCurrent = hasExistingBilling && current?.plan.code === plan.code
                const isSelected = pending?.plan.code === plan.code
                return (
                  <SubscriptionPlanCard
                    key={plan.id}
                    plan={plan}
                    current={isCurrent}
                    pending={isSelected}
                    action={
                      <Button
                        type="button"
                        variant={plan.isRecommended ? "primary" : "outline"}
                        className="h-10 w-full rounded-xl"
                        disabled={
                          isPending ||
                          !overview?.canManageSubscription ||
                          hasExistingBilling ||
                          (isSelected && !selectionStale)
                        }
                        onClick={() => { setPlansOpen(false); setSelectedPlan(plan) }}
                      >
                        {isCurrent
                          ? "Current plan"
                          : isSelected
                            ? selectionStale ? "Refresh student count" : "Awaiting payment"
                            : "Select " + plan.name}
                      </Button>
                    }
                  />
                )
              })}
            </div>
          )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <AlertDialog
        open={!!selectedPlan}
        onOpenChange={(open) => !open && setSelectedPlan(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Select the {selectedPlan?.name} plan?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This creates a pending monthly subscription for{" "}
              {overview?.currentStudents ?? 0} active students at{" "}
              {selectedPlan
                ? formatCurrency(
                    selectedPlan.pricePerUserPerMonth,
                    selectedPlan.currency,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )
                : ""}
              /student/month. It will not become active until payment is
              confirmed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep current plan</AlertDialogCancel>
            <AlertDialogAction
              variant="primary"
              onClick={() => void confirmSelection()}
            >
              Confirm selection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsCard>
  )
}
