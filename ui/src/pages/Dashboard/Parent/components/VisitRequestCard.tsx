import { memo, useState } from "react"
import { Building2, CalendarDays, CheckCircle2, Clock, School, XCircle } from "lucide-react"
import type { VisitationRequest, VisitationStatus } from "@/store/visitation.store"
import { fmtDate } from "@/utils"

interface VisitRequestCardProps {
  request: VisitationRequest
  /** Only passed by the admin-side view — the guardian's own self-service
   * portal renders this same card without these, so a parent can never see
   * (or trigger) approve/decline on their own request. */
  onApprove?: (request: VisitationRequest) => void
  onDecline?: (request: VisitationRequest) => void
}

export const VisitRequestCard = memo(function VisitRequestCard({
  request: r,
  onApprove,
  onDecline,
}: VisitRequestCardProps) {
  const [expanded, setExpanded] = useState(false)
  const canReview = r.status === "pending" && (onApprove || onDecline)

  const statusConfig: Record<
    VisitationStatus,
    { color: string; label: string; icon: typeof CheckCircle2 }
  > = {
    pending: { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", label: "Pending Review", icon: Clock },
    approved: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", label: "Approved", icon: CheckCircle2 },
    declined: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "Declined", icon: XCircle },
  }
  const { color, label, icon: StatusIcon } = statusConfig[r.status]

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-white/3 ${
        r.status === "pending"
          ? "border-orange-200 dark:border-orange-500/20"
          : r.status === "approved"
            ? "border-green-200 dark:border-green-500/20"
            : "border-gray-100 dark:border-white/10"
      }`}
    >
      <div className="px-5 py-4">
        {/* Top row */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {r.studentName}
              </p>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${color}`}
              >
                <StatusIcon size={10} />
                {label}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                {r.location === "hostel" ? <Building2 size={11} /> : <School size={11} />}
                {r.location === "hostel"
                  ? `${r.hostelName} · Room ${r.roomNumber}`
                  : "School Visit"}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays size={11} />
                {fmtDate(r.visitDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {r.checkInTime} – {r.checkOutTime}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              Visitor: {r.visitorName} ({r.visitorRelationship}) · Purpose: {r.purpose}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {fmtDate(r.createdAt)}
            </p>
            <button
              onClick={() => setExpanded((p) => !p)}
              className="text-[11px] text-blue-600 underline underline-offset-2 dark:text-blue-400"
            >
              {expanded ? "Less" : "Details"}
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3.5 text-xs dark:border-white/5 dark:bg-white/3">
            {r.parentName !== r.visitorName && (
              <DetailRow label="Submitted by" value={r.parentName} />
            )}
            <DetailRow label="Visitor" value={`${r.visitorName} (${r.visitorRelationship})`} />
            <DetailRow label="Contact" value={r.parentPhone} />
            <DetailRow label="Check-in" value={r.checkInTime} />
            <DetailRow label="Check-out" value={r.checkOutTime} />
            {r.extraVisitorsCount > 0 && (
              <DetailRow
                label="Extra visitors"
                value={`${r.extraVisitorsCount} person${r.extraVisitorsCount > 1 ? "s" : ""}${r.extraVisitorsNames ? ` — ${r.extraVisitorsNames}` : ""}`}
              />
            )}
            {r.bringsItems && (
              <DetailRow
                label="Items / Package"
                value={r.itemsDescription ?? "Items declared"}
              />
            )}
            {r.notes && <DetailRow label="Notes" value={r.notes} />}
          </div>
        )}

        {/* Admin note */}
        {r.adminNote && (
          <div
            className={`mt-3 rounded-lg px-3 py-2.5 text-xs ${
              r.status === "approved"
                ? "bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400"
            }`}
          >
            <span className="font-medium">
              {r.status === "approved" ? "Admin note" : "Reason for decline"}:
            </span>{" "}
            {r.adminNote}
            {r.reviewedBy && r.status === "declined" && (
              <span className="block">
                — {r.reviewedBy}
                {r.reviewedAt ? `, ${fmtDate(r.reviewedAt.split("T")[0])}` : ""}
              </span>
            )}
          </div>
        )}

        {/* Admin review actions */}
        {canReview && (
          <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3 dark:border-white/5">
            <button
              onClick={() => onDecline?.(r)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-900/10"
            >
              <XCircle size={13} />
              Decline
            </button>
            <button
              onClick={() => onApprove?.(r)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-xs font-medium text-white transition-colors hover:bg-green-700"
            >
              <CheckCircle2 size={13} />
              Approve
            </button>
          </div>
        )}

        {/* Confirmation */}
        {r.status === "approved" && (
          <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-500/20 dark:bg-green-900/10">
            <p className="text-xs font-semibold text-green-700 dark:text-green-400">
              ✓ Visit Confirmed
            </p>
            <p className="mt-0.5 text-xs text-green-600 dark:text-green-500">
              Please present this confirmation at the{" "}
              {r.location === "hostel" ? "hostel reception" : "school gate"} on{" "}
              {fmtDate(r.visitDate)} at {r.checkInTime}. Approved by {r.reviewedBy}.
            </p>
          </div>
        )}
      </div>
    </div>
  )
})

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-24 shrink-0 font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="text-gray-700 dark:text-gray-300">{value}</span>
    </div>
  )
}
