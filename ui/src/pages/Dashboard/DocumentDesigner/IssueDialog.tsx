import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, Eye, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { usePermissions } from "@/hooks/usePermissions"
import {
  documentMenus,
  schoolDocumentApi,
  type DocumentPreview,
  type DocumentTemplate,
  type IssuedDocument,
  type SourceBody,
} from "@/api/schoolDocuments.api"
import {
  DocumentCanvas,
  Empty,
  Failure,
  Field,
  Select,
  errorMessage,
} from "./shared"
import { renderDocument } from "./renderDocument"

export default function IssueDialog({
  template,
  schoolId,
  onClose,
  onIssued,
}: {
  template: DocumentTemplate
  schoolId: string
  onClose: () => void
  onIssued: () => void
}) {
  const permissions = usePermissions(),
    kind = template.summary.kind
  const types = useMemo(
    () =>
      kind === "reportCard"
        ? permissions.canView(documentMenus.results)
          ? [{ id: "result" as const, name: "Published student result" }]
          : []
        : [
            ...(permissions.canView(documentMenus.students)
              ? [{ id: "studentAward" as const, name: "School student award" }]
              : []),
            ...(permissions.canView(documentMenus.training)
              ? [{ id: "training" as const, name: "Completed staff training" }]
              : []),
          ],
    [kind, permissions]
  )
  const [sourceType, setType] = useState<SourceBody["sourceType"]>(
    types[0]?.id ?? (kind === "reportCard" ? "result" : "studentAward")
  )
  const [sourceId, setId] = useState(""),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [title, setTitle] = useState(""),
    [date, setDate] = useState(() => {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    }),
    [comment, setComment] = useState("")
  const [preview, setPreview] = useState<DocumentPreview | null>(null),
    [issued, setIssued] = useState<IssuedDocument | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null)
  useEffect(() => {
    if (types.length && !types.some((t) => t.id === sourceType)) {
      setType(types[0].id)
      setId("")
      setPage(1)
      setPreview(null)
    }
  }, [types, sourceType])
  const query = useQuery({
    queryKey: ["document-sources", schoolId, kind, sourceType, search, page],
    queryFn: () =>
      schoolDocumentApi.sources(schoolId, kind, sourceType, search, page),
    enabled: types.some((t) => t.id === sourceType) && !issued,
  })
  const clear = () => {
    setPreview(null)
    setError(null)
  }
  const body = (): SourceBody => ({
    templateId: template.summary.id,
    templateRevision: template.summary.revision,
    sourceType,
    sourceId,
    awardTitle: title,
    awardDate: sourceType === "studentAward" ? date : null,
    comment,
    previewHash: preview?.contentHash,
  })
  async function act(issue: boolean) {
    setBusy(true)
    setError(null)
    try {
      if (issue) {
        if (!preview)
          throw new Error("Preview this document before issuing it.")
        await renderDocument(
          preview.kind,
          preview.layout,
          preview.data,
          "preview"
        )
        const result = await schoolDocumentApi.issue(schoolId, body())
        setIssued(result)
        onIssued()
        toast.success(
          "Document issued and saved. You can now download its PDF."
        )
      } else setPreview(await schoolDocumentApi.preview(schoolId, body()))
    } catch (e) {
      setError(e)
      setPreview(null)
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  const ready =
    !!sourceId && (sourceType !== "studentAward" || (!!title.trim() && !!date))
  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent
        className="max-h-[94vh] overflow-y-auto sm:max-w-5xl"
        onEscapeKeyDown={(e) => {
          if (busy) e.preventDefault()
        }}
        onInteractOutside={(e) => {
          if (busy) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {issued ? "Document issued" : "Preview and issue document"}
          </DialogTitle>
          <DialogDescription>
            {template.summary.name} · Published edition{" "}
            {template.summary.publishedVersion}. Review the record and preview
            before issuing a saved document.
          </DialogDescription>
        </DialogHeader>
        {issued ? (
          <>
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 className="size-5" />
              Saved as {issued.summary.documentNumber}. Its design and data are
              retained.
            </div>
            <DocumentCanvas
              kind={issued.summary.kind}
              layout={issued.layout}
              data={issued.data}
              status="issued"
              download
            />
          </>
        ) : !types.length ? (
          <Empty title="Source records access required">
            Ask your administrator for View Results access for report cards, or
            Student List / Assignments & Progress access for certificates.
          </Empty>
        ) : (
          <div className="grid min-w-0 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            <fieldset disabled={busy} className="min-w-0 space-y-4">
              <Select
                label="Record type"
                value={sourceType}
                onChange={(v) => {
                  setType(v as SourceBody["sourceType"])
                  setId("")
                  setPage(1)
                  setSearch("")
                  clear()
                }}
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
              <Field
                label="Search eligible records"
                value={search}
                maxLength={100}
                onChange={(v) => {
                  setSearch(v)
                  setId("")
                  setPage(1)
                  clear()
                }}
              />
              {query.isPending && (
                <p role="status" className="text-sm text-slate-500">
                  Loading eligible records…
                </p>
              )}
              {query.isError && (
                <Failure
                  error={query.error}
                  retry={() => void query.refetch()}
                />
              )}
              <div
                className="max-h-60 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2"
                role="group"
                aria-label="Eligible records"
              >
                {query.data?.items.map((r) => (
                  <label
                    key={r.id}
                    className={`flex cursor-pointer items-start gap-2 rounded-lg p-3 text-sm ${sourceId === r.id ? "bg-indigo-50 text-indigo-900" : "hover:bg-slate-50"}`}
                  >
                    <input
                      type="radio"
                      name="document-source"
                      aria-label={`${r.label} — ${r.details}`}
                      checked={sourceId === r.id}
                      onChange={() => {
                        setId(r.id)
                        clear()
                      }}
                    />
                    <span className="min-w-0 break-words">
                      <span className="block font-medium">{r.label}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {r.details}
                      </span>
                    </span>
                  </label>
                ))}
                {query.data && !query.data.items.length && (
                  <p className="p-3 text-sm text-slate-500">
                    No eligible records match. Publish student results or
                    complete the training first.
                  </p>
                )}
              </div>
              {query.data && query.data.totalCount > 25 && (
                <div className="flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => {
                      setPage((p) => p - 1)
                      setId("")
                      clear()
                    }}
                  >
                    Previous
                  </Button>
                  <span className="text-xs">Page {page}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page * 25 >= query.data.totalCount}
                    onClick={() => {
                      setPage((p) => p + 1)
                      setId("")
                      clear()
                    }}
                  >
                    Next
                  </Button>
                </div>
              )}
              {sourceType === "studentAward" && (
                <>
                  <Field
                    label="Award title"
                    value={title}
                    onChange={(v) => {
                      setTitle(v)
                      clear()
                    }}
                  />
                  <Field
                    label="Award date"
                    type="date"
                    value={date}
                    onChange={(v) => {
                      setDate(v)
                      clear()
                    }}
                  />
                  <p className="text-xs text-slate-500">
                    Your school authorises this award. Recipient details come
                    from the selected school record.
                  </p>
                </>
              )}
              <Field
                label="Document comment"
                value={comment}
                multiline
                maxLength={1000}
                onChange={(v) => {
                  setComment(v)
                  clear()
                }}
              />
              <p className="text-xs text-slate-500">
                Shown where the template contains {"{{Comment}}"}.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={!ready || query.isError || query.isPending}
                  onClick={() => void act(false)}
                >
                  <Eye className="size-4" />
                  Preview document
                </Button>
                <Button
                  disabled={
                    !preview ||
                    !permissions.canCreate(documentMenus.issued) ||
                    !permissions.canView(documentMenus.issued)
                  }
                  onClick={() => void act(true)}
                >
                  <Send className="size-4" />
                  Issue document
                </Button>
              </div>
              {!permissions.canCreate(documentMenus.issued) && (
                <p className="text-xs text-amber-700">
                  Issuing requires Create access to Issued Documents.
                </p>
              )}
            </fieldset>
            <div className="min-w-0 space-y-3">
              {!!error && <Failure error={error} />}
              {preview ? (
                <DocumentCanvas
                  kind={preview.kind}
                  layout={preview.layout}
                  data={preview.data}
                  status="preview"
                  download
                />
              ) : (
                <Empty title="Review before issuing">
                  Select a record and preview its published document design.
                  Issuing saves the original layout and data for future
                  downloads.
                </Empty>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
