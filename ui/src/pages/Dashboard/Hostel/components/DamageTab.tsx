import { memo, useCallback, useMemo, useState } from "react"
import { useParams } from "react-router"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Plus,
  AlertCircle,
  AlertTriangle,
  DollarSign,
  FileText,
  User,
  ShieldAlert,
  ClipboardList,
  Loader2,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FilterSelect } from "@/components/ui/filter-select"
import { StatCard } from "@/components/general/StatCard"
import { FormDraftBanner } from "@/components/general/FormDraftBanner"
import { useFormDraft } from "@/hooks/useFormDraft"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetAllHostelRooms,
  useGetAllHostelReports,
  useFileHostelReport,
  useBillHostelReport,
  useWaiveHostelReport,
} from "@/hooks/hostel"
import { useGetSchoolStudents } from "@/hooks/studentPortal"
import type { HostelReportItemI } from "@/api/hostel.api/types"
import {
  REPORT_TYPE,
  REPORT_TYPE_OPTIONS,
  reportTypeLabel,
  isPropertyDamageReport,
  reportStatusLabel,
  isReportStatus,
} from "@/schema/hostelReport.schema"
import { DashboardRoutes } from "@/routes"
import { RequiredDataNotice } from "./RequiredDataNotice"

interface DamageTabProps {
  hostelId: string
}

const reportFormSchema = z
  .object({
    reportType: z.number(),
    roomId: z.string().min(1, "Room is required"),
    title: z.string().min(3, "Title is required"),
    description: z.string().min(5, "Description is required"),
    reportedBy: z.string().min(2, "Reporter name required"),
    estimatedCost: z.string().optional(),
  })
  .refine(
    (d) =>
      d.reportType !== REPORT_TYPE.PropertyDamage ||
      (d.estimatedCost && d.estimatedCost.trim().length > 0),
    {
      message: "Estimated cost is required for damage reports",
      path: ["estimatedCost"],
    }
  )

type ReportFormData = z.infer<typeof reportFormSchema>

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="size-3 shrink-0" />
      {message}
    </p>
  )
}

// ── Bill Modal ─────────────────────────────────────────────────────────────────

