import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BookOpen, Loader2 } from "lucide-react"
import type { SubUserSubjectItemI } from "@/api/examAndRecords.api/types"
import { EmptyPlaceholder } from "./EmptyPlaceholder"

interface AssignedSubjectsCardProps {
  teacherSubjects: SubUserSubjectItemI[]
  isLoadingSubjects: boolean
}

export function AssignedSubjectsCard({
  teacherSubjects,
  isLoadingSubjects,
}: AssignedSubjectsCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BookOpen className="h-4 w-4 text-gray-500" />
          Assigned Subjects
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoadingSubjects ? (
          <div className="flex h-32 items-center justify-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading subjects…</span>
          </div>
        ) : teacherSubjects.length === 0 ? (
          <EmptyPlaceholder
            icon={BookOpen}
            title="No subjects assigned"
            description="This teacher has not been assigned any subjects yet."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teacherSubjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">
                    {subject.subjectName}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        subject.statusName === "Active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {subject.statusName || "—"}
                    </span>
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
