import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeletePeriodTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  periodTypeName?: string
  onConfirm: () => void
}

export function DeletePeriodTypeDialog({
  open,
  onOpenChange,
  periodTypeName,
  onConfirm,
}: DeletePeriodTypeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this period type?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove "{periodTypeName}" from the period
            types available when building a timetable. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
