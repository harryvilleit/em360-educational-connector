// Recovered from the 0.6 WordPress Parent Portal source; used only by the WordPress parent screens.
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router"
import { useSchoolId } from "@/contexts/SchoolContext"
import { parentConsentRecords } from "@/api/parentManagement.api"
import { PageHeader } from "@/components/general/PageHeader"
import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import Pagination from "@/components/ui/pagination"
export default function ParentConsentRecords() {
  const schoolId = useSchoolId(),
    { parentId = "" } = useParams(),
    navigate = useNavigate()
  const [page, setPage] = useState(1),
    [status, setStatus] = useState("")
  const q = useQuery({
    queryKey: ["parent-consent", schoolId, parentId, page, status],
    queryFn: () =>
      parentConsentRecords(schoolId, parentId, page, status || undefined),
  })
  return (
    <div className="space-y-6">
      <PageHeader
        title="Parent Consent"
        description="Review the recorded responses for this parent's children."
        onBack={() => navigate(-1)}
      />
      <label className="flex items-center gap-3">
        Response status
        <select
          aria-label="Consent status"
          className="rounded-lg border p-2"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All responses</option>
          {["Pending", "Approved", "Rejected"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      {q.isPending ? (
        <p role="status">Loading consent records…</p>
      ) : q.isError ? (
        <QueryErrorPanel
          title="Unable to load consent"
          message={q.error.message}
          onRetry={() => void q.refetch()}
        />
      ) : (
        <>
          <div className="space-y-3">
            {q.data.items.map((r) => (
              <article
                key={r.consentRequestId + ":" + r.studentId}
                className="rounded-xl border bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-semibold">{r.title}</h2>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                    {r.myResponseStatus}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {r.studentName} · Due{" "}
                  {new Date(r.responseDue).toLocaleDateString()}
                </p>
                <p className="my-3 text-sm whitespace-pre-wrap">
                  {r.description}
                </p>
                {r.myResponseNote && (
                  <p className="rounded-lg bg-slate-50 p-3 text-sm">
                    Response: {r.myResponseNote}
                  </p>
                )}
                {r.respondedAt && (
                  <p className="mt-2 text-xs text-slate-500">
                    Responded {new Date(r.respondedAt).toLocaleString()}
                  </p>
                )}
              </article>
            ))}
            {!q.data.items.length && (
              <p className="rounded-xl border p-8 text-center">
                No consent records match this filter.
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
    </div>
  )
}
