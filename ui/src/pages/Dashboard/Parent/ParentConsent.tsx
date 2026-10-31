import { memo, useCallback, useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  ShieldCheck,
  ShieldX,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
} from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { useResolvedParent } from "@/hooks/useResolvedParent"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetConsentRequests } from "@/hooks/consent"
import { useConsentStore } from "@/store/consent.store"
import { getConsentCategoryMeta, isConsentClosed } from "@/utils/consent"
import { formatDate, formatDateTime } from "@/utils"
import type { ConsentRequestI } from "@/api/consent.api/types"
import type { LaunchSchoolPortalDataI } from "@/api/guardian.api/types"
import type { LinkedChild } from "@/types/parent"
import type { ConsentDecision, ConsentResponse } from "@/types/consent"

type FilterTab = "all" | "pending" | "responded"

interface ParentConsentPageProps {
  parentIdOverride?: string
  portalOverride?: LaunchSchoolPortalDataI
}

export default function ParentConsentPage({
  parentIdOverride,
  portalOverride,
}: ParentConsentPageProps = {}) {
  const { parentId: routeParentId } = useParams<{ productId: string; parentId: string }>()
  const parentId = parentIdOverride ?? routeParentId
  const navigate = useNavigate()
  const schoolId = useSchoolId()

  const { parent, isLoading } = useResolvedParent(parentId, portalOverride)
 
  const { requests, isLoading: requestsLoading } = useGetConsentRequests({
    schoolId,
    pageSize: 100,
  })
  const responses = useConsentStore((s) => s.responses)
  const respond = useConsentStore((s) => s.respond)

  const getResponse = useCallback(
    (requestId: string, studentId: string, parentId: string) =>
      responses.find(
        (r) =>
          r.requestId === requestId &&
          r.studentId === studentId &&
          r.parentId === parentId
      ),
    [responses]
  )

  const [filterTab, setFilterTab] = useState<FilterTab>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleToggle = useCallback((id: string) => {
    setExpandedId((p) => (p === id ? null : id))
  }, [])

  const handleRespond = useCallback(
    (
      requestId: string,
      studentId: string,
      studentName: string,
      decision: ConsentDecision,
      notes?: string
    ) => {
      if (!parent) return
      respond({ requestId, parentId: parent.id, studentId, studentName, decision, notes })
    },
    [respond, parent]
  )

  const handleGetResponse = useCallback(
    (requestId: string, studentId: string) =>
      parent ? getResponse(requestId, studentId, parent.id) : undefined,
    [getResponse, parent]
  )

  if (isLoading || requestsLoading) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        Loading...
      </div>
    )
  }

  if (!parent) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        Parent not found.
      </div>
    )
  }

  function affectedChildren(): LinkedChild[] {
    return parent!.children
  }

  function isPending(req: ConsentRequestI): boolean {
    return affectedChildren().some(
      (c) => !getResponse(req.id, c.id, parent!.id)
    )
  }

  const displayed = requests.filter((req) => {
    if (filterTab === "pending") return isPending(req)
    if (filterTab === "responded") return !isPending(req)
    return true
  })

  const pendingCount = requests.filter(isPending).length

  return (
    <div>
      <PageHeader
        title="Consent Requests"
        description={`${parent.firstName} ${parent.lastName}`}
        onBack={parentIdOverride ? undefined : () => navigate(-1)}
        actions={
          pendingCount > 0 && (
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-600">
              {pendingCount} awaiting response
            </span>
          )
        }
        className="mb-7"
      />

      {/* Filter tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-white/10 dark:bg-white/3">
        {(
          [
            { key: "all", label: "All Requests" },
            { key: "pending", label: "Pending" },
            { key: "responded", label: "Responded" },
          ] as { key: FilterTab; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterTab(key)}
            className={`flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              filterTab === key
                ? "bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-gray-100"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Consent request list */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-center dark:border-white/10 dark:bg-white/3">
          <ClipboardList
            size={36}
            className="mb-3 text-gray-300 dark:text-gray-600"
          />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {filterTab === "pending"
              ? "No pending consent requests"
              : filterTab === "responded"
                ? "No responses recorded yet"
                : "No consent requests at this time"}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Consent requests from the school will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((req) => (
            <ConsentCard
              key={req.id}
              request={req}
              affectedChildren={affectedChildren()}
              expanded={expandedId === req.id}
              onToggle={handleToggle}
              onRespond={handleRespond}
              getResponse={handleGetResponse}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Consent card ───────────────────────────────────────────────────────────────

const ConsentCard = memo(function ConsentCard({
  request: req,
  affectedChildren,
  expanded,
  onToggle,
  onRespond,
  getResponse,
}: {
  request: ConsentRequestI
  affectedChildren: LinkedChild[]
  expanded: boolean
  onToggle: (id: string) => void
  onRespond: (
    requestId: string,
    studentId: string,
    studentName: string,
    decision: ConsentDecision,
    notes?: string
  ) => void
  getResponse: (
    requestId: string,
    studentId: string
  ) => ConsentResponse | undefined
}) {
  const allResponded = affectedChildren.every((c) => !!getResponse(req.id, c.id))
  const someResponded = affectedChildren.some((c) => !!getResponse(req.id, c.id))
  const isPastDue = isConsentClosed(req.responseDue)

  const { badge, label, glyph } = getConsentCategoryMeta(req.category)

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white dark:bg-white/3 ${
        req.isUrgent && !allResponded
          ? "border-orange-200 dark:border-orange-500/30"
          : "border-gray-200 dark:border-white/10"
      }`}
    >
      {/* Card header — always visible */}
      <button
        onClick={() => onToggle(req.id)}
        className="flex w-full items-start gap-3.5 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/2"
      >
        {/* Category icon */}
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${badge}`}
        >
          <span className="text-sm">{glyph}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {req.title}
            </p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${badge}`}
            >
              {label}
            </span>
            {req.isUrgent && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <AlertTriangle size={9} />
                Urgent
              </span>
            )}
          </div>

          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <Clock size={11} />
            {isPastDue ? "Closed" : `Due`} {formatDate(req.responseDue, "short")} · {req.sentBy}
          </p>

          {/* Response summary */}
          <div className="mt-1.5">
            {allResponded ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                <CheckCircle2 size={12} />
                All children responded
              </span>
            ) : someResponded ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-500 dark:text-orange-400">
                <Clock size={12} />
                Partially responded
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                <Clock size={12} />
                Awaiting your response
              </span>
            )}
          </div>
        </div>

        {expanded ? (
          <ChevronUp size={15} className="mt-1 shrink-0 text-gray-400" />
        ) : (
          <ChevronDown size={15} className="mt-1 shrink-0 text-gray-400" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-white/5">
          {/* Full description */}
          <div className="px-5 py-4">
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {req.description}
            </p>
          </div>

          {/* Children consent rows */}
          <div className="border-t border-gray-100 dark:border-white/5">
            <div className="px-5 py-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Your Children
              </p>
              <div className="space-y-3">
                {affectedChildren.map((child) => (
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
        </div>
      )}
    </div>
  )
})

// ─── Child consent row ──────────────────────────────────────────────────────────

const ChildConsentRow = memo(function ChildConsentRow({
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
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [note, setNote] = useState("")
  const [changing, setChanging] = useState(false)

  function handleDisapprove() {
    if (showNoteInput) {
      onRespond("disapproved", note.trim() || undefined)
      setShowNoteInput(false)
      setNote("")
      setChanging(false)
    } else {
      setShowNoteInput(true)
    }
  }

  function handleApprove() {
    onRespond("approved")
    setShowNoteInput(false)
    setNote("")
    setChanging(false)
  }

  const showActions = !response || changing

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
      {/* Child identity row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {child.avatarInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {child.name}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {child.class} · {child.studentId}
          </p>
        </div>

        {/* Decided badge */}
        {response && !changing && (
          <div className="flex items-center gap-2">
            {response.decision === "approved" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 size={12} />
                Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <XCircle size={12} />
                Disapproved
              </span>
            )}
            {!isPastDue && (
              <button
                onClick={() => setChanging(true)}
                className="text-[11px] text-blue-600 underline underline-offset-2 dark:text-blue-400"
              >
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
            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
              Note: {response.notes}
            </p>
          )}
        </div>
      )}

      {/* Consent action buttons */}
      {showActions && !isPastDue && (
        <div className="border-t border-gray-100 dark:border-white/5">
          {showNoteInput && (
            <div className="px-4 pt-3">
              <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                Reason for disapproval (optional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. We prefer to handle this privately..."
                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-500/20 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
              />
            </div>
          )}

          <div className="flex gap-2 px-4 py-3">
            <button
              onClick={handleApprove}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              <ShieldCheck size={15} />
              I Approve
            </button>
            <button
              onClick={handleDisapprove}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              <ShieldX size={15} />
              {showNoteInput ? "Confirm Disapproval" : "I Disapprove"}
            </button>
          </div>

          {showNoteInput && (
            <div className="px-4 pb-3">
              <button
                onClick={() => { setShowNoteInput(false); setNote("") }}
                className="text-xs text-gray-400 underline underline-offset-2 dark:text-gray-500"
              >
                Cancel
              </button>
            </div>
          )}

          {changing && (
            <div className="border-t border-gray-100 px-4 pb-3 pt-1 dark:border-white/5">
              <button
                onClick={() => setChanging(false)}
                className="text-xs text-gray-400 underline underline-offset-2 dark:text-gray-500"
              >
                Keep previous response
              </button>
            </div>
          )}
        </div>
      )}

      {showActions && isPastDue && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-white/5 dark:bg-white/2">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            The deadline for this consent has passed. Contact the school for assistance.
          </p>
        </div>
      )}
    </div>
  )
})
