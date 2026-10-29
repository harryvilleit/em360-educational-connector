import { useState } from "react"
import { Link, useParams } from "react-router"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useCreateHostels, useUpdateHostel } from "@/hooks/hostel"
import { useGetAllHostelCategories } from "@/hooks/hostelCategory"
import { DashboardRoutes } from "@/routes"
import type { HostelItemI } from "@/api/hostel.api/types"
import { NameChipInput } from "./NameChipInput"

// ── Props ─────────────────────────────────────────────────────────────────────

interface HostelModalProps {
  open: boolean
  onClose: () => void
  hostel?: HostelItemI | null
}

// ── Component ─────────────────────────────────────────────────────────────────
// The form is only mounted while the dialog is open, keyed by which hostel
// (if any) is being edited — so it always starts from fresh, correct field
// values without needing an effect to resync state on every open/target change.

export function HostelModal({ open, onClose, hostel }: HostelModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {hostel ? "Edit Hostel Type" : "Create Hostel Type"}
          </DialogTitle>
        </DialogHeader>

        {open && (
          <HostelModalForm
            key={hostel?.id ?? "create"}
            hostel={hostel ?? null}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function HostelModalForm({
  hostel,
  onClose,
}: {
  hostel: HostelItemI | null
  onClose: () => void
}) {
  const schoolId = useSchoolId()
  const { productId } = useParams<{ productId: string }>()
  const isEdit = !!hostel

  const { categories } = useGetAllHostelCategories(schoolId)
  // A hostel edited here may carry a category that's since been deleted —
  // keep it selectable so editing doesn't silently blank out or block
  // saving an existing hostel.
  const categoryOptions =
    hostel && !categories.some((c) => c.id === hostel.categoryId)
      ? [{ id: hostel.categoryId, name: hostel.categoryName }, ...categories]
      : categories

  const { createHostelsAsync, isPending: isCreating } = useCreateHostels({
    onSuccess: onClose,
  })
  const { updateHostelAsync, isPending: isUpdating } = useUpdateHostel({
    onSuccess: onClose,
  })
  const isPending = isCreating || isUpdating

  const [hostelCategoryId, setHostelCategoryId] = useState(
    hostel ? hostel.categoryId : ""
  )
  const [hostelTypeError, setHostelTypeError] = useState("")
  const [name, setName] = useState(hostel ? hostel.name : "")
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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!hostelCategoryId) {
      setHostelTypeError("Hostel category is required")
      return
    }

    if (isEdit && hostel) {
      const trimmedName = name.trim()
      if (!trimmedName) {
        setNameError("Hostel name is required")
        return
      }
      await updateHostelAsync({
        id: hostel.id,
        name: trimmedName,
        hostelCategoryId,
        status: hostel.status,
      })
      return
    }

    if (names.length === 0) {
      setNamesError("Add at least one hostel name")
      return
    }
    await createHostelsAsync({ names, hostelCategoryId, schoolId: schoolId ?? "" })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Hostel category */}
      <div className="space-y-1.5">
        <Label htmlFor="hostel-category">
          Hostel Category <span className="text-red-500">*</span>
        </Label>
        {categoryOptions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-xs text-muted-foreground">
            No hostel categories yet. Go to{" "}
            <Link
              to={DashboardRoutes.toHostelCategories(productId ?? "")}
              className="font-medium text-blue-600 hover:underline"
            >
              Hostel Categories
            </Link>{" "}
            to create ones like Boys Hostel, Girls Hostel, etc.
          </p>
        ) : (
          <Select
            value={hostelCategoryId}
            onValueChange={(v) => {
              setHostelCategoryId(v)
              setHostelTypeError("")
            }}
          >
            <SelectTrigger
              id="hostel-category"
              className={`w-full rounded-md border-gray-200 ${hostelTypeError ? "border-red-400" : ""}`}
            >
              <SelectValue placeholder="Select a hostel category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {hostelTypeError && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3" />
            {hostelTypeError}
          </p>
        )}
      </div>

      {/* Hostel name(s) */}
      {isEdit ? (
        <div className="space-y-1.5">
          <Label htmlFor="hostel-name">
            Hostel Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="hostel-name"
            placeholder="e.g. Boys Hostel Block A"
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
            Hostel Name(s) <span className="text-red-500">*</span>
          </Label>
          <NameChipInput
            names={names}
            onAdd={addName}
            onRemove={removeName}
            placeholder="e.g. Boys Hostel Block A — press Enter to add"
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
        <Button type="submit" disabled={isPending} className="w-1/2" variant="primary">
          {isEdit
            ? "Save Changes"
            : names.length > 1
              ? `Create ${names.length} Hostels`
              : "Create Hostel"}
        </Button>
      </div>
    </form>
  )
}
