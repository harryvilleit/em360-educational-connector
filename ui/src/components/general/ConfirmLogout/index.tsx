import { LogOut } from "lucide-react"
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

interface ConfirmLogoutI {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClick: () => void
}
export default function ConfirmLogout({
  open,
  onOpenChange,
  onClick,
}: ConfirmLogoutI) {
  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="rounded-2xl border-none" size="sm">
          <AlertDialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <LogOut className="size-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Are you sure you want to log out? you will need to sign in again
              to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 sm:justify-center">
            <AlertDialogCancel className="rounded-full px-6">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onClick}
              className="rounded-full bg-red-600 px-6 hover:bg-red-700"
            >
              Yes, Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
