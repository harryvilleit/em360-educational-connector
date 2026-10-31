import { useState } from "react"
import { CheckCircle2, XCircle, X } from "lucide-react"
import type { TranscriptRequest } from "@/store/transcript.store"

interface TranscriptActionModalProps {
  type: "approve" | "decline"
  request: TranscriptRequest
  onClose: () => void
  onConfirm: (note: string) => void
}

export function TranscriptActionModal({
  type,
  request: r,
  onClose,
  onConfirm,
}: TranscriptActionModalProps) {
  const [note, setNote] = useState("")
  const isApprove = type === "approve"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${isApprove ? "Approve" : "Reject"} transcript request`}
      tabIndex={-1}
      onKeyDown={(event) => event.key === "Escape" && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {isApprove
              ? "Approve Transcript Request"
              : "Decline Transcript Request"}
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
          <div className="rounded-xl bg-gray-50 p-3.5 text-xs dark:bg-white/5">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-blue-50 px-2 py-0.5 font-mono font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {r.serialNumber}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 font-medium ${
                  r.deliveryType === "official"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                }`}
              >
                {r.deliveryType === "official" ? "Official" : "Personal"}
              </span>
            </div>
            <p className="mt-2 font-medium text-gray-800 dark:text-gray-200">
              {r.studentName} · {r.studentClass}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Parent: {r.parentName}
            </p>
            {r.deliveryType === "official" && r.institutionName && (
              <p className="text-gray-500 dark:text-gray-400">
                To: {r.institutionName}
              </p>
            )}
            {r.purpose && (
              <p className="text-gray-500 dark:text-gray-400">
                Purpose: {r.purpose}
              </p>
            )}
          </div>

          {/* Approve notice */}
          {isApprove && (
            <div className="flex items-start gap-2.5 rounded-xl bg-green-50 px-3 py-2.5 text-xs text-green-700 dark:bg-green-900/10 dark:text-green-400">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              <p>
                Approving this request will allow the parent to download the
                official academic transcript PDF directly from their portal.
              </p>
            </div>
          )}

          {/* Note / Reason */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
              {isApprove
                ? "Note for parent (optional)"
                : "Reason for declining"}{" "}
              {!isApprove && <span className="text-red-500">*</span>}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                isApprove
                  ? "e.g. Transcript ready. Please download from your portal."
                  : "e.g. Insufficient academic records for the requested period."
              }
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!isApprove && !note.trim()) return
              onConfirm(note.trim())
            }}
            disabled={!isApprove && !note.trim()}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              isApprove
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isApprove ? (
              <>
                <CheckCircle2 size={14} />
                Approve
              </>
            ) : (
              <>
                <XCircle size={14} />
                Decline
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
