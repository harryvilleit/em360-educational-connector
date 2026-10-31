import { memo } from "react"
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react"
import { isConsentClosed } from "@/utils/consent"
import type { ConsentDecision, ConsentResponse } from "@/types/consent"
import type { ListItem } from "./notificationHelpers"
import { fmtDate } from "@/utils"
import { ChildConsentRow } from "./ChildConsentRow"

export const ConsentNotificationItem = memo(function ConsentNotificationItem({
  item,
  isExpanded,
  onToggle,
  getResponse,
  onRespond,
}: {
  item: Extract<ListItem, { kind: "consent" }>
  isExpanded: boolean
  onToggle: (id: string) => void
  parentId: string
  getResponse: (requestId: string, studentId: string) => ConsentResponse | undefined
  onRespond: (
    requestId: string,
    studentId: string,
    studentName: string,
    decision: ConsentDecision,
    notes?: string
  ) => void
}) {
  const req = item.request
  const isPastDue = isConsentClosed(req.responseDue)
  const allResponded = item.affectedChildren.every((c) => !!getResponse(req.id, c.id))

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white dark:bg-white/3 ${
        req.isUrgent && !allResponded
          ? "border-orange-200 dark:border-orange-500/30"
          : !item.read
            ? "border-blue-200 dark:border-blue-500/30"
            : "border-gray-200 dark:border-white/10"
      }`}
    >
      <button
        onClick={() => onToggle(item.id)}
        className="flex w-full items-start gap-3.5 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/2"
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          <ShieldCheck size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {!item.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />}
            <p className={`truncate text-sm ${!item.read ? "font-semibold text-gray-900 dark:text-gray-100" : "font-medium text-gray-700 dark:text-gray-300"}`}>
              {req.title}
            </p>
            <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              Consent Request
            </span>
            {req.isUrgent && (
              <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <AlertTriangle size={9} />
                Urgent
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span>{fmtDate(item.date)}</span>
            <span>·</span>
            <span>{isPastDue ? "Closed" : `Due ${fmtDate(req.responseDue)}`}</span>
            <span>·</span>
            <span>{req.sentBy}</span>
          </div>
          <div className="mt-1">
            {allResponded ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                <CheckCircle2 size={11} /> All children responded
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-500 dark:text-orange-400">
                <AlertTriangle size={11} /> Awaiting your response
              </span>
            )}
          </div>
        </div>
        {isExpanded ? <ChevronUp size={15} className="mt-1 shrink-0 text-gray-400" /> : <ChevronDown size={15} className="mt-1 shrink-0 text-gray-400" />}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-white/5">
          {/* Description */}
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{req.description}</p>
          </div>

          {/* Per-child response */}
          <div className="border-t border-gray-100 px-5 pb-4 pt-3 dark:border-white/5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Your Response
            </p>
            <div className="space-y-3">
              {item.affectedChildren.map((child) => (
                <ChildConsentRow
                  key={child.id}
                  child={child}
                  response={getResponse(req.id, child.id)}
                  isPastDue={isPastDue}
                  onRespond={(decision, notes) =>
                    onRespond(req.id, child.id, child.name, decision, notes)
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})
