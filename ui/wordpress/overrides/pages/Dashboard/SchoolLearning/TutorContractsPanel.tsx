// WordPress version: payment checkout opens in a new tab.
import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarDays, CreditCard, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  createTutorContractApi,
  fundTutorContractApi,
  getSchoolTutorContractsApi,
  getSchoolTutorJobsApi,
  reviewTutorWorkApi,
  type SchoolTutorInvitation,
  type TutorContract,
} from "@/api/schoolLearning.api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/utils/currency"
import { openCheckout } from "../../../../school-learning/checkout"

const contractsKey = (schoolId: string) => ["school-tutor-contracts", schoolId]

export function TutorContractsPanel({
  schoolId,
  currency,
  invitations,
}: {
  schoolId: string
  currency: string
  invitations: SchoolTutorInvitation[]
}) {
  const client = useQueryClient()
  const [open, setOpen] = useState(false)
  const contracts = useQuery({
    queryKey: contractsKey(schoolId),
    queryFn: () => getSchoolTutorContractsApi(schoolId),
    enabled: Boolean(schoolId),
  })
  const jobs = useQuery({
    queryKey: ["school-tutor-jobs", schoolId],
    queryFn: () => getSchoolTutorJobsApi(schoolId),
    enabled: Boolean(schoolId),
  })
  const refresh = () =>
    client.invalidateQueries({ queryKey: contractsKey(schoolId) })

  const tutorOptions = useMemo(() => {
    const options = invitations
      .filter((item) => item.status === "Accepted")
      .map((item) => ({
        key: `inv:${item.id}`,
        tutorId: item.tutorId,
        tutorName: item.tutorName || item.tutorEmail,
        invitationId: item.id,
      }))
    for (const job of jobs.data?.value ?? [])
      for (const application of job.applications.filter(
        (item) => item.status === "Accepted"
      ))
        options.push({
          key: `job:${job.id}`,
          tutorId: application.tutorId,
          tutorName: application.tutorName,
          tutorJobRequestId: job.id,
        } as (typeof options)[number] & { tutorJobRequestId: string })
    return options.filter(
      (item, index, all) =>
        all.findIndex((candidate) => candidate.tutorId === item.tutorId) ===
        index
    )
  }, [invitations, jobs.data?.value])

  if (contracts.isPending)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="size-6 animate-spin text-blue-600" />
      </div>
    )
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Tutor contracts & payments</h2>
          <p className="text-sm text-muted-foreground">
            Agree pay terms, fund each period before work starts, and approve
            completed work.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          disabled={tutorOptions.length === 0}
        >
          <Plus className="size-4" />
          Create contract
        </Button>
      </div>
      {tutorOptions.length === 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Accept a tutor invitation or select an applicant from Tutor vacancies
          before creating a contract.
        </p>
      )}
      {contracts.isError ? (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          {(contracts.error as Error).message}
        </p>
      ) : (contracts.data?.value.length ?? 0) === 0 ? (
        <div className="rounded-xl border p-10 text-center text-muted-foreground">
          No tutor contracts yet.
        </div>
      ) : (
        contracts.data?.value.map((contract) => (
          <ContractCard
            key={contract.id}
            schoolId={schoolId}
            contract={contract}
            onChanged={refresh}
          />
        ))
      )}
      <CreateContractDialog
        open={open}
        onOpenChange={setOpen}
        schoolId={schoolId}
        currency={currency}
        tutors={tutorOptions}
        onCreated={refresh}
      />
    </div>
  )
}

