import { useNavigate, useParams } from "react-router"
import { AlertTriangle } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useLearnerSupportCase } from "@/hooks/learnerSupport"
import { EmptySupport, StatusBadge } from "./components"
import { formatDate } from "./utils"
import TriageDialog from "./TriageDialog"
import PassportPanel from "./PassportPanel"
import PlanPanel from "./PlanPanel"
import AdjustmentsPanel from "./AdjustmentsPanel"
import ReviewsPanel from "./ReviewsPanel"
import ContributionsPanel from "./ContributionsPanel"
import DocumentsPanel from "./DocumentsPanel"
import AuditPanel from "./AuditPanel"

export default function LearnerSupportCasePage() {
  const schoolId = useSchoolId()
  const { caseId = "" } = useParams()
  const navigate = useNavigate()
  const { supportCase, isPending, isError } = useLearnerSupportCase(
    schoolId,
    caseId
  )

  if (isPending)
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        Loading learner-support record…
      </p>
    )
  if (isError || !supportCase)
    return (
      <EmptySupport>
        This learner-support case could not be loaded.
      </EmptySupport>
    )

  const activePlan =
    supportCase.plans.find((plan) => plan.status === "Published") ??
    supportCase.plans[0]
  return (
    <div className="space-y-6">
      <PageHeader
        title={supportCase.studentName}
        description={`${supportCase.caseNumber} · ${supportCase.className || "No current class"} · ${supportCase.jurisdictionCode}`}
        onBack={() => navigate(-1)}
        badge={<StatusBadge status={supportCase.status} />}
        actions={<TriageDialog item={supportCase} schoolId={schoolId} />}
        stats={[
          { label: "Register", value: supportCase.isOnRegister ? "Yes" : "No" },
          {
            label: "Case owner",
            value: supportCase.caseOwnerName || "Unassigned",
          },
          {
            label: "Next review",
            value: formatDate(supportCase.nextReviewDate),
          },
          {
            label: "Published plan",
            value: activePlan ? `v${activePlan.version}` : "None",
          },
        ]}
      />
      {supportCase.immediateSafetyConcern && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <AlertTriangle className="size-5 shrink-0" />
          <div>
            <p className="font-semibold">Immediate safety concern recorded</p>
            <p>
              Follow the school's safeguarding process outside this support
              workflow where required.
            </p>
          </div>
        </div>
      )}
      <Tabs defaultValue="passport" className="gap-4">
        <div className="overflow-x-auto">
          <TabsList className="h-auto min-w-max flex-wrap justify-start">
            <TabsTrigger value="passport">Passport</TabsTrigger>
            <TabsTrigger value="plan">Plan & provision</TabsTrigger>
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="voice">Learner & family voice</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="passport">
          <PassportPanel item={supportCase} schoolId={schoolId} />
        </TabsContent>
        <TabsContent value="plan">
          <PlanPanel item={supportCase} schoolId={schoolId} />
        </TabsContent>
        <TabsContent value="adjustments">
          <AdjustmentsPanel item={supportCase} schoolId={schoolId} />
        </TabsContent>
        <TabsContent value="reviews">
          <ReviewsPanel
            item={supportCase}
            schoolId={schoolId}
            activePlanId={activePlan?.id}
          />
        </TabsContent>
        <TabsContent value="voice">
          <ContributionsPanel item={supportCase} schoolId={schoolId} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsPanel item={supportCase} schoolId={schoolId} />
        </TabsContent>
        <TabsContent value="audit">
          <AuditPanel item={supportCase} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
