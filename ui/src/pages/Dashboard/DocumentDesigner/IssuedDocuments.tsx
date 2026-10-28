import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Ban, Eye, FileCheck2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import {
  documentMenus,
  schoolDocumentApi,
  type DocumentKind,
  type IssuedDocument,
  type IssuedSummary,
} from "@/api/schoolDocuments.api"
import {
  Denied,
  DocumentCanvas,
  Empty,
  Failure,
  Field,
  Select,
  errorMessage,
} from "./shared"

export default function IssuedDocuments() {
  const schoolId = useSchoolId(),
    permissions = usePermissions(),
    cache = useQueryClient()
  const view = permissions.canView(documentMenus.issued),
    report = permissions.canView(documentMenus.reportCard),
    certificate = permissions.canView(documentMenus.certificate)
  const [kind, setKind] = useState<DocumentKind>(
      report ? "reportCard" : "certificate"
    ),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState<IssuedDocument | null>(null),
    [revoking, setRevoking] = useState<IssuedSummary | null>(null),
    [reason, setReason] = useState("")
  useEffect(() => {
    setSelected(null)
    setRevoking(null)
    setPage(1)
  }, [schoolId])
  useEffect(() => {
    if (kind === "reportCard" && !report && certificate) setKind("certificate")
    else if (kind === "certificate" && !certificate && report)
      setKind("reportCard")
  }, [kind, report, certificate])
  const allowed = kind === "reportCard" ? report : certificate
  const key = ["school-issued-documents", schoolId, kind, search, page]
  const query = useQuery({
    queryKey: key,
    queryFn: () => schoolDocumentApi.issued(schoolId, kind, search, page),
    enabled: !!schoolId && view && allowed,
  })
  async function open(row: IssuedSummary) {
    setBusy(true)
    try {
      setSelected(await schoolDocumentApi.document(schoolId, row.id))
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  async function revoke() {
    if (!revoking) return
    setBusy(true)
    try {
      await schoolDocumentApi.revoke(schoolId, revoking, reason)
      setRevoking(null)
      setReason("")
      void cache.invalidateQueries({
        queryKey: ["school-issued-documents", schoolId],
      })
      toast.success("Document revoked. Its original record is retained.")
    } catch (e) {
      toast.error(errorMessage(e))
      void query.refetch()
    } finally {
      setBusy(false)
    }
  }
  if (!view || (!report && !certificate)) return <Denied />
  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Issued Documents"
        description="Find saved report cards and certificates, download their original editions and manage revocation."
        icon={<FileCheck2 className="size-5" />}
      />
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[220px_minmax(0,1fr)]">
        <Select
          label="Document type"
          value={kind}
          onChange={(v) => {
            setKind(v as DocumentKind)
            setPage(1)
          }}
        >
          {report && <option value="reportCard">Report cards</option>}
          {certificate && <option value="certificate">Certificates</option>}
        </Select>
        <Field
          label="Search recipient, template or document number"
          value={search}
          maxLength={100}
          onChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
        />
      </div>
      {query.isPending && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-slate-500"
        >
          <Loader2 className="size-4 animate-spin" />
          Loading issued documents…
        </p>
      )}
      {query.isError && (
        <Failure error={query.error} retry={() => void query.refetch()} />
      )}
      {query.isSuccess && !query.data.items.length && (
        <Empty title="No issued documents found">
          Publish a template, preview it with a school record, then issue the
          document. Its saved edition will appear here.
        </Empty>
      )}
      <div className="space-y-3">
        {query.data?.items.map((row) => (
          <article
            key={row.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold break-words">{row.recipientName}</h2>
              <p className="mt-1 text-sm break-words text-slate-500">
                {row.templateName} · Edition {row.templateVersion}
              </p>
              <p className="mt-1 font-mono text-xs break-words text-slate-500">
                {row.documentNumber}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Issued {new Date(row.issuedAtUtc).toLocaleString()}
              </p>
              {row.revokedAtUtc && (
                <p className="mt-2 text-xs break-words text-red-700">
                  Revoked: {row.revocationReason}
                </p>
              )}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${row.revokedAtUtc ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
            >
              {row.revokedAtUtc ? "Revoked" : "Issued"}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => void open(row)}
              >
                <Eye className="size-4" />
                View and download
              </Button>
              {!row.revokedAtUtc &&
                permissions.canDelete(documentMenus.issued) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      setReason("")
                      setRevoking(row)
                    }}
                  >
                    <Ban className="size-4" />
                    Revoke
                  </Button>
                )}
            </div>
          </article>
        ))}
      </div>
      {query.data && query.data.totalCount > 25 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {page} · {query.data.totalCount} documents
          </span>
          <Button
            variant="outline"
            disabled={page * 25 >= query.data.totalCount}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selected?.summary.documentNumber}</DialogTitle>
            <DialogDescription>
              Original edition {selected?.summary.templateVersion}.{" "}
              {selected?.summary.revokedAtUtc
                ? `Revoked: ${selected.summary.revocationReason}`
                : "Saved layout and school record snapshot."}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <DocumentCanvas
              kind={selected.summary.kind}
              layout={selected.layout}
              data={selected.data}
              status={selected.summary.revokedAtUtc ? "revoked" : "issued"}
              download
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!revoking}
        onOpenChange={(o) => !busy && !o && setRevoking(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke document</DialogTitle>
            <DialogDescription>
              The original record is retained. Future downloads will be marked
              as revoked; previously downloaded copies cannot be recalled.
            </DialogDescription>
          </DialogHeader>
          <Field
            label="Revocation reason"
            value={reason}
            onChange={setReason}
            multiline
            maxLength={500}
            disabled={busy}
          />
          <Button
            variant="destructive"
            disabled={busy || !reason.trim()}
            onClick={() => void revoke()}
          >
            Confirm revocation
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
