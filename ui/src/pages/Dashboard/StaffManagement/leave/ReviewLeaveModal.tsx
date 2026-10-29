import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/ui/modal"
import { LeaveFilterSelect as FilterSelect } from "./LeaveFilterSelect"
import {
  useAdminLeaveRequest,
  useReviewLeaveRequest,
} from "@/hooks/leaveManagement"
import {
  LeaveRequestStatus,
  type LeaveRequestDto,
} from "@/api/leaveManagement.api/types"
import { LeaveStatusBadge, LeaveTypeChip } from "./LeaveStatusBadge"
import {
  formatDays,
  formatLeaveDate,
  formatLeaveRange,
  formatTimeRange,
  toLeaveStatus,
} from "./utils"

interface Props {
  schoolId: string
  request: LeaveRequestDto
  onClose: () => void
}

export function ReviewLeaveModal({ schoolId, request, onClose }: Props) {
  const detail = useAdminLeaveRequest(schoolId, request.id)
  const review = useReviewLeaveRequest(schoolId)

  const [relief, setRelief] = useState<Record<string, string>>({})
  const [rejecting, setRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const current = detail.data ?? request
  const isPending = toLeaveStatus(current.status) === LeaveRequestStatus.Pending
  const reliefOptions = (detail.data?.availableReliefTeachers ?? []).map(
    (t) => ({ value: t.staffSubUserId, label: t.staffName })
  )

  const unassigned = current.impactedPeriods.filter(
    (p) => !relief[p.id] && !p.assignedReliefStaffSubUserId
  ).length

  const submit = async (decision: "Approve" | "Reject") => {
    const reliefAssignments = current.impactedPeriods.flatMap((p) => {
      const reliefStaffSubUserId = relief[p.id]
      return reliefStaffSubUserId
        ? [{ impactedPeriodId: p.id, reliefStaffSubUserId }]
        : []
    })
    try {
      await review.mutateAsync({
        leaveRequestId: current.id,
        schoolId,
        decision,
        rejectionReason:
          decision === "Reject" ? rejectionReason.trim() : undefined,
        reliefAssignments:
          decision === "Approve" && reliefAssignments.length > 0
            ? reliefAssignments
            : undefined,
      })
      toast.success(
        decision === "Approve"
          ? "Leave request approved."
          : "Leave request rejected."
      )
      onClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save the decision."
      )
    }
  }

  return (
    <Modal
      title={isPending ? "Review leave request" : "Leave request"}
      size="xl"
      onClose={onClose}
      footer={
        isPending ? (
          rejecting ? (
            <div className="space-y-3">
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                placeholder="Reason for rejection (required)"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRejecting(false)}>
                  Back
                </Button>
                <Button
                  onClick={() => submit("Reject")}
                  disabled={!rejectionReason.trim() || review.isPending}
                >
                  {review.isPending ? "Rejecting..." : "Confirm rejection"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-amber-700">
                {unassigned > 0
                  ? `${unassigned} period${unassigned === 1 ? "" : "s"} without relief cover`
                  : ""}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setRejecting(true)}>
                  Reject
                </Button>
                <Button
                  onClick={() => submit("Approve")}
                  disabled={review.isPending}
                >
                  {review.isPending ? "Approving..." : "Approve"}
                </Button>
              </div>
            </div>
          )
        ) : undefined
      }
    >
      <div className="grid gap-6 text-sm md:grid-cols-2">
        <div className="space-y-5">
          <section className="space-y-1">
            <p className="text-base font-semibold text-gray-900">
              {current.staffName}
            </p>
            <p className="text-gray-500">
              {[current.staffRole, current.staffDepartment]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="text-gray-500">{current.staffEmail}</p>
          </section>

          <section className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <LeaveTypeChip
                name={current.leaveTypeName}
                typeId={current.leaveTypeId}
              />
              <LeaveStatusBadge status={current.status} />
            </div>
            <p className="text-gray-900">
              {formatLeaveRange(current.startDate, current.endDate)} ·{" "}
              {formatDays(current.workingDays)}
            </p>
            <p className="text-gray-600">{current.reason}</p>
            {current.attachmentUrl && (
              <a
                href={current.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-chart-2 underline"
              >
                View attachment
              </a>
            )}
            {current.rejectionReason && (
              <p className="text-red-600">
                Rejected: {current.rejectionReason}
              </p>
            )}
          </section>

          {detail.isError && (
            <p role="alert" className="text-red-600">
              Could not load the latest request details.
            </p>
          )}
        </div>

        <section className="space-y-3">
          <h3 className="font-semibold text-gray-900">Class schedule impact</h3>
          {current.impactedPeriods.length === 0 && (
            <p className="rounded-xl border border-dashed border-gray-200 p-4 text-gray-500">
              No classes are affected by this leave.
            </p>
          )}
          <div className="space-y-3">
            {current.impactedPeriods.map((p) => {
              const key = p.id
              return (
                <div
                  key={key}
                  className="space-y-2 rounded-xl border border-gray-100 p-3"
                >
                  <p className="font-medium text-gray-900">
                    {p.dayOfWeek.slice(0, 3)}, {formatLeaveDate(p.date)} ·{" "}
                    {formatTimeRange(p.startTime, p.endTime)}
                    {p.isOnlineLiveClass && " · Live class"}
                  </p>
                  <p className="text-gray-600">
                    {p.schoolClassName} · {p.subjectName}
                  </p>
                  {isPending ? (
                    <FilterSelect
                      value={relief[key] ?? ""}
                      onChange={(v) =>
                        setRelief((prev) => ({ ...prev, [key]: v }))
                      }
                      placeholder="Assign relief teacher"
                      className="w-full"
                      options={[
                        { value: "", label: "No relief" },
                        ...reliefOptions,
                      ]}
                    />
                  ) : (
                    p.assignedReliefStaffName && (
                      <p className="text-gray-600">
                        Relief: {p.assignedReliefStaffName}
                      </p>
                    )
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </Modal>
  )
}
