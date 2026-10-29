// WordPress version: Export downloads every student in the class result as CSV.
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  Loader2,
  MessageSquare,
  MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SearchInput } from "@/components/ui/search-input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ClassResult, StudentResultDetail } from "@/pages/Dashboard/ExamsAndRecords/components/ManageResult/types"
import { StudentStatusBadge } from "@/pages/Dashboard/ExamsAndRecords/components/ManageResult/StudentStatusBadge"

interface ClassDetailViewProps {
  onExport: () => void
  exporting: boolean
  currentResult: ClassResult | undefined
  filteredStudents: StudentResultDetail[]
  searchStudent: string
  onSearchChange: (value: string) => void
  onBack: () => void
  onViewStudent: (studentId: string) => void
  onAddRemark: (studentId: string) => void
  onPublishClick: () => void
  onPublishStudent: (student: StudentResultDetail) => void
  publishingStudentResultId: string | null
}

export function ClassDetailView({
  onExport,
  exporting,
  currentResult,
  filteredStudents,
  searchStudent,
  onSearchChange,
  onBack,
  onViewStudent,
  onAddRemark,
  onPublishClick,
  onPublishStudent,
  publishingStudentResultId,
}: ClassDetailViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentResult?.className} - Term {currentResult?.term}{" "}
              {currentResult?.session}
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentResult?.resultsCollected}/{currentResult?.totalStudents}{" "}
              results collected
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {currentResult?.status !== "published" ? (
            <Button
              onClick={onPublishClick}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Publish Results
            </Button>
          ) : (
            <Button disabled className="bg-emerald-600">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Published
            </Button>
          )}
          <Button variant="outline" onClick={onExport} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {currentResult?.status === "draft" && "Results in Draft"}
              {currentResult?.status === "submitted" && "Results Submitted"}
              {currentResult?.status === "approved" && "Results Approved"}
              {currentResult?.status === "published" && "Results Published"}
            </p>
            <p className="text-sm text-gray-600">{currentResult?.comments}</p>
          </div>
          <div>
            {currentResult?.status === "draft" && (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            {currentResult?.status === "submitted" && (
              <AlertCircle className="h-5 w-5 text-blue-600" />
            )}
            {(currentResult?.status === "approved" ||
              currentResult?.status === "published") && (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <SearchInput
        placeholder="Search student name or ID..."
        value={searchStudent}
        onChange={onSearchChange}
        containerClassName="max-w-sm"
      />

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Results</CardTitle>
          <CardDescription>
            View and manage individual student results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Total Score</TableHead>
                  <TableHead>Average</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-6 text-center">
                      <p className="text-muted-foreground">No students found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.studentId}>
                      <TableCell className="font-medium">
                        {student.position}/{student.totalStudents}
                      </TableCell>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {student.admissionNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.totalScore}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                          {student.averageGrade.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StudentStatusBadge status={student.status} />
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {student.remark || "No remark"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!student.isPublished && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-600 text-green-700 hover:bg-green-50"
                              disabled={
                                publishingStudentResultId === student.studentId
                              }
                              onClick={() => onPublishStudent(student)}
                            >
                              {publishingStudentResultId ===
                              student.studentId ? (
                                <>
                                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                  Publishing...
                                </>
                              ) : (
                                "Publish Result"
                              )}
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => onViewStudent(student.studentId)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onAddRemark(student.studentId)}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Add Remark
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
