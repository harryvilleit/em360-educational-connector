import { KeyRound } from "lucide-react"
import ActiveSessionsList from "@/components/account/ActiveSessionsList"
import { Button } from "@/components/ui/button"
import { useForgotPassword } from "@/hooks/auth"
import { useAuthStore } from "@/store/auth.store"
import SettingsCard from "./SettingsCard"

export default function SecuritySettings() {
  const email = useAuthStore((state) => state.user?.email)
  const { forgotPassword, isLoading } = useForgotPassword()

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Change Password"
        description="Password changes are completed through a verified email link."
      >
        <div className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <KeyRound className="mt-0.5 size-5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Send a secure reset link
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {email
                  ? `The link will be sent to ${email}.`
                  : "Your account email is unavailable. Refresh and try again."}
              </p>
            </div>
          </div>
          <Button
            type="button"
            disabled={!email || isLoading}
            onClick={() => email && forgotPassword({ email })}
            className="shrink-0 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            {isLoading ? "Sending…" : "Send Reset Link"}
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Active Sessions"
        description="Review devices signed into your account and sign out any session you do not recognise."
      >
        <ActiveSessionsList />
      </SettingsCard>
    </div>
  )
}
