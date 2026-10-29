import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Building2, Loader2 } from "lucide-react"
import type { SubUserDepartmentItemI } from "@/api/examAndRecords.api/types"
import { EmptyPlaceholder } from "./EmptyPlaceholder"

interface AssignedDepartmentsCardProps {
  teacherDepartments: SubUserDepartmentItemI[]
  isLoadingDepartments: boolean
}

export function AssignedDepartmentsCard({
  teacherDepartments,
  isLoadingDepartments,
}: AssignedDepartmentsCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Building2 className="h-4 w-4 text-gray-500" />
          Assigned Departments
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoadingDepartments ? (
          <div className="flex h-32 items-center justify-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading departments…</span>
          </div>
        ) : teacherDepartments.length === 0 ? (
          <EmptyPlaceholder
            icon={Building2}
            title="No departments assigned"
            description="This teacher has not been assigned to any department yet."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teacherDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">
                    {dept.departmentName}
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
