import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type { ClassResult } from "./types"

interface PublishResultsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentResult: ClassResult | undefined
  isLoading: boolean
  onPublish: () => void
}

export function PublishResultsDialog({
  open,
  onOpenChange,
  currentResult,
  isLoading,
  onPublish,
}: PublishResultsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Publish Results</DialogTitle>
          <DialogDescription>
            Make results visible to students and parents. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 rounded-lg border border-amber-100 bg-amber-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">Important</p>
              <p className="mt-1 text-sm text-amber-800">
                Once published, these results will be accessible to students and
                parents. Ensure all data is accurate before publishing.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">
            {currentResult?.className} - Term {currentResult?.term}{" "}
            {currentResult?.session}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {currentResult?.resultsCollected}/{currentResult?.totalStudents}{" "}
            students' results
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
                Publish Results
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
