import { useNavigate, useParams } from "react-router"
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  ClipboardCheck,
  Settings2,
  ShieldAlert,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useAttendanceInterventionAccess,
  useAttendanceInterventionDashboard,
} from "@/hooks/attendanceIntervention"
import { DashboardRoutes } from "@/routes"
import { AttendanceInterventionAccessGate, ExplainableRiskBanner, RiskBadge } from "./components"
import { formatDate, formatDateTime, labelFromCode } from "./utils"

export default function AttendanceEarlyInterventionPage() {
  const navigate = useNavigate()
  const { productId = "" } = useParams()
  const schoolId = useSchoolId()
  const { access } = useAttendanceInterventionAccess(schoolId)
  const { dashboard, isLoading, isError, refetch } = useAttendanceInterventionDashboard(schoolId)

  return (
    <AttendanceInterventionAccessGate>
      <div className="space-y-6">
        <PageHeader
          title="Attendance & Early Intervention"
          description="Identify concerning attendance patterns, coordinate support and measure outcomes."
          onBack={() => navigate(DashboardRoutes.toAttendance(productId))}
          backLabel="Back to Attendance"
          actions={
            <>
              {access?.canConfigureRules && (
                <Button
                  variant="outline"
                  onClick={() => navigate(DashboardRoutes.toAttendanceInterventionSettings(productId))}
                >
                  <Settings2 className="size-4" />
                  Risk rules
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => navigate(DashboardRoutes.toAttendanceRiskQueue(productId))}
              >
                View risk queue
                <ChevronRight className="size-4" />
              </Button>
            </>
          }
        />

        <ExplainableRiskBanner />
        {access?.isLimitedToAssignedClasses && (
          <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-900">
            This dashboard is limited to learners in your assigned classes.
          </div>
        )}

        {isError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-800">The intervention dashboard could not be loaded.</p>
            <Button variant="outline" className="mt-3" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                label="Medium risk"
                value={isLoading ? "0" : (dashboard?.mediumRisk ?? 0)}
                icon={AlertTriangle}
                color="amber"
                onClick={() => navigate(DashboardRoutes.toAttendanceRiskQueue(productId, "Medium"))}
              />
              <StatCard
                label="High or critical risk"
                value={
                  isLoading ? "0" : (dashboard?.highRisk ?? 0) + (dashboard?.criticalRisk ?? 0)
                }
                icon={ShieldAlert}
                color="red"
                onClick={() => navigate(DashboardRoutes.toAttendanceRiskQueue(productId))}
              />
              <StatCard
                label="Open interventions"
                value={isLoading ? "0" : (dashboard?.openInterventions ?? 0)}
                icon={ClipboardCheck}
                color="blue"
              />
              <StatCard
                label="Reviews due"
                value={isLoading ? "0" : (dashboard?.reviewsDue ?? 0)}
                icon={CalendarClock}
                color="violet"
                meta={(dashboard?.overdueActions ?? 0) > 0 ? `${dashboard?.overdueActions} overdue actions` : "No overdue actions"}
                metaType={(dashboard?.overdueActions ?? 0) > 0 ? "down" : "neutral"}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <h2 className="font-semibold text-gray-900">Priority learners</h2>
                    <p className="text-xs text-muted-foreground">
                      Medium, high and critical attendance patterns
                    </p>
                  </div>
                  <Users className="size-5 text-gray-300" />
                </div>
                {(dashboard?.priorityLearners ?? []).length === 0 ? (
                  <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No priority attendance risks were found in the current window.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {dashboard?.priorityLearners.map((learner) => (
                      <button
                        type="button"
                        key={learner.studentId}
                        onClick={() =>
                          navigate(
                            DashboardRoutes.toAttendanceStudentRisk(productId, learner.studentId)
                          )
                        }
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {learner.studentName}
                            </p>
                            <RiskBadge risk={learner.riskLevel} />
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {learner.className || "No current class"} · {learner.riskFactors[0]?.explanation || "Attendance pattern detected"}
                          </p>
                        </div>
                        <span className="shrink-0 text-lg font-bold text-gray-900">
                          {learner.attendancePercentage.toFixed(1)}%
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <h2 className="font-semibold text-gray-900">Action queue</h2>
                    <p className="text-xs text-muted-foreground">Open actions ordered by due date</p>
                  </div>
                  <CalendarClock className="size-5 text-gray-300" />
                </div>
                {(dashboard?.actionQueue ?? []).length === 0 ? (
                  <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No open intervention actions.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {dashboard?.actionQueue.map((action) => (
                      <button
                        type="button"
                        key={action.id}
                        onClick={() => {
                          if (action.studentId)
                            navigate(
                              DashboardRoutes.toAttendanceStudentRisk(productId, action.studentId)
                            )
                        }}
                        className="w-full px-5 py-4 text-left hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{action.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {action.studentName || action.caseNumber} · {labelFromCode(action.type)}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-gray-500">
                            {action.dueAtUtc ? formatDateTime(action.dueAtUtc) : "No deadline"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <p className="text-xs text-muted-foreground">
              {dashboard?.learnersAssessed ?? 0} active learners assessed · Last refreshed {formatDate(new Date().toISOString())}
            </p>
          </>
        )}
      </div>
    </AttendanceInterventionAccessGate>
  )
}
