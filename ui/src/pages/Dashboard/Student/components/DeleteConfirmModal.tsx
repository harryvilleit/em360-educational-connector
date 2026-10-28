import { Button } from "@/components/ui/button"

interface DeleteConfirmModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmModal({
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label="Delete student"
      tabIndex={-1}
      onKeyDown={(event) => event.key === "Escape" && onCancel()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <p className="font-semibold text-gray-900">Delete student?</p>
        <p className="mt-1 text-sm text-gray-500">
          This action cannot be undone. All data for this student will be
          permanently removed.
        </p>
        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-xl bg-red-600 text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
