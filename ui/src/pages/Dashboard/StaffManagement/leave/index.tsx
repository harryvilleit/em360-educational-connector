import { useState } from "react"
import { Navigate, useParams } from "react-router"
import { PageHeader } from "@/components/general/PageHeader"
import { usePermissions } from "@/hooks/usePermissions"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useLeaveAdminOverview } from "@/hooks/leaveManagement"
import { DashboardRoutes } from "@/routes"
import { ApprovalsTab } from "./ApprovalsTab"
import { LeaveCalendarTab } from "./LeaveCalendarTab"
import { LedgerTab } from "./LedgerTab"
import { SettingsTab } from "./SettingsTab"

type LeaveTab = "approvals" | "calendar" | "ledger" | "settings"

// Admin side of leave. Staff request leave and see balances on the separate My Leave page.
export default function LeaveManagementPage() {
  const { productId = "" } = useParams<{ productId: string }>()
  const schoolId = useSchoolId()
  const { canUpdate } = usePermissions()

  // Approving leave is the Update permission on the Leave Management menu.
  const isApprover = canUpdate(DashboardRoutes.toStaffLeave(productId))
  const [tab, setTab] = useState<LeaveTab>("approvals")
  const overview = useLeaveAdminOverview(schoolId, isApprover)

  if (!isApprover) {
    return <Navigate to={DashboardRoutes.toStaffMyLeave(productId)} replace />
  }

  const pending = overview.data?.pendingRequestsCount ?? 0
  const tabs: { value: LeaveTab; label: string }[] = [
    {
      value: "approvals",
      label:
        pending > 0
          ? `Approvals & Requests (${pending})`
          : "Approvals & Requests",
    },
    { value: "calendar", label: "Leave Calendar" },
    { value: "ledger", label: "Balance Ledger" },
    { value: "settings", label: "Settings" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description="Review requests, track staff absence and configure leave policies"
      />

      <div
        role="tablist"
        className="sticky top-0 z-10 flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1"
      >
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.value
                ? "bg-chart-2 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "approvals" && <ApprovalsTab schoolId={schoolId} />}
      {tab === "calendar" && <LeaveCalendarTab schoolId={schoolId} />}
      {tab === "ledger" && <LedgerTab schoolId={schoolId} />}
      {tab === "settings" && <SettingsTab schoolId={schoolId} />}
    </div>
  )
}
