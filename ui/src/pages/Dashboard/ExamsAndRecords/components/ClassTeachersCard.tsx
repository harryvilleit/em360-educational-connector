import { useState } from "react"
import { Loader2, Plus, Trash2, User, Users } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useGetClassTeachers,
  useRemoveTeacherFromClass,
} from "@/hooks/examAndRecords"
import AssignTeacherToClassModal from "./AssignTeacherToClassModal"

export function ClassTeachersCard({
  classId,
  className,
  schoolId,
}: {
  classId: string
  className: string
  schoolId: string
}) {
  const { classTeachers, isLoading: teachersLoading } = useGetClassTeachers({
    classId,
    schoolId,
  })
  const { removeTeacherFromClassAsync, isPending: isRemovingTeacher } =
    useRemoveTeacherFromClass()

  const [assignTeacherOpen, setAssignTeacherOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Teachers</CardTitle>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAssignTeacherOpen(true)}
            >
              <Plus className="size-3.5" />
              Assign Teacher
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {teachersLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading teachers…
            </div>
          ) : classTeachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-2 size-8 text-gray-300" />
              <p className="text-sm text-muted-foreground">
                No teachers assigned yet.{" "}
                <button
                  onClick={() => setAssignTeacherOpen(true)}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Assign a teacher
                </button>
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Assigned</TableHead>
                  <TableHead className="w-16 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classTeachers.map((ct) => {
                  const teacherName = ct.subUserName
                  const teacherEmail = ct.subUserEmail || "—"

                  return (
                    <TableRow key={ct.id}>
                      <TableCell>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {teacherName}
                      </TableCell>
                      <TableCell className="text-gray-600">{teacherEmail}</TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          ct.statusName === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {ct.statusName || "Active"}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {format(new Date(ct.dateCreated), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isRemovingTeacher}
                          onClick={() => removeTeacherFromClassAsync(ct.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          {isRemovingTeacher ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AssignTeacherToClassModal
        open={assignTeacherOpen}
        onClose={() => setAssignTeacherOpen(false)}
        classId={classId}
        className={className}
        schoolId={schoolId}
      />
    </>
  )
}
