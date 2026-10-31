import { memo } from "react"
import { Building2, CheckCircle2, Clock, Download, User, XCircle } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import type { TranscriptRequest, TranscriptStatus } from "@/store/transcript.store"
import type { Parent } from "@/types/parent"
import { generateTranscriptPDF } from "./generateTranscriptPDF"
import { fmtDate } from "@/utils"

interface TranscriptCardProps {
  request: TranscriptRequest
  parent: Parent
  /** Only passed by the admin-side view — the guardian's own self-service
   * portal renders this same card without these, so a parent can never see
   * (or trigger) approve/decline on their own request. */
  onApprove?: (request: TranscriptRequest) => void
  onDecline?: (request: TranscriptRequest) => void
}

export const TranscriptCard = memo(function TranscriptCard({
  request: r,
  parent,
  onApprove,
  onDecline,
}: TranscriptCardProps) {
  const schoolId = useSchoolId()
  const canReview = r.status === "pending" && (onApprove || onDecline)
  const statusConfig: Record<
    TranscriptStatus,
    { color: string; label: string; icon: typeof CheckCircle2 }
  > = {
    pending: { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", label: "Pending Approval", icon: Clock },
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {r.studentName} · {r.studentClass}
              </p>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${color}`}>
                <StatusIcon size={10} />
                {label}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                r.deliveryType === "official"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              }`}>
                {r.deliveryType === "official" ? <Building2 size={9} /> : <User size={9} />}
                {r.deliveryType === "official" ? "Official" : "Personal"}
              </span>
            </div>

            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Serial: {r.serialNumber} · Requested {fmtDate(r.createdAt)}
              {r.purpose && <span> · {r.purpose}</span>}
            </p>

            {r.deliveryType === "official" && r.institutionName && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                To: {r.institutionName}
                {r.contactPerson && ` · Attn: ${r.contactPerson}`}
              </p>
            )}
          </div>

          {r.status === "approved" && (
            <button
              onClick={() => generateTranscriptPDF(r, schoolId)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
            >
              <Download size={12} />
              Download PDF
            </button>
          )}
        </div>

        {r.adminNote && (
          <div className={`mt-3 rounded-lg px-3 py-2 text-xs ${
            r.status === "approved"
              ? "bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400"
          }`}>
            <span className="font-medium">
              {r.status === "approved" ? "Note" : "Reason"}:
            </span>{" "}
            {r.adminNote}
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
      </div>
    </div>
  )
})
