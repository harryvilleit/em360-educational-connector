import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { FilterSelect } from "@/components/ui/filter-select"
import { Plus, ClipboardList } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useResolvedParent } from "@/hooks/useResolvedParent"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useVisitationStore, type VisitationRequest } from "@/store/visitation.store"
import type { LaunchSchoolPortalDataI } from "@/api/guardian.api/types"
import { NewVisitModal } from "./components/NewVisitModal"
import { VisitRequestCard } from "./components/VisitRequestCard"
import { VisitationActionModal } from "./components/VisitationActionModal"

const ALL_SESSIONS = "all"

interface ParentVisitationPageProps {
  parentIdOverride?: string
  portalOverride?: LaunchSchoolPortalDataI
}

export default function ParentVisitationPage({
  parentIdOverride,
  portalOverride,
}: ParentVisitationPageProps = {}) {
  const { parentId: routeParentId } = useParams<{ productId: string; parentId: string }>()
  const parentId = parentIdOverride ?? routeParentId
  const navigate = useNavigate()
  const schoolId = useSchoolId()

  const { parent, isLoading } = useResolvedParent(parentId, portalOverride)
  const submitRequest = useVisitationStore((s) => s.submitRequest)
  const getParentRequests = useVisitationStore((s) => s.getParentRequests)
  const approveRequest = useVisitationStore((s) => s.approveRequest)
  const declineRequest = useVisitationStore((s) => s.declineRequest)
  const [showForm, setShowForm] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState(ALL_SESSIONS)
  const [actionModal, setActionModal] = useState<{
    type: "approve" | "decline"
    request: VisitationRequest
  } | null>(null)

  // Only the admin route (`/dashboard/:productId/parents/:parentId/visitation`)
  // renders this without an override — the guardian's own self-service portal
  // always passes parentIdOverride. A parent must never see review actions on
  // their own requests.
  const isAdmin = !parentIdOverride

  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const sessionOptions = useMemo(
    () => [
      { value: ALL_SESSIONS, label: "All Sessions" },
      ...sessions.map((s) => ({ value: s.Id, label: s.SessionName })),
    ],
    [sessions]
  )
  const activeSession = sessions.find((s) => s.Id === selectedSessionId)
  const activeSessionRange = useMemo(() => {
    if (!activeSession) return null
    const starts = activeSession.Terms.map((t) => t.StartDate).filter(Boolean).sort()
    const ends = activeSession.Terms.map((t) => t.EndDate).filter(Boolean).sort()
    if (starts.length === 0) return null
    return { start: starts[0], end: ends[ends.length - 1] }
  }, [activeSession])

  if (isLoading) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        Loading parent...
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

  const parentRequests = getParentRequests(parent.id).sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt)
  )
  const visibleRequests =
    selectedSessionId === ALL_SESSIONS || !activeSessionRange
      ? parentRequests
      : parentRequests.filter(
          (r) =>
            r.visitDate >= activeSessionRange.start &&
            r.visitDate <= activeSessionRange.end
        )
  const pending = parentRequests.filter((r) => r.status === "pending").length

  return (
    <div>
      <PageHeader
        title="Visitation Requests"
        description={
          <>
            {parent.firstName} {parent.lastName}
            {pending > 0 && (
              <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                {pending} pending
              </span>
            )}
          </>
        }
        onBack={parentIdOverride ? undefined : () => navigate(-1)}
        actions={
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <Plus className="size-4" />
            New Request
          </Button>
        }
        className="mb-7"
      />

      {/* Session selector — browse visit requests from a previous session */}
      {sessionOptions.length > 2 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <FilterSelect
            value={selectedSessionId}
            onChange={setSelectedSessionId}
            options={sessionOptions}
            placeholder="Select session"
            triggerClassName="h-9 w-40"
          />
        </div>
      )}

      {/* Request list */}
      {parentRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center dark:border-white/10 dark:bg-white/3">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
            <ClipboardList size={22} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No visit requests yet
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Submit a request to schedule a visit to your child
          </p>
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
            className="mt-4"
          >
            <Plus className="size-4" />
            Request a Visit
          </Button>
        </div>
      ) : visibleRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center dark:border-white/10 dark:bg-white/3">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
            <ClipboardList size={22} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No visit requests for {activeSession?.SessionName ?? "this session"}
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Try selecting a different session above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleRequests.map((req) => (
            <VisitRequestCard
              key={req.id}
              request={req}
              onApprove={
                isAdmin
                  ? (r) => setActionModal({ type: "approve", request: r })
                  : undefined
              }
              onDecline={
                isAdmin
                  ? (r) => setActionModal({ type: "decline", request: r })
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {showForm && (
        <NewVisitModal
          parent={parent}
          onClose={() => setShowForm(false)}
          onSubmit={(data) => {
            submitRequest(data)
            setShowForm(false)
          }}
        />
      )}

      {actionModal && (
        <VisitationActionModal
          type={actionModal.type}
          request={actionModal.request}
          onClose={() => setActionModal(null)}
          onConfirm={(note) => {
            if (actionModal.type === "approve") {
              approveRequest(actionModal.request.id, "School Admin", note)
            } else {
              declineRequest(actionModal.request.id, "School Admin", note)
            }
            setActionModal(null)
          }}
        />
      )}
    </div>
  )
}
