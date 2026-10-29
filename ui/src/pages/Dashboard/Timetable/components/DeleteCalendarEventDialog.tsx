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

interface DeleteCalendarEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventTitle?: string
  onConfirm: () => void
}

export function DeleteCalendarEventDialog({
  open,
  onOpenChange,
  eventTitle,
  onConfirm,
}: DeleteCalendarEventDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this event?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove "{eventTitle}" from the school
            calendar. This can't be undone.
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
