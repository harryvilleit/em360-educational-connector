import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useElectionCategories,
  useCreateElectionCategory,
  useUpdateElectionCategory,
  useChangeCategoryStatus,
} from "@/hooks/voting"
import type { ElectionCategoryDto } from "@/api/voting.api/types"

const isInactive = (c: ElectionCategoryDto) =>
  c.status ? c.status === "Inactive" : !c.isActive

export default function ElectionCategoriesPage() {
  const schoolId = useSchoolId()
  const [activeOnly, setActiveOnly] = useState(false)
  const { categories, isLoading, isError, error: loadError, refetch } =
    useElectionCategories(schoolId, activeOnly ? "Active" : undefined)
  const { mutate: createCategory, isPending: creating } =
    useCreateElectionCategory()
  const { mutate: updateCategory, isPending: updating } =
    useUpdateElectionCategory()

  const { mutate: changeStatus, isPending: changingStatus } =
    useChangeCategoryStatus()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  return (
    <div className="space-y-6 py-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          Election Categories
        </h1>
        <p className="text-sm text-muted-foreground">
          Create categories to use when setting up elections.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Fields marked{" "}
          <span className="text-red-600" aria-hidden="true">
            *
          </span>{" "}
          are required.
        </p>
      </header>
      <form
        className="space-y-4 rounded-xl border bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim()) {
            setError("Enter a category name.")
            return
          }
          createCategory(
            { schoolId, name: name.trim(), description: description.trim() || undefined },
            {
              onSuccess: () => {
                setName("")
                setDescription("")
                setError("")
              },
            }
          )
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="category-name">
            Category name{" "}
            <span className="text-red-600" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="category-name"
            aria-required="true"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setError("")
            }}
            placeholder="e.g. Sports Captain"
            aria-invalid={!!error}
            aria-describedby={error ? "category-error" : undefined}
          />
          {error && (
            <p id="category-error" role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-description">
            Description <span className="text-gray-400">(optional)</span>
          </Label>
          <Textarea
            id="category-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What this category of elections is for"
            rows={2}
          />
        </div>
        <Button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create Category"}
        </Button>
      </form>
      <section
        aria-labelledby="categories-heading"
        className="rounded-xl border bg-white p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="categories-heading" className="text-lg font-semibold">
            Available categories
          </h2>
          <div
            role="group"
            aria-label="Filter categories"
            className="flex gap-1 rounded-lg border p-1"
          >
            {[
              { label: "All", value: false },
              { label: "Active only", value: true },
            ].map((option) => (
              <Button
                key={option.label}
                type="button"
                size="sm"
                variant={activeOnly === option.value ? "default" : "ghost"}
                aria-pressed={activeOnly === option.value}
                onClick={() => setActiveOnly(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        {isLoading ? (
          <div role="status" aria-label="Loading categories" className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-gray-100" />
            ))}
          </div>
        ) : isError ? (
          <div role="alert">
            <p className="text-sm text-red-600">
              {loadError?.message || "Categories could not be loaded."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {activeOnly
              ? "No active categories found."
              : "No categories yet. Create your first category above."}
          </p>
        ) : (
          <ul className="divide-y">
            {categories.map((category) => (
              <li key={category.id} className="py-3 break-words">
                {editingId === category.id ? (
                  <form
                    className="space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault()
                      if (!editName.trim()) return
                      updateCategory(
                        {
                          id: category.id,
                          schoolId,
                          name: editName.trim(),
                          description: editDescription.trim() || undefined,
                          isActive: category.isActive,
                        },
                        { onSuccess: () => setEditingId(null) }
                      )
                    }}
                  >
                    <Label htmlFor="edit-category-name">
                      Category name{" "}
                      <span className="text-red-600" aria-hidden="true">
                        *
                      </span>
                    </Label>
                    <Input
                      id="edit-category-name"
                      aria-required="true"
                      autoFocus
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                    />
                    <Label htmlFor="edit-category-description">
                      Description <span className="text-gray-400">(optional)</span>
                    </Label>
                    <Textarea
                      id="edit-category-description"
                      value={editDescription}
                      onChange={(event) => setEditDescription(event.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={updating}>
                        {updating ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        {isInactive(category) ? (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                            Inactive
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                            Active
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={changingStatus}
                        onClick={() =>
                          changeStatus({
                            id: category.id,
                            schoolId,
                            status: isInactive(category) ? "Active" : "Inactive",
                          })
                        }
                      >
                        {isInactive(category) ? "Activate" : "Deactivate"}
                      </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                                            aria-label={`Edit ${category.name}`}
                      onClick={() => {
                        setEditingId(category.id)
                        setEditName(category.name)
                        setEditDescription(category.description ?? "")
                      }}
                    >
                      Edit
                    </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
