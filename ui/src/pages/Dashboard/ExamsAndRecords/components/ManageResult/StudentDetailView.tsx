import { useMemo } from "react"
import { ArrowLeft, CheckCircle2, Edit2, Loader2 } from "lucide-react"
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { formatDateTime } from "@/utils"
import ReportCardButton from "@/components/report-card/ReportCardButton"
import type { CommentData, StudentResultDetail } from "./types"
import { StudentStatusBadge } from "./StudentStatusBadge"

interface StudentDetailViewProps {
  student: StudentResultDetail
  comments: CommentData[]
  onBack: () => void
  onAddRemark: () => void
  onPublishStudent: () => void
  isPublishing: boolean
}

export function StudentDetailView({
  student,
  comments,
  onBack,
  onAddRemark,
  onPublishStudent,
  isPublishing,
}: StudentDetailViewProps) {
  const chartData = useMemo(
    () =>
      student.subjects.map((subject) => ({
        name: subject.name,
        CA: subject.caScore,
        Exam: subject.examScore,
        Total: subject.total,
      })),
    [student.subjects]
  )

  // Assessment columns are whatever the backend actually recorded for these
  // subjects (2 CAs, 3 CAs, or something else entirely) — never a fixed
  // CA1/CA2/CA3 shape. Non-exam assessments first, in first-seen order,
  // with any "Exam"-named assessment pushed to the end.
  const assessmentColumns = useMemo(() => {
    const seen = new Set<string>()
    const examNames: string[] = []
    const otherNames: string[] = []
    for (const subject of student.subjects) {
      for (const a of subject.assessments) {
        if (seen.has(a.name)) continue
        seen.add(a.name)
        if (/exam/i.test(a.name)) examNames.push(a.name)
        else otherNames.push(a.name)
      }
    }
    return [...otherNames, ...examNames]
  }, [student.subjects])

  const studentComments = useMemo(
    () => comments.filter((c) => c.studentId === student.studentId),
    [comments, student.studentId]
  )

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
              {student.studentName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Student ID: {student.admissionNumber} • Position: {student.position}/
              {student.totalStudents}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <StudentStatusBadge status={student.status} />
              {student.datePublished && (
                <span className="text-xs text-muted-foreground">
                  Published: {formatDateTime(student.datePublished)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <ReportCardButton
            result={{
              student: {
                name: student.studentName,
                admissionNumber: student.admissionNumber,
                className: student.className,
                session: student.sessionName,
                term: student.termName,
              },
              subjects: student.subjects.map((subject) => ({
                name: subject.name,
                assessments: subject.assessments,
                total: subject.total,
                grade: subject.grade,
              })),
              summary: {
                totalScore: student.totalScore,
                averageScore: student.averageGrade,
                position: student.position,
                totalStudents: student.totalStudents,
              },
              remark: student.remark,
            }}
          />
          {!student.isPublished && (
            <Button
              onClick={onPublishStudent}
              disabled={isPublishing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Publish Result
                </>
              )}
            </Button>
          )}
          <Button
            onClick={onAddRemark}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Add Remark
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{student.totalScore}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Out of {student.subjects.length * 100}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {student.averageGrade.toFixed(2)}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Across all subjects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{student.position}</div>
            <p className="mt-2 text-xs text-muted-foreground">
              Out of {student.totalStudents} students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="CA" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Exam" stackId="a" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Subject Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  {assessmentColumns.map((col) => (
                    <TableHead key={col} className="text-center">
                      {col}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.subjects.map((subject) => {
                  const scoreByName = new Map(
                    subject.assessments.map((a) => [a.name, a.score])
                  )
                  return (
                    <TableRow key={subject.name}>
                      <TableCell className="font-medium">
                        {subject.name}
                      </TableCell>
                      {assessmentColumns.map((col) => (
                        <TableCell key={col} className="text-center">
                          {scoreByName.has(col) ? scoreByName.get(col) : "–"}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-medium">
                        {subject.total}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                          {subject.grade}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Remarks */}
      <Card>
        <CardHeader>
          <CardTitle>Remarks & Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {student.remark && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-900">
                Class Teacher Remark
              </p>
              <p className="mt-2 text-sm text-gray-600">{student.remark}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Added recently
              </p>
            </div>
          )}

          {studentComments.map((comment, index) => (
            <div
              key={index}
              className="rounded-lg border border-blue-200 bg-blue-50 p-4"
            >
              <p className="text-sm font-medium text-gray-900">
                {comment.addedBy}
              </p>
              <p className="mt-2 text-sm text-gray-600">{comment.remark}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {comment.timestamp}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
