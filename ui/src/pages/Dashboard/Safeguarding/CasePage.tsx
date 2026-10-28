import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import {
  CalendarPlus,
  FilePlus2,
  ListPlus,
  Network,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useSafeguardingAccess,
  useSafeguardingCase,
} from "@/hooks/safeguarding"
import { getSafeguardingDocumentDownloadApi } from "@/api/safeguarding.api"
import {
  ConfidentialBanner,
  EmptySafeguarding,
  RiskBadge,
  SafeguardingAccessGate,
  StatusBadge,
} from "./components"
import { formatDate, formatDateTime, labelFromCode } from "./utils"
import {
  CloseCaseDialog,
  TriageDialog,
} from "./CaseDialogs"
import UploadDocumentDialog from "./UploadDocumentDialog"
import SafetyPlanDialog from "./SafetyPlanDialog"
import AddReferralDialog from "./AddReferralDialog"
import AddActionDialog from "./AddActionDialog"

type OpenDialog =
  | "triage"
  | "action"
  | "referral"
  | "plan"
  | "document"
  | "close"

function DetailItem({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm whitespace-pre-wrap text-gray-900">
        {value || "—"}
      </dd>
    </div>
  )
}

function CaseWorkspace() {
  const schoolId = useSchoolId()
  const { caseId = "" } = useParams()
  const navigate = useNavigate()
  const { access } = useSafeguardingAccess(schoolId)
  const { safeguardingCase: item, isPending } = useSafeguardingCase(
    schoolId,
    caseId
  )
  const [dialog, setDialog] = useState<OpenDialog>()

  if (isPending)
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  if (!item)
    return (
      <EmptySafeguarding>
        The safeguarding case could not be found or you no longer have access.
      </EmptySafeguarding>
    )
  const editable = access?.canManageCases && item.status !== "Closed"
  const closeDialog = () => setDialog(undefined)

  async function openDocument(documentId: string) {
    const target = window.open("about:blank", "_blank")
    if (target) target.opener = null
    try {
      const response = await getSafeguardingDocumentDownloadApi(
        schoolId,
        documentId
      )
      if (target) target.location.href = response.value.url
      else toast.error("Allow pop-ups to open this confidential document")
    } catch (error) {
      target?.close()
      toast.error(
        error instanceof Error
          ? error.message
          : "The document could not be opened"
      )
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${item.studentName} · ${item.caseNumber}`}
        description={item.concernSummary}
        onBack={() => navigate(-1)}
        backLabel="Back to safeguarding"
        icon={<ShieldAlert className="size-5 text-red-700" />}
        iconBg="bg-red-50"
        badge={
          <span className="flex items-center gap-2">
            <RiskBadge risk={item.riskLevel} />
            <StatusBadge status={item.status} />
          </span>
        }
        badgeColor="bg-transparent p-0"
        actions={
          editable ? (
            <>
              <Button variant="outline" onClick={() => setDialog("triage")}>
                Triage / update
              </Button>
              <Button variant="outline" onClick={() => setDialog("action")}>
                <ListPlus />
                Add action
              </Button>
              <Button variant="destructive" onClick={() => setDialog("close")}>
                <XCircle />
                Close case
              </Button>
            </>
          ) : undefined
        }
      />
      <ConfidentialBanner />
      {item.immediateDanger && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-950">
          Immediate danger was reported on submission. Confirm emergency and
          protective action is recorded below.
        </div>
      )}
      <Tabs defaultValue="summary">
        <TabsList variant="line" className="max-w-full overflow-x-auto">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="actions">
            Actions ({item.actions.length})
          </TabsTrigger>
          <TabsTrigger value="referrals">
            Referrals ({item.referrals.length})
          </TabsTrigger>
          <TabsTrigger value="plans">
            Safety plans ({item.safetyPlans.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({item.documents.length})
          </TabsTrigger>
          <TabsTrigger value="chronology">Chronology</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Concern</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 md:grid-cols-2">
                <DetailItem
                  label="Learner"
                  value={`${item.studentName}${item.className ? ` · ${item.className}` : ""}`}
                />
                <DetailItem
                  label="Category"
                  value={labelFromCode(item.category)}
                />
                <DetailItem
                  label="Incident date"
                  value={formatDateTime(item.incidentAtUtc)}
                />
                <DetailItem
                  label="Incident location"
                  value={item.incidentLocation}
                />
                <DetailItem label="Reported by" value={item.reporterName} />
                <DetailItem
                  label="Reported at"
                  value={formatDateTime(item.reportedAtUtc)}
                />
                <div className="md:col-span-2">
                  <DetailItem
                    label="Factual record"
                    value={item.concernDetails}
                  />
                </div>
                <div className="md:col-span-2">
                  <DetailItem
                    label="Learner's own words"
                    value={item.learnersOwnWords}
                  />
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Triage decision</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 md:grid-cols-2">
                <DetailItem label="Assigned lead" value={item.assignedToName} />
                <DetailItem
                  label="Next action due"
                  value={formatDateTime(item.nextActionDueAtUtc)}
                />
                <div className="md:col-span-2">
                  <DetailItem
                    label="Triage rationale"
                    value={item.triageSummary}
                  />
                </div>
                <div className="md:col-span-2">
                  <DetailItem
                    label="Immediate action taken"
                    value={item.immediateActionTaken}
                  />
                </div>
                {item.closedAtUtc && (
                  <>
                    <DetailItem
                      label="Closed"
                      value={formatDateTime(item.closedAtUtc)}
                    />
                    <DetailItem
                      label="Closure rationale"
                      value={item.closureSummary}
                    />
                  </>
                )}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="actions" className="space-y-4 pt-4">
          {editable && (
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setDialog("action")}>
                <ListPlus />
                Add action
              </Button>
            </div>
          )}
          {!item.actions.length ? (
            <EmptySafeguarding>
              No safeguarding actions have been recorded.
            </EmptySafeguarding>
          ) : (
            item.actions.map((action) => (
              <Card key={action.id}>
                <CardContent className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{action.title}</p>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                        {labelFromCode(action.status)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {labelFromCode(action.type)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-wrap text-gray-700">
                      {action.details}
                    </p>
                    {action.outcome && (
                      <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-sm">
                        <strong>Outcome:</strong> {action.outcome}
                      </p>
                    )}
                  </div>
                  <dl className="min-w-44 space-y-2">
                    <DetailItem label="Owner" value={action.assignedToName} />
                    <DetailItem
                      label="Due"
                      value={formatDateTime(action.dueAtUtc)}
                    />
                  </dl>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="referrals" className="space-y-4 pt-4">
          {editable && (
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setDialog("referral")}>
                <Network />
                Record referral
              </Button>
            </div>
          )}
          {!item.referrals.length ? (
            <EmptySafeguarding>
              No external referrals have been recorded.
            </EmptySafeguarding>
          ) : (
            item.referrals.map((referral) => (
              <Card key={referral.id}>
                <CardContent>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {referral.agencyName || labelFromCode(referral.agency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {labelFromCode(referral.status)} ·{" "}
                        {formatDateTime(referral.referredAtUtc)} ·{" "}
                        {referral.externalReference || "No external reference"}
                      </p>
                    </div>
                    <span className="rounded-full bg-purple-50 px-2 py-1 text-xs text-purple-800">
                      {labelFromCode(referral.agency)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm whitespace-pre-wrap">
                    {referral.reason}
                  </p>
                  {referral.responseSummary && (
                    <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                      <strong>Response:</strong> {referral.responseSummary}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="plans" className="space-y-4 pt-4">
          {editable && (
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setDialog("plan")}>
                <CalendarPlus />
                New plan version
              </Button>
            </div>
          )}
          {!item.safetyPlans.length ? (
            <EmptySafeguarding>
              No safety plan has been recorded.
            </EmptySafeguarding>
          ) : (
            item.safetyPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader className="flex-row items-start justify-between">
                  <div>
                    <CardTitle>{plan.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Version {plan.version} · {labelFromCode(plan.status)} ·
                      review {formatDate(plan.reviewDate)}
                    </p>
                  </div>
                  <ShieldCheck className="size-5 text-violet-700" />
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-5 md:grid-cols-2">
                    <DetailItem
                      label="Immediate risks"
                      value={plan.immediateRisks}
                    />
                    <DetailItem
                      label="Protective actions"
                      value={plan.protectiveActions}
                    />
                    <DetailItem
                      label="Trusted adults"
                      value={plan.trustedAdults}
                    />
                    <DetailItem
                      label="Learner instructions"
                      value={plan.learnerInstructions}
                    />
                  </dl>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="documents" className="space-y-4 pt-4">
          {editable && (
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setDialog("document")}>
                <FilePlus2 />
                Upload document
              </Button>
            </div>
          )}
          {!item.documents.length ? (
            <EmptySafeguarding>
              No confidential documents have been uploaded.
            </EmptySafeguarding>
          ) : (
            <Card>
              <CardContent>
                <div className="divide-y">
                  {item.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {labelFromCode(doc.category)} · {doc.fileName} ·
                          version {doc.version} ·{" "}
                          {formatDateTime(doc.dateCreated)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => void openDocument(doc.id)}
                      >
                        Open securely
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="chronology" className="pt-4">
          {!item.auditHistory.length ? (
            <EmptySafeguarding>
              No chronology entries are available.
            </EmptySafeguarding>
          ) : (
            <Card>
              <CardContent>
                <ol className="relative ml-2 border-l border-gray-200">
                  {item.auditHistory.map((log) => (
                    <li key={log.id} className="ml-5 pb-6 last:pb-0">
                      <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full border-2 border-white bg-red-500" />
                      <p className="font-medium">{labelFromCode(log.action)}</p>
                      <p className="mt-1 text-sm text-gray-700">
                        {log.summary}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(log.dateCreated)} ·{" "}
                        {log.actorName || "System"}
                      </p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      <TriageDialog
        open={dialog === "triage"}
        onClose={closeDialog}
        schoolId={schoolId}
        item={item}
      />
      <AddActionDialog
        open={dialog === "action"}
        onClose={closeDialog}
        schoolId={schoolId}
        item={item}
      />
      <AddReferralDialog
        open={dialog === "referral"}
        onClose={closeDialog}
        schoolId={schoolId}
        item={item}
      />
      <SafetyPlanDialog
        open={dialog === "plan"}
        onClose={closeDialog}
        schoolId={schoolId}
        item={item}
      />
      <UploadDocumentDialog
        open={dialog === "document"}
        onClose={closeDialog}
        schoolId={schoolId}
        item={item}
      />
      <CloseCaseDialog
        open={dialog === "close"}
        onClose={closeDialog}
        schoolId={schoolId}
        item={item}
      />
    </div>
  )
}

export default function SafeguardingCasePage() {
  return (
    <SafeguardingAccessGate require="view">
      <CaseWorkspace />
    </SafeguardingAccessGate>
  )
}
