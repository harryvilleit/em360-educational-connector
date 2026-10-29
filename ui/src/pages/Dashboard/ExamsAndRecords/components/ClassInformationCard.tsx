import { BookOpen, CalendarDays, Hash, Layers, Loader2, Tag } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ClassItem, ClassArmItem } from "@/api/examAndRecords.api/types"
import { InfoRow } from "./InfoRow"

export function ClassInformationCard({
  schoolClass,
  classArms,
  armsLoading,
}: {
  schoolClass: ClassItem
  classArms: ClassArmItem[]
  armsLoading: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Class Information</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-gray-50">
        <InfoRow icon={Hash} label="Class ID" value={
          <span className="font-mono text-xs text-gray-500">{schoolClass.Id}</span>
        } />
        <InfoRow icon={BookOpen} label="Class Name" value={schoolClass.ClsName} />
        <InfoRow icon={Tag} label="Category" value={schoolClass.CategoryName} />
        <InfoRow
          icon={CalendarDays}
          label="Date Created"
          value={format(new Date(schoolClass.DateCreated), "MMM d, yyyy")}
        />
        <InfoRow
          icon={Layers}
          label="Arms"
          value={
            armsLoading ? (
              <Loader2 className="size-3.5 animate-spin text-gray-400" />
            ) : classArms.length === 0 ? (
              <span className="text-gray-400">None assigned</span>
            ) : (
              <div className="flex flex-wrap justify-end gap-1">
                {classArms.map((arm) => (
                  <span
                    key={arm.Id}
                    className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700"
                  >
                    {arm.ArmName}
                  </span>
                ))}
              </div>
            )
          }
        />
      </CardContent>
    </Card>
  )
}
