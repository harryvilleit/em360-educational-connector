import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useDeleteSchoolPaymentMethod } from "@/hooks/feeManagement"
import type { SchoolPaymentMethodI } from "@/api/feeManagement.api/types"

interface Props {
  target: SchoolPaymentMethodI | null
  onClose: () => void
}

export default function DeletePaymentMethodModal({ target, onClose }: Props) {
  const { deleteSchoolPaymentMethodAsync, isPending } =
    useDeleteSchoolPaymentMethod()

  return (
    <Dialog open={!!target} onOpenChange={onClose}>
      <DialogContent className="w-full rounded-2xl p-4 sm:max-w-sm sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-gray-900">
            Delete Payment Method
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{" "}
          <span className="font-medium text-gray-900">{target?.name}</span>?
          This cannot be undone.
        </p>
        <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-md sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="w-full rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 sm:w-auto"
            disabled={isPending}
            onClick={async () => {
              if (target) {
                await deleteSchoolPaymentMethodAsync(target.id)
              }
              onClose()
            }}
          >
            {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
