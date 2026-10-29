import { useParams, useNavigate } from "react-router"
import { ArrowLeft, GraduationCap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardRoutes } from "@/routes"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetClassById, useGetClassArms } from "@/hooks/examAndRecords"
import { ClassInformationCard } from "./components/ClassInformationCard"
import { SchoolInformationCard } from "./components/SchoolInformationCard"
import { ClassSubjectsCard } from "./components/ClassSubjectsCard"
import { ClassTeachersCard } from "./components/ClassTeachersCard"

export default function ClassDetailPage() {
  const { classId, productId } = useParams<{ classId: string; productId: string }>()
  const navigate = useNavigate()
  const schoolId = useSchoolId()

  const { schoolClass, isLoading } = useGetClassById(classId ?? "")
  const { classArms, isLoading: armsLoading } = useGetClassArms(classId ?? "")

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    )
  }

  // ── Not found ─────────────────────────────────────────────────────────────────
  if (!schoolClass) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
          <GraduationCap className="h-10 w-10 text-blue-400" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">Class not found</h2>
        <p className="mt-2 text-sm text-gray-500">
          This class may have been deleted or doesn't exist.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => navigate(DashboardRoutes.toClasses(productId ?? ""))}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Classes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            {schoolClass.ClsName}
            {classArms.map((arm) => (
              <Badge
                key={arm.Id}
                variant="secondary"
                className="bg-blue-50 text-blue-700"
              >
                {arm.ArmName}
              </Badge>
            ))}
          </span>
        }
        description={`${schoolClass.CategoryName} · ${schoolClass.SchoolName}`}
        onBack={() => navigate(DashboardRoutes.toClasses(productId ?? ""))}
        backLabel="Back to Classes"
      />

      {/* Detail cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ClassInformationCard
          schoolClass={schoolClass}
          classArms={classArms}
          armsLoading={armsLoading}
        />
        <SchoolInformationCard schoolClass={schoolClass} />
      </div>

      <ClassSubjectsCard
        classId={classId ?? ""}
        className={schoolClass.ClsName}
        schoolId={schoolId}
      />

      <ClassTeachersCard
        classId={classId ?? ""}
        className={schoolClass.ClsName}
        schoolId={schoolId}
      />
    </div>
  )
}
