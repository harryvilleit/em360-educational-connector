// WordPress version: payment checkout opens in a new tab.
import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  BookOpen,
  CreditCard,
  FilePlus2,
  GraduationCap,
  Loader2,
  MailPlus,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useAuthStore } from "@/store/auth.store"
import {
  approveSchoolCourseOfferingApi,
  acceptSchoolCourseApplicationApi,
  createSchoolCourseRequestApi,
  getSchoolDirectoryApi,
  getSchoolLearningHubApi,
  initializeSchoolCourseCheckoutApi,
  initializeCourseRequestBalanceApi,
  inviteSchoolTutorApi,
  revokeSchoolTutorInvitationApi,
  reviewCourseRequestMilestoneApi,
  setSchoolCourseAudienceApi,
  type SchoolAudienceType,
  type SchoolCourseOffering,
  type SchoolCourseRequest,
  type SchoolDirectory,
  type SchoolTutorInvitation,
} from "@/api/schoolLearning.api"
import { formatCurrency } from "@/utils/currency"
import { uploadFileAndGetUrl } from "@/api/files.api"
import { TutorJobsPanel } from "@/pages/Dashboard/SchoolLearning/TutorJobsPanel"
import { TutorContractsPanel } from "@/pages/Dashboard/SchoolLearning/TutorContractsPanel"
import { openCheckout } from "../../../../school-learning/checkout"

const hubKey = (schoolId: string) => ["school-learning", schoolId]

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Active" || status === "Accepted" || status === "Paid"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Pending" ||
          status === "PendingApproval" ||
          status === "Approved"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-50 text-slate-600"
  return (
    <Badge variant="outline" className={tone}>
      {status.replace(/([A-Z])/g, " $1").trim()}
    </Badge>
  )
}

