import { GraduationCap, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClassItem } from "@/api/examAndRecords.api/types"
import { InfoRow } from "./InfoRow"

export function SchoolInformationCard({
  schoolClass,
}: {
  schoolClass: ClassItem
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">School Information</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-gray-50">
        <InfoRow icon={GraduationCap} label="School" value={schoolClass.SchoolName} />
        <InfoRow
          icon={Tag}
          label="School ID"
          value={
            <span className="font-mono text-xs text-gray-500">{schoolClass.SchoolId}</span>
          }
        />
      </CardContent>
    </Card>
  )
}
