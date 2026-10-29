import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { School, GraduationCap } from "lucide-react"
import type { TeacherAssignedClassI } from "@/api/examAndRecords.api/types"
import { EmptyPlaceholder } from "./EmptyPlaceholder"

interface AssignedClassesCardProps {
  assignedClasses: TeacherAssignedClassI[]
}

export function AssignedClassesCard({
  assignedClasses,
}: AssignedClassesCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <School className="h-4 w-4 text-gray-500" />
          Assigned Classes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {assignedClasses.length === 0 ? (
          <EmptyPlaceholder
            icon={GraduationCap}
            title="No classes assigned"
            description="This teacher is not currently assigned to any classes."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Class</TableHead>
                <TableHead>Arms</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedClasses.map((cls) => (
                <TableRow key={cls.classId}>
                  <TableCell className="font-medium">
                    <p>{cls.className}</p>
                    {cls.categoryName && (
                      <p className="text-xs text-gray-400">
                        {cls.categoryName}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {cls.arms.length > 0
                      ? cls.arms.map((a) => a.armName).join(", ")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
