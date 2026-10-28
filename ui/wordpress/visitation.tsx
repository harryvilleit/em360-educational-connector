import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"
import { Plus, CalendarDays } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import api from "./api"
import {
  visits,
  reviewVisit,
  value,
  type Visit,
  type Page,
} from "./visitation-api"

export default function Visitation() {
  const schoolId = useSchoolId(),
    client = useQueryClient(),
    permissions = usePermissions()
  const { requestId } = useParams()
  const [page, setPage] = useState(1),
    [status, setStatus] = useState("Pending"),
    [selected, setSelected] = useState<Visit | null>(null),
    [showNew, setShowNew] = useState(false),
    [decision, setDecision] = useState<"Approved" | "Rejected">("Approved"),
    [reason, setReason] = useState("")
  const query = useQuery({
    queryKey: ["wp-visits", schoolId, page, status],
    queryFn: () => visits(schoolId, page, status || undefined),
  })
  const detail = useQuery({
    queryKey: ["wp-visits", schoolId, "detail", requestId],
    queryFn: () => visits(schoolId, 1, undefined, requestId),
    enabled: !!requestId,
  })
  useEffect(() => {
    if (detail.data?.items[0]) setSelected(detail.data.items[0])
  }, [detail.data])
  const mutation = useMutation({
    mutationFn: () => reviewVisit(selected!.id, decision, reason),
    onSuccess: () => {
      toast.success("Visit request updated.")
      setSelected(null)
      void client.invalidateQueries({ queryKey: ["wp-visits", schoolId] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitation Requests"
        description="Review and manage parent visit requests"
        actions={
          permissions.canCreate("/dashboard/users/visitation") ? (
            <Button variant="primary" onClick={() => setShowNew(true)}>
              <Plus size={16} />
              New Request
            </Button>
          ) : undefined
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4">
        <p className="font-medium">
          <CalendarDays className="mr-2 inline size-5 text-blue-600" />
          {query.data?.totalItems ?? "—"} {status || "total"} requests
        </p>
        <label className="flex items-center gap-2 text-sm">
          Status
          <select
            aria-label="Visit status"
            className="rounded-lg border p-2"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
          >
            <option value="">All statuses</option>
            {["Pending", "Approved", "Rejected", "Cancelled"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {query.isPending ? (
        <p role="status">Loading visitation requests…</p>
      ) : query.isError ? (
        <p role="alert" className="text-red-700">
          {query.error.message}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                {[
                  "Visitor / Student",
                  "Visit details",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th className="p-4" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((v) => (
                <tr className="border-b last:border-0" key={v.id}>
                  <td className="p-4">
                    <strong>
                      {v.visitorFirstName} {v.visitorLastName}
                    </strong>
                    <p className="text-slate-500">
                      {v.studentName} · {v.className || "School"}
                    </p>
                  </td>
                  <td className="p-4">
                    {v.visitDate.slice(0, 10)} · {v.checkInTime?.slice(0, 5)}–
                    {v.expectedCheckOutTime?.slice(0, 5)}
                    <p className="text-slate-500">{v.visitLocation}</p>
                  </td>
                  <td className="p-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                      {v.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelected(v)
                        setReason("")
                        setDecision("Approved")
                      }}
                    >
                      View details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!query.data.items.length && (
            <p className="p-8 text-center text-slate-500">
              No visitation requests match this filter.
            </p>
          )}
        </div>
      )}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={page === 1 || query.isFetching}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {query.data?.totalPages || 1}
        </span>
        <Button
          variant="outline"
          disabled={
            !query.data || page >= query.data.totalPages || query.isFetching
          }
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) setSelected(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Visit request details</DialogTitle>
            <DialogDescription>{selected?.studentName}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <p>
                <strong>Visitor:</strong> {selected.visitorFirstName}{" "}
                {selected.visitorLastName} ({selected.relationshipToStudent})
              </p>
              <p>
                <strong>Purpose:</strong> {selected.reasonForVisit}
              </p>
              <p>
                <strong>Additional notes:</strong>{" "}
                {selected.additionalNotes || "None"}
              </p>
              <p>
                <strong>Accompanying visitors:</strong>{" "}
                {selected.additionalVisitorCount}{" "}
                {selected.additionalVisitorNames}
              </p>
              <p>
                <strong>Bringing items:</strong>{" "}
                {selected.bringingPackage ? "Yes" : "No"}
              </p>
              <p>
                <strong>Status:</strong> {selected.status}
                {selected.rejectionReason && " — " + selected.rejectionReason}
              </p>
              {selected.status === "Pending" &&
                permissions.canUpdate("/dashboard/users/visitation") && (
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault()
                      mutation.mutate()
                    }}
                  >
                    <label className="block">
                      Decision
                      <select
                        className="ml-3 rounded border p-2"
                        value={decision}
                        onChange={(e) =>
                          setDecision(e.target.value as typeof decision)
                        }
                      >
                        <option>Approved</option>
                        <option>Rejected</option>
                      </select>
                    </label>
                    <label className="block">
                      Review note {decision === "Rejected" && "(required)"}
                      <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required={decision === "Rejected"}
                        maxLength={1000}
                      />
                    </label>
                    <Button
                      disabled={
                        mutation.isPending ||
                        (decision === "Rejected" && !reason.trim())
                      }
                      type="submit"
                    >
                      {mutation.isPending ? "Saving…" : "Save decision"}
                    </Button>
                  </form>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <NewVisit
        open={showNew}
        close={() => setShowNew(false)}
        schoolId={schoolId}
      />
    </div>
  )
}
function NewVisit({
  open,
  close,
  schoolId,
}: {
  open: boolean
  close: () => void
  schoolId: string
}) {
  const client = useQueryClient()
  const [search, setSearch] = useState(""),
    [guardian, setGuardian] = useState(""),
    [keyword, setKeyword] = useState("")
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(search), 300)
    return () => clearTimeout(timer)
  }, [search])
  const parents = useQuery({
    queryKey: ["wp-visit-parents", schoolId, keyword],
    queryFn: () =>
      value<Page<{ guardianId: string; fullName: string }>>(
        api.get("/Guardian/GetSchoolParents/" + schoolId, {
          params: { pageNumber: 1, pageSize: 20, search: keyword },
        }),
      ),
    enabled: open,
  })
  const children = useQuery({
    queryKey: ["wp-visit-children", schoolId, guardian],
    queryFn: () =>
      value<{ studentId: string; fullName: string }[]>(
        api.get("/Guardian/GetGuardianChildren", {
          params: { schoolId, guardianId: guardian },
        }),
      ),
    enabled: open && !!guardian,
  })
  const create = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      value(api.post("/Guardian/SubmitVisitRequest", data)),
    onSuccess: () => {
      toast.success("Visit request submitted.")
      close()
      void client.invalidateQueries({ queryKey: ["wp-visits", schoolId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !create.isPending) close()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Visitation Request</DialogTitle>
          <DialogDescription>
            Choose the guardian and child, then enter the visit details.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            create.mutate({
              ...Object.fromEntries(f),
              schoolId,
              guardianId: guardian,
              visitLocation: Number(f.get("visitLocation")),
              additionalVisitorCount: Number(
                f.get("additionalVisitorCount") || 0,
              ),
              bringingPackage: f.get("bringingPackage") === "on",
            })
          }}
        >
          <label className="block text-sm">
            Search parents
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or email"
            />
          </label>
          <label className="block text-sm">
            Parent / guardian
            <select
              required
              className="mt-1 w-full rounded-lg border p-2"
              value={guardian}
              onChange={(e) => setGuardian(e.target.value)}
            >
              <option value="">Select a guardian</option>
              {parents.data?.items.map((p) => (
                <option key={p.guardianId} value={p.guardianId}>
                  {p.fullName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Student
            <select
              required
              name="studentId"
              key={guardian}
              disabled={!guardian || children.isPending}
              className="mt-1 w-full rounded-lg border p-2"
            >
              <option value="">Select a child</option>
              {children.data?.map((c) => (
                <option key={c.studentId} value={c.studentId}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </label>
          {(parents.isError || children.isError) && (
            <p role="alert" className="text-red-700">
              {parents.error?.message || children.error?.message}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {[
              ["visitorFirstName", "Visitor first name", "text"],
              ["visitorLastName", "Visitor last name", "text"],
              ["relationshipToStudent", "Relationship", "text"],
              ["visitDate", "Visit date", "date"],
              ["checkInTime", "Arrival time", "time"],
              ["expectedCheckOutTime", "Departure time", "time"],
            ].map(([name, label, type]) => (
              <label key={name} className="text-sm">
                {label}
                <Input name={name} type={type} required maxLength={100} />
              </label>
            ))}
          </div>
          <label className="block text-sm">
            Location
            <select name="visitLocation" className="ml-2 rounded border p-2">
              <option value="1">School</option>
              <option value="2">Hostel</option>
            </select>
          </label>
          <label className="block text-sm">
            Purpose of visit
            <Textarea name="reasonForVisit" required maxLength={1000} />
          </label>
          <label className="block text-sm">
            Additional notes
            <Textarea name="additionalNotes" maxLength={1000} />
          </label>
          <label className="block text-sm">
            Additional visitors
            <Input
              name="additionalVisitorCount"
              type="number"
              min="0"
              max="20"
              defaultValue="0"
            />
          </label>
          <label className="block text-sm">
            Additional visitor names
            <Input name="additionalVisitorNames" maxLength={500} />
          </label>
          <label className="flex gap-2 text-sm">
            <input name="bringingPackage" type="checkbox" /> Bringing items or a
            package
          </label>
          <Button type="submit" disabled={create.isPending || !guardian}>
            {create.isPending ? "Submitting…" : "Submit request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
