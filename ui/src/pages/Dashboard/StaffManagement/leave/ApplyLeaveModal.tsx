import { useMemo, useRef, useState } from "react"
import { AlertTriangle, CircleAlert, Paperclip, X } from "lucide-react"
import { toast } from "sonner"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useUploadFile } from "@/hooks/files"
import {
  useCalculateLeaveDuration,
  useLeaveTypes,
  useMyLeaveBalances,
  useSubmitLeaveRequest,
} from "@/hooks/leaveManagement"
import { HalfDayPeriod } from "@/api/leaveManagement.api/types"
import { formatDays, formatLeaveDate, formatTimeRange } from "./utils"

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
const ATTACHMENT_TYPES = ["application/pdf", "image/png", "image/jpeg"]

interface Props {
  schoolId: string
  onClose: () => void
}

export function ApplyLeaveModal({ schoolId, onClose }: Props) {
  const { data: leaveTypes = [] } = useLeaveTypes(schoolId)
  const { data: balances = [] } = useMyLeaveBalances(schoolId)
  const submit = useSubmitLeaveRequest(schoolId)
  const fileInput = useRef<HTMLInputElement>(null)

  const [leaveTypeId, setLeaveTypeId] = useState("")
  const [isHalfDay, setIsHalfDay] = useState(false)
  const [period, setPeriod] = useState<HalfDayPeriod>(HalfDayPeriod.Morning)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [attachmentName, setAttachmentName] = useState("")
  const [showImpact, setShowImpact] = useState(false)

  const { uploadFile, isPending: isUploading } = useUploadFile({
    onSuccess: (url, file) => {
      setAttachmentUrl(url)
      setAttachmentName(file.name)
    },
  })

  const activeTypes = leaveTypes.filter((t) => t.isActive)
  const selectedType = activeTypes.find((t) => t.id === leaveTypeId)
  const effectiveEnd = isHalfDay ? startDate : endDate
  const balanceFor = (typeId: string) =>
    balances.find((b) => b.leaveTypeId === typeId)?.availableDays

  const query = useMemo(
    () => ({
      schoolId,
      leaveTypeId,
      startDate,
      endDate: effectiveEnd,
      isHalfDay,
      halfDayPeriod: isHalfDay ? period : undefined,
    }),
    [schoolId, leaveTypeId, startDate, effectiveEnd, isHalfDay, period]
  )
  const debouncedQuery = useDebouncedValue(query, 300)
  const canCalculate = !!(leaveTypeId && startDate && effectiveEnd)
  const calc = useCalculateLeaveDuration(debouncedQuery, canCalculate)
  const result = canCalculate ? calc.data : undefined

  const hasBlockingError =
    !!result &&
    (!result.hasSufficientBalance ||
      result.hasOverlapWithExistingLeave ||
      result.validationErrors.length > 0)
  const needsAttachment = !!result?.attachmentRequired && !attachmentUrl
  const reasonOk = reason.trim().length >= 10
  const canSubmit =
    !!result &&
    !calc.isFetching &&
    !hasBlockingError &&
    !needsAttachment &&
    reasonOk &&
    !isUploading &&
    !submit.isPending

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!ATTACHMENT_TYPES.includes(file.type)) {
      toast.error("Attach a PDF, PNG or JPG file.")
      return
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error("Attachment must be 10MB or smaller.")
      return
    }
    uploadFile(file)
  }

  const handleSubmit = async () => {
    try {
      await submit.mutateAsync({
        schoolId,
        leaveTypeId,
        startDate,
        endDate: effectiveEnd,
        isHalfDay,
        halfDayPeriod: isHalfDay ? period : HalfDayPeriod.None,
        reason: reason.trim(),
        attachmentUrl: attachmentUrl || undefined,
      })
      toast.success("Leave request submitted.")
      onClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not submit leave request."
      )
    }
  }

  return (
    <Modal
      title="Apply for Leave"
      size="lg"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submit.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Leave type">
          <Select
            value={leaveTypeId}
            onValueChange={(v) => {
              setLeaveTypeId(v)
              const type = activeTypes.find((t) => t.id === v)
              if (!type?.allowHalfDay) setIsHalfDay(false)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select leave type" />
            </SelectTrigger>
            <SelectContent>
              {activeTypes.map((t) => {
                const available = balanceFor(t.id)
                return (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                    {available !== undefined &&
                      ` (${formatDays(available)} available)`}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </Field>

        {selectedType?.allowHalfDay && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isHalfDay}
              onChange={(e) => setIsHalfDay(e.target.checked)}
            />
            Half day
          </label>
        )}

        {isHalfDay && (
          <div className="flex gap-4 text-sm text-gray-700">
            {(
              [
                [HalfDayPeriod.Morning, "Morning period"],
                [HalfDayPeriod.Afternoon, "Afternoon period"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="half-day-period"
                  checked={period === value}
                  onChange={() => setPeriod(value)}
                />
                {label}
              </label>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label={isHalfDay ? "Date" : "Start date"}>
            <DatePicker value={startDate} onChange={setStartDate} />
          </Field>
          {!isHalfDay && (
            <Field label="End date">
              <DatePicker value={endDate} onChange={setEndDate} />
            </Field>
          )}
        </div>

        {canCalculate && (
          <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
            {calc.isError && !result ? (
              <p className="text-red-600" role="alert">
                {calc.error instanceof Error
                  ? calc.error.message
                  : "Could not calculate leave duration."}
              </p>
            ) : !result ? (
              <p className="text-gray-500">Calculating...</p>
            ) : (
              <>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                  <dt>Calendar days</dt>
                  <dd className="text-right">{result.calendarDays}</dd>
                  <dt>Excluded weekend days</dt>
                  <dd className="text-right">{result.weekendDaysCount}</dd>
                  <dt>Excluded public holidays</dt>
                  <dd className="text-right">{result.holidaysCount}</dd>
                  <dt className="font-semibold text-gray-900">
                    Net working days deducted
                  </dt>
                  <dd className="text-right font-semibold text-gray-900">
                    {result.workingDays}
                  </dd>
                  <dt className="font-semibold text-gray-900">
                    Balance after leave
                  </dt>
                  <dd className="text-right font-semibold text-gray-900">
                    {result.availableBalance - result.workingDays}
                  </dd>
                </dl>

                <div className="space-y-1.5">
                  {!result.hasSufficientBalance && (
                    <Notice tone="error">
                      Insufficient balance (requested {result.workingDays} days,
                      available: {result.availableBalance} days).
                    </Notice>
                  )}
                  {result.hasOverlapWithExistingLeave && (
                    <Notice tone="error">
                      Overlaps with an existing leave request.
                    </Notice>
                  )}
                  {!result.meetsNoticeRequirement && (
                    <Notice tone="warn">
                      Policy requires at least{" "}
                      {result.minimumNoticeDaysRequired} days advance notice.
                    </Notice>
                  )}
                  {result.attachmentRequired && (
                    <Notice tone="warn">
                      A supporting document is required for this request.
                    </Notice>
                  )}
                  {result.validationErrors.map((message) => (
                    <Notice key={message} tone="error">
                      {message}
                    </Notice>
                  ))}
                </div>

                {result.impactedPeriodsCount > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowImpact((v) => !v)}
                      className="flex items-center gap-1.5 font-medium text-amber-700"
                    >
                      <AlertTriangle className="size-4" />
                      {result.impactedPeriodsCount} classes affected during this
                      period
                    </button>
                    {showImpact && (
                      <ul className="mt-2 space-y-1 text-gray-600">
                        {result.impactedPeriods.map((p, i) => (
                          <li key={`${p.date}-${p.startTime}-${i}`}>
                            {p.dayOfWeek.slice(0, 3)}, {formatLeaveDate(p.date)}
                            : {formatTimeRange(p.startTime, p.endTime)} (
                            {p.schoolClassName} - {p.subjectName})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <Field label="Reason for leave">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="At least 10 characters"
          />
        </Field>

        <Field label="Supporting document (PDF, PNG or JPG, up to 10MB)">
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0])
              e.target.value = ""
            }}
          />
          {attachmentUrl ? (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
              <span className="flex items-center gap-2 truncate">
                <Paperclip className="size-4 shrink-0" />
                {attachmentName}
              </span>
              <button
                type="button"
                aria-label="Remove attachment"
                onClick={() => {
                  setAttachmentUrl("")
                  setAttachmentName("")
                }}
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => fileInput.current?.click()}
            >
              <Paperclip className="size-4" />
              {isUploading ? "Uploading..." : "Attach file"}
            </Button>
          )}
        </Field>
      </div>
    </Modal>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </div>
  )
}

function Notice({
  tone,
  children,
}: {
  tone: "error" | "warn"
  children: React.ReactNode
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "flex items-start gap-1.5 text-red-600"
          : "flex items-start gap-1.5 text-amber-700"
      }
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}
