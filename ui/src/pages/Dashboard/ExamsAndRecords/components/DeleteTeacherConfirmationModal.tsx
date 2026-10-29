import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"

interface DeleteTeacherConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacherName: string
  onConfirm: () => void
}

export default function DeleteTeacherConfirmationModal({
  open,
  onOpenChange,
  teacherName,
  onConfirm,
}: DeleteTeacherConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle>Delete Teacher</DialogTitle>
          </div>
          <DialogDescription className="mt-4">
            Are you sure you want to delete <strong>{teacherName}</strong>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1 cursor-pointer py-6"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="flex-1 cursor-pointer bg-red-600 py-6 text-white hover:bg-red-700"
            onClick={handleConfirm}
          >
            Delete Teacher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
