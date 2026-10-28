import { publicSiteUrl } from "@/lib/portal-navigation"
import { useState } from "react"
import {
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  LoaderCircle,
  Newspaper,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { useSchoolId } from "@/contexts/SchoolContext"
import { HomeRoutes } from "@/routes"
import { useAuthStore } from "@/store/auth.store"
import type { SchoolBlogPost, SchoolBlogPostInput } from "@/types/school-blog"
import {
  useCreateSchoolBlogPost,
  useDeleteSchoolBlogPost,
  useSchoolBlogPosts,
  useUpdateSchoolBlogPost,
} from "@/hooks/publicSchools"
import SettingsCard from "./SettingsCard"
import SchoolBlogFormModal from "./SchoolBlogFormModal"
import DeleteSchoolBlogPostDialog from "./DeleteSchoolBlogPostDialog"
import { formatSchoolBlogDate } from "@/lib/school-blog"

export default function BlogSettings() {
  const schoolId = useSchoolId()
  const user = useAuthStore((state) => state.user)
  const { data, isPending, error } = useSchoolBlogPosts(schoolId)
  const createPost = useCreateSchoolBlogPost(schoolId)
  const updatePost = useUpdateSchoolBlogPost(schoolId)
  const deletePost = useDeleteSchoolBlogPost(schoolId)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SchoolBlogPost | null>(null)
  const [deleting, setDeleting] = useState<SchoolBlogPost | null>(null)

  async function savePost(payload: SchoolBlogPostInput) {
    if (editing) {
      await updatePost.mutateAsync({ postId: editing.id, payload })
    } else {
      await createPost.mutateAsync(payload)
    }
  }

  const posts = data?.items ?? []
  const stats = [
    {
      label: "All articles",
      value: data?.totalItems ?? 0,
      icon: Newspaper,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Published",
      value: data?.publishedItems ?? 0,
      icon: ExternalLink,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Drafts",
      value: data?.draftItems ?? 0,
      icon: FileText,
      tone: "bg-amber-50 text-amber-700",
    },
  ]

  return (
    <SettingsCard
      title="School blog"
      description="Publish news, achievements and important updates on your public school page."
    >
      <div className="rounded-2xl bg-linear-to-r from-blue-700 to-blue-600 p-5 text-white sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-blue-100 uppercase">
            Your school newsroom
          </p>
          <h3 className="mt-2 text-xl font-bold">
            Keep families connected to school life
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-blue-100">
            Create a draft, add a properly sized cover image, and publish when
            the article is ready.
          </p>
        </div>
        <Button
          className="mt-4 shrink-0 bg-white text-blue-700 hover:bg-blue-50 sm:mt-0"
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          <Plus className="size-4" /> New article
        </Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4"
          >
            <span
              className={`grid size-10 place-items-center rounded-xl ${tone}`}
            >
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-gray-950">{value}</p>
              <p className="text-xs font-medium text-muted-foreground">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {isPending ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <LoaderCircle className="mr-2 size-5 animate-spin" /> Loading
          articles…
        </div>
      ) : error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error.message}
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-blue-700 shadow-sm">
            <Newspaper className="size-6" />
          </span>
          <h3 className="mt-4 font-bold text-gray-900">No articles yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Start with a welcome message, event update, or student achievement.
          </p>
          <Button
            className="mt-5"
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
          >
            <Plus className="size-4" /> Create first article
          </Button>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-sm"
            >
              <div className="grid min-h-44 grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr]">
                {post.coverImageUrl ? (
                  <img
                    src={post.coverImageUrl}
                    alt=""
                    className="h-full min-h-44 w-full object-cover"
                  />
                ) : (
                  <div className="grid min-h-44 place-items-center bg-gray-100 text-gray-400">
                    <Newspaper className="size-8" />
                  </div>
                )}
                <div className="flex min-w-0 flex-col p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-blue-700 uppercase">
                      {post.category}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${post.status === "Published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 font-bold text-gray-950">
                    {post.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3.5" />{" "}
                      {formatSchoolBlogDate(
                        post.publishedAtUtc || post.dateModified
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" /> {post.readTimeMinutes} min
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2">
                <span className="truncate text-xs text-muted-foreground">
                  By {post.authorName}
                </span>
                <div className="flex items-center gap-1">
                  {post.status === "Published" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      asChild
                    >
                      <Link
                        to={publicSiteUrl(HomeRoutes.toSchoolBlogPost(schoolId, post.slug))}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View ${post.title}`}
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => {
                      setEditing(post)
                      setModalOpen(true)
                    }}
                    aria-label={`Edit ${post.title}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-red-600 hover:text-red-700"
                    onClick={() => setDeleting(post)}
                    aria-label={`Delete ${post.title}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {data && data.publishedItems > 0 && (
        <div className="mt-5 flex justify-end">
          <Button variant="outline" asChild>
            <Link
              to={publicSiteUrl(HomeRoutes.toSchoolDetail(schoolId))}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="size-4" /> View public school page
            </Link>
          </Button>
        </div>
      )}

      <SchoolBlogFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        initial={editing}
        defaultAuthor={user?.name ?? "School Admin"}
        onSubmit={savePost}
        submitting={createPost.isPending || updatePost.isPending}
      />

      <DeleteSchoolBlogPostDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        postTitle={deleting?.title}
        onConfirm={() => {
          if (!deleting) return
          deletePost.mutate(deleting.id)
          setDeleting(null)
        }}
      />
    </SettingsCard>
  )
}
