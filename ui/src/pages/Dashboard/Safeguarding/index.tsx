import { useNavigate, useParams } from "react-router"
import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  ShieldCheck,
  ShieldAlert,
  Siren,
  UsersRound,
} from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useSafeguardingDashboard } from "@/hooks/safeguarding"
import { useStudentSupportSettings } from "@/hooks/studentSupportSettings"
import { DashboardRoutes } from "@/routes"
import {
  ConfidentialBanner,
  EmptySafeguarding,
  RiskBadge,
  SafeguardingAccessGate,
  StatusBadge,
} from "./components"
import { formatDateTime } from "./utils"

function SafeguardingOverview() {
  const schoolId = useSchoolId()
  const { productId = "" } = useParams()
  const navigate = useNavigate()
  const { dashboard, isPending } = useSafeguardingDashboard(schoolId)
  const { settings } = useStudentSupportSettings(schoolId)
  const stats = [
    {
      label: "Awaiting triage",
      value: dashboard?.awaitingTriage ?? 0,
      icon: ClipboardList,
      tone: "bg-amber-50 text-amber-800",
    },
    {
      label: "Open cases",
      value: dashboard?.openCases ?? 0,
      icon: UsersRound,
      tone: "bg-blue-50 text-blue-800",
    },
    {
      label: "High risk",
      value: dashboard?.highRiskCases ?? 0,
      icon: AlertTriangle,
      tone: "bg-orange-50 text-orange-800",
    },
    {
      label: "Critical",
      value: dashboard?.criticalCases ?? 0,
      icon: Siren,
      tone: "bg-red-50 text-red-800",
    },
    {
      label: "Overdue actions",
      value: dashboard?.overdueActions ?? 0,
      icon: CalendarClock,
      tone: "bg-rose-50 text-rose-800",
    },
    {
      label: "Active safety plans",
      value: dashboard?.activeSafetyPlans ?? 0,
      icon: ShieldCheck,
      tone: "bg-violet-50 text-violet-800",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={settings?.safeguardingName ?? "Safeguarding and Child Protection"}
        description="Secure concern reporting, triage, chronology, actions, referrals and safety planning."
        icon={<ShieldAlert className="size-5 text-red-700" />}
        iconBg="bg-red-50"
        actions={
          <Button
            variant="primary"
            onClick={() =>
              navigate(DashboardRoutes.toSafeguardingReport(productId))
            }
          >
            Report a concern
          </Button>
        }
      />
      <ConfidentialBanner />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {isPending ? (
                  <Skeleton className="mt-2 h-8 w-16" />
                ) : (
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                )}
              </div>
              <div className={`rounded-xl p-3 ${stat.tone}`}>
                <stat.icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Priority cases</CardTitle>
            <p className="text-sm text-muted-foreground">
              Critical risks, untriaged concerns and overdue actions.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              navigate(DashboardRoutes.toSafeguardingCases(productId))
            }
          >
            View all
          </Button>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((x) => (
                <Skeleton key={x} className="h-16 w-full" />
              ))}
            </div>
          ) : !dashboard?.priorityCases.length ? (
            <EmptySafeguarding>
              No priority cases need attention.
            </EmptySafeguarding>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Learner</th>
                    <th className="px-4 py-3">Case</th>
                    <th className="px-4 py-3">Risk</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Next action</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dashboard.priorityCases.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.className || item.studentGivenId}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs">{item.caseNumber}</p>
                        {item.immediateDanger && (
                          <p className="mt-1 text-xs font-semibold text-red-700">
                            Immediate danger reported
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge risk={item.riskLevel} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">
                        {formatDateTime(item.nextActionDueAtUtc)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              DashboardRoutes.toSafeguardingCase(
                                productId,
                                item.id
                              )
                            )
                          }
                        >
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function SafeguardingOverviewPage() {
  return (
    <SafeguardingAccessGate require="view">
      <SafeguardingOverview />
    </SafeguardingAccessGate>
  )
}