function ContractCard({
  schoolId,
  contract,
  onChanged,
}: {
  schoolId: string
  contract: TutorContract
  onChanged: () => unknown
}) {
  const fund = useMutation({
    mutationFn: () => fundTutorContractApi(schoolId, contract.id),
    onSuccess: ({ value }) => {
      void onChanged()
      if (value.payPeriods.at(-1)?.checkoutUrl)
        openCheckout(value.payPeriods.at(-1)!.checkoutUrl!)
      else toast.success("Pay period funded")
    },
    onError: (error: Error) => toast.error(error.message),
  })
  const review = useMutation({
    mutationFn: ({
      periodId,
      approve,
    }: {
      periodId: string
      approve: boolean
    }) => {
      const feedback = approve
        ? undefined
        : (window.prompt("Tell the tutor what must be revised:") ?? undefined)
      if (!approve && !feedback?.trim())
        throw new Error("Feedback is required when requesting a revision.")
      return reviewTutorWorkApi(schoolId, contract.id, periodId, {
        approve,
        feedback,
      })
    },
    onSuccess: ({ message }) => {
      toast.success(message || "Work reviewed")
      void onChanged()
    },
    onError: (error: Error) => toast.error(error.message),
  })
  const payday =
    contract.paymentFrequency === "Weekly"
      ? [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ][contract.weeklyPayDay ?? 0]
      : `day ${contract.monthlyPayDay}`
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{contract.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {contract.tutorName} ·{" "}
              {formatCurrency(contract.rateAmount, contract.currency)}{" "}
              {contract.rateType === "Hourly" ? "per hour" : "per month"}
            </p>
          </div>
          <Badge variant="outline">{contract.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 text-blue-600" />
            {contract.paymentFrequency} · payday {payday} ·{" "}
            {contract.expectedHoursPerWeek} expected hrs/week
          </p>
          {contract.tutorAcceptedAtUtc ? (
            <Button disabled={fund.isPending} onClick={() => fund.mutate()}>
              {fund.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CreditCard className="size-4" />
              )}
              Fund next period
            </Button>
          ) : (
            <Badge variant="secondary">Waiting for tutor acceptance</Badge>
          )}
        </div>
        <div className="space-y-2">
          {contract.payPeriods.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground">
              No pay period has been funded.
            </p>
          ) : (
            contract.payPeriods.map((period) => (
              <div key={period.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {new Date(period.periodStartUtc).toLocaleDateString()} –{" "}
                      {new Date(period.periodEndUtc).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Payday {new Date(period.payDayUtc).toLocaleDateString()} ·{" "}
                      {formatCurrency(
                        period.approvedGrossAmount ??
                          period.expectedGrossAmount,
                        contract.currency
                      )}
                    </p>
                  </div>
                  <Badge variant="outline">{period.status}</Badge>
                </div>
                {period.workReport && (
                  <p className="mt-2 text-sm">{period.workReport}</p>
                )}
                {period.submittedHours != null && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted hours: {period.submittedHours}
                  </p>
                )}
                {period.schoolFeedback && (
                  <p className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-900">
                    Feedback: {period.schoolFeedback}
                  </p>
                )}
                {period.status === "Submitted" && (
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={review.isPending}
                      onClick={() =>
                        review.mutate({ periodId: period.id, approve: false })
                      }
                    >
                      Request revision
                    </Button>
                    <Button
                      size="sm"
                      disabled={review.isPending}
                      onClick={() =>
                        review.mutate({ periodId: period.id, approve: true })
                      }
                    >
                      {review.isPending && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      Approve work
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

type TutorOption = {
  key: string
  tutorId: string
  tutorName: string
  invitationId?: string
  tutorJobRequestId?: string
}
function CreateContractDialog({
  open,
  onOpenChange,
  schoolId,
  currency,
  tutors,
  onCreated,
}: {
  open: boolean
  onOpenChange: (value: boolean) => void
  schoolId: string
  currency: string
  tutors: TutorOption[]
  onCreated: () => unknown
}) {
  const [tutorKey, setTutorKey] = useState("")
  const [title, setTitle] = useState("")
  const [rateType, setRateType] = useState<"Hourly" | "Monthly">("Hourly")
  const [frequency, setFrequency] = useState<"Weekly" | "Monthly">("Weekly")
  const [rate, setRate] = useState("")
  const [hours, setHours] = useState("")
  const [payday, setPayday] = useState("5")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const mutation = useMutation({
    mutationFn: () => {
      const tutor = tutors.find((item) => item.key === tutorKey)!
      return createTutorContractApi(schoolId, {
        tutorId: tutor.tutorId,
        invitationId: tutor.invitationId,
        tutorJobRequestId: tutor.tutorJobRequestId,
        title,
        rateType,
        paymentFrequency: frequency,
        rateAmount: Number(rate),
        expectedHoursPerWeek: Number(hours),
        currency,
        weeklyPayDay: frequency === "Weekly" ? Number(payday) : undefined,
        monthlyPayDay: frequency === "Monthly" ? Number(payday) : undefined,
        startDateUtc: new Date(startDate).toISOString(),
        endDateUtc: endDate ? new Date(endDate).toISOString() : undefined,
      })
    },
    onSuccess: () => {
      toast.success("Contract sent to tutor")
      onOpenChange(false)
      void onCreated()
    },
    onError: (error: Error) => toast.error(error.message),
  })
  const valid =
    tutorKey &&
    title.trim().length >= 3 &&
    Number(rate) > 0 &&
    Number(hours) > 0 &&
    startDate &&
    Number(payday) >= (frequency === "Weekly" ? 0 : 1) &&
    Number(payday) <= (frequency === "Weekly" ? 6 : 28)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create tutor contract</DialogTitle>
          <DialogDescription>
            The tutor must accept these terms. The school then prepays every
            weekly or monthly work period.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Tutor</Label>
            <Select value={tutorKey} onValueChange={setTutorKey}>
              <SelectTrigger>
                <SelectValue placeholder="Select accepted tutor" />
              </SelectTrigger>
              <SelectContent>
                {tutors.map((item) => (
                  <SelectItem key={item.key} value={item.key}>
                    {item.tutorName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Contract title</Label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Rate type</Label>
            <Select
              value={rateType}
              onValueChange={(value: "Hourly" | "Monthly") =>
                setRateType(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hourly">Hourly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment frequency</Label>
            <Select
              value={frequency}
              onValueChange={(value: "Weekly" | "Monthly") => {
                setFrequency(value)
                setPayday(value === "Weekly" ? "5" : "28")
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rate amount</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input value={currency} readOnly aria-readonly="true" className="bg-slate-50" />
            <p className="text-xs text-muted-foreground">Your school base currency</p>
          </div>
          <div className="space-y-2">
            <Label>Expected hours/week</Label>
            <Input
              type="number"
              min="1"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>
              {frequency === "Weekly"
                ? "Payday (0 Sunday – 6 Saturday)"
                : "Monthly payday (1–28)"}
            </Label>
            <Input
              type="number"
              min={frequency === "Weekly" ? 0 : 1}
              max={frequency === "Weekly" ? 6 : 28}
              value={payday}
              onChange={(event) => setPayday(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Start date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>End date (optional)</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Send contract"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
