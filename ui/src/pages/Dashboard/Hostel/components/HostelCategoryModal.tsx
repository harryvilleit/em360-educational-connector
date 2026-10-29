import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useCreateHostelCategories,
  useUpdateHostelCategory,
} from "@/hooks/hostelCategory"
import type { HostelCategoryItemI } from "@/api/hostel.api/types"
import { NameChipInput } from "./NameChipInput"

interface HostelCategoryModalProps {
  open: boolean
  onClose: () => void
  category?: HostelCategoryItemI | null
}

// The form is only mounted while the dialog is open, keyed by which
// category (if any) is being edited — so it always starts fresh without
// needing an effect to resync state on every open/target change.
export function HostelCategoryModal({
  open,
  onClose,
  category,
}: HostelCategoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Hostel Category" : "Create Hostel Category"}
          </DialogTitle>
        </DialogHeader>

        {open && (
          <HostelCategoryModalForm
            key={category?.id ?? "create"}
            category={category ?? null}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function HostelCategoryModalForm({
  category,
  onClose,
}: {
  category: HostelCategoryItemI | null
  onClose: () => void
}) {
  const schoolId = useSchoolId()
  const isEdit = !!category

  const { createCategories } = useCreateHostelCategories({ onSuccess: onClose })
  const { updateCategory } = useUpdateHostelCategory({ onSuccess: onClose })

  const [name, setName] = useState(category ? category.name : "")
  const [nameError, setNameError] = useState("")
  const [names, setNames] = useState<string[]>([])
  const [namesError, setNamesError] = useState("")

  const addName = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (names.some((n) => n.toLowerCase() === trimmed.toLowerCase())) return
    setNames((prev) => [...prev, trimmed])
    setNamesError("")
  }
  const removeName = (index: number) => {
    setNames((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isEdit && category) {
      const trimmedName = name.trim()
      if (!trimmedName) {
        setNameError("Hostel category name is required")
        return
      }
      updateCategory({ id: category.id, name: trimmedName })
      return
    }

    if (names.length === 0) {
      setNamesError("Add at least one category name")
      return
    }
    createCategories({ schoolId: schoolId ?? "", names })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {isEdit ? (
        <div className="space-y-1.5">
          <Label htmlFor="hostel-category-name">
            Category Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="hostel-category-name"
            placeholder="e.g. Boys Hostel, Staff Hostel"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setNameError("")
            }}
            className={nameError ? "border-red-400" : ""}
          />
          {nameError && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              {nameError}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label>
            Category Name(s) <span className="text-red-500">*</span>
          </Label>
          <NameChipInput
            names={names}
            onAdd={addName}
            onRemove={removeName}
            placeholder="e.g. Boys Hostel — press Enter to add"
          />
          {namesError && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              {namesError}
            </p>
          )}
        </div>
      )}

      <div className="flex w-full gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onClose} className="w-1/2">
          Cancel
        </Button>
        <Button type="submit" className="w-1/2" variant="primary">
          {isEdit
            ? "Save Changes"
            : names.length > 1
              ? `Create ${names.length} Categories`
              : "Create Category"}
        </Button>
      </div>
    </form>
  )
}
