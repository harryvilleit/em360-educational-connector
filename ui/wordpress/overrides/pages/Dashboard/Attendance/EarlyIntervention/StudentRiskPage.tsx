// WordPress version: opening and managing interventions follow the menu permissions.
import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  ArrowLeftRight,
  CalendarClock,
  CheckCircle2,
  ClipboardPlus,
  History,
  LockKeyhole,
  MessageSquarePlus,
  Phone,
  TrendingDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/general/PageHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useAttendanceInterventionAccess,
  useAttendanceStudentRiskProfile,
} from "@/hooks/attendanceIntervention"
import type { AttendanceInterventionActivityI } from "@/api/attendanceIntervention.api"
import { DashboardRoutes } from "@/routes"
import {
  AttendanceInterventionAccessGate,
  InterventionStatusBadge,
  RiskBadge,
} from "@/pages/Dashboard/Attendance/EarlyIntervention/components"
import {
  AddActivityDialog,
  CloseInterventionDialog,
  CompleteActivityDialog,
  OpenInterventionDialog,
  ReferralDialog,
  ReviewDialog,
} from "@/pages/Dashboard/Attendance/EarlyIntervention/InterventionDialogs"
import { formatDate, formatDateTime, labelFromCode } from "@/pages/Dashboard/Attendance/EarlyIntervention/utils"

type DialogName = "open" | "activity" | "review" | "referral" | "close" | "complete" | null

