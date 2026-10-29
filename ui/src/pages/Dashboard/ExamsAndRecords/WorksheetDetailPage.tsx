import { useState, useMemo, memo } from "react"
import { useNavigate, useParams } from "react-router"
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Layers,
  Mail,
  Trophy,
  User,
  Users,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import ApprovalActionModal from "./components/ApprovalActionModal"
import {
  useGetGradeWorksheetById,
  useApproveGradeWorksheet,
  useRejectGradeWorksheet,
} from "@/hooks/examAndRecords"
import { useGetSubUserAccessEdit } from "@/hooks/userMgt"
import { useSchoolId } from "@/contexts/SchoolContext"
import { DashboardRoutes } from "@/routes"
import { getGradeColor, getOrdinalRank } from "@/utils"

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  if (s === "approved")
    return (
      <Badge className="gap-1.5 border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
        <CheckCircle2 className="h-3 w-3" />
        Approved
      </Badge>
    )
  if (s === "rejected")
    return (
      <Badge className="gap-1.5 border-red-200 bg-red-50 text-red-700 hover:bg-red-50">
        <XCircle className="h-3 w-3" />
        Rejected
      </Badge>
    )
  return (
    <Badge className="gap-1.5 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
      <Clock className="h-3 w-3" />
      Pending Review
    </Badge>
  )
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      <span className="text-sm text-gray-500">{label}:</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  )
}

function GradeBar({
  label,
  count,
  total,
  barClass,
  textClass,
}: {
  label: string
  count: number
  total: number
  barClass: string
  textClass: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className={`w-16 text-sm font-semibold ${textClass}`}>{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full transition-all ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-sm font-bold text-gray-800">
        {count}
      </span>
      <span className="w-10 text-right text-xs text-gray-400">{pct}%</span>
    </div>
  )
}

const PositionCell = memo(function PositionCell({ position }: { position: number }) {
  if (position === 1)
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-100 text-sm font-bold text-yellow-700">
        1
      </span>
    )
  if (position === 2)
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
        2
      </span>
    )
  if (position === 3)
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
        3
      </span>
    )
  return (
    <span className="text-sm text-gray-500">{getOrdinalRank(position)}</span>
  )
})


