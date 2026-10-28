import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Eye, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import SchoolContentEditor, {
  SchoolRichContent,
} from "@/components/general/SchoolContent"
import {
  getSchoolPricingApi,
  updateSchoolPricingApi,
} from "@/api/publicSchools.api"
import { publicSchoolKeys } from "@/hooks/publicSchools"
import { schoolHtmlText } from "@/lib/school-public-content"
import type { SchoolPricingSettings as Pricing } from "@/types/public-schools"

export default function SchoolPricingSettings({
  schoolId,
}: {
  schoolId: string
}) {
  const query = useQuery({
    queryKey: ["school-pricing", schoolId],
    queryFn: () => getSchoolPricingApi(schoolId),
  })
  if (query.isPending)
    return (
      <div className="p-12">
        <LoaderCircle className="animate-spin" />
      </div>
    )
  if (!query.data || query.error)
    return (
      <div
        role="alert"
        className="rounded-xl bg-red-50 p-6 text-sm text-red-700"
      >
        {query.error?.message || "Unable to load pricing."}
        <Button
          variant="outline"
          onClick={() => query.refetch()}
          className="ml-3"
        >
          Retry
        </Button>
      </div>
    )
  return <PricingForm key={schoolId} schoolId={schoolId} initial={query.data} />
}
function PricingForm({
  schoolId,
  initial,
}: {
  schoolId: string
  initial: Pricing
}) {
  const [draft, setDraft] = useState(initial)
  const [preview, setPreview] = useState(false)
  const [saved, setSaved] = useState(initial)
  const qc = useQueryClient()
  const dirty =
    draft.title !== saved.title ||
    draft.content !== saved.content ||
    draft.showPricing !== saved.showPricing
  const mutation = useMutation({
    mutationFn: (action: "draft" | "publish") =>
      updateSchoolPricingApi(schoolId, {
        title: draft.title,
        content: draft.content,
        showPricing: draft.showPricing,
        action,
      }),
    onSuccess: (data, action) => {
      // Keep a draft visibility choice in the form; only publishing changes live visibility.
      const next = {
        ...data,
        showPricing: action === "draft" ? draft.showPricing : data.showPricing,
      }
      setDraft(next)
      setSaved(next)
      qc.setQueryData(["school-pricing", schoolId], data)
      qc.invalidateQueries({ queryKey: publicSchoolKeys.all })
      toast.success(
        action === "draft"
          ? "Pricing draft saved"
          : data.showPricing
            ? "Pricing published"
            : "Pricing content hidden from public profile"
      )
    },
    onError: (e: Error) => toast.error(e.message),
  })
  const save = (action: "draft" | "publish") => {
    if (
      !draft.title.trim() ||
      draft.title.length > 160 ||
      draft.content.length > 50000
    ) {
      toast.error("Check the title and content length.")
      return
    }
    if (
      action === "publish" &&
      draft.showPricing &&
      !schoolHtmlText(draft.content)
    ) {
      toast.error("Add pricing information before publishing.")
      return
    }
    mutation.mutate(action)
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pricing page</h2>
          <p className="mt-1 text-sm text-slate-500">
            Explain your fees and learning packages to prospective families.
          </p>
        </div>
        <Button variant="outline" onClick={() => setPreview(true)}>
          <Eye className="mr-2 size-4" />
          Preview page
        </Button>
      </div>
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <label className="block space-y-2 text-sm font-semibold">
          Page title
          <Input
            value={draft.title}
            maxLength={160}
            disabled={mutation.isPending}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </label>
        <SchoolContentEditor
          label="Pricing information"
          value={draft.content}
          onChange={(content) => setDraft({ ...draft, content })}
          disabled={mutation.isPending}
        />
        <label className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-blue-600"
            checked={draft.showPricing}
            disabled={mutation.isPending}
            onChange={(e) =>
              setDraft({ ...draft, showPricing: e.target.checked })
            }
          />
          <span>
            <span className="block text-sm font-semibold text-slate-900">
              Show pricing content on public profile
            </span>
            <span className="text-xs text-slate-600">
              Apply your visibility choice using the button below. Saving a
              draft keeps the live page unchanged. The public Pricing tab
              remains visible with an enquiry prompt when pricing content is
              hidden.
            </span>
          </span>
        </label>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-500">
            {dirty ? "Unsaved changes" : "Saved"}
            {saved.publishedAtUtc
              ? ` · Last published ${new Date(saved.publishedAtUtc).toLocaleDateString()}`
              : " · Not published yet"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => save("draft")}
            >
              Save draft
            </Button>
            <Button
              variant="primary"
              disabled={mutation.isPending}
              onClick={() => save("publish")}
            >
              {mutation.isPending && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              {draft.showPricing ? "Publish pricing" : "Save & hide pricing"}
            </Button>
          </div>
        </div>
      </div>
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogTitle>{draft.title || "Pricing & fees"}</DialogTitle>
          <DialogDescription>
            Preview of your current pricing content.
          </DialogDescription>
          <SchoolRichContent html={draft.content} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
