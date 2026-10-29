import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface PublishStudentResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentName: string | undefined
  isLoading: boolean
  onPublish: () => void
}

export function PublishStudentResultDialog({
  open,
  onOpenChange,
  studentName,
  isLoading,
  onPublish,
}: PublishStudentResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Publish Student Result?</DialogTitle>
          <DialogDescription>
            You are about to publish the result for{" "}
            <span className="font-medium text-gray-900">{studentName}</span>.
            Once published, this result will become available according to
            the existing result publication rules.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onPublish}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Publish Result
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
