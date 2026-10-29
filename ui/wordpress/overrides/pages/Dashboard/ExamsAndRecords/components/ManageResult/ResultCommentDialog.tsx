// WordPress version: remarks are saved to the school record, so the dialog shows saving state.
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ResultCommentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commentText: string
  onCommentChange: (text: string) => void
  onSubmit: () => void
  isPending?: boolean
}

export function ResultCommentDialog({
  open,
  onOpenChange,
  commentText,
  onCommentChange,
  onSubmit,
  isPending = false,
}: ResultCommentDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
        if (!isOpen) onCommentChange("")
      }}
    >
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Add Remark or Comment</DialogTitle>
          <DialogDescription>
            Add a remark or comment for this student's result
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="remark">Remark/Comment</Label>
            <Textarea
              id="remark"
              placeholder="Enter your remark or comment here..."
              value={commentText}
              onChange={(e) => onCommentChange(e.target.value)}
              rows={5}
              maxLength={2000}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Be constructive and encouraging
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              onCommentChange("")
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={isPending || !commentText.trim()}
            onClick={onSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="mr-2 h-4 w-4" />
            {isPending ? "Saving…" : "Add Comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
