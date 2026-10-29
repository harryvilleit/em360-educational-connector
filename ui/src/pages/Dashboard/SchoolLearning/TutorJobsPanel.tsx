import { useId, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BriefcaseBusiness, Loader2, MapPin, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  closeTutorJobApi,
  createTutorJobApi,
  getSchoolTutorJobsApi,
  selectTutorJobApplicationApi,
} from "@/api/schoolLearning.api"
import { useAuthStore } from "@/store/auth.store"
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

const key = (schoolId: string, viewerId?: string) => ["school-tutor-jobs", schoolId, viewerId]

export function TutorJobsPanel({ schoolId, currency }: { schoolId: string; currency: string }) {
  const client = useQueryClient()
  const viewerId = useAuthStore((state) => state.user?.id)
  const [open, setOpen] = useState(false)
  const query = useQuery({
    queryKey: key(schoolId, viewerId),
    queryFn: () => getSchoolTutorJobsApi(schoolId),
    enabled: Boolean(schoolId),
  })
  const refresh = () => client.invalidateQueries({ queryKey: ["school-tutor-jobs", schoolId] })
  const select = useMutation({
    mutationFn: ({
      jobId,
      applicationId,
    }: {
      jobId: string
      applicationId: string
    }) => selectTutorJobApplicationApi(schoolId, jobId, applicationId),
    onSuccess: ({ message }) => {
      toast.success(message || "Tutor selected")
      void refresh()
      void client.invalidateQueries({ queryKey: ["school-learning", schoolId] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
  const close = useMutation({
    mutationFn: (jobId: string) => closeTutorJobApi(schoolId, jobId),
    onSuccess: () => {
      toast.success("Vacancy closed")
      void refresh()
    },
    onError: (error: Error) => toast.error(error.message),
  })
  if (query.isPending)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Tutor vacancies</h2>
          <p className="text-sm text-muted-foreground">
            Publish hourly or monthly roles on Tutor opportunities for approved tutors to apply. Selecting a tutor adds them to your school's external tutors and makes them available for a contract.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Post tutor vacancy
        </Button>
      </div>
      {query.isError ? (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          {(query.error as Error).message}
        </p>
      ) : query.data?.value.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          <BriefcaseBusiness className="mx-auto mb-2 size-8" />
          No tutor vacancies have been posted.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {query.data?.value.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatCurrency(job.rateAmount, job.currency)}{" "}
                      {job.paymentStructure === "Hourly"
                        ? "per hour"
                        : "per month"}{" "}
                      · {job.expectedHoursPerWeek} hrs/week
                    </p>
                  </div>
                  <Badge variant="outline">{job.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {job.description}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4" />
                  {job.workMode === "FullyRemote"
                    ? "Fully remote"
                    : job.hybridLocation}
                </p>
                {job.status === "Open" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={close.isPending}
                    onClick={() => close.mutate(job.id)}
                  >
                    Close vacancy
                  </Button>
                )}
                <div className="space-y-3">
                  <p className="font-medium">
                    Applications ({job.applications.length})
                  </p>
                  {job.applications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No applications yet.
                    </p>
                  ) : (
                    job.applications.map((application) => (
                      <div
                        key={application.id}
                        className="rounded-lg border p-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">
                              {application.tutorName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(
                                application.proposedRateAmount,
                                job.currency
                              )}{" "}
                              · {application.availableHoursPerWeek} hrs/week ·
                              available{" "}
                              {new Date(
                                application.availableFromUtc
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {application.status}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm">
                          {application.coverLetter}
                        </p>
                        {application.relevantExperience && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            <strong>Experience:</strong>{" "}
                            {application.relevantExperience}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-3 text-sm">
                          <a
                            className="text-blue-600 underline"
                            href={application.cvUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View CV
                          </a>
                          {application.portfolioUrl && (
                            <a
                              className="text-blue-600 underline"
                              href={application.portfolioUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Portfolio
                            </a>
                          )}
                          {application.youtubeIntroUrl && (
                            <a
                              className="text-blue-600 underline"
                              href={application.youtubeIntroUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Intro video
                            </a>
                          )}
                        </div>
                        {job.status === "Open" &&
                          (application.status === "Submitted" || application.status === "Shortlisted") && (
                            <Button
                              className="mt-3"
                              size="sm"
                              disabled={select.isPending}
                              onClick={() =>
                                select.mutate({
                                  jobId: job.id,
                                  applicationId: application.id,
                                })
                              }
                            >
                              Select tutor
                            </Button>
                          )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <CreateTutorJobDialog
        open={open}
        onOpenChange={setOpen}
        schoolId={schoolId}
        currency={currency}
        onCreated={refresh}
      />
    </div>
  )
}

function CreateTutorJobDialog({
  open,
  onOpenChange,
  schoolId,
  currency,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string
  currency: string
  onCreated: () => unknown
}) {
  const formId = useId()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [paymentStructure, setPaymentStructure] = useState<
    "Hourly" | "Monthly"
  >("Hourly")
  const [rate, setRate] = useState("")
  const [hours, setHours] = useState("")
  const [maximumHours, setMaximumHours] = useState("")
  const [workMode, setWorkMode] = useState<"FullyRemote" | "Hybrid">(
    "FullyRemote"
  )
  const [location, setLocation] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [experienceYears, setExperienceYears] = useState("")
  const [qualifications, setQualifications] = useState("")
  const mutation = useMutation({
    mutationFn: () =>
      createTutorJobApi(schoolId, {
        title,
        description,
        paymentStructure,
        rateAmount: Number(rate),
        currency,
        expectedHoursPerWeek: Number(hours),
        maximumTotalHours: maximumHours ? Number(maximumHours) : undefined,
        workMode,
        hybridLocation: workMode === "Hybrid" ? location : undefined,
        startDateUtc: new Date(`${startDate}T00:00:00Z`).toISOString(),
        endDateUtc: endDate
          ? new Date(`${endDate}T23:59:59Z`).toISOString()
          : undefined,
        minimumExperienceYears: experienceYears
          ? Number(experienceYears)
          : undefined,
        requiredQualifications: qualifications || undefined,
      }),
    onSuccess: () => {
      toast.success("Tutor vacancy published")
      void onCreated()
      onOpenChange(false)
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Post a tutor vacancy</DialogTitle>
          <DialogDescription>
            The role will be visible publicly, but only approved platform tutors
            can apply.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`${formId}-title`}>Job title</Label>
            <Input id={`${formId}-title`} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`${formId}-description`}>Description of job tasks</Label>
            <Textarea id={`${formId}-description`}
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-payment`}>Payment structure</Label>
            <Select
              value={paymentStructure}
              onValueChange={(value: "Hourly" | "Monthly") =>
                setPaymentStructure(value)
              }
            >
              <SelectTrigger id={`${formId}-payment`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hourly">Hourly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-rate`}>{paymentStructure} rate amount</Label>
            <Input id={`${formId}-rate`}
              type="number"
              min="0.01"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-currency`}>Currency</Label>
            <Input id={`${formId}-currency`} value={currency} readOnly aria-readonly="true" className="bg-slate-50" />
            <p className="text-xs text-muted-foreground">Your school base currency</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-hours`}>Expected hours per week</Label>
            <Input id={`${formId}-hours`}
              type="number"
              min="1"
              max="168"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-maximum`}>Maximum total hours (optional)</Label>
            <Input id={`${formId}-maximum`}
              type="number"
              min="1"
              value={maximumHours}
              onChange={(e) => setMaximumHours(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-mode`}>Work mode</Label>
            <Select
              value={workMode}
              onValueChange={(value: "FullyRemote" | "Hybrid") =>
                setWorkMode(value)
              }
            >
              <SelectTrigger id={`${formId}-mode`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FullyRemote">Fully remote</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {workMode === "Hybrid" && (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`${formId}-location`}>Hybrid work location</Label>
              <Input id={`${formId}-location`}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor={`${formId}-start`}>Start date</Label>
            <Input id={`${formId}-start`}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-end`}>End date (optional)</Label>
            <Input id={`${formId}-end`}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${formId}-experience`}>Minimum experience in years</Label>
            <Input id={`${formId}-experience`}
              type="number"
              min="0"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`${formId}-qualifications`}>Required qualifications (optional)</Label>
            <Textarea id={`${formId}-qualifications`}
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={
              mutation.isPending ||
              title.trim().length < 3 ||
              description.trim().length < 30 ||
              !rate ||
              !hours ||
              !startDate ||
              (workMode === "Hybrid" && !location.trim())
            }
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Publishing…
              </>
            ) : (
              "Publish vacancy"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
