import { useParams } from "react-router"
import { Ban, UserCheck, UsersRound, UserX } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { useLeaveAdminOverview } from "@/hooks/leaveManagement"
import { usePermissions } from "@/hooks/usePermissions"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useStaffDirectory } from "@/hooks/staff"
import { StaffShortcuts } from "./components/StaffShortcuts"

import { MyPayslips } from "./payroll/Payslips"

export default function StaffOverviewPage() {
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const schoolId = useSchoolId()

  const { canUpdate } = usePermissions()
  const { directory } = useStaffDirectory({ schoolId, pageSize: 1 })
  const { data: leaveOverview } = useLeaveAdminOverview(
    schoolId,
    canUpdate(DashboardRoutes.toStaffLeave(p))
  )
  const pendingLeave = leaveOverview?.pendingRequestsCount ?? 0

  return (
    <div className="space-y-8">
      <PageHeader
        title="Staff Management"
        description="Manage staff records, lesson notes, payroll and performance."
      />

      <section>
        <h2 className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Total Staff"
            value={directory?.totalStaff ?? 0}
            icon={UsersRound}
            color="blue"
          />
          <StatCard
            label="Active"
            value={directory?.activeCount ?? 0}
            icon={UserCheck}
            color="emerald"
            valueColor="text-emerald-600"
            meta="Currently on duty"
          />
          <StatCard
            label="Inactive"
            value={directory?.inactiveCount ?? 0}
            icon={UserX}
            color="gray"
            valueColor="text-slate-500"
          />
          <StatCard
            label="Suspended"
            value={directory?.suspendedCount ?? 0}
            icon={Ban}
            color="amber"
            valueColor="text-amber-600"
          />
        </div>
      </section>

      <StaffShortcuts productId={p} pendingLeave={pendingLeave} />
      <MyPayslips />
    </div>
  )
}
