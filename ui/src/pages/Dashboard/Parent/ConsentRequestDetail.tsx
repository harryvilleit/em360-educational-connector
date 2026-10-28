import { useMemo } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { DashboardRoutes } from "@/routes"
import {
  useGetConsentRequests,
  useGetConsentResponses,
} from "@/hooks/consent"
import type { ConsentRequestI } from "@/api/consent.api/types"
import {
  getConsentCategoryMeta,
  getConsentTargetLabel,
  isConsentClosed,
} from "@/utils/consent"
import { formatDate, formatDateTime } from "@/utils"


export default function ParentConsentDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { productId, consentRequestId } = useParams<{
    productId: string
    consentRequestId: string
  }>()
  const schoolId = useSchoolId()


  const stateRequest = (location.state as { request?: ConsentRequestI } | null)
    ?.request

  const { requests, isLoading: fetchedRequestsLoading } = useGetConsentRequests(
    { schoolId, pageSize: 100 },
    !stateRequest
  )
  const requestsLoading = !stateRequest && fetchedRequestsLoading
  const req = useMemo(
    () => stateRequest ?? requests.find((r) => r.id === consentRequestId),
    [stateRequest, requests, consentRequestId]
  )

  const { responses, isLoading: responsesLoading } = useGetConsentResponses({
    consentRequestId: consentRequestId ?? "",
    pageSize: 200,
  })

  const goBack = () => navigate(DashboardRoutes.toParentConsentOverview(productId ?? ""))

  if (requestsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!req) {
    return (
      <div>
        <PageHeader title="Consent Request" onBack={goBack} className="mb-6" />
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center dark:border-white/10 dark:bg-white/3">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Consent request not found
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            It may have been removed, or the link is out of date.
          </p>
        </div>
      </div>
    )
  }

  const isPastDue = isConsentClosed(req.responseDue)
  const { label, badge, icon, iconBg, glyph } = getConsentCategoryMeta(
    req.category
  )

  return (
    <div>
      <PageHeader
        title={req.title}
        description={
          <span className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge}`}>
              {label}
            </span>
            {req.isUrgent && !isPastDue && (
              <span className="flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <AlertTriangle size={10} /> Urgent
              </span>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500">
              By {req.sentBy} · Due {formatDate(req.responseDue, "short")} · Sent{" "}
              {formatDate(req.dateCreated, "short")}
            </span>
          </span>
        }
        onBack={goBack}
        className="mb-6"
      />

      {/* Description + scope */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-white/10 dark:bg-white/3">
        <div className="flex items-start gap-3 px-5 py-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${icon} dark:bg-white/5`}>
            <span className="text-base">{glyph}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {req.description}
            </p>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Sent to: {getConsentTargetLabel(req.targetType)}
              {" · "}
              {isPastDue ? "Closed" : "Open"}
            </p>
          </div>
        </div>
      </div>

      {/* Responses */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-white/10 dark:bg-white/3">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Responses
          </h2>
        </div>

        {responsesLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-4 animate-spin text-gray-400" />
          </div>
        ) : responses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/60 dark:border-white/5 dark:bg-white/2">
                <tr>
                  {["Student", "Guardian", "Class", "Decision", "Responded At"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-gray-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {responses.map((r) => {
                  const decision = r.status?.toLowerCase() ?? ""
                  const isApproved = decision.includes("approv")
                  const isRejected =
                    decision.includes("reject") || decision.includes("disapprov")
                  return (
                    <tr key={r.id}>
                      <td className="px-5 py-3">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                          {r.studentName}
                        </p>
                        {r.responseNote && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            Note: {r.responseNote}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {r.guardianName || "—"}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {r.className || "—"}
                      </td>
                      <td className="px-5 py-3">
                        {isApproved ? (
                          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle2 size={10} /> Approved
                          </span>
                        ) : isRejected ? (
                          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            <XCircle size={10} /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
                            <Clock size={10} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400 dark:text-gray-500">
                        {r.respondedAt ? formatDateTime(r.respondedAt) : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              No responses recorded yet
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
