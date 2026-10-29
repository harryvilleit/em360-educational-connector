import { useState } from "react"
import { BookOpen, Loader2, Plus, Trash2 } from "lucide-react"
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
import { useGetSubjectsByClass, useRemoveClassSubject } from "@/hooks/examAndRecords"
import AssignSubjectToClassModal from "./AssignSubjectToClassModal"
import {
  normalizeSubjectRequirement,
  subjectRequirementLabel,
  SUBJECT_REQUIREMENT,
} from "@/utils/subjectRequirement.utils"

export function ClassSubjectsCard({
  classId,
  className,
  schoolId,
}: {
  classId: string
  className: string
  schoolId: string
}) {
  const { classSubjects, isLoading: subjectsLoading } = useGetSubjectsByClass({
    classId,
    schoolId,
  })
  const { removeClassSubjectAsync, isPending: isRemoving } = useRemoveClassSubject()

  const [assignSubjectOpen, setAssignSubjectOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Subjects</CardTitle>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAssignSubjectOpen(true)}
            >
              <Plus className="size-3.5" />
              Assign Subject
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {subjectsLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading subjects…
            </div>
          ) : classSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="mb-2 size-8 text-gray-300" />
              <p className="text-sm text-muted-foreground">
                No subjects assigned yet.{" "}
                <button
                  onClick={() => setAssignSubjectOpen(true)}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Assign subjects
                </button>
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Assigned</TableHead>
                  <TableHead className="w-16 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classSubjects.map((cs) => (
                  <TableRow key={cs.id}>
                    <TableCell>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                        <BookOpen className="h-4 w-4 text-green-600" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {cs.subjectName}
                        {normalizeSubjectRequirement(cs.requirement) !== undefined && (
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              normalizeSubjectRequirement(cs.requirement) ===
                              SUBJECT_REQUIREMENT.Mandatory
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {subjectRequirementLabel(cs.requirement)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        cs.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {cs.status || "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {format(new Date(cs.dateCreated), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isRemoving}
                        onClick={() => removeClassSubjectAsync(cs.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        {isRemoving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AssignSubjectToClassModal
        open={assignSubjectOpen}
        onClose={() => setAssignSubjectOpen(false)}
        classId={classId}
        className={className}
        schoolId={schoolId}
      />
    </>
  )
}
