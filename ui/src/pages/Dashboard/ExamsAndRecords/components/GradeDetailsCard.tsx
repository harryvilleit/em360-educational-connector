import { CalendarDays, GraduationCap, Hash } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SchoolGradeItem } from "@/api/examAndRecords.api/types"

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="text-right text-sm font-medium text-gray-900">
        {value}
      </div>
    </div>
  )
}

export function GradeDetailsCard({ grade }: { grade: SchoolGradeItem }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Grade information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Grade Information
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-50">
          <InfoRow
            icon={Hash}
            label="Grade ID"
            value={
              <span className="font-mono text-xs text-gray-500">
                {grade.Id}
              </span>
            }
          />
          <InfoRow
            icon={GraduationCap}
            label="Grade"
            value={
              <span className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                {grade.Grade}
              </span>
            }
          />
          <InfoRow
            icon={Hash}
            label="Description"
            value={
              grade.Description || <span className="text-gray-400">—</span>
            }
          />
          <InfoRow
            icon={Hash}
            label="Min Score"
            value={
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                {grade.MinScore}
              </span>
            }
          />
          <InfoRow
            icon={Hash}
            label="Max Score"
            value={
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                {grade.MaxScore}
              </span>
            }
          />
        </CardContent>
      </Card>

      {/* Meta information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            School Information
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-50">
          <InfoRow
            icon={GraduationCap}
            label="School"
            value={grade.SchoolName}
          />
          <InfoRow
            icon={CalendarDays}
            label="Date Created"
            value={format(new Date(grade.DateCreated), "MMM d, yyyy")}
          />
          <InfoRow
            icon={CalendarDays}
            label="Last Modified"
            value={format(new Date(grade.DateModified), "MMM d, yyyy")}
          />
        </CardContent>
      </Card>
    </div>
  )
}
