import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PromoteConfirmModalProps {
  open: boolean
  studentCount: number
  fromClass: string
  fromMeta: string
  toClass: string
  toMeta: string
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function PromoteConfirmModal({
  open,
  studentCount,
  fromClass,
  fromMeta,
  toClass,
  toMeta,
  isPending,
  onCancel,
  onConfirm,
}: PromoteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isPending && onCancel()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Confirm promotion
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            You&apos;re about to move {studentCount} student
            {studentCount === 1 ? "" : "s"} to a new class.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-3 rounded-xl bg-gray-50 px-4 py-4 text-sm">
          <div className="text-center">
            <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">
              {fromMeta}
            </p>
            <p className="font-semibold text-gray-800">{fromClass}</p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-blue-600" />
          <div className="text-center">
            <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">
              {toMeta}
            </p>
            <p className="font-semibold text-gray-800">{toClass}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          This updates each student&apos;s active class immediately. It does
          not affect past results or records.
        </p>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              `Promote ${studentCount}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
