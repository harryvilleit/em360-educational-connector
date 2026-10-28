import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Archive,
  ArrowUpRight,
  FileBadge2,
  FileText,
  Loader2,
  Palette,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { StatCard } from "@/components/general/StatCard"
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
  type DocumentTemplate,
  type TemplateSummary,
} from "@/api/schoolDocuments.api"
import TemplateEditor from "./TemplateEditor"
import IssueDialog from "./IssueDialog"
import { Denied, Empty, Failure, Field, errorMessage } from "./shared"

export default function DocumentTemplates({ kind }: { kind: DocumentKind }) {
  const schoolId = useSchoolId(),
    permissions = usePermissions(),
    cache = useQueryClient(),
    menu = documentMenus[kind]
  const view = permissions.canView(menu),
    create = permissions.canCreate(menu),
    edit = permissions.canUpdate(menu),
    remove = permissions.canDelete(menu)
  const [creating, setCreating] = useState(false),
    [name, setName] = useState(""),
    [busy, setBusy] = useState(false),
    [editor, setEditor] = useState<DocumentTemplate | null>(null),
    [issuing, setIssuing] = useState<DocumentTemplate | null>(null)
  useEffect(() => {
    setEditor(null)
    setIssuing(null)
    setCreating(false)
  }, [schoolId, kind])
  const key = ["school-document-templates", schoolId, kind]
  const query = useQuery({
    queryKey: key,
    queryFn: () => schoolDocumentApi.templates(schoolId, kind),
    enabled: !!schoolId && view,
  })
  const refresh = () => {
    void cache.invalidateQueries({ queryKey: key })
    void cache.invalidateQueries({
      queryKey: ["school-issued-documents", schoolId],
    })
  }
  async function start(summary: TemplateSummary, issue = false) {
    setBusy(true)
    try {
      const t = await schoolDocumentApi.template(schoolId, summary.id)
      if (issue) setIssuing(t)
      else setEditor(t)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  async function add() {
    setBusy(true)
    try {
      const t = await schoolDocumentApi.create(schoolId, kind, name)
      setCreating(false)
      setName("")
      setEditor(t)
      refresh()
      toast.success("Template created. Customise its design before publishing.")
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }
  async function archive(t: TemplateSummary) {
    if (
      !window.confirm(
        "Archive this template? Existing issued documents will be retained."
      )
    )
      return
    setBusy(true)
    try {
      await schoolDocumentApi.archive(schoolId, t)
      refresh()
      toast.success("Template archived. Issued documents are retained.")
    } catch (e) {
      toast.error(errorMessage(e))
      refresh()
    } finally {
      setBusy(false)
    }
  }
  if (!view) return <Denied />
  const records = query.data ?? [],
    published = records.filter((x) => x.publishedVersion > 0).length
  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title={
          kind === "reportCard"
            ? "Report Card Templates"
            : "Certificate Templates"
        }
        description="Design school documents, publish an edition and issue personalised PDFs from your records."
        icon={
          kind === "reportCard" ? (
            <FileText className="size-5" />
          ) : (
            <FileBadge2 className="size-5" />
          )
        }
        actions={
          create && (
            <Button onClick={() => setCreating(true)} disabled={busy}>
              <Plus className="size-4" />
              Create template
            </Button>
          )
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active templates"
          value={records.length}
          icon={Palette}
          color="indigo"
        />
        <StatCard
          label="Published designs"
          value={published}
          icon={FileText}
          color="emerald"
        />
        <StatCard
          label="Draft changes"
          value={records.filter((x) => x.hasUnpublishedChanges).length}
          icon={Archive}
          color="amber"
        />
      </div>
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
        Start with a ready-made layout, adjust branding and reorder blocks.{" "}
        {kind === "reportCard"
          ? "Report cards use published results and approved subject scores."
          : "Certificates use school student awards or completed staff training."}{" "}
        Issued documents keep their original design and data.
      </div>
      {query.isPending && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-slate-500"
        >
          <Loader2 className="size-4 animate-spin" />
          Loading document templates…
        </p>
      )}
      {query.isError && (
        <Failure error={query.error} retry={() => void query.refetch()} />
      )}
      {query.isSuccess && !records.length && (
        <Empty title="Create your school's first design">
          Choose your colours, headings, logo and signature. You can preview and
          save drafts before publishing.
        </Empty>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {records.map((t) => (
          <article
            key={t.id}
            className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-5">
              <Palette className="size-8 text-indigo-400" />
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${t.publishedVersion ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
              >
                {t.publishedVersion
                  ? `Published v${t.publishedVersion}`
                  : "Draft"}
              </span>
            </div>
            <div className="flex flex-1 flex-col space-y-4 p-5">
              <div>
                <h2 className="font-semibold break-words text-slate-900">
                  {t.name}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Updated {new Date(t.updatedAtUtc).toLocaleString()}
                </p>
                {t.hasUnpublishedChanges && t.publishedVersion > 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    Draft changes awaiting publication
                  </p>
                )}
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void start(t)}
                >
                  <Palette className="size-4" />
                  {edit ? "Design" : "View design"}
                </Button>
                {t.publishedVersion > 0 && (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => void start(t, true)}
                  >
                    <ArrowUpRight className="size-4" />
                    Use template
                  </Button>
                )}
                {remove && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => void archive(t)}
                  >
                    <Archive className="size-4" />
                    Archive
                  </Button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      <Dialog open={creating} onOpenChange={(o) => !busy && setCreating(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create document template</DialogTitle>
            <DialogDescription>
              A new draft starts with a{" "}
              {kind === "reportCard" ? "report card" : "certificate"} layout.
              Your school controls its branding and publication.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void add()
            }}
            className="space-y-4"
          >
            <Field
              label="New template name"
              value={name}
              onChange={setName}
              disabled={busy}
            />
            <Button type="submit" disabled={busy || !name.trim()}>
              Create draft
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {editor && (
        <TemplateEditor
          key={`${schoolId}-${editor.summary.id}`}
          initial={editor}
          schoolId={schoolId}
          canEdit={edit}
          onClose={() => setEditor(null)}
          onSaved={refresh}
        />
      )}
      {issuing && (
        <IssueDialog
          key={`${schoolId}-${issuing.summary.id}`}
          template={issuing}
          schoolId={schoolId}
          onClose={() => setIssuing(null)}
          onIssued={refresh}
        />
      )}
    </div>
  )
}
