import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { FileText, Clock, CheckCircle2, XCircle, Send } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import {
  transcripts,
  transcriptSummary,
  reviewTranscript,
  type Transcript,
  type TranscriptStatus,
} from "@/api/parentManagement.api"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import Pagination from "@/components/ui/pagination"
import { TranscriptRequestForm } from "@/pages/Dashboard/Parent/components/TranscriptRequestForm"
import { toast } from "sonner"
export default function ParentTranscriptOverview() {
  const schoolId = useSchoolId(),
    { parentId } = useParams(),
    navigate = useNavigate(),
    permissions = usePermissions(),
    client = useQueryClient()
  const [page, setPage] = useState(1),
    [status, setStatus] = useState("Pending"),
    [selected, setSelected] = useState<Transcript | null>(null),
    [create, setCreate] = useState(false),
    [decision, setDecision] = useState<TranscriptStatus>("Processing"),
    [reason, setReason] = useState("")
  const q = useQuery({
    queryKey: ["parent-transcripts", schoolId, parentId, page, status],
    queryFn: () => transcripts(schoolId, page, status || undefined, parentId),
  })
  const summary = useQuery({
    queryKey: ["parent-transcripts", schoolId, parentId, "summary"],
    queryFn: () => transcriptSummary(schoolId, parentId),
  })
  const mutation = useMutation({
    mutationFn: () =>
      reviewTranscript(selected!.id, decision, reason || undefined),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["parent-transcripts"] })
      toast.success("Transcript request updated.")
      setSelected(null)
    },
  })
  const cards = [
    {
      label: "Total Requests",
      value: summary.data?.total,
      icon: FileText,
      color: "gray" as const,
    },
    {
      label: "Pending",
      value: summary.data?.pending,
      icon: Clock,
      color: "orange" as const,
    },
    {
      label: "Processing",
      value: summary.data?.processing,
      icon: CheckCircle2,
      color: "blue" as const,
    },
    {
      label: "Dispatched",
      value: summary.data?.dispatched,
      icon: Send,
      color: "green" as const,
    },
    {
      label: "Rejected",
      value: summary.data?.rejected,
      icon: XCircle,
      color: "red" as const,
    },
  ]
  return (
    <div className="space-y-6">
      <PageHeader
        title="Transcript Requests"
        description="Review and track academic transcript requests from parents."
        onBack={parentId ? () => navigate(-1) : undefined}
        actions={
          permissions.canCreate("/dashboard/parents/transcript") && (
            <Button onClick={() => setCreate(true)}>New Request</Button>
          )
        }
      />
      {summary.isError ? (
        <QueryErrorPanel
          title="Unable to load request totals"
          message={summary.error.message}
          onRetry={() => void summary.refetch()}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          {cards.map((c) => (
            <StatCard key={c.label} {...c} value={c.value ?? "—"} />
          ))}
        </div>
      )}
      <div className="flex justify-end">
        <label className="flex items-center gap-3">
          Status
          <select
            aria-label="Transcript status"
            className="rounded-lg border bg-white p-2"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All statuses</option>
            {[
              "Pending",
              "Processing",
              "Dispatched",
              "Rejected",
              "Cancelled",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {q.isPending ? (
        <p role="status">Loading transcript requests…</p>
      ) : q.isError ? (
        <QueryErrorPanel
          title="Unable to load transcript requests"
          message={q.error.message}
          onRetry={() => void q.refetch()}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Student",
                    "Recipient",
                    "Purpose",
                    "Requested",
                    "Status",
                    "",
                  ].map((h, i) => (
                    <th className="p-4" key={i}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {q.data.items.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-4">
                      <strong>{r.studentName}</strong>
                      <p className="text-slate-500">{r.className}</p>
                    </td>
                    <td className="p-4">
                      {r.institutionName || "Parent / Self"}
                    </td>
                    <td className="max-w-64 truncate p-4">{r.purpose}</td>
                    <td className="p-4">
                      {new Date(r.dateCreated).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelected(r)
                          setDecision(
                            r.status === "Processing"
                              ? "Dispatched"
                              : "Processing"
                          )
                          setReason("")
                          mutation.reset()
                        }}
                      >
                        View details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!q.data.items.length && (
              <p className="p-10 text-center text-slate-500">
                No transcript requests match this filter.
              </p>
            )}
          </div>
          <Pagination
            page={page}
            total={q.data.totalItems}
            pageSize={20}
            onPageChange={setPage}
          />
        </>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(v) => !v && !mutation.isPending && setSelected(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Transcript request details</DialogTitle>
            <DialogDescription>{selected?.studentName}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <dl className="grid gap-3">
                <div>
                  <dt className="font-semibold">Recipient</dt>
                  <dd>{selected.institutionName || "Parent / Self"}</dd>
                  <dd className="whitespace-pre-wrap">
                    {selected.institutionAddress}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Contact</dt>
                  <dd>
                    {selected.contactPerson || "—"} {selected.contactEmail}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Purpose</dt>
                  <dd className="whitespace-pre-wrap">{selected.purpose}</dd>
                </div>
                {selected.additionalNotes && (
                  <div>
                    <dt className="font-semibold">Notes</dt>
                    <dd>{selected.additionalNotes}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-semibold">Status</dt>
                  <dd>{selected.status}</dd>
                </div>
                {selected.rejectionReason && (
                  <div>
                    <dt className="font-semibold">Rejection reason</dt>
                    <dd>{selected.rejectionReason}</dd>
                  </div>
                )}
                {selected.dispatchedAt && (
                  <div>
                    <dt className="font-semibold">Dispatched</dt>
                    <dd>{new Date(selected.dispatchedAt).toLocaleString()}</dd>
                  </div>
                )}
              </dl>
              {permissions.canUpdate("/dashboard/parents/transcript") &&
                ["Pending", "Processing"].includes(selected.status) && (
                  <form
                    className="space-y-3 border-t pt-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!mutation.isPending) mutation.mutate()
                    }}
                  >
                    <label className="block">
                      Update status
                      <select
                        aria-label="Transcript decision"
                        className="mt-1 w-full rounded-lg border p-2"
                        value={decision}
                        onChange={(e) =>
                          setDecision(e.target.value as TranscriptStatus)
                        }
                      >
                        {selected.status === "Pending" ? (
                          <option value="Processing">Start processing</option>
                        ) : (
                          <option value="Dispatched">Mark as dispatched</option>
                        )}
                        <option value="Rejected">Reject request</option>
                      </select>
                    </label>
                    {decision === "Rejected" && (
                      <label className="block">
                        Rejection reason
                        <textarea
                          aria-label="Rejection reason"
                          required
                          maxLength={2000}
                          className="mt-1 w-full rounded-lg border p-2"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </label>
                    )}
                    {decision === "Dispatched" && (
                      <p className="rounded-lg bg-blue-50 p-3">
                        Confirm that your school has sent the transcript. This
                        action records dispatch; it does not send a document.
                      </p>
                    )}
                    {mutation.isError && (
                      <p role="alert" className="text-red-700">
                        {mutation.error.message}
                      </p>
                    )}
                    <Button type="submit" disabled={mutation.isPending}>
                      {mutation.isPending ? "Saving…" : "Save decision"}
                    </Button>
                  </form>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {create && (
        <TranscriptRequestForm
          guardianId={parentId}
          onClose={() => setCreate(false)}
        />
      )}
    </div>
  )
}
