import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Trash2 } from "lucide-react"
import type { DepartmentItem } from "@/api/examAndRecords.api/types"
import { useDeleteDepartment } from "@/hooks/examAndRecords"

interface DeleteDepartmentModalProps {
  open: boolean
  onClose: () => void
  department: DepartmentItem | null
}

export default function DeleteDepartmentModal({
  open,
  onClose,
  department,
}: DeleteDepartmentModalProps) {
  const { deleteDepartmentAsync, isPending } = useDeleteDepartment({
    onSuccess: () => onClose(),
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Department</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <Trash2 className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              Are you sure you want to delete{" "}
              <span className="font-bold">{department?.Name}</span>?
            </p>
            <p className="text-xs text-muted-foreground">
              This will permanently remove the department from the system.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 cursor-pointer py-6"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 cursor-pointer bg-red-600 py-6 text-white hover:bg-red-700 disabled:opacity-60"
            onClick={() => department && deleteDepartmentAsync(department.Id)}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isPending ? "Deleting..." : "Delete Department"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