function BillModal({
  report,
  onClose,
}: {
  report: HostelReportItemI
  onClose: () => void
}) {
  const schoolId = useSchoolId()
  const { formatMoney } = useSchoolMoney()
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const [search, setSearch] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string
    name: string
  } | null>(null)

  const { students } = useGetSchoolStudents({
    schoolId,
    search: search || undefined,
    pageSize: 10,
  })
  const { pagination: studentTotals } = useGetSchoolStudents({
    schoolId,
    pageSize: 1,
  })
  const noStudentsExist = studentTotals.totalItems === 0

  const { billHostelReport, isPending } = useBillHostelReport({
    onSuccess: onClose,
  })

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bill Report to Student</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <p>
              <span className="font-medium">Report:</span> {report.title}
            </p>
            <p>
              <span className="font-medium">Estimated Cost:</span>{" "}
              {formatMoney(report.estimatedCost)}
            </p>
          </div>

          {!selectedStudent ? (
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Student to Bill
              </Label>
              <div className="relative mt-1.5">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
              {noStudentsExist ? (
                <RequiredDataNotice
                  itemLabel="a student"
                  pageLabel="Students"
                  to={DashboardRoutes.toStudentAdd(p)}
                />
              ) : (
                search.trim() && (
                  <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                    {students.length === 0 ? (
                      <div className="px-3 py-3 text-center text-sm text-gray-400">
                        No students found
                      </div>
                    ) : (
                      students.map((s) => (
                        <button
                          key={s.studentId}
                          type="button"
                          onClick={() =>
                            setSelectedStudent({
                              id: s.studentId,
                              name: `${s.firstname} ${s.lastname}`,
                            })
                          }
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50"
                        >
                          {s.firstname} {s.lastname}
                        </button>
                      ))
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
              <span className="text-sm font-medium text-blue-800">
                {selectedStudent.name}
              </span>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-xs text-blue-500 hover:underline"
              >
                Change
              </button>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedStudent &&
                billHostelReport({
                  id: report.id,
                  reportId: report.id,
                  studentId: selectedStudent.id,
                })
              }
              disabled={!selectedStudent || isPending}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
            >
              {isPending ? "Billing…" : "Bill Student"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Report Card ────────────────────────────────────────────────────────────────

const ReportCard = memo(function ReportCard({
  report,
  onBill,
  onWaive,
}: {
  report: HostelReportItemI
  onBill: (reportId: string) => void
  onWaive: (reportId: string) => void
}) {
  const { formatMoney } = useSchoolMoney()
  const isDamage = isPropertyDamageReport(report.reportType)
  const statusColors: Record<string, string> = {
    Reported: "border-orange-200 bg-orange-50 text-orange-700",
    Billed: "border-purple-200 bg-purple-50 text-purple-700",
    Waived: "border-gray-200 bg-gray-50 text-gray-600",
  }
  const statusLabel = reportStatusLabel(report.status)
  const colors =
    statusColors[statusLabel] ?? "border-gray-200 bg-gray-50 text-gray-600"

  return (
    <div className={`rounded-lg border p-4 ${colors}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold">
              {statusLabel}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                isDamage
                  ? "bg-red-100 text-red-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {reportTypeLabel(report.reportType)}
            </span>
            {report.roomNumber && (
              <span className="text-xs text-gray-600">
                Room {report.roomNumber}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900">{report.title}</p>
          <p className="line-clamp-2 text-sm text-gray-600">
            {report.description}
          </p>
          <div className="grid grid-cols-1 gap-1 text-xs text-gray-600 sm:grid-cols-2">
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3" />
              <span>Reported by: {report.reportedBy}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              <span>
                {new Date(report.dateCreated).toLocaleDateString("en-NG")}
              </span>
            </div>
            {report.studentName && (
              <div className="flex items-center gap-1.5 sm:col-span-2">
                <User className="h-3 w-3" />
                <span>Billed to: {report.studentName}</span>
              </div>
            )}
            {isDamage && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3 w-3" />
                <span>{formatMoney(report.estimatedCost)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-col">
          {isReportStatus(report.status, "Reported") && (
            <Button
              size="sm"
              onClick={() => onBill(report.id)}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              <DollarSign className="mr-1 h-3 w-3" />
              Bill Student
            </Button>
          )}
          {!isReportStatus(report.status, "Waived") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onWaive(report.id)}
              className="text-gray-600"
            >
              Waive
            </Button>
          )}
        </div>
      </div>
    </div>
  )
})

// ── Tab ──────────────────────────────────────────────────────────────────────

export default function DamageTab({ hostelId }: DamageTabProps) {
  const schoolId = useSchoolId()
  const { currencyCode } = useSchoolMoney()
  const { productId } = useParams<{ productId: string }>()
  const p = productId ?? ""
  const { rooms } = useGetAllHostelRooms({ schoolId, pageSize: 200 })
  const hostelRooms = useMemo(
    () => rooms.filter((r) => r.hostelId === hostelId),
    [rooms, hostelId]
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [billTarget, setBillTarget] = useState<HostelReportItemI | null>(null)
  const [filter, setFilter] = useState<"all" | "0" | "1">("all")

  const { reports, isLoading } = useGetAllHostelReports({
    hostelId,
    reportType: filter !== "all" ? filter : undefined,
    pageSize: 100,
  })

  const { fileHostelReport, isPending: isFiling } = useFileHostelReport({
    onSuccess: () => {
      reset()
      setModalOpen(false)
      clearDraft()
    },
  })
  const { waiveHostelReport } = useWaiveHostelReport()

  const damageCount = useMemo(
    () => reports.filter((r) => isPropertyDamageReport(r.reportType)).length,
    [reports]
  )
  const incidentCount = reports.length - damageCount

  const handleBill = useCallback(
    (reportId: string) => {
      const target = reports.find((r) => r.id === reportId)
      if (target) setBillTarget(target)
    },
    [reports]
  )
  const handleWaive = useCallback(
    (reportId: string) => waiveHostelReport(reportId),
    [waiveHostelReport]
  )

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: REPORT_TYPE.PropertyDamage,
      roomId: "",
      title: "",
      description: "",
      reportedBy: "",
      estimatedCost: "",
    },
  })

  const watchedAll = useWatch({ control })

  const {
    hasDraft,
    draftValues,
    draftSavedAt,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  } = useFormDraft<ReportFormData>({
    formKey: `hostel-damage-report-create-${hostelId}`,
    values: watchedAll as ReportFormData,
    enabled: modalOpen,
  })

  function handleRestoreDraft() {
    if (!draftValues) return
    reset(draftValues)
    acknowledgeDraft()
  }

  const isDamage = watch("reportType") === REPORT_TYPE.PropertyDamage

  const onSubmit = (data: ReportFormData) => {
    fileHostelReport({
      hostelId,
      roomId: data.roomId,
      reportType: data.reportType,
      title: data.title,
      description: data.description,
      reportedBy: data.reportedBy,
      estimatedCost:
        data.reportType === REPORT_TYPE.PropertyDamage
          ? parseFloat((data.estimatedCost ?? "0").replace(/,/g, "")) || 0
          : 0,
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
          <p className="text-sm text-gray-500">
            Report property damage and hostel incidents
          </p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus className="size-4" />
          File Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Reports"
          value={reports.length}
          icon={ClipboardList}
          color="gray"
          valueColor="text-gray-900"
        />
        <StatCard
          label="Property Damage"
          value={damageCount}
          icon={DollarSign}
          color="red"
          valueColor="text-red-600"
        />
        <StatCard
          label="Incidents"
          value={incidentCount}
          icon={AlertTriangle}
          color="orange"
          valueColor="text-orange-600"
        />
      </div>

      {/* Filter Tabs */}
      <FilterSelect
        value={filter}
        onChange={(v) => setFilter(v as "all" | "0" | "1")}
        options={[
          { value: "all", label: "All" },
          { value: "0", label: "Property Damage" },
          { value: "1", label: "Incidents" },
        ]}
        placeholder="Filter"
        triggerClassName="w-44"
      />

      {/* Report List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-700">No reports</p>
          <p className="text-xs text-gray-500">
            No reports match the current filter
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onBill={handleBill}
              onWaive={handleWaive}
            />
          ))}
        </div>
      )}

      {/* File Report Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-orange-500" />
              File a Report
            </DialogTitle>
          </DialogHeader>

          {hasDraft && draftSavedAt && (
            <FormDraftBanner
              savedAt={draftSavedAt}
              onRestore={handleRestoreDraft}
              onDiscard={discardDraft}
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Report Type */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Report Type *
              </Label>
              <Controller
                control={control}
                name="reportType"
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={String(t.value)}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Room */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Room *
              </Label>
              <Controller
                control={control}
                name="roomId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className={errors.roomId ? "border-red-400" : ""}
                    >
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostelRooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.roomNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.roomId?.message} />
              {hostelRooms.length === 0 && (
                <RequiredDataNotice
                  itemLabel="a room"
                  pageLabel="Rooms"
                  to={DashboardRoutes.toHostelCreateRoom(p)}
                />
              )}
            </div>

            {/* Title */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Title *
              </Label>
              <Input
                {...register("title")}
                placeholder="Brief summary of the report"
                className={errors.title ? "border-red-400" : ""}
              />
              <FieldError message={errors.title?.message} />
            </div>

            {/* Description */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Description *
              </Label>
              <Textarea
                {...register("description")}
                placeholder="Describe what happened in detail..."
                rows={3}
                className={`resize-none text-sm ${errors.description ? "border-red-400" : ""}`}
              />
              <FieldError message={errors.description?.message} />
            </div>

            {/* Reported By */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Reported By *
              </Label>
              <Input
                {...register("reportedBy")}
                placeholder="Staff name"
                className={errors.reportedBy ? "border-red-400" : ""}
              />
              <FieldError message={errors.reportedBy?.message} />
            </div>

            {/* Cost — only for damage */}
            {isDamage && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Estimated Cost ({currencyCode}) *
                </Label>
                <Input
                  {...register("estimatedCost")}
                  placeholder="e.g. 5000"
                  className={errors.estimatedCost ? "border-red-400" : ""}
                />
                <FieldError message={errors.estimatedCost?.message} />
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isFiling}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
              >
                {isFiling ? "Submitting…" : "Submit Report"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {billTarget && (
        <BillModal report={billTarget} onClose={() => setBillTarget(null)} />
      )}
    </div>
  )
}
