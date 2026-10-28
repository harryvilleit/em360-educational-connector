import { useNavigate, useParams } from "react-router"
import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  FileCheck2,
  Coins,
  UsersRound,
} from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useLearnerSupportDashboard } from "@/hooks/learnerSupport"
import { useStudentSupportSettings } from "@/hooks/studentSupportSettings"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"
import { DashboardRoutes } from "@/routes"
import NewReferralDialog from "./NewReferralDialog"
import { EmptySupport, StatusBadge } from "./components"
import { formatDate } from "./utils"

export default function LearnerSupportOverviewPage() {
  const schoolId = useSchoolId()
  const { productId = "" } = useParams()
  const navigate = useNavigate()
  const { dashboard, isPending } = useLearnerSupportDashboard(schoolId)
  const { settings } = useStudentSupportSettings(schoolId)
  const { formatMoney } = useSchoolMoney()

  const stats = [
    {
      label: "Open referrals",
      value: dashboard?.openReferrals ?? 0,
      icon: ClipboardCheck,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: `On ${settings?.supportRegisterName ?? "support register"}`,
      value: dashboard?.learnersOnRegister ?? 0,
      icon: UsersRound,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Active plans",
      value: dashboard?.activePlans ?? 0,
      icon: FileCheck2,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Reviews due",
      value: dashboard?.reviewsDue ?? 0,
      icon: CalendarClock,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Overdue reviews",
      value: dashboard?.overdueReviews ?? 0,
      icon: AlertTriangle,
      tone: "bg-red-50 text-red-700",
    },
    {
      label: "Active provision cost",
      value: formatMoney(dashboard?.activeProvisionCost ?? 0),
      icon: Coins,
      tone: "bg-sky-50 text-sky-700",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={settings?.learnerSupportName ?? "Learner Support"}
        description="One workflow for referrals, graduated response, support plans, provision, adjustments and reviews."
        actions={<NewReferralDialog schoolId={schoolId} />}
      />

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
              Safety concerns, overdue reviews and referrals awaiting triage.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              navigate(`/dashboard/${productId}/learner-support/register`)
            }
          >
            View register
          </Button>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-16 w-full" />
              ))}
            </div>
          ) : !dashboard?.priorityCases.length ? (
            <EmptySupport>No priority cases need attention.</EmptySupport>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Learner</th>
                    <th className="px-4 py-3">Case</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Next review</th>
                    <th className="px-4 py-3" />
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
                        <span className="font-mono text-xs">
                          {item.caseNumber}
                        </span>
                        {item.immediateSafetyConcern && (
                          <p className="mt-1 text-xs font-medium text-red-700">
                            Safety concern
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(item.nextReviewDate)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              DashboardRoutes.toLearnerSupportCase(
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
