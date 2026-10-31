import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { Plus, FileText } from "lucide-react"
import { useResolvedParent } from "@/hooks/useResolvedParent"
import { useTranscriptStore, type TranscriptRequest } from "@/store/transcript.store"
import type { LaunchSchoolPortalDataI } from "@/api/guardian.api/types"
import { TranscriptCard } from "./components/TranscriptCard"
import { TranscriptModal } from "./components/TranscriptModal"
import { TranscriptActionModal } from "./components/TranscriptActionModal"

interface ParentTranscriptRequestPageProps {
  parentIdOverride?: string
  portalOverride?: LaunchSchoolPortalDataI
}

export default function ParentTranscriptRequestPage({
  parentIdOverride,
  portalOverride,
}: ParentTranscriptRequestPageProps = {}) {
  const { parentId: routeParentId } = useParams<{ productId: string; parentId: string }>()
  const parentId = parentIdOverride ?? routeParentId
  const navigate = useNavigate()

  const { parent, isLoading } = useResolvedParent(parentId, portalOverride)
  const getParentRequests = useTranscriptStore((s) => s.getParentRequests)
  const submitRequest = useTranscriptStore((s) => s.submitRequest)
  const approveRequest = useTranscriptStore((s) => s.approveRequest)
  const declineRequest = useTranscriptStore((s) => s.declineRequest)
  const [showForm, setShowForm] = useState(false)
  const [actionModal, setActionModal] = useState<{
    type: "approve" | "decline"
    request: TranscriptRequest
  } | null>(null)

  // Only the admin route (`/dashboard/:productId/parents/:parentId/transcript`)
  // renders this without an override — the guardian's own self-service portal
  // always passes parentIdOverride. A parent must never see review actions on
  // their own requests.
  const isAdmin = !parentIdOverride

  if (isLoading) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">Loading parent...</div>
    )
  }

  if (!parent) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">Parent not found.</div>
    )
  }

  const requests = getParentRequests(parent.id).sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt)
  )
  const pending = requests.filter((r) => r.status === "pending").length

  return (
    <div>
      <PageHeader
        title="Request Transcript"
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

      {/* Request list */}
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center dark:border-white/10 dark:bg-white/3">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
            <FileText size={22} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No transcript requests yet
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Submit a request to generate an official academic transcript
          </p>
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
            className="mt-4"
          >
            <Plus className="size-4" />
            Request Transcript
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <TranscriptCard
              key={req.id}
              request={req}
              parent={parent}
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
        <TranscriptModal
          parent={parent}
          onClose={() => setShowForm(false)}
          onSubmit={(data) => {
            submitRequest(data)
            setShowForm(false)
          }}
        />
      )}

      {actionModal && (
        <TranscriptActionModal
          type={actionModal.type}
          request={actionModal.request}
          onClose={() => setActionModal(null)}
          onConfirm={(note) => {
            if (actionModal.type === "approve") {
              approveRequest(actionModal.request.id, note || undefined)
            } else {
              declineRequest(actionModal.request.id, note)
            }
            setActionModal(null)
          }}
        />
      )}
    </div>
  )
}
