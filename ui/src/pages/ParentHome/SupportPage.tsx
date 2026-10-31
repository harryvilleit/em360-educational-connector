import { useState } from "react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGuardianPortal } from "@/contexts/GuardianPortalContext"
import FamilySupportView from "@/components/learnerSupport/FamilySupportView"

export default function ParentSupportPage() {
  const schoolId = useSchoolId()
  const { portal, isLoading } = useGuardianPortal()
  const [selectedStudentId, setSelectedStudentId] = useState("")
  if (isLoading)
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading children…
      </p>
    )
  if (!portal?.children.length)
    return (
      <p className="rounded-xl border p-6 text-sm">
        No linked learner records were found for this account.
      </p>
    )
  const studentId = selectedStudentId || portal.children[0].studentId
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <label className="grid gap-1 text-sm font-medium">
          Learner
          <select
            className="h-10 min-w-64 rounded-lg border bg-white px-3"
            value={studentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            {portal.children.map((child) => (
              <option key={child.studentId} value={child.studentId}>
                {child.fullName}
              </option>
            ))}
          </select>
        </label>
      </div>
      <FamilySupportView
        schoolId={schoolId}
        studentId={studentId}
        actor="parent"
      />
    </div>
  )
}
