import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { LearnerSupportCaseStatus } from "@/api/learnerSupport.api"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useStudentSupportSettings } from "@/hooks/studentSupportSettings"
import { learnerSupportLabel } from "./utils"

export function StatusBadge({ status }: { status: LearnerSupportCaseStatus }) {
  const schoolId = useSchoolId()
  const { settings } = useStudentSupportSettings(schoolId)
  const styles: Partial<Record<LearnerSupportCaseStatus, string>> = {
    Submitted: "bg-amber-100 text-amber-800",
    UnderTriage: "bg-blue-100 text-blue-800",
    Assessing: "bg-violet-100 text-violet-800",
    SupportPlanActive: "bg-emerald-100 text-emerald-800",
    ReviewDue: "bg-orange-100 text-orange-800",
    StatutoryAssessment: "bg-purple-100 text-purple-800",
    StatutoryPlanActive: "bg-teal-100 text-teal-800",
    Monitoring: "bg-sky-100 text-sky-800",
    Closed: "bg-gray-100 text-gray-700",
  }
  return (
    <Badge className={styles[status] ?? "bg-gray-100 text-gray-700"}>
      {learnerSupportLabel(status, settings)}
    </Badge>
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

export function EmptySupport({ children }: { children: ReactNode }) {
  return (
    <Card className="border-dashed py-12">
      <CardContent className="text-center text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  )
}
