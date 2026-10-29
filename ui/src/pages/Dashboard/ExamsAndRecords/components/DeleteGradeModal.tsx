import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeleteGradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gradeName: string
  onDelete: () => void
  isPending: boolean
}

export function DeleteGradeModal({
  open,
  onOpenChange,
  gradeName,
  onDelete,
  isPending,
}: DeleteGradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Grade</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete grade{" "}
            <span className="font-semibold text-gray-900">"{gradeName}"</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Delete Grade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
