import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { SchoolGradeItem } from "@/api/examAndRecords.api/types"

interface EditForm {
  grade: string
  minScore: number
  maxScore: number
  description: string
}

interface EditGradeModalProps {
  editingGrade: SchoolGradeItem | null
  editForm: EditForm
  onEditFormChange: (form: EditForm) => void
  onSave: () => void
  onClose: () => void
  isPending: boolean
  description?: string
}

export function EditGradeModal({
  editingGrade,
  editForm,
  onEditFormChange,
  onSave,
  onClose,
  isPending,
  description = "Update the grade letter, description, and score range.",
}: EditGradeModalProps) {
  return (
    <Dialog open={!!editingGrade} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Grade</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-grade-letter">Grade</Label>
              <Input
                id="edit-grade-letter"
                placeholder="e.g., A"
                value={editForm.grade}
                onChange={(e) =>
                  onEditFormChange({
                    ...editForm,
                    grade: e.target.value.toUpperCase(),
                  })
                }
                className="border-chart-2 py-6"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-grade-description">Description</Label>
              <Input
                id="edit-grade-description"
                placeholder="e.g., Excellent"
                value={editForm.description}
                onChange={(e) =>
                  onEditFormChange({ ...editForm, description: e.target.value })
                }
                className="border-chart-2 py-6"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-min-score">Min Score</Label>
              <Input
                id="edit-min-score"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={editForm.minScore || ""}
                onChange={(e) =>
                  onEditFormChange({
                    ...editForm,
                    minScore:
                      e.target.value === "" ? 0 : parseInt(e.target.value) || 0,
                  })
                }
                className="border-chart-2 py-6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-max-score">Max Score</Label>
              <Input
                id="edit-max-score"
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={editForm.maxScore || ""}
                onChange={(e) =>
                  onEditFormChange({
                    ...editForm,
                    maxScore:
                      e.target.value === "" ? 0 : parseInt(e.target.value) || 0,
                  })
                }
                className="border-chart-2 py-6"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isPending}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
