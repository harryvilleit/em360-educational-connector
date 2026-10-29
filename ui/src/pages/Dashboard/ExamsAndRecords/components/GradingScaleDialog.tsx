import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus } from "lucide-react"

interface GradingFormData {
  grade: string
  minScore: number
  maxScore: number
  description: string
}

interface GradingScaleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  gradingForm: GradingFormData
  onGradingFormChange: (form: GradingFormData) => void
  onAddGradingScale: () => void
  isPending?: boolean
}

export function GradingScaleDialog({
  isOpen,
  onOpenChange,
  gradingForm,
  onGradingFormChange,
  onAddGradingScale,
  isPending = false,
}: GradingScaleDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="primary">
          <Plus className="size-4" />
          Add Grade
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Grading Scale</DialogTitle>
          <DialogDescription>
            Define a new grade with its corresponding score range
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade-letter">Grade</Label>
              <Input
                id="grade-letter"
                placeholder="e.g., A"
                value={gradingForm.grade}
                onChange={(e) =>
                  onGradingFormChange({
                    ...gradingForm,
                    grade: e.target.value.toUpperCase(),
                  })
                }
                className="border-chart-2 py-6"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade-description">Description</Label>
              <Input
                id="grade-description"
                placeholder="e.g., Excellent"
                value={gradingForm.description}
                onChange={(e) =>
                  onGradingFormChange({
                    ...gradingForm,
                    description: e.target.value,
                  })
                }
                className="border-chart-2 py-6"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-score">Min Score</Label>
              <Input
                id="min-score"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={gradingForm.minScore || ""}
                onChange={(e) =>
                  onGradingFormChange({
                    ...gradingForm,
                    minScore: e.target.value === "" ? 0 : parseInt(e.target.value) || 0,
                  })
                }
                className="border-chart-2 py-6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-score">Max Score</Label>
              <Input
                id="max-score"
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={gradingForm.maxScore || ""}
                onChange={(e) =>
                  onGradingFormChange({
                    ...gradingForm,
                    maxScore: e.target.value === "" ? 0 : parseInt(e.target.value) || 0,
                  })
                }
                className="border-chart-2 py-6"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={onAddGradingScale}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Add Grade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
