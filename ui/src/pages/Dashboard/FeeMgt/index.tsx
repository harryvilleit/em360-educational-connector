import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import type { GetFeeManagementOverviewParamsI } from "@/api/feeManagement.api/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Wallet,
  GraduationCap,
} from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard, type StatCardProps } from "@/components/general/StatCard"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetFeeManagementOverview } from "@/hooks/feeManagement"
import { formatCompactMoney } from "./utils"
import { useSchoolCurrency } from "@/contexts/SchoolContext"
import FeeBreakdownChart from "./components/FeeBreakdownChart"
import FeeCollectionChart from "./components/FeeCollectionChart"
import OutstandingFees from "./components/OutstandingFees"
import QuickFeeActions from "./components/QuickFeeActions"
import RecentPayments from "./components/RecentPayments"
import RecordPaymentModal from "./components/RecordPaymentModal"

export default function FeeManagementPage() {
  const schoolId = useSchoolId()
  return <FeeManagementOverview key={schoolId} schoolId={schoolId} />
}

function FeeManagementOverview({ schoolId }: { schoolId: string }) {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const navigate = useNavigate()
  const { productId } = useParams()
  const currencyCode = useSchoolCurrency()
  const [filters, setFilters] = useState<
    Omit<GetFeeManagementOverviewParamsI, "schoolId">
  >({})
  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })

  const {
    overview: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetFeeManagementOverview({ schoolId, ...filters })
  const overview = isLoading || isError ? undefined : response
  const sessionId = filters.sessionId ?? response?.sessionId
  const termId = filters.sessionId ? filters.termId : response?.termId
  const selectedSession = sessions.find((session) => session.Id === sessionId)
  const termChange = overview?.thisTermVsLastTermPercent ?? 0

  const feeStats: StatCardProps[] = [
    {
      label: "Total Expected",
      value: formatCompactMoney(overview?.totalExpected ?? 0, currencyCode),
      meta: overview?.sessionName || undefined,
      metaType: "neutral",
      icon: Wallet,
      color: "blue",
    },
    {
      label: "Total Collected",
      value: formatCompactMoney(overview?.totalCollected ?? 0, currencyCode),
      meta: `${overview?.collectionRatePercent ?? 0}% of target`,
      metaType: "up",
      icon: CheckCircle2,
      color: "green",
    },
    {
      label: "Outstanding",
      value: formatCompactMoney(overview?.outstanding ?? 0, currencyCode),
      meta: `${overview?.unpaidRatePercent ?? 0}% unpaid`,
      metaType: "down",
      icon: AlertCircle,
      color: "red",
    },
    {
      label: "This Term",
      value: formatCompactMoney(overview?.thisTermCollected ?? 0, currencyCode),
      meta: overview
        ? `${termChange >= 0 ? "+" : ""}${termChange}% vs last term`
        : undefined,
      metaType: (overview?.thisTermVsLastTermPercent ?? 0) >= 0 ? "up" : "down",
      icon: TrendingUp,
      color: "indigo",
    },
    {
      label: "Payments Today",
      value: formatCompactMoney(
        overview?.paymentsTodayAmount ?? 0,
        currencyCode
      ),
      meta: `${overview?.paymentsTodayCount ?? 0} transactions`,
      metaType: "up",
      icon: CreditCard,
      color: "cyan",
    },
    {
      label: "Defaulters",
      value: String(overview?.defaulterCount ?? 0),
      meta: "Students overdue",
      metaType: "down",
      icon: TrendingDown,
      color: "amber",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={sessionId ?? ""}
              disabled={!sessions.length}
              onValueChange={(sessionId) => {
                const session = sessions.find((item) => item.Id === sessionId)
                const term =
                  session?.Terms.find((item) => item.IsCurrent) ??
                  session?.Terms[0]
                setFilters({ sessionId, termId: term?.Id })
              }}
            >
              <SelectTrigger aria-label="Academic session">
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.Id} value={session.Id}>
                    {session.SessionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={termId ?? ""}
              disabled={!selectedSession?.Terms.length}
              onValueChange={(termId) => setFilters({ sessionId, termId })}
            >
              <SelectTrigger aria-label="Academic term">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {selectedSession?.Terms.map((term) => (
                  <SelectItem key={term.Id} value={term.Id}>
                    {term.TermName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        description={
          overview?.sessionName && overview?.termName
            ? `Manage and track student fees for ${overview.termName}, ${overview.sessionName}.`
            : "Manage and track student fees, payments, and outstanding balances."
        }
      />

      {isFetching && !isLoading && (
        <span role="status" className="text-sm text-muted-foreground">
          Updating overview?
        </span>
      )}
      {isError && (
        <div role="alert">
          <p>
            {error instanceof Error
              ? error.message
              : "Unable to load fee management overview."}
          </p>
          <Button onClick={() => void refetch()}>Try again</Button>
        </div>
      )}
      {isLoading && (
        <span role="status" className="sr-only">
          Loading fee management overview
        </span>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {feeStats.map((stat) => (
          <StatCard
            key={stat.label}
            {...stat}
            value={stat.value}
            meta={isLoading || isError ? undefined : stat.meta}
          />
        ))}
      </div>

      <QuickFeeActions
        onRecordPayment={() => setModalOpen(true)}
        onGenerateInvoice={() =>
          navigate(DashboardRoutes.toGenerateInvoice(productId!))
        }
        onSendReminders={() =>
          navigate(DashboardRoutes.toPaymentReminder(productId!))
        }
        onFeeStructure={() =>
          navigate(DashboardRoutes.toPaymentItems(productId!))
        }
        onReconcile={() =>
          navigate(DashboardRoutes.toPaymentSettlements(productId!))
        }
        onOnlinePayments={() =>
          navigate(DashboardRoutes.toOnlinePayments(productId!))
        }
        onPaymentSetup={() =>
          navigate(DashboardRoutes.toOnlinePaymentSetup(productId!))
        }
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-blue-950">External tutor course payments</p>
              <p className="mt-1 text-sm text-blue-900/75">
                Review tutor discounts, selected users and the course price × user calculation before payment.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-blue-200 bg-white"
            onClick={() => navigate(DashboardRoutes.toSchoolLearning(productId!))}
          >
            Manage tutor payments
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentPayments
          payments={overview?.recentPayments ?? []}
          isLoading={isLoading}
          isError={isError}
        />
        <OutstandingFees
          outstandingFees={overview?.outstandingFees ?? []}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FeeCollectionChart
            trend={overview?.collectionTrend ?? []}
            isLoading={isLoading}
            isError={isError}
          />
        </div>
        <FeeBreakdownChart
          byLevel={overview?.byLevel ?? []}
          collectionRatePercent={overview?.collectionRatePercent ?? 0}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      <RecordPaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
