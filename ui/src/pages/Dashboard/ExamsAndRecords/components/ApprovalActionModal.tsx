import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle, XCircle } from "lucide-react"

export interface ApprovalActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: "approve" | "reject"
  gradeName: string
  className: string
  subjectName: string
  studentCount: number
  isLoading: boolean
  onConfirm: (reason?: string) => void
}

export default function ApprovalActionModal({
  open,
  onOpenChange,
  action,
  gradeName,
  className,
  subjectName,
  studentCount,
  isLoading,
  onConfirm,
}: ApprovalActionModalProps) {
  const [rejectionReason, setRejectionReason] = useState("")

  const handleConfirm = () => {
    if (action === "reject" && !rejectionReason.trim()) {
      return
    }
    onConfirm(rejectionReason)
    setRejectionReason("")
  }

  const isApprove = action === "approve"
  const isReasonEmpty = action === "reject" && !rejectionReason.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApprove ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approve Grades
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                Reject Grades
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? "Are you sure you want to approve these grades? They will move to the publish stage."
              : "Are you sure you want to reject these grades? The teacher will be notified with your feedback."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2 rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-700">
              <span className="font-medium">Grade Entry:</span>{" "}
              <span className="font-semibold">{gradeName}</span>
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-medium">Class:</span>{" "}
              <span className="font-semibold">{className}</span>
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-medium">Subject:</span>{" "}
              <span className="font-semibold">{subjectName}</span>
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-medium">Students:</span>{" "}
              <span className="font-semibold">{studentCount}</span>
            </p>
          </div>

          {action === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="text-sm font-medium">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Provide detailed feedback for why these grades are being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-24 resize-none"
              />
            </div>
          )}

          {isApprove && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm text-green-900">
                ✓ Once approved, these grades will be ready for publishing and
                will be visible to students.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setRejectionReason("")
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || (action === "reject" && isReasonEmpty)}
            className={`gap-2 ${
              isApprove
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            {isLoading ? (
              <Spinner className="h-4 w-4" />
            ) : isApprove ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {isApprove ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
