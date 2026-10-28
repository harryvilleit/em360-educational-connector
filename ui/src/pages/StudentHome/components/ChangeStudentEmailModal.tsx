import { useEffect, useRef, useState, type FormEvent } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { toast } from "sonner"
import { z } from "zod"
import {
  requestStudentEmailChange,
  verifyStudentEmailChange,
} from "@/api/studentPortal.api/emailChange"
import { queryKeys } from "@/utils/queryKeys"
import { useAuthStore } from "@/store/auth.store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`

interface Props {
  studentId: string
  schoolId: string
  currentEmail: string
}

export function ChangeStudentEmailModal({
  studentId,
  schoolId,
  currentEmail,
}: Props) {
  const queryClient = useQueryClient()
  const updateUserEmail = useAuthStore((state) => state.updateUserEmail)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [destination, setDestination] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [expiresAt, setExpiresAt] = useState(0)
  const [resendAt, setResendAt] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const locked = useRef(false)
  const otpRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const request = useMutation({
    mutationFn: requestStudentEmailChange,
    retry: false,
  })
  const verify = useMutation({
    mutationFn: verifyStudentEmailChange,
    retry: false,
  })
  const busy = request.isPending || verify.isPending
  const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000))
  const cooldown = Math.max(0, Math.ceil((resendAt - now) / 1000))

  useEffect(() => {
    if (!open) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [open])

  useEffect(() => {
    if (open && !busy) (step === "otp" ? otpRef : emailRef).current?.focus()
  }, [open, step, busy])

  function changeOpen(next: boolean) {
    if (locked.current) return
    setError("")
    setNow(Date.now())
    setOpen(next)
  }

  async function sendCode(resend = false) {
    if (locked.current || Date.now() < resendAt) return
    const newEmail = resend ? destination : email.trim()
    if (!newEmail) return setError("Email is required.")
    if (!z.email().safeParse(newEmail).success)
      return setError("Enter a valid email address.")
    if (newEmail.toLowerCase() === currentEmail.trim().toLowerCase()) {
      return setError(
        "Enter an email address different from your current email."
      )
    }
    locked.current = true
    setError("")
    try {
      await request.mutateAsync({ studentId, newEmail })
      const sentAt = Date.now()
      setNow(sentAt)
      setExpiresAt(sentAt + 15 * 60 * 1000)
      setResendAt(sentAt + 60 * 1000)
      setDestination(newEmail)
      setEmail(newEmail)
      setOtp("")
      setStep("otp")
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to send the verification code. Please try again."
      )
    } finally {
      locked.current = false
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (locked.current) return
    if (step === "email") return sendCode()
    if (Date.now() >= expiresAt) {
      setNow(Date.now())
      return setError(
        "This verification code has expired. Request a new code to continue."
      )
    }
    if (!/^\d{6}$/.test(otp))
      return setError("Enter the complete 6-digit verification code.")
    locked.current = true
    setError("")
    try {
      await verify.mutateAsync({
        studentId,
        newEmail: destination,
        otpCode: otp,
      })
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to verify the code. Please try again."
      )
      locked.current = false
      return
    }
    toast.success("Email updated successfully.")
    updateUserEmail(destination)
    setOpen(false)
    setStep("email")
    setEmail("")
    setOtp("")
    setResendAt(0)
    locked.current = false
    // Refresh actual backend state; never synthesize an email or default flag.
    try {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [queryKeys.userProfile],
        }),
        queryClient.invalidateQueries(
          { queryKey: [queryKeys.studentById, { studentId, schoolId }] },
          { throwOnError: true }
        ),
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentDetail, { studentId, schoolId }],
        }),
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentPortalLaunch, studentId, schoolId],
        }),
      ])
    } catch {
      toast.error(
        "Your email was updated, but your profile could not refresh. Please reload the page."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-2 text-blue-600">
          Change Email
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-md"
        showCloseButton={!busy}
      >
        <DialogHeader className="pr-6">
          <DialogTitle>
            {step === "email"
              ? "Change Email Address"
              : "Verify Your New Email"}
          </DialogTitle>
          <DialogDescription className="break-words">
            {step === "email"
              ? "Enter the new email address you would like to use for your student account."
              : `We've sent a 6-digit verification code to ${destination}.`}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={submit}
          noValidate
          className="min-w-0 space-y-4"
          aria-busy={busy}
        >
          {step === "email" ? (
            <>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Current Email</p>
                <p className="text-sm break-all text-gray-700">
                  {currentEmail}
                </p>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="new-student-email"
                  className="text-sm font-medium"
                >
                  New Email Address
                </label>
                <Input
                  ref={emailRef}
                  id="new-student-email"
                  type="email"
                  autoComplete="email"
                  placeholder="student@gmail.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={busy}
                  required
                  aria-invalid={!!error}
                  aria-describedby={error ? "email-change-error" : undefined}
                />
              </div>
            </>
          ) : (
            <>
              <InputOTP
                ref={otpRef}
                aria-label="6-digit verification code"
                aria-describedby={
                  error ? "email-change-error" : "email-code-expiry"
                }
                aria-invalid={!!error}
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={setOtp}
                disabled={busy || remaining === 0}
              >
                <InputOTPGroup className="gap-1.5 sm:gap-2">
                  {Array.from({ length: 6 }, (_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="size-8 sm:size-11"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <p
                id="email-code-expiry"
                className="text-center text-xs text-gray-500"
              >
                {remaining > 0
                  ? `This verification code expires in ${clock(remaining)}`
                  : "This verification code has expired. Request a new code to continue."}
              </p>
              <div className="text-center text-sm text-gray-500">
                <p>Didn't receive the code?</p>
                <Button
                  type="button"
                  variant="link"
                  className="text-blue-600"
                  onClick={() => void sendCode(true)}
                  disabled={busy || cooldown > 0}
                >
                  Resend Code
                </Button>
              </div>
            </>
          )}
          {cooldown > 0 && (
            <p className="text-center text-xs text-gray-500">
              Resend code in {clock(cooldown)}
            </p>
          )}
          {error && (
            <p
              id="email-change-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {error}
            </p>
          )}
          <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
            After your new email is verified, future login verification codes
            will be sent to this email address.
          </p>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={
              busy ||
              (step === "otp"
                ? remaining === 0 || otp.length !== 6
                : cooldown > 0)
            }
          >
            {busy && <Spinner />}
            {step === "email"
              ? "Send Verification Code"
              : "Verify & Update Email"}
          </Button>
          <div className="flex flex-wrap justify-center gap-2">
            {step === "otp" && (
              <Button
                type="button"
                variant="link"
                className="text-blue-600"
                disabled={busy}
                onClick={() => {
                  setStep("email")
                  setError("")
                }}
              >
                Change Email Address
              </Button>
            )}
            <Button
              type="button"
              variant="cancel"
              disabled={busy}
              onClick={() => changeOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