export default function SchoolLearningHubPage() {
  const schoolId = useSchoolId()
  const viewerId = useAuthStore((state) => state.token ? state.user?.id : null)
  const queryClient = useQueryClient()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [createRequestOpen, setCreateRequestOpen] = useState(false)
  const [audienceOffering, setAudienceOffering] =
    useState<SchoolCourseOffering | null>(null)

  const hubQuery = useQuery({
    queryKey: [...hubKey(schoolId), viewerId ?? "guest"],
    queryFn: () => getSchoolLearningHubApi(schoolId),
    enabled: Boolean(schoolId),
  })
  const hub = hubQuery.data?.value
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: hubKey(schoolId) })

  const approve = useMutation({
    mutationFn: (offeringId: string) =>
      approveSchoolCourseOfferingApi(schoolId, offeringId),
    onSuccess: () => {
      toast.success("Course approved")
      void refresh()
    },
    onError: (error: Error) => toast.error(error.message),
  })
  const checkout = useMutation({
    mutationFn: (offeringId: string) =>
      initializeSchoolCourseCheckoutApi(schoolId, offeringId),
    onSuccess: ({ value }) => {
      void refresh()
      if (value.checkoutUrl) openCheckout(value.checkoutUrl)
      else toast.success("Course access activated")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const activeOfferings =
    hub?.offerings.filter((item) => item.status === "Active") ?? []
  const totalSeats = activeOfferings.reduce(
    (sum, item) => sum + item.seatCount,
    0
  )
  const due =
    hub?.orders
      .filter((item) => item.status === "Pending")
      .reduce((sum, item) => sum + item.totalAmount, 0) ?? 0

  if (hubQuery.isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-blue-600" />
      </div>
    )
  }
  if (hubQuery.isError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6"
      >
        <p className="font-semibold text-red-900">
          School learning could not be loaded.
        </p>
        <p className="mt-1 text-sm text-red-700">
          {(hubQuery.error as Error).message}
        </p>
        <Button className="mt-4" onClick={() => void hubQuery.refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="External Tutor Learning"
        description="Invite independent tutors, assign their courses to school audiences, pay per user, and monitor progress."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateRequestOpen(true)}
            >
              <FilePlus2 className="size-4" />
              Create course brief
            </Button>
            <Button onClick={() => setInviteOpen(true)}>
              <MailPlus className="size-4" />
              Invite tutor
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Invited tutors"
          value={String(
            hub?.invitations.filter((item) => item.status === "Accepted")
              .length ?? 0
          )}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Active courses"
          value={String(activeOfferings.length)}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          label="Assigned users"
          value={String(totalSeats)}
          icon={GraduationCap}
          color="cyan"
        />
        <StatCard
          label="Pending payments"
          value={formatCurrency(due, hub?.currency)}
          icon={CreditCard}
          color="amber"
        />
      </div>

      <Tabs defaultValue="requests" className="gap-5">
        <TabsList variant="line" className="max-w-full overflow-x-auto">
          <TabsTrigger value="requests">Course briefs</TabsTrigger>
          <TabsTrigger value="jobs">Tutor vacancies</TabsTrigger>
          <TabsTrigger value="contracts">Contracts & payments</TabsTrigger>
          <TabsTrigger value="courses">Courses & audience</TabsTrigger>
          <TabsTrigger value="tutors">Tutors</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {(hub?.courseRequests.length ?? 0) === 0 ? (
            <EmptyState text="Create the course your school needs, then invite one or more platform tutors for it." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {hub?.courseRequests.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="border-b sm:grid-cols-[1fr_auto]">
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description || "No additional brief supplied."}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatCurrency(item.minimumBudget, item.currency)}–
                        {formatCurrency(item.maximumBudget, item.currency)} ·{" "}
                        {new Date(item.startDateUtc).toLocaleDateString()} to{" "}
                        {new Date(item.endDateUtc).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        Funded{" "}
                        {formatCurrency(item.fundedAmount, item.currency)} ·
                        Created{" "}
                        {new Date(item.dateCreatedUtc).toLocaleDateString()}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setInviteOpen(true)}
                      >
                        <MailPlus className="size-4" />
                        Invite tutor
                      </Button>
                    </div>
                    {item.status === "AwaitingDeposit" && item.checkoutUrl && (
                      <Button
                        size="sm"
                        onClick={() =>
                          openCheckout(item.checkoutUrl!)
                        }
                      >
                        Pay 50% deposit
                      </Button>
                    )}
                    {item.status === "AwaitingFullFunding" && (
                      <FundBalanceButton
                        schoolId={schoolId}
                        request={item}
                        onChanged={refresh}
                      />
                    )}
                    {item.applications
                      .filter(
                        (application) => application.status === "Submitted"
                      )
                      .map((application) => (
                        <div
                          key={application.id}
                          className="rounded-lg border p-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">
                                {application.tutorName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {application.paymentStructure} ·{" "}
                                {formatCurrency(
                                  application.proposedAmount,
                                  item.currency
                                )}
                              </p>
                            </div>
                            <AcceptApplicationButton
                              schoolId={schoolId}
                              requestId={item.id}
                              applicationId={application.id}
                              onChanged={refresh}
                            />
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {application.description}
                          </p>
                          <p className="mt-2 text-xs">
                            Tutor 60%:{" "}
                            {formatCurrency(
                              application.tutorShare,
                              item.currency
                            )}{" "}
                            · EM360 40%:{" "}
                            {formatCurrency(
                              application.platformShare,
                              item.currency
                            )}
                          </p>
                        </div>
                      ))}
                    {item.applications
                      .filter(
                        (application) => application.status === "Accepted"
                      )
                      .map((application) => (
                        <DeliveryReview
                          key={application.id}
                          schoolId={schoolId}
                          request={item}
                          application={application}
                          onChanged={refresh}
                        />
                      ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <TutorJobsPanel
            key={`${schoolId}:${viewerId ?? "guest"}`}
            schoolId={schoolId}
            currency={hub?.currency ?? "USD"}
          />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <TutorContractsPanel
            schoolId={schoolId}
            currency={hub?.currency ?? "USD"}
            invitations={hub?.invitations ?? []}
          />
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          {(hub?.offerings.length ?? 0) === 0 ? (
            <EmptyState text="No tutor course is assigned yet. Create a course brief, invite a tutor, then approve the tutor’s matching LMS course." />
          ) : (
            hub?.offerings.map((item) => (
              <Card key={item.id}>
                <CardHeader className="border-b sm:grid-cols-[1fr_auto]">
                  <div>
                    <CardTitle>{item.courseTitle}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.tutorName} ·{" "}
                      {item.origin === "TutorAssignment"
                        ? "Tutor proposed"
                        : "School requested"}
                    </p>
                    {item.schoolCourseRequestTitle && (
                      <p className="mt-1 text-xs text-blue-700">
                        Fulfils: {item.schoolCourseRequestTitle}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={item.status} />
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <Metric
                      label="Audience"
                      value={item.audienceSummary || "Not selected"}
                    />
                    <Metric label="Users" value={String(item.seatCount)} />
                    <Metric
                      label="Price per user"
                      value={formatCurrency(item.unitPrice, item.currency)}
                    />
                    <Metric
                      label="Total"
                      value={formatCurrency(item.totalAmount, item.currency)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.status === "PendingApproval" && (
                      <Button
                        size="sm"
                        onClick={() => approve.mutate(item.id)}
                        disabled={approve.isPending}
                      >
                        Approve
                      </Button>
                    )}
                    {(item.status === "Approved" ||
                      item.status === "Draft") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAudienceOffering(item)}
                      >
                        {item.seatCount ? "Edit audience" : "Select audience"}
                      </Button>
                    )}
                    {item.status === "Approved" && item.seatCount > 0 && !item.isOwner && (
                      <Button
                        size="sm"
                        onClick={() => checkout.mutate(item.id)}
                        disabled={checkout.isPending}
                      >
                        Pay {formatCurrency(item.totalAmount, item.currency)}
                      </Button>
                    )}
                  </div>
                  {item.discountPercent > 0 && (
                    <p className="text-xs text-emerald-700 sm:col-span-4">
                      Tutor discount: {item.discountPercent}% — list price{" "}
                      {formatCurrency(item.listUnitPrice, item.currency)} per
                      user.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="tutors" className="space-y-3">
          {(hub?.invitations.length ?? 0) === 0 ? (
            <EmptyState text="No tutor invitations yet." />
          ) : (
            <div className="overflow-hidden rounded-xl border bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="p-4">Tutor</th>
                    <th className="p-4">Requested course</th>
                    <th className="p-4">Sent</th>
                    <th className="p-4">Status</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {hub?.invitations.map((item) => (
                    <InvitationRow
                      key={item.id}
                      item={item}
                      schoolId={schoolId}
                      onChanged={refresh}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {(hub?.progress.length ?? 0) === 0 ? (
            <EmptyState text="Progress appears after a course has been paid and learners begin lessons or assessments." />
          ) : (
            hub?.progress.map((course) => (
              <Card key={course.offeringId}>
                <CardHeader className="border-b">
                  <CardTitle>{course.courseTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Tutor: {course.tutorName}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Metric
                      label="Assigned"
                      value={String(course.assignedUsers)}
                    />
                    <Metric
                      label="Started"
                      value={String(course.startedUsers)}
                    />
                    <Metric
                      label="Completed"
                      value={String(course.completedUsers)}
                    />
                    <Metric
                      label="Average progress"
                      value={`${course.averageProgressPercent}%`}
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs text-muted-foreground uppercase">
                        <tr>
                          <th className="py-2">Learner</th>
                          <th>Group</th>
                          <th>Lessons</th>
                          <th>Assessments</th>
                          <th>Average score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {course.learners.map((learner) => (
                          <tr key={learner.userId}>
                            <td className="py-3 font-medium">
                              {learner.learnerName}
                            </td>
                            <td>{learner.className || learner.audienceType}</td>
                            <td>
                              {learner.completedLessons}/{learner.totalLessons}{" "}
                              ({learner.progressPercent}%)
                            </td>
                            <td>
                              {learner.completedAssessments}/
                              {learner.totalAssessments}
                            </td>
                            <td>
                              {learner.averageScore == null
                                ? "—"
                                : `${learner.averageScore}%`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="billing">
          {(hub?.orders.length ?? 0) === 0 ? (
            <EmptyState text="A frozen invoice is created when you start checkout for an approved course audience." />
          ) : (
            <div className="overflow-hidden rounded-xl border bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="p-4">Course / tutor</th>
                    <th className="p-4">Calculation</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {hub?.orders.map((order) => (
                    <tr key={order.id}>
                      <td className="p-4">
                        <p className="font-medium">{order.courseTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.tutorName}
                        </p>
                      </td>
                      <td className="p-4">
                        {formatCurrency(order.unitPrice, order.currency)} ×{" "}
                        {order.quantity} users
                      </td>
                      <td className="p-4">
                        {order.discountPercent
                          ? `${order.discountPercent}%`
                          : "—"}
                      </td>
                      <td className="p-4 font-semibold">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateCourseRequestDialog
        open={createRequestOpen}
        onOpenChange={setCreateRequestOpen}
        schoolId={schoolId}
        currency={hub?.currency ?? "USD"}
        onCreated={refresh}
      />
      <InviteTutorDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        schoolId={schoolId}
        courseRequests={hub?.courseRequests ?? []}
        onCreated={refresh}
      />
      <AudienceDialog
        offering={audienceOffering}
        schoolId={schoolId}
        onOpenChange={(open) => !open && setAudienceOffering(null)}
        onSaved={refresh}
      />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-white py-14 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}

function InvitationRow({
  item,
  schoolId,
  onChanged,
}: {
  item: SchoolTutorInvitation
  schoolId: string
  onChanged: () => unknown
}) {
  const revoke = useMutation({
    mutationFn: () => revokeSchoolTutorInvitationApi(schoolId, item.id),
    onSuccess: () => {
      toast.success("Invitation revoked")
      void onChanged()
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return (
    <tr>
      <td className="p-4">
        <p className="font-medium">{item.tutorName}</p>
        <p className="text-xs text-muted-foreground">{item.tutorEmail}</p>
      </td>
      <td className="p-4">
        {item.courseTitle || "Tutor may propose a course"}
      </td>
      <td className="p-4">
        {new Date(item.dateCreatedUtc).toLocaleDateString()}
      </td>
      <td className="p-4">
        <StatusBadge status={item.status} />
      </td>
      <td className="p-4 text-right">
        {(item.status === "Pending" || item.status === "Accepted") && (
          <Button
            size="sm"
            variant="ghost"
            disabled={revoke.isPending}
            onClick={() => revoke.mutate()}
          >
            Revoke
          </Button>
        )}
      </td>
    </tr>
  )
}

function CreateCourseRequestDialog({
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
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [topics, setTopics] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [minimumBudget, setMinimumBudget] = useState("")
  const [maximumBudget, setMaximumBudget] = useState("")
  const [curriculumMaterialUrl, setCurriculumMaterialUrl] = useState("")
  const [curriculumMaterialName, setCurriculumMaterialName] = useState("")
  const [uploading, setUploading] = useState(false)
  const mutation = useMutation({
    mutationFn: () =>
      createSchoolCourseRequestApi(schoolId, {
        title,
        description,
        topics,
        startDateUtc: new Date(startDate).toISOString(),
        endDateUtc: new Date(endDate).toISOString(),
        minimumBudget: Number(minimumBudget),
        maximumBudget: Number(maximumBudget),
        currency,
        curriculumMaterialUrl: curriculumMaterialUrl || undefined,
        curriculumMaterialName: curriculumMaterialName || undefined,
      }),
    onSuccess: ({ value }) => {
      toast.success("Course request saved; complete the deposit to publish it")
      void onCreated()
      if (value.checkoutUrl) openCheckout(value.checkoutUrl)
      else onOpenChange(false)
    },
    onError: (error: Error) => toast.error(error.message),
  })
  const valid =
    title.trim().length >= 2 &&
    topics.trim().length >= 2 &&
    startDate &&
    endDate &&
    Number(minimumBudget) > 0 &&
    Number(maximumBudget) >= Number(minimumBudget)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Request a course</DialogTitle>
          <DialogDescription>
            Your request becomes public after a 50% deposit based on the maximum
            budget. The remaining accepted proposal balance is due before work
            starts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Course title</Label>
            <Input
              value={title}
              maxLength={200}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              maxLength={2000}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Topics to cover</Label>
            <Textarea
              value={topics}
              maxLength={4000}
              onChange={(event) => setTopics(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_1fr_110px] gap-3">
            <div className="space-y-2">
              <Label>Minimum</Label>
              <Input
                type="number"
                min="1"
                value={minimumBudget}
                onChange={(event) => setMinimumBudget(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum</Label>
              <Input
                type="number"
                min="1"
                value={maximumBudget}
                onChange={(event) => setMaximumBudget(event.target.value)}
              />
            </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input value={currency} readOnly aria-readonly="true" className="bg-slate-50" />
            <p className="text-xs text-muted-foreground">Your school base currency</p>
          </div>
          </div>
          {Number(maximumBudget) > 0 && (
            <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              Deposit due now:{" "}
              {formatCurrency(Number(maximumBudget) * 0.5, currency)}
            </p>
          )}
          <div className="space-y-2">
            <Label>Curriculum material (optional)</Label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              disabled={uploading}
              onChange={async (event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setUploading(true)
                try {
                  setCurriculumMaterialUrl(await uploadFileAndGetUrl(file))
                  setCurriculumMaterialName(file.name)
                  toast.success("Curriculum uploaded")
                } catch (error) {
                  toast.error((error as Error).message)
                } finally {
                  setUploading(false)
                }
              }}
            />
            {uploading && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Uploading curriculum…
              </p>
            )}
            {curriculumMaterialUrl && (
              <p className="text-xs text-emerald-700">
                {curriculumMaterialName} is ready.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid || mutation.isPending || uploading}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Preparing checkout…
              </>
            ) : (
              "Continue to deposit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AcceptApplicationButton({
  schoolId,
  requestId,
  applicationId,
  onChanged,
}: {
  schoolId: string
  requestId: string
  applicationId: string
  onChanged: () => unknown
}) {
  const mutation = useMutation({
    mutationFn: () =>
      acceptSchoolCourseApplicationApi(schoolId, requestId, applicationId),
    onSuccess: () => {
      toast.success("Tutor selected")
      void onChanged()
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return (
    <Button
      size="sm"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {mutation.isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        "Select tutor"
      )}
    </Button>
  )
}

function FundBalanceButton({
  schoolId,
  request,
  onChanged,
}: {
  schoolId: string
  request: SchoolCourseRequest
  onChanged: () => unknown
}) {
  const mutation = useMutation({
    mutationFn: () => initializeCourseRequestBalanceApi(schoolId, request.id),
    onSuccess: ({ value }) => {
      void onChanged()
      if (value.checkoutUrl) openCheckout(value.checkoutUrl)
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return (
    <Button
      size="sm"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {mutation.isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Preparing checkout…
        </>
      ) : (
        `Pay balance ${formatCurrency(request.remainingFundingAmount, request.currency)}`
      )}
    </Button>
  )
}

function DeliveryReview({
  schoolId,
  request,
  application,
  onChanged,
}: {
  schoolId: string
  request: SchoolCourseRequest
  application: SchoolCourseRequest["applications"][number]
  onChanged: () => unknown
}) {
  const mutation = useMutation({
    mutationFn: ({
      milestoneId,
      approve,
      feedback,
    }: {
      milestoneId: string
      approve: boolean
      feedback?: string
    }) =>
      reviewCourseRequestMilestoneApi(
        schoolId,
        request.id,
        milestoneId,
        approve,
        feedback
      ),
    onSuccess: ({ message }) => {
      toast.success(message || "Delivery reviewed")
      void onChanged()
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">Delivery by {application.tutorName}</p>
          <p className="text-xs text-muted-foreground">
            {application.linkedCourseTitle ||
              "Tutor has not linked a course yet"}
          </p>
        </div>
        {application.linkedCourseId && (
          <a
            className="text-sm font-medium text-blue-700 underline"
            href={`/dashboard/e-learning-lms/lms/courses/${application.linkedCourseId}`}
            target="_blank"
            rel="noreferrer"
          >
            Preview course
          </a>
        )}
      </div>
      <div className="mt-3 space-y-2">
        {application.milestones.map((milestone) => (
          <div key={milestone.id} className="rounded-lg bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{milestone.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(milestone.amount, request.currency)} ·{" "}
                  {milestone.status}
                </p>
              </div>
              {milestone.status === "Submitted" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={mutation.isPending}
                    onClick={() => {
                      const feedback = window.prompt(
                        "Describe the changes the tutor must make:"
                      )
                      if (feedback?.trim())
                        mutation.mutate({
                          milestoneId: milestone.id,
                          approve: false,
                          feedback,
                        })
                    }}
                  >
                    Request changes
                  </Button>
                  <Button
                    size="sm"
                    disabled={mutation.isPending}
                    onClick={() =>
                      mutation.mutate({
                        milestoneId: milestone.id,
                        approve: true,
                      })
                    }
                  >
                    {mutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Approve & release"
                    )}
                  </Button>
                </div>
              )}
            </div>
            {milestone.submissionNote && (
              <p className="mt-2 text-sm text-muted-foreground">
                {milestone.submissionNote}
              </p>
            )}
            {milestone.revisionNote && (
              <p className="mt-2 text-xs text-amber-800">
                Revision requested: {milestone.revisionNote}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function InviteTutorDialog({
  open,
  onOpenChange,
  schoolId,
  courseRequests,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string
  courseRequests: SchoolCourseRequest[]
  onCreated: () => unknown
}) {
  const [email, setEmail] = useState("")
  const [requestId, setRequestId] = useState("none")
  const [message, setMessage] = useState("")
  const mutation = useMutation({
    mutationFn: () =>
      inviteSchoolTutorApi(schoolId, {
        tutorEmail: email,
        schoolCourseRequestId: requestId === "none" ? undefined : requestId,
        message,
      }),
    onSuccess: () => {
      toast.success("Tutor invitation sent")
      setEmail("")
      setRequestId("none")
      setMessage("")
      onOpenChange(false)
      void onCreated()
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite an external tutor</DialogTitle>
          <DialogDescription>
            The tutor remains independent and must accept before courses can be
            assigned. There is no invitation limit.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tutor’s platform email</Label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tutor@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label>School course brief (optional)</Label>
            <Select value={requestId} onValueChange={setRequestId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General invitation</SelectItem>
                {courseRequests
                  .filter((item) => item.status !== "Archived")
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The tutor will see the brief and attach one of their published LMS
              courses.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Message (optional)</Label>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Explain the learning outcome and intended audience."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!email.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Sending…" : "Send invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type AudienceConfig = {
  enabled: boolean
  scope: "All" | "Class" | "Selected"
  classId: string
  userIds: string[]
}
const initialAudience = (): Record<SchoolAudienceType, AudienceConfig> => ({
  Student: { enabled: false, scope: "All", classId: "", userIds: [] },
  Staff: { enabled: false, scope: "All", classId: "", userIds: [] },
  Parent: { enabled: false, scope: "All", classId: "", userIds: [] },
})

function AudienceDialog({
  offering,
  schoolId,
  onOpenChange,
  onSaved,
}: {
  offering: SchoolCourseOffering | null
  schoolId: string
  onOpenChange: (open: boolean) => void
  onSaved: () => unknown
}) {
  const [config, setConfig] = useState(initialAudience)
  const directoryQuery = useQuery({
    queryKey: ["school-learning", schoolId, "directory"],
    queryFn: () => getSchoolDirectoryApi(schoolId),
    enabled: Boolean(offering),
  })
  const mutation = useMutation({
    mutationFn: () =>
      setSchoolCourseAudienceApi(
        schoolId,
        offering!.id,
        (Object.keys(config) as SchoolAudienceType[])
          .filter((type) => config[type].enabled)
          .map((type) => ({
            audienceType: type,
            scope: config[type].scope,
            classId: config[type].classId || undefined,
            userIds: config[type].userIds,
          }))
      ),
    onSuccess: ({ value }) => {
      toast.success(
        `${value.seatCount} users selected · ${formatCurrency(value.totalAmount, value.currency)}`
      )
      setConfig(initialAudience())
      onOpenChange(false)
      void onSaved()
    },
    onError: (error: Error) => toast.error(error.message),
  })
  const directory = directoryQuery.data?.value
  const estimate = useMemo(
    () => estimateSeats(config, directory),
    [config, directory]
  )
  const types: SchoolAudienceType[] = ["Student", "Staff", "Parent"]
  return (
    <Dialog open={Boolean(offering)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select course audience</DialogTitle>
          <DialogDescription>
            Only active school members with login accounts are billable. Each
            user is counted once, even if they belong to more than one group.
          </DialogDescription>
        </DialogHeader>
        {directoryQuery.isPending ? (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto size-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {types.map((type) => {
              const item = config[type]
              const members = directory
                ? directory[
                    `${type.toLowerCase()}${type === "Staff" ? "" : "s"}` as
                      | "students"
                      | "staff"
                      | "parents"
                  ]
                : []
              return (
                <div key={type} className="rounded-xl border p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={item.enabled}
                      onCheckedChange={(checked) =>
                        setConfig((current) => ({
                          ...current,
                          [type]: {
                            ...current[type],
                            enabled: Boolean(checked),
                          },
                        }))
                      }
                    />
                    <div className="flex-1">
                      <p className="font-semibold">
                        {type === "Staff" ? "Staff" : `${type}s`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {members.length} eligible accounts
                      </p>
                    </div>
                    {item.enabled && (
                      <Select
                        value={item.scope}
                        onValueChange={(scope: AudienceConfig["scope"]) =>
                          setConfig((current) => ({
                            ...current,
                            [type]: { ...current[type], scope },
                          }))
                        }
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          {type === "Student" && (
                            <SelectItem value="Class">A class</SelectItem>
                          )}
                          <SelectItem value="Selected">Selected</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  {item.enabled && item.scope === "Class" && (
                    <Select
                      value={item.classId}
                      onValueChange={(classId) =>
                        setConfig((current) => ({
                          ...current,
                          [type]: { ...current[type], classId },
                        }))
                      }
                    >
                      <SelectTrigger className="mt-3">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(directory?.classes ?? {}).map(
                          ([id, name]) => (
                            <SelectItem key={id} value={id}>
                              {name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {item.enabled && item.scope === "Selected" && (
                    <div className="mt-3 max-h-40 space-y-1 overflow-y-auto rounded-lg bg-slate-50 p-2">
                      {members.map((member) => (
                        <label
                          key={member.userId}
                          className="flex items-center gap-2 rounded p-2 hover:bg-white"
                        >
                          <Checkbox
                            checked={item.userIds.includes(member.userId)}
                            onCheckedChange={(checked) =>
                              setConfig((current) => ({
                                ...current,
                                [type]: {
                                  ...current[type],
                                  userIds: checked
                                    ? [...current[type].userIds, member.userId]
                                    : current[type].userIds.filter(
                                        (id) => id !== member.userId
                                      ),
                                },
                              }))
                            }
                          />
                          <span className="text-sm">{member.displayName}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {member.className}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        <div className="rounded-xl bg-blue-50 p-4 text-blue-950">
          <p className="font-semibold">
            Estimated bill:{" "}
            {formatCurrency(
              (offering?.unitPrice || offering?.listUnitPrice || 0) * estimate,
              offering?.currency
            )}
          </p>
          <p className="mt-1 text-xs">
            {formatCurrency(
              offering?.unitPrice || offering?.listUnitPrice || 0,
              offering?.currency
            )}{" "}
            per user × {estimate} unique users. The final audience, discount,
            price and quantity are frozen when checkout starts.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!estimate || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Saving…" : `Save ${estimate} users`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function estimateSeats(
  config: Record<SchoolAudienceType, AudienceConfig>,
  directory?: SchoolDirectory
) {
  if (!directory) return 0
  const ids = new Set<string>()
  ;(["Student", "Staff", "Parent"] as SchoolAudienceType[]).forEach((type) => {
    const item = config[type]
    if (!item.enabled) return
    const members =
      type === "Student"
        ? directory.students
        : type === "Staff"
          ? directory.staff
          : directory.parents
    const selected =
      item.scope === "All"
        ? members
        : item.scope === "Class"
          ? members.filter((member) => member.classId === item.classId)
          : members.filter((member) => item.userIds.includes(member.userId))
    selected.forEach((member) => ids.add(member.userId))
  })
  return ids.size
}
