import { useEffect, useMemo, useState } from "react"
import {
  ImagePlus,
  LoaderCircle,
  Newspaper,
  UploadCloud,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RichHtmlEditor } from "@/components/ui/rich-html-editor"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SCHOOL_BLOG_CATEGORIES,
  type SchoolBlogPost,
  type SchoolBlogPostInput,
} from "@/types/school-blog"

type SchoolBlogFormModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (data: SchoolBlogPostInput) => Promise<void>
  initial?: SchoolBlogPost | null
  defaultAuthor?: string
  submitting?: boolean
}

type Draft = Omit<SchoolBlogPostInput, "coverImage"> & {
  coverImage: File | null
}

const emptyForm: Draft = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: null,
  category: "News",
  authorName: "",
  status: "Draft",
}

export default function SchoolBlogFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  defaultAuthor = "",
  submitting = false,
}: SchoolBlogFormModalProps) {
  const [form, setForm] = useState<Draft>(emptyForm)

  useEffect(() => {
    if (!open) return
    setForm(
      initial
        ? {
            title: initial.title,
            excerpt: initial.excerpt,
            content: initial.content,
            coverImage: null,
            category: initial.category,
            authorName: initial.authorName,
            status: initial.status,
          }
        : { ...emptyForm, authorName: defaultAuthor }
    )
  }, [open, initial, defaultAuthor])

  const localPreview = useMemo(
    () => (form.coverImage ? URL.createObjectURL(form.coverImage) : null),
    [form.coverImage]
  )
  useEffect(
    () => () => {
      if (localPreview) URL.revokeObjectURL(localPreview)
    },
    [localPreview]
  )

  const coverPreview = localPreview || initial?.coverImageUrl || null
  const hasArticleContent = Boolean(
    form.content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;|&#160;/gi, " ")
      .trim()
  )
  const canSubmit = Boolean(
    form.title.trim() &&
    form.excerpt.trim() &&
    hasArticleContent &&
    form.authorName.trim() &&
    (form.status === "Draft" || coverPreview)
  )

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    await onSubmit({ ...form, coverImage: form.coverImage })
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => !value && !submitting && onClose()}
    >
      <DialogContent className="max-h-[94vh] overflow-y-auto p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-gray-100 px-6 py-5 text-left">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <Newspaper className="size-5" />
            </span>
            <div>
              <DialogTitle>
                {initial ? "Edit article" : "Create an article"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Draft privately or publish this update on your school page.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-7 px-6 py-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between gap-4">
                  <Label htmlFor="blog-title">Article title *</Label>
                  <span className="text-xs text-muted-foreground">
                    {form.title.length}/240
                  </span>
                </div>
                <Input
                  id="blog-title"
                  required
                  maxLength={240}
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="A clear, useful headline for families"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between gap-4">
                  <Label htmlFor="blog-excerpt">Short summary *</Label>
                  <span className="text-xs text-muted-foreground">
                    {form.excerpt.length}/600
                  </span>
                </div>
                <Textarea
                  id="blog-excerpt"
                  required
                  rows={3}
                  maxLength={600}
                  value={form.excerpt}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      excerpt: event.target.value,
                    }))
                  }
                  placeholder="What should a visitor know before opening the article?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blog-content">Article content *</Label>
                <RichHtmlEditor
                  value={form.content}
                  onChange={(content) =>
                    setForm((current) => ({ ...current, content }))
                  }
                  minHeight={390}
                  placeholder="Write the complete school update here…"
                />
                <p className="text-xs text-muted-foreground">
                  Format visually or switch to HTML to edit the source directly.
                </p>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-gray-200 p-4">
                <Label>
                  Cover image {form.status === "Published" ? "*" : ""}
                </Label>
                <div className="mt-3 overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
                  {coverPreview ? (
                    <div className="relative">
                      <img
                        src={coverPreview}
                        alt="Article cover preview"
                        className="aspect-[6/5] w-full object-cover"
                      />
                      {form.coverImage && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              coverImage: null,
                            }))
                          }
                          className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-gray-950/75 text-white"
                          aria-label="Remove selected image"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid aspect-[6/5] place-items-center p-6 text-center">
                      <div>
                        <ImagePlus className="mx-auto size-8 text-gray-400" />
                        <p className="mt-2 text-sm font-semibold text-gray-700">
                          Add an article cover
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
                  <UploadCloud className="size-4" />{" "}
                  {coverPreview ? "Replace image" : "Choose image"}
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        coverImage: event.target.files?.[0] ?? null,
                      }))
                    }
                  />
                </label>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Recommended 1800 × 1500 px. Larger images are reduced
                  automatically without stretching; smaller images are not
                  enlarged.
                </p>
              </div>

              <div className="space-y-4 rounded-2xl border border-gray-200 p-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        category: value as Draft["category"],
                      }))
                    }
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHOOL_BLOG_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        status: value as Draft["status"],
                      }))
                    }
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">
                        Draft — only admins can see it
                      </SelectItem>
                      <SelectItem value="Published">
                        Published — visible to everyone
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-author">Author name *</Label>
                  <Input
                    id="blog-author"
                    required
                    maxLength={160}
                    value={form.authorName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        authorName: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </aside>
          </div>

          <DialogFooter className="border-t border-gray-100 bg-gray-50 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || submitting}>
              {submitting && <LoaderCircle className="size-4 animate-spin" />}
              {form.status === "Published" ? "Publish article" : "Save draft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
