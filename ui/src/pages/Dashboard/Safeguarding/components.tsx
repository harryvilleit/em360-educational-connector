import type { ReactNode } from "react"
import { LockKeyhole, ShieldAlert, ShieldX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useSafeguardingAccess } from "@/hooks/safeguarding"
import { useStudentSupportSettings } from "@/hooks/studentSupportSettings"
import type {
  SafeguardingCaseStatus,
  SafeguardingRiskLevel,
} from "@/api/safeguarding.api"
import { labelFromCode } from "./utils"

export function SafeguardingAccessGate({
  require,
  children,
}: {
  require: "submit" | "view" | "manage" | "configure"
  children: ReactNode
}) {
  const schoolId = useSchoolId()
  const { access, isPending } = useSafeguardingAccess(schoolId)
  const { settings } = useStudentSupportSettings(schoolId)
  if (isPending)
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  const allowed =
    require === "submit"
      ? access?.canSubmitConcern
      : require === "view"
        ? access?.canViewCases
        : require === "manage"
          ? access?.canManageCases
          : access?.canConfigureAccess
  if (!allowed) {
    return (
      <Card className="border-red-100 bg-red-50/40 py-14">
        <CardContent className="mx-auto max-w-xl text-center">
          <ShieldX className="mx-auto mb-3 size-9 text-red-700" />
          <h2 className="text-lg font-semibold">
            Restricted safeguarding area
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Confidential case records are limited to the {settings?.safeguardingLeadTitle ?? "safeguarding lead"}, {settings?.deputySafeguardingLeadTitle ?? "deputy safeguarding lead"} and
            appointed reviewers. School administration access does not
            automatically include case access.
          </p>
        </CardContent>
      </Card>
    )
  }
  return <>{children}</>
}

export function ConfidentialBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <LockKeyhole className="mt-0.5 size-4 shrink-0" />
      <div>
        <strong>Highly confidential.</strong> Access is audited. Record factual
        observations and share only on a need-to-know basis.
      </div>
    </div>
  )
}

export function EmergencyBanner() {
  const schoolId = useSchoolId()
  const { settings } = useStudentSupportSettings(schoolId)
  const contact = settings?.emergencyPhoneNumber
    ? `call ${settings.emergencyServicesName} on ${settings.emergencyPhoneNumber}`
    : `contact ${settings?.emergencyServicesName ?? "local emergency services"}`
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">
      <ShieldAlert className="mt-0.5 size-5 shrink-0" />
      <div>
        <strong>If anyone is in immediate danger, {contact}.</strong>{" "}
        {settings?.emergencyGuidance ?? "Follow the school's local emergency and child-protection procedure."}{" "}
        Submitting this form does not contact emergency services.
      </div>
    </div>
  )
}

export function FormField({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-gray-700">
      {label}
      {children}
      {hint && (
        <span className="text-xs font-normal text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  )
}

export function EmptySafeguarding({ children }: { children: ReactNode }) {
  return (
    <Card className="border-dashed py-12">
      <CardContent className="text-center text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  )
}

export function StatusBadge({ status }: { status: SafeguardingCaseStatus }) {
  const style: Record<SafeguardingCaseStatus, string> = {
    Submitted: "bg-amber-100 text-amber-900",
    AwaitingTriage: "bg-orange-100 text-orange-900",
    Open: "bg-blue-100 text-blue-900",
    Monitoring: "bg-violet-100 text-violet-900",
    ReferredExternally: "bg-purple-100 text-purple-900",
    Closed: "bg-gray-100 text-gray-700",
  }
  return <Badge className={style[status]}>{labelFromCode(status)}</Badge>
}

export function RiskBadge({ risk }: { risk: SafeguardingRiskLevel }) {
  const style: Record<SafeguardingRiskLevel, string> = {
    NotAssessed: "bg-gray-100 text-gray-700",
    Low: "bg-emerald-100 text-emerald-900",
    Medium: "bg-amber-100 text-amber-900",
    High: "bg-orange-100 text-orange-900",
    Critical: "bg-red-100 text-red-900",
  }
  return <Badge className={style[risk]}>{labelFromCode(risk)}</Badge>
}
