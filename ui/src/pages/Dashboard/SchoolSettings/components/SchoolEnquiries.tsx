import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Inbox, Mail, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import {
  getSchoolEnquiriesApi,
  updateSchoolEnquiryStatusApi,
} from "@/api/publicSchools.api"
import { Button } from "@/components/ui/button"
import type { SchoolEnquiry } from "@/types/public-schools"

const labels = {
  admission: "Admission enquiry",
  visit: "School visit",
  partnership: "Partnership",
  general: "General question",
}

export default function SchoolEnquiries({ schoolId }: { schoolId: string }) {
  const [page, setPage] = useState(1)
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ["school-enquiries", schoolId, page],
    queryFn: () => getSchoolEnquiriesApi(schoolId, page),
    enabled: !!schoolId,
    refetchInterval: 60_000,
  })
  const update = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: SchoolEnquiry["status"]
    }) => updateSchoolEnquiryStatusApi(schoolId, id, status),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: ["school-enquiries", schoolId],
      })
    },
    onError: (error) =>
      toast.error(error.message || "Could not update this enquiry"),
  })
  const data = query.data
  return (
    <section
      className="space-y-5 py-5"
      aria-labelledby="school-enquiries-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="school-enquiries-heading"
            className="text-xl font-bold text-slate-900"
          >
            School enquiries
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Messages sent through your public school profile.
          </p>
          {data && (
            <p className="mt-2 text-sm font-medium text-blue-700">
              {data.pendingCount} pending · {data.totalItems} total
            </p>
          )}
        </div>
        <Button
          variant="outline"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw className="mr-2 size-4" />
          Refresh enquiries
        </Button>
      </div>
      <p className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        Reply by email opens your email app with the visitor’s address. Choose
        your school or private email account to send your reply. Replies are
        sent outside EM360 and are not tracked here. You can also copy the
        address into your webmail.
      </p>
      {query.isPending && (
        <p role="status" className="py-8 text-center text-slate-500">
          Loading enquiries…
        </p>
      )}
      {query.isError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {query.error.message || "Could not load enquiries."} Use Refresh
          enquiries to try again.
        </p>
      )}
      {data && !data.items.length && (
        <div className="rounded-xl border border-dashed border-slate-200 px-5 py-12 text-center">
          <Inbox className="mx-auto mb-3 size-9 text-slate-400" />
          <h3 className="font-semibold">No enquiries yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            When someone requests information, their message will appear here.
          </p>
        </div>
      )}
      {data?.items.map((item) => (
        <article
          key={item.id}
          className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold break-words text-slate-900">
                {item.requesterName}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {labels[item.requestType] || "Enquiry"} ·{" "}
                {new Date(
                  item.submittedAtUtc.endsWith("Z")
                    ? item.submittedAtUtc
                    : item.submittedAtUtc + "Z"
                ).toLocaleString()}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${item.status === "pending" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600"}`}
            >
              {item.status}
            </span>
          </div>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-xs text-slate-500">Email</dt>
              <dd className="break-all">{item.requesterEmail}</dd>
            </div>
            {item.requesterPhone && (
              <div>
                <dt className="text-xs text-slate-500">Phone</dt>
                <dd className="break-words">{item.requesterPhone}</dd>
              </div>
            )}
            {item.studentName && (
              <div>
                <dt className="text-xs text-slate-500">Student</dt>
                <dd className="break-words">{item.studentName}</dd>
              </div>
            )}
            {item.studentGrade && (
              <div>
                <dt className="text-xs text-slate-500">Grade / class</dt>
                <dd className="break-words">{item.studentGrade}</dd>
              </div>
            )}
          </dl>
          <p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 break-words whitespace-pre-wrap text-slate-700">
            {item.message}
          </p>
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <Button variant="primary" asChild>
              <a
                href={`mailto:${encodeURIComponent(item.requesterEmail)}?subject=${encodeURIComponent("Re: Your school enquiry")}`}
              >
                <Mail className="mr-2 size-4" />
                Reply by email
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(item.requesterEmail)
                  toast.success("Email address copied")
                } catch {
                  toast.error(
                    "Could not copy. Select the email address above and copy it."
                  )
                }
              }}
            >
              Copy email
            </Button>
            <label className="flex items-center gap-2 text-sm sm:ml-auto">
              Status
              <select
                aria-label={`Status for ${item.requesterName}`}
                value={item.status}
                disabled={update.isPending}
                onChange={(e) =>
                  update.mutate({
                    id: item.id,
                    status: e.target.value as SchoolEnquiry["status"],
                  })
                }
                className="rounded-md border border-slate-200 bg-white px-3 py-2"
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </div>
          {!item.emailNotificationQueued && (
            <p className="text-xs text-slate-500">
              Email alert not confirmed. This message is saved in your inbox.
            </p>
          )}
        </article>
      ))}
      {data && data.totalItems > data.pageSize && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            disabled={data.pageNumber <= 1 || query.isFetching}
            onClick={() => setPage(data.pageNumber - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {data.pageNumber} of{" "}
            {Math.ceil(data.totalItems / data.pageSize)}
          </span>
          <Button
            variant="outline"
            disabled={
              data.pageNumber * data.pageSize >= data.totalItems ||
              query.isFetching
            }
            onClick={() => setPage(data.pageNumber + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  )
}
