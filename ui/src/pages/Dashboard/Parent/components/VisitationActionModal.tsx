import { useState } from "react"
import { CheckCircle2, XCircle, X } from "lucide-react"
import type { VisitationRequest } from "@/store/visitation.store"
import { fmtDate } from "@/utils"

export function VisitationActionModal({
  type,
  request: r,
  onClose,
  onConfirm,
}: {
  type: "approve" | "decline"
  request: VisitationRequest
  onClose: () => void
  onConfirm: (note: string) => void
}) {
  const [note, setNote] = useState("")
  const isApprove = type === "approve"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${isApprove ? "Approve" : "Decline"} visitation request`}
      tabIndex={-1}
      onKeyDown={(event) => event.key === "Escape" && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {isApprove ? "Approve Visit Request" : "Decline Visit Request"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <X size={15} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {/* Request summary */}
          <div className="rounded-lg bg-gray-50 p-3 text-xs dark:bg-white/5">
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {r.visitorName} ({r.visitorRelationship}) → {r.studentName}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {r.location === "hostel"
                ? `${r.hostelName} · Room ${r.roomNumber}`
                : "School Visit"}{" "}
              · {fmtDate(r.visitDate)} · {r.checkInTime} – {r.checkOutTime}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Purpose: {r.purpose}
            </p>
          </div>

          {/* Note */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
              {isApprove
                ? "Note for parent (optional)"
                : "Reason for declining *"}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                isApprove
                  ? "e.g. Please report at the school gate with valid ID..."
                  : "e.g. Requested date falls on an exam day..."
              }
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="flex gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/5">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!isApprove && !note.trim()) return
              onConfirm(note.trim())
            }}
            disabled={!isApprove && !note.trim()}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-40 ${
              isApprove
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isApprove ? (
              <>
                <CheckCircle2 size={14} /> Approve
              </>
            ) : (
              <>
                <XCircle size={14} /> Decline
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
