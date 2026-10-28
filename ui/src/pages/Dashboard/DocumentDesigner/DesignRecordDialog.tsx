import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type {
  DocumentData,
  DocumentTemplate,
  SourceBody,
} from "@/api/schoolDocuments.api"
import { documentMenus, schoolDocumentApi } from "@/api/schoolDocuments.api"
import { usePermissions } from "@/hooks/usePermissions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Empty, Failure, Field, Select } from "./shared"

export default function DesignRecordDialog({
  template,
  schoolId,
  canEdit,
  prepare,
  onClose,
  onLoaded,
}: {
  template: DocumentTemplate
  schoolId: string
  canEdit: boolean
  prepare: () => Promise<DocumentTemplate>
  onClose: () => void
  onLoaded: (data: DocumentData) => void
}) {
  const permissions = usePermissions(),
    kind = template.summary.kind
  const types = useMemo(
    () =>
      kind === "reportCard"
        ? permissions.canView(documentMenus.results)
          ? ["result"]
          : []
        : [
            ...(permissions.canView(documentMenus.students)
              ? ["studentAward"]
              : []),
            ...(permissions.canView(documentMenus.training)
              ? ["training"]
              : []),
          ],
    [kind, permissions]
  )
  const [type, setType] = useState(types[0] ?? "result"),
    [sourceId, setSourceId] = useState(""),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [title, setTitle] = useState(""),
    [date, setDate] = useState(new Date().toISOString().slice(0, 10)),
    [comment, setComment] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null)
  useEffect(() => {
    if (types.length && !types.includes(type)) {
      setType(types[0])
      setSourceId("")
      setPage(1)
    }
  }, [types, type])
  const query = useQuery({
    queryKey: ["document-sources", schoolId, kind, type, search, page],
    queryFn: () =>
      schoolDocumentApi.sources(
        schoolId,
        kind,
        type as SourceBody["sourceType"],
        search,
        page
      ),
    enabled: types.includes(type),
  })
  async function load() {
    setBusy(true)
    setError(null)
    try {
      const current = await prepare()
      const preview = await schoolDocumentApi.preview(schoolId, {
        templateId: current.summary.id,
        templateRevision: current.summary.revision,
        sourceType: type as SourceBody["sourceType"],
        sourceId,
        awardTitle: title,
        awardDate: type === "studentAward" ? date : null,
        comment,
        useDraft: canEdit,
      })
      onLoaded(preview.data)
      onClose()
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose()
      }}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
        onInteractOutside={(e) => {
          if (busy) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (busy) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Preview with a school record</DialogTitle>
          <DialogDescription>
            Your current draft is saved before loading the record. This creates
            a preview; it does not issue a document.
          </DialogDescription>
        </DialogHeader>
        {!types.length ? (
          <Empty title="Source access required">
            Your role needs access to published results, students or completed
            training.
          </Empty>
        ) : (
          <fieldset disabled={busy} className="space-y-4">
            <Select
              label="Record type"
              value={type}
              onChange={(v) => {
                setType(v)
                setSourceId("")
                setPage(1)
              }}
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t === "result"
                    ? "Published student result"
                    : t === "training"
                      ? "Completed staff training"
                      : "Student award"}
                </option>
              ))}
            </Select>
            <Field
              label="Search records"
              value={search}
              onChange={(v) => {
                setSearch(v)
                setPage(1)
                setSourceId("")
              }}
              maxLength={100}
            />
            {!!query.error && (
              <Failure error={query.error} retry={() => void query.refetch()} />
            )}
            <Select
              label="Select record"
              value={sourceId}
              onChange={setSourceId}
            >
              <option value="">
                {query.isFetching ? "Loading…" : "Choose a record…"}
              </option>
              {query.data?.items.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} · {s.details}
                </option>
              ))}
            </Select>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1 || query.isFetching}
                onClick={() => {
                  setPage(page - 1)
                  setSourceId("")
                }}
              >
                Previous
              </Button>
              <span>
                Page {page} · {query.data?.totalCount ?? 0} records
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  query.isFetching || page * 25 >= (query.data?.totalCount ?? 0)
                }
                onClick={() => {
                  setPage(page + 1)
                  setSourceId("")
                }}
              >
                Next
              </Button>
            </div>
            {type === "studentAward" && (
              <>
                <Field label="Award title" value={title} onChange={setTitle} />
                <Field
                  label="Award date"
                  type="date"
                  value={date}
                  onChange={setDate}
                />
              </>
            )}
            <Field
              label="Teacher or award comment"
              multiline
              maxLength={1000}
              value={comment}
              onChange={setComment}
            />
            {!!error && <Failure error={error} />}
            <Button
              disabled={
                !sourceId ||
                busy ||
                (type === "studentAward" && (!title.trim() || !date))
              }
              onClick={() => void load()}
            >
              {busy ? "Loading record…" : "Use this record"}
            </Button>
          </fieldset>
        )}
      </DialogContent>
    </Dialog>
  )
}
