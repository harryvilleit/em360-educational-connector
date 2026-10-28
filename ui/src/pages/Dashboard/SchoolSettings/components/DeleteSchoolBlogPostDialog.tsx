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

type DeleteSchoolBlogPostDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  postTitle?: string
  onConfirm: () => void
}

export default function DeleteSchoolBlogPostDialog({
  open,
  onOpenChange,
  postTitle,
  onConfirm,
}: DeleteSchoolBlogPostDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this blog post?</AlertDialogTitle>
          <AlertDialogDescription>
            {postTitle
              ? `"${postTitle}" will be permanently removed from your school blog. This can't be undone.`
              : "This post will be permanently removed from your school blog. This can't be undone."}
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