export default function AttendanceStudentRiskPage() {
  const navigate = useNavigate()
  const { productId = "", studentId = "" } = useParams()
  const schoolId = useSchoolId()
  const { access } = useAttendanceInterventionAccess(schoolId)
  const { profile, isLoading, isError, refetch } = useAttendanceStudentRiskProfile(
    schoolId,
    studentId
  )
  const [dialog, setDialog] = useState<DialogName>(null)
  const [selectedActivity, setSelectedActivity] = useState<AttendanceInterventionActivityI>()

  if (isLoading)
    return <p className="py-24 text-center text-sm text-muted-foreground">Loading learner attendance profile…</p>
  if (isError || !profile)
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-red-700">The learner attendance profile could not be loaded.</p>
        <Button variant="outline" className="mt-3" onClick={() => refetch()}>Try again</Button>
      </div>
    )

  const { risk, activeIntervention } = profile
  const openActivities = activeIntervention?.activities.filter((x) => x.status === "Open") ?? []

  return (
    <AttendanceInterventionAccessGate>
      <div className="space-y-6">
        <PageHeader
          title={risk.studentName}
          description={`${risk.studentGivenId || "No learner ID"} · ${risk.className || "No current class"}`}
          onBack={() => navigate(DashboardRoutes.toAttendanceRiskQueue(productId))}
          backLabel="Back to Risk Queue"
          badge={<RiskBadge risk={risk.riskLevel} />}
          badgeColor="bg-transparent p-0"
          actions={
            // Opening a case needs Create on the risk queue; working on an open case needs Update.
            (activeIntervention ? access?.canManageInterventions : access?.canOpenInterventions) ? (
              activeIntervention ? (
                <>
                  <Button variant="outline" onClick={() => setDialog("activity")}><MessageSquarePlus className="size-4" />Add activity</Button>
                  <Button variant="outline" onClick={() => setDialog("referral")}><ArrowLeftRight className="size-4" />Refer</Button>
                  <Button variant="primary" onClick={() => setDialog("review")}><CalendarClock className="size-4" />Record review</Button>
                </>
              ) : (
                <Button variant="primary" onClick={() => setDialog("open")}><ClipboardPlus className="size-4" />Open intervention</Button>
              )
            ) : undefined
          }
        />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Metric label="Attendance" value={`${risk.attendancePercentage.toFixed(1)}%`} />
          <Metric label="Marked sessions" value={risk.markedSessions} />
          <Metric label="Absent" value={risk.absentCount} danger={risk.absentCount > 0} />
          <Metric label="Late" value={risk.lateCount} danger={risk.lateCount > 0} />
          <Metric label="Consecutive absence" value={risk.consecutiveAbsences} danger={risk.consecutiveAbsences > 1} />
        </div>

        {(profile.hasActiveLearnerSupport || profile.hasRestrictedSafeguardingInvolvement) && (
          <div className="flex flex-wrap gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-950">
            <LockKeyhole className="size-4" />
            {profile.hasActiveLearnerSupport && <span>Active Learner Support involvement.</span>}
            {profile.hasRestrictedSafeguardingInvolvement && <span>Restricted safeguarding involvement exists. Details are not available in Attendance.</span>}
          </div>
        )}

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="mb-4 flex items-center gap-2"><TrendingDown className="size-5 text-orange-500" /><h2 className="font-semibold text-gray-900">Why this learner was flagged</h2></div>
          {risk.riskFactors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No risk rule is currently triggered.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {risk.riskFactors.map((factor) => (
                <div key={factor.code} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-gray-900">{factor.title}</p><Badge variant="outline">+{factor.weight}</Badge></div>
                  <p className="mt-1 text-sm text-gray-600">{factor.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {activeIntervention ? (
          <section className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex flex-col justify-between gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-gray-900">{activeIntervention.caseNumber}</h2><InterventionStatusBadge status={activeIntervention.status} /></div>
                <p className="mt-1 text-sm text-gray-600">{activeIntervention.reason}</p>
                <p className="mt-1 text-xs text-muted-foreground">Opened {formatDate(activeIntervention.openedDate)} · Target {activeIntervention.targetAttendancePercentage.toFixed(1)}% · Review {formatDate(activeIntervention.nextReviewDate)}</p>
              </div>
              {access?.canManageInterventions && (
                <Button variant="destructive" disabled={openActivities.length > 0} onClick={() => setDialog("close")}>Close intervention</Button>
              )}
            </div>

            <Tabs defaultValue="activities" className="mt-5">
              <TabsList variant="line">
                <TabsTrigger value="activities">Activities ({activeIntervention.activities.length})</TabsTrigger>
                <TabsTrigger value="attendance">Attendance history</TabsTrigger>
                <TabsTrigger value="audit">Audit trail</TabsTrigger>
              </TabsList>
              <TabsContent value="activities" className="mt-4 space-y-3">
                {activeIntervention.activities.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No intervention activities recorded.</p> : activeIntervention.activities.map((activity) => (
                  <div key={activity.id} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-gray-900">{activity.title}</p><Badge variant="outline">{labelFromCode(activity.type)}</Badge><Badge className={activity.status === "Open" ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-gray-700"}>{activity.status}</Badge></div>
                        <p className="mt-2 text-sm text-gray-600">{activity.details}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{activity.contactMethod && `${activity.contactMethod} · `}{activity.contactedPerson && `${activity.contactedPerson} · `}{activity.dueAtUtc ? `Due ${formatDateTime(activity.dueAtUtc)}` : `Recorded ${formatDateTime(activity.dateCreated)}`}</p>
                        {activity.outcome && <p className="mt-2 rounded-lg bg-green-50 p-2 text-xs text-green-900"><strong>Outcome:</strong> {activity.outcome}</p>}
                        {activity.restrictedReference && <p className="mt-2 rounded-lg bg-violet-50 p-2 text-xs text-violet-900"><LockKeyhole className="mr-1 inline size-3" />Restricted reference: {activity.restrictedReference}</p>}
                      </div>
                      {activity.status === "Open" && access?.canManageInterventions && <Button variant="outline" size="sm" onClick={() => { setSelectedActivity(activity); setDialog("complete") }}><CheckCircle2 className="size-4" />Complete</Button>}
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="attendance" className="mt-4">
                <AttendanceTimeline timeline={profile.attendanceTimeline} />
              </TabsContent>
              <TabsContent value="audit" className="mt-4 space-y-3">
                {activeIntervention.auditHistory.map((entry) => <div key={entry.id} className="flex gap-3 rounded-xl border border-gray-100 p-3"><History className="mt-0.5 size-4 shrink-0 text-gray-400" /><div><p className="text-sm font-medium text-gray-900">{labelFromCode(entry.action)}</p><p className="text-xs text-gray-600">{entry.summary}</p><p className="mt-1 text-xs text-muted-foreground">{entry.actorName || "System"} · {formatDateTime(entry.dateCreated)}</p></div></div>)}
              </TabsContent>
            </Tabs>
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-8 text-center">
            <Phone className="mx-auto mb-3 size-8 text-blue-500" />
            <h2 className="font-semibold text-gray-900">No active intervention</h2>
            <p className="mx-auto mt-1 max-w-lg text-sm text-muted-foreground">Review the explainable risk factors and, where appropriate, open an intervention to record contact, actions and outcomes.</p>
          </section>
        )}

        <OpenInterventionDialog open={dialog === "open"} onOpenChange={(open) => setDialog(open ? "open" : null)} schoolId={schoolId} studentId={studentId} attendancePercentage={risk.attendancePercentage} />
        {activeIntervention && <>
          <AddActivityDialog open={dialog === "activity"} onOpenChange={(open) => setDialog(open ? "activity" : null)} schoolId={schoolId} caseId={activeIntervention.id} />
          <ReviewDialog open={dialog === "review"} onOpenChange={(open) => setDialog(open ? "review" : null)} schoolId={schoolId} caseId={activeIntervention.id} />
          <ReferralDialog open={dialog === "referral"} onOpenChange={(open) => setDialog(open ? "referral" : null)} schoolId={schoolId} caseId={activeIntervention.id} />
          <CloseInterventionDialog open={dialog === "close"} onOpenChange={(open) => setDialog(open ? "close" : null)} schoolId={schoolId} caseId={activeIntervention.id} />
          <CompleteActivityDialog open={dialog === "complete"} onOpenChange={(open) => setDialog(open ? "complete" : null)} schoolId={schoolId} activity={selectedActivity} />
        </>}
      </div>
    </AttendanceInterventionAccessGate>
  )
}

function Metric({ label, value, danger = false }: { label: string; value: string | number; danger?: boolean }) {
  return <div className="rounded-2xl border border-gray-100 bg-white p-4"><p className={`text-2xl font-bold ${danger ? "text-red-700" : "text-gray-900"}`}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>
}

function AttendanceTimeline({ timeline }: { timeline: { attendanceDate: string; status: string; remarks?: string }[] }) {
  if (!timeline.length) return <p className="py-10 text-center text-sm text-muted-foreground">No attendance records in the last 120 days.</p>
  return <div className="overflow-hidden rounded-xl border border-gray-100"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Remarks</th></tr></thead><tbody className="divide-y divide-gray-50">{timeline.map((row, index) => <tr key={`${row.attendanceDate}-${index}`}><td className="px-4 py-3">{formatDate(row.attendanceDate)}</td><td className="px-4 py-3"><Badge variant="outline">{row.status}</Badge></td><td className="px-4 py-3 text-gray-600">{row.remarks || "—"}</td></tr>)}</tbody></table></div>
}
