import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { SubUserItem } from "@/api/userMgt.api/types"
import { useAdminResetUserPassword } from "@/hooks/userMgt"
import { AdminResetPasswordSection } from "@/components/general/AdminResetPasswordSection"

interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
  user: SubUserItem | null
  schoolId: string
}

export default function ChangePasswordModal({
  open,
  onClose,
  user,
  schoolId,
}: ChangePasswordModalProps) {
  const { adminResetUserPasswordAsync, isPending } = useAdminResetUserPassword()

  const initials = user
    ? `${user.FirstName[0]}${user.LastName[0]}`.toUpperCase()
    : ""
  const email = user?.Email || user?.email || ""

  async function handleReset(newPassword: string) {
    if (!user) return
    await adminResetUserPasswordAsync({
      userId: user.SubUserId,
      schoolId,
      newPassword,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl p-0 sm:max-w-md">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
            Change Password
          </DialogTitle>
          <DialogDescription>
            Set a new password for this user. It is emailed to them directly.
          </DialogDescription>

          {user && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user.FirstName} {user.LastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {email}
                </p>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="px-6 py-5">
          <AdminResetPasswordSection
            key={user?.SubUserId ?? "none"}
            variant="bare"
            onReset={handleReset}
            isPending={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