export default function WorksheetDetailPage() {
  const { productId, worksheetId } = useParams<{
    productId: string
    worksheetId: string
  }>()
  const navigate = useNavigate()
  const schoolId = useSchoolId()

  const { worksheet, isLoading } = useGetGradeWorksheetById(worksheetId ?? "")



  const { subUserAccessEdit, isLoading: isLoadingSubmitter } =
    useGetSubUserAccessEdit({
      subUserId: worksheet?.submittedBy ?? "",
      schoolId,
    })

  const submitterName = subUserAccessEdit
    ? [subUserAccessEdit.SubUserFirstName, subUserAccessEdit.SubUserLastName]
        .filter(Boolean)
        .join(" ")
    : null
  const submitterEmail = subUserAccessEdit?.SubUserEmail ?? null

  const [actionType, setActionType] = useState<"approve" | "reject">("approve")
  const [actionModalOpen, setActionModalOpen] = useState(false)

  const { approveGradeWorksheet, isPending: isApproving } =
    useApproveGradeWorksheet({
      onSuccess: () => setActionModalOpen(false),
    })

  const { rejectGradeWorksheet, isPending: isRejecting } =
    useRejectGradeWorksheet({
      onSuccess: () => setActionModalOpen(false),
    })

  const scoreColumns = useMemo(() => {
    if (!worksheet) return []
    const keys = new Set<string>()
    worksheet.students.forEach((s) =>
      Object.keys(s.scores).forEach((k) => keys.add(k))
    )
    return Array.from(keys)
  }, [worksheet])

  const submittedDate = worksheet?.submittedOn
    ? new Date(worksheet.submittedOn).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A"

  const isPending = worksheet?.status.toLowerCase() === "pending"

  const handleConfirm = (reason?: string) => {
    if (!worksheet) return
    if (actionType === "approve") {
      approveGradeWorksheet(worksheet.worksheetId)
    } else if (reason) {
      rejectGradeWorksheet({ worksheetId: worksheet.worksheetId, reason })
    }
  }

  const openApprove = () => {
    setActionType("approve")
    setActionModalOpen(true)
  }

  const openReject = () => {
    setActionType("reject")
    setActionModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Worksheet Details"
        description={
          isLoading || !worksheet
            ? "Loading…"
            : `${worksheet.className} — ${worksheet.subjectName}`
        }
        onBack={() => navigate(DashboardRoutes.toApproveGrades(productId!))}
        backLabel="Grade Approval"
        actions={
          worksheet && (
            <>
              <StatusBadge status={worksheet.status} />
              {isPending && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={openReject}
                    disabled={isApproving || isRejecting}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-green-600 text-white hover:bg-green-700"
                    onClick={openApprove}
                    disabled={isApproving || isRejecting}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                </>
              )}
            </>
          )
        }
      />

      {isLoading || !worksheet ? (
        <div className="flex items-center justify-center py-32">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Context strip ── */}
          <Card className="border-gray-100 bg-gray-50/60">
            <CardContent className="flex flex-wrap gap-x-6 gap-y-2 py-4">
              <MetaItem icon={Layers} label="Class" value={worksheet.className} />
              <MetaItem icon={BookOpen} label="Subject" value={worksheet.subjectName} />
              <MetaItem icon={CalendarDays} label="Term" value={worksheet.termName} />
              <MetaItem icon={CalendarDays} label="Session" value={worksheet.sessionName} />
              <MetaItem icon={Users} label="Students" value={String(worksheet.totalStudents)} />
              <MetaItem icon={Clock} label="Submitted" value={submittedDate} />
              {worksheet.submittedBy && (
                <MetaItem
                  icon={User}
                  label="Submitted by"
                  value={isLoadingSubmitter ? "Loading…" : (submitterName || "—")}
                />
              )}
              {submitterEmail && (
                <MetaItem icon={Mail} label="Email" value={submitterEmail} />
              )}
            </CardContent>
          </Card>

          {/* ── Metrics row ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Performance summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Average — hero number */}
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-bold tracking-tight text-indigo-600">
                    {worksheet.averageScore.toFixed(1)}
                  </span>
                  <span className="mb-1.5 text-lg font-medium text-indigo-400">
                    %
                  </span>
                  <span className="mb-1.5 text-sm text-gray-400">
                    class average
                  </span>
                </div>

                {/* Highest / Lowest / Below C */}
                <div className="grid grid-cols-3 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-400">Highest</p>
                    <p className="mt-0.5 text-xl font-bold text-green-600">
                      {worksheet.highestScore}
                    </p>
                  </div>
                  <div className="border-x border-gray-100 text-center">
                    <p className="text-xs font-medium text-gray-400">Lowest</p>
                    <p className="mt-0.5 text-xl font-bold text-orange-500">
                      {worksheet.lowestScore}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-400">Below C</p>
                    <p className="mt-0.5 text-xl font-bold text-red-500">
                      {worksheet.belowC}
                    </p>
                  </div>
                </div>

                {/* Top performer */}
                {worksheet.topPerformer && (
                  <div className="flex items-center gap-3 rounded-xl border border-yellow-100 bg-yellow-50 px-4 py-3">
                    <Trophy className="h-5 w-5 shrink-0 text-yellow-500" />
                    <div>
                      <p className="text-xs font-medium text-yellow-700">
                        Top Performer
                      </p>
                      <p className="text-sm font-bold text-yellow-900">
                        {worksheet.topPerformer.studentName}
                      </p>
                    </div>
                    <span className="ml-auto text-lg font-bold text-yellow-700">
                      {worksheet.topPerformer.score}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grade distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <GradeBar
                  label="Grade A"
                  count={worksheet.gradeA}
                  total={worksheet.totalStudents}
                  barClass="bg-green-500"
                  textClass="text-green-600"
                />
                <GradeBar
                  label="Grade B"
                  count={worksheet.gradeB}
                  total={worksheet.totalStudents}
                  barClass="bg-blue-500"
                  textClass="text-blue-600"
                />
                <GradeBar
                  label="Grade C"
                  count={worksheet.gradeC}
                  total={worksheet.totalStudents}
                  barClass="bg-amber-400"
                  textClass="text-amber-600"
                />
                <GradeBar
                  label="Below C"
                  count={worksheet.belowC}
                  total={worksheet.totalStudents}
                  barClass="bg-red-400"
                  textClass="text-red-500"
                />

                <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                  <p className="text-xs text-gray-400">Total students</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {worksheet.totalStudents}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Student grades table ── */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Student Grades
              </CardTitle>
              <span className="text-xs text-gray-400">
                {worksheet.students.length} students
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-100 bg-gray-50/70">
                      <TableHead className="w-16 pl-6 font-semibold text-gray-600">
                        Pos
                      </TableHead>
                      <TableHead className="font-semibold text-gray-600">
                        Student Name
                      </TableHead>
                      {scoreColumns.map((col) => (
                        <TableHead
                          key={col}
                          className="text-center font-semibold text-gray-600"
                        >
                          {col}
                        </TableHead>
                      ))}
                      <TableHead className="text-center font-semibold text-gray-600">
                        Total
                      </TableHead>
                      <TableHead className="pr-6 text-center font-semibold text-gray-600">
                        Grade
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {worksheet.students.map((student) => (
                      <TableRow
                        key={student.studentId}
                        className="border-b border-gray-50 hover:bg-gray-50/60"
                      >
                        <TableCell className="pl-6">
                          <PositionCell position={student.position} />
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {student.studentName}
                        </TableCell>
                        {scoreColumns.map((col) => (
                          <TableCell
                            key={col}
                            className="text-center text-sm text-gray-600"
                          >
                            {student.scores[col] ?? "—"}
                          </TableCell>
                        ))}
                        <TableCell className="text-center text-sm font-bold text-gray-900">
                          {student.total}
                        </TableCell>
                        <TableCell className="pr-6 text-center">
                          <Badge className={getGradeColor(student.grade)}>
                            {student.grade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {worksheet && (
        <ApprovalActionModal
          open={actionModalOpen}
          onOpenChange={setActionModalOpen}
          action={actionType}
          gradeName={`${worksheet.className} — ${worksheet.subjectName}`}
          className={worksheet.className}
          subjectName={worksheet.subjectName}
          studentCount={worksheet.totalStudents}
          isLoading={isApproving || isRejecting}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
