import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router"
import { Bell, ShieldCheck, CalendarDays } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { useSchoolId } from "@/contexts/SchoolContext"
import { visits, value, type Page } from "./visitation-api"
import api from "./api"
export default function Notifications() {
  const schoolId = useSchoolId(),
    navigate = useNavigate()
  const { productId } = useParams()
  const [filter, setFilter] = useState("All"),
    [page, setPage] = useState(1)
  const visit = useQuery({
    queryKey: ["wp-notification-visits", schoolId, page],
    queryFn: () => visits(schoolId, page),
    enabled: filter !== "Consent",
  })
  const consent = useQuery({
    queryKey: ["wp-notification-consent", schoolId, page],
    queryFn: () =>
      value<
        Page<{
          id: string
          title: string
          description: string
          dateCreated: string
          pending: number
          approved: number
          rejected: number
        }>
      >(
        api.get("/Consent/GetRequests", {
          params: { schoolId, pageNumber: page, pageSize: 20 },
        }),
      ),
    enabled: filter !== "Visitation",
  })
  const rows = [
    ...(filter !== "Consent"
      ? (visit.data?.items ?? []).map((v) => ({
          id: v.id,
          kind: "Visitation",
          title:
            v.visitorFirstName +
            " " +
            v.visitorLastName +
            " — " +
            v.studentName,
          body: v.status + " · " + v.reasonForVisit,
          date: v.dateCreated,
          path: "visitation",
        }))
      : []),
    ...(filter !== "Visitation"
      ? (consent.data?.items ?? []).map((c) => ({
          id: c.id,
          kind: "Consent",
          title: c.title,
          body: c.description,
          date: c.dateCreated,
          path: "consent/" + c.id,
        }))
      : []),
  ].sort((a, b) => b.date.localeCompare(a.date))
  const loading =
      (filter !== "Consent" && visit.isPending) ||
      (filter !== "Visitation" && consent.isPending),
    error =
      filter === "Consent"
        ? consent.error
        : filter === "Visitation"
          ? visit.error
          : visit.error || consent.error
  const pages = Math.max(
    filter !== "Consent" ? (visit.data?.totalPages ?? 1) : 1,
    filter !== "Visitation" ? (consent.data?.totalPages ?? 1) : 1,
  )
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="School visitation and consent activity from EM360."
      />
      <div className="flex gap-2">
        {["All", "Visitation", "Consent"].map((t) => (
          <Button
            key={t}
            variant={filter === t ? "primary" : "outline"}
            onClick={() => {
              setFilter(t)
              setPage(1)
            }}
          >
            {t}
          </Button>
        ))}
      </div>
      {loading ? (
        <p role="status">Loading school activity…</p>
      ) : error ? (
        <p role="alert" className="text-red-700">
          {error.message}
        </p>
      ) : (
        <div className="divide-y rounded-2xl border bg-white">
          {rows.map((row) => (
            <button
              key={row.kind + row.id}
              className="flex w-full gap-4 p-5 text-left hover:bg-blue-50"
              onClick={() =>
                navigate("/dashboard/" + productId + "/users/" + row.path)
              }
            >
              {row.kind === "Consent" ? (
                <ShieldCheck className="shrink-0 text-blue-600" />
              ) : (
                <CalendarDays className="shrink-0 text-blue-600" />
              )}
              <span>
                <strong>{row.title}</strong>
                <span className="mt-1 block text-sm text-slate-600">
                  {row.body}
                </span>
                <span className="mt-2 block text-xs text-slate-500">
                  {row.kind} · {row.date?.slice(0, 10)}
                </span>
              </span>
            </button>
          ))}
          {!rows.length && (
            <div className="p-10 text-center text-slate-500">
              <Bell className="mx-auto mb-3" />
              No school activity to display.
            </div>
          )}
        </div>
      )}
      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span>
          Page {page} of {pages}
        </span>
        <Button
          variant="outline"
          disabled={page >= pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
