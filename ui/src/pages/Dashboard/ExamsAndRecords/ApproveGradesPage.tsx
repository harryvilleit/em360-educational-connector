import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/general/PageHeader"
import ApprovalActionModal from "./components/ApprovalActionModal"
import GradeStatsCards from "./components/GradeStatsCards"
import GradeWorksheetsTable from "./components/GradeWorksheetsTable"
import type { StatusFilter } from "./components/GradeWorksheetsTable"
import { useNavigate, useParams } from "react-router"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useCurrentAcademicStore } from "@/store/currentAcademic.store"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import {
  useGetAllGradeWorksheets,
  useApproveGradeWorksheet,
  useRejectGradeWorksheet,
} from "@/hooks/examAndRecords"
import { DashboardRoutes } from "@/routes"
import type { GradeWorksheetSummaryI } from "@/api/examAndRecords.api/types"

export default function ApproveGradesPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const schoolId = useSchoolId()
  const currentSessionId = useCurrentAcademicStore((s) => s.currentSessionId)

  const { sessions } = useGetAllSchoolSessions({ schoolId })

  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    currentSessionId || ""
  )
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending")

  useEffect(() => {
    if (sessions.length === 0) return
    const isValid = sessions.some((s) => s.Id === selectedSessionId)
    if (!isValid) {
      const fallback =
        sessions.find((s) => s.Id === currentSessionId) ?? sessions[0]
      setSelectedSessionId(fallback.Id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions])

  const { worksheets, isLoading: worksheetsLoading } = useGetAllGradeWorksheets({
    schoolId,
    sessionId: selectedSessionId || undefined,
  })

  const [selectedWorksheet, setSelectedWorksheet] =
    useState<GradeWorksheetSummaryI | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject">("approve")
  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false)

  const filteredEntries = useMemo(() => {
    if (statusFilter === "all") return worksheets
    return worksheets.filter((w) => w.status.toLowerCase() === statusFilter)
  }, [worksheets, statusFilter])

  const stats = useMemo(
    () => ({
      pending: worksheets.filter((w) => w.status.toLowerCase() === "pending").length,
      approved: worksheets.filter((w) => w.status.toLowerCase() === "approved").length,
      rejected: worksheets.filter((w) => w.status.toLowerCase() === "rejected").length,
    }),
    [worksheets]
  )

  const { approveGradeWorksheet, isPending: isApproving } =
    useApproveGradeWorksheet({
      onSuccess: () => {
        setActionModalOpen(false)
        setSelectedWorksheet(null)
      },
    })

  const { rejectGradeWorksheet, isPending: isRejecting } =
    useRejectGradeWorksheet({
      onSuccess: () => {
        setActionModalOpen(false)
        setSelectedWorksheet(null)
      },
    })

  const isActionLoading = isApproving || isRejecting

  const handleOpenApprove = useCallback((entry: GradeWorksheetSummaryI) => {
    setSelectedWorksheet(entry)
    setActionType("approve")
    setActionModalOpen(true)
  }, [])

  const handleOpenReject = useCallback((entry: GradeWorksheetSummaryI) => {
    setSelectedWorksheet(entry)
    setActionType("reject")
    setActionModalOpen(true)
  }, [])

  const handleConfirmAction = (reason?: string) => {
    if (!selectedWorksheet) return
    if (actionType === "approve") {
      approveGradeWorksheet(selectedWorksheet.worksheetId)
    } else if (reason) {
      rejectGradeWorksheet({
        worksheetId: selectedWorksheet.worksheetId,
        reason,
      })
    }
  }

  const handleView = useCallback(
    (entry: GradeWorksheetSummaryI) => {
      navigate(DashboardRoutes.toWorksheetDetail(productId!, entry.worksheetId))
    },
    [navigate, productId]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grade Approval"
        description="Review and approve submitted student grades"
        actions={
          <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((session) => (
                <SelectItem key={session.Id} value={session.Id}>
                  {session.SessionName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <GradeStatsCards stats={stats} />

      <GradeWorksheetsTable
        isLoading={worksheetsLoading}
        filteredEntries={filteredEntries}
        stats={stats}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onView={handleView}
        onApprove={handleOpenApprove}
        onReject={handleOpenReject}
      />

      {selectedWorksheet && (
        <ApprovalActionModal
          open={actionModalOpen}
          onOpenChange={setActionModalOpen}
          action={actionType}
          gradeName={`${selectedWorksheet.className} - ${selectedWorksheet.subjectName}`}
          className={selectedWorksheet.className}
          subjectName={selectedWorksheet.subjectName}
          studentCount={selectedWorksheet.totalStudents}
          isLoading={isActionLoading}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  )
}
