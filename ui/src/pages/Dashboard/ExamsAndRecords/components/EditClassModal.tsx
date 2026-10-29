import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useGetAllCategories, useUpdateClass } from "@/hooks/examAndRecords"
import type { ClassItem } from "@/api/examAndRecords.api/types"
import { CLASS_TYPE, normalizeClassType } from "@/utils/classType.utils"

interface EditClassModalProps {
  open: boolean
  onClose: () => void
  cls: ClassItem | null
  schoolId: string
}

export default function EditClassModal({
  open,
  onClose,
  cls,
  schoolId,
}: EditClassModalProps) {
  const { categories, isLoading: loadingCategories } = useGetAllCategories({ schoolId })
  const { updateClassAsync, isPending } = useUpdateClass({ onSuccess: onClose })

  const [clsName, setClsName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [classType, setClassType] = useState<number | "">("")

  // Pre-populate whenever the target class changes
  useEffect(() => {
    if (cls) {
      setClsName(cls.ClsName)
      setCategoryId(cls.CategoryId)
      setClassType(normalizeClassType(cls.ClassType) ?? "")
    }
  }, [cls])

  async function handleSave() {
    if (!cls) return
    if (!clsName.trim()) { toast.error("Class name is required"); return }
    if (!categoryId) { toast.error("Category is required"); return }
    if (!classType) { toast.error("Class type is required"); return }
    await updateClassAsync({
      id: cls.Id,
      clsName: clsName.trim(),
      categoryId,
      schoolId,
      classType,
    })
  }

  function handleClose() {
    setClsName("")
    setCategoryId("")
    setClassType("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>Update the class name or category.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-cls-name">Class Name</Label>
            <Input
              id="edit-cls-name"
              value={clsName}
              onChange={(e) => setClsName(e.target.value)}
              placeholder="e.g. JSS 1"
              className="border-chart-2 py-6"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-cls-category">Category</Label>
            {loadingCategories ? (
              <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400">
                <Loader2 className="size-3.5 animate-spin" />
                Loading categories…
              </div>
            ) : (
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="border-chart-2 py-6">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.Id} value={cat.Id}>
                      {cat.CatName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-cls-type">Class Type</Label>
            <Select
              value={classType ? String(classType) : undefined}
              onValueChange={(v) => setClassType(Number(v))}
            >
              <SelectTrigger id="edit-cls-type" className="border-chart-2 py-6">
                <SelectValue placeholder="Select class type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(CLASS_TYPE.Primary)}>
                  Primary — Core Academic Grade
                </SelectItem>
                <SelectItem value={String(CLASS_TYPE.Secondary)}>
                  Secondary — Auxiliary / Club / Support Group
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || loadingCategories}
            className="bg-chart-2 text-white"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
