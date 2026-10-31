import { memo, useState } from "react"
import { CheckCircle2, ShieldCheck, ShieldX, XCircle } from "lucide-react"
import { formatDateTime } from "@/utils"
import type { LinkedChild } from "@/types/parent"
import type { ConsentDecision, ConsentResponse } from "@/types/consent"

export const ChildConsentRow = memo(function ChildConsentRow({
  child,
  response,
  isPastDue,
  onRespond,
}: {
  child: LinkedChild
  response: ConsentResponse | undefined
  isPastDue: boolean
  onRespond: (decision: ConsentDecision, notes?: string) => void
}) {
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState("")
  const [changing, setChanging] = useState(false)

  const showActions = (!response || changing) && !isPastDue

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {child.avatarInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{child.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{child.class} · {child.studentId}</p>
        </div>

        {response && !changing && (
          <div className="flex items-center gap-2">
            {response.decision === "approved" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 size={11} /> Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <XCircle size={11} /> Disapproved
              </span>
            )}
            {!isPastDue && (
              <button onClick={() => setChanging(true)} className="text-[11px] text-blue-600 underline underline-offset-2 dark:text-blue-400">
                Change
              </button>
            )}
          </div>
        )}
      </div>

      {/* Response timestamp + notes */}
      {response && !changing && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 dark:border-white/5 dark:bg-white/2">
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Responded {formatDateTime(response.respondedAt)}
          </p>
          {response.notes && (
            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">Note: {response.notes}</p>
          )}
        </div>
      )}

      {showActions && (
        <div className="border-t border-gray-100 dark:border-white/5">
          {showNote && (
            <div className="px-4 pt-3">
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                Reason for disapproval (optional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. We prefer to handle this privately..."
                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
              />
            </div>
          )}
          <div className="flex gap-2 px-4 py-3">
            <button
              onClick={() => { onRespond("approved"); setChanging(false) }}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              <ShieldCheck size={14} /> I Approve
            </button>
            <button
              onClick={() => {
                if (showNote) {
                  onRespond("disapproved", note.trim() || undefined)
                  setShowNote(false)
                  setNote("")
                  setChanging(false)
                } else {
                  setShowNote(true)
                }
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              <ShieldX size={14} />
              {showNote ? "Confirm" : "I Disapprove"}
            </button>
          </div>
          {showNote && (
            <div className="px-4 pb-3">
              <button onClick={() => { setShowNote(false); setNote("") }} className="text-xs text-gray-400 underline">Cancel</button>
            </div>
          )}
          {changing && !showNote && (
            <div className="border-t border-gray-100 px-4 pb-3 pt-2 dark:border-white/5">
              <button onClick={() => setChanging(false)} className="text-xs text-gray-400 underline">Keep previous response</button>
            </div>
          )}
        </div>
      )}

      {!showActions && isPastDue && !response && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-white/5 dark:bg-white/2">
          <p className="text-xs text-gray-400 dark:text-gray-500">Deadline passed. Contact the school for assistance.</p>
        </div>
      )}
    </div>
  )
})
