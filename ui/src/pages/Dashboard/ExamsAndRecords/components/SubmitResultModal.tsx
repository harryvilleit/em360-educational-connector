import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Send } from "lucide-react"

export interface SubmitResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedSubjectName: string
  selectedClassName: string
  studentCount: number
  isLoading: boolean
  onConfirmSubmit: () => void
}

export default function SubmitResultModal({
  open,
  onOpenChange,
  selectedSubjectName,
  selectedClassName,
  studentCount,
  isLoading,
  onConfirmSubmit,
}: SubmitResultModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Grades for Approval</DialogTitle>
          <DialogDescription>
            Are you sure you want to submit these grades? Once submitted, they
            will be sent to administrators for review and approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-sm font-medium text-blue-900">
              Subject: <span className="font-bold">{selectedSubjectName}</span>
            </p>
            <p className="text-sm font-medium text-blue-900">
              Class: <span className="font-bold">{selectedClassName}</span>
            </p>
            <p className="text-sm font-medium text-blue-900">
              Students: <span className="font-bold">{studentCount}</span>
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-900">
              ⚠️ Please ensure all scores are correctly entered before
              submission.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirmSubmit}
            disabled={isLoading}
            className="gap-2 bg-chart-2 text-white"
          >
            {isLoading ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Confirm Submission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
