import { useState } from "react"
import { KeyRound, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { GeneratedPasswordField } from "@/components/ui/generated-credential-field"
import { generateRandomPassword } from "@/utils/credentialGenerator"
import { SectionCard } from "@/components/general/ProfileSections"

interface AdminResetPasswordSectionProps {
  onReset: (password: string) => void | Promise<unknown>
  isPending: boolean
  variant?: "card" | "bare"
}

export function AdminResetPasswordSection({
  onReset,
  isPending,
  variant = "card",
}: AdminResetPasswordSectionProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function handleGenerate() {
    setPassword(generateRandomPassword())
  }

  async function handleReset() {
    if (!password) return
    setError("")
    try {
      await onReset(password)
      setPassword("")
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Password reset failed. Please retry.",
      )
    }
  }

  const content = (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <Field>
        <FieldLabel htmlFor="admin-reset-password">New Password</FieldLabel>
        <GeneratedPasswordField
          id="admin-reset-password"
          value={password}
          onChange={setPassword}
          onGenerate={handleGenerate}
          disabled={isPending}
        />
      </Field>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          onClick={handleReset}
          disabled={isPending || !password}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </div>
    </div>
  )

  if (variant === "bare") return content

  return (
    <SectionCard title="Reset Password" icon={KeyRound}>
      {content}
    </SectionCard>
  )
}
