import type { ReactNode } from "react"
import { LockKeyhole, ShieldX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useAttendanceInterventionAccess } from "@/hooks/attendanceIntervention"
import type {
  AttendanceInterventionStatus,
  AttendanceRiskLevel,
} from "@/api/attendanceIntervention.api"
import { labelFromCode } from "./utils"

export function AttendanceInterventionAccessGate({ children }: { children: ReactNode }) {
  const schoolId = useSchoolId()
  const { access, isPending } = useAttendanceInterventionAccess(schoolId)
  if (isPending)
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  if (!access?.canViewRisks)
    return (
      <Card className="border-amber-100 bg-amber-50/50 py-14">
        <CardContent className="mx-auto max-w-xl text-center">
          <ShieldX className="mx-auto mb-3 size-9 text-amber-700" />
          <h2 className="text-lg font-semibold">Attendance intervention access required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            School leaders and attendance or pastoral staff can view the full risk queue.
            Teachers see only learners in their assigned classes.
          </p>
        </CardContent>
      </Card>
    )
  return <>{children}</>
}

export function ExplainableRiskBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-950">
      <LockKeyhole className="mt-0.5 size-4 shrink-0" />
      <div>
        <strong>Decision support only.</strong> Every alert shows the attendance facts that
        triggered it. Staff make the final intervention and referral decisions.
      </div>
    </div>
  )
}

export function RiskBadge({ risk }: { risk: AttendanceRiskLevel }) {
  const style: Record<AttendanceRiskLevel, string> = {
    None: "bg-gray-100 text-gray-700",
    Low: "bg-emerald-100 text-emerald-900",
    Medium: "bg-amber-100 text-amber-900",
    High: "bg-orange-100 text-orange-900",
    Critical: "bg-red-100 text-red-900",
  }
  return <Badge className={style[risk]}>{labelFromCode(risk)}</Badge>
}

export function InterventionStatusBadge({ status }: { status: AttendanceInterventionStatus }) {
  const style: Record<AttendanceInterventionStatus, string> = {
    Open: "bg-blue-100 text-blue-900",
    Monitoring: "bg-violet-100 text-violet-900",
    Closed: "bg-gray-100 text-gray-700",
  }
  return <Badge className={style[status]}>{labelFromCode(status)}</Badge>
}

export function FormField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-gray-700">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  )
}
