import { useRef, useState, type ReactNode } from "react"
import { Link } from "react-router"
import { AlertCircle, LockKeyhole, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { ApiError } from "@/api/api"
import PageLoader from "@/components/general/PageLoader"
import { Button } from "@/components/ui/button"
import { useGetSchoolPortalAccess } from "@/hooks/products"
import { HomeRoutes } from "@/routes"
import { SchoolIdContext } from "@/contexts/SchoolContext"
import SubscriptionPlanSettings from "@/pages/Dashboard/SchoolSettings/components/SubscriptionPlanSettings"

interface SchoolPortalAccessGateProps {
  schoolId: string
  enabled?: boolean
  children: ReactNode
}

function pausedMessage(reason?: string, canManageSubscription?: boolean) {
  if (reason === "AdminBlocked")
    return "School access is blocked by EM360. Please contact EM360 support."
  if (reason === "AwaitingApproval")
    return "Your school is still awaiting EM360 approval."
  if (reason === "SubscriptionRequired")
    return canManageSubscription
      ? "Access is still paused. No active subscription or grace extension was found. Choose an available plan below or contact EM360 support."
      : "Access is still paused. Please ask the school owner to arrange payment or contact EM360 support."
  return "School access is still unavailable. Please contact EM360 support."
}

export default function SchoolPortalAccessGate(
  props: SchoolPortalAccessGateProps
) {
  // A different school must never inherit a previous school's check result.
  return <SchoolAccessContent key={props.schoolId} {...props} />
}

function SchoolAccessContent({
  schoolId,
  enabled = true,
  children,
}: SchoolPortalAccessGateProps) {
  const { access, isLoading, isFetching, isError, error, refetch } =
    useGetSchoolPortalAccess(schoolId, { enabled })
  const [checking, setChecking] = useState(false)
  const [feedback, setFeedback] = useState<{
    message: string
    failed: boolean
    checkedAt?: Date
  } | null>(null)
  const checkInFlight = useRef(false)

  const checkAccess = async () => {
    if (checkInFlight.current) return
    checkInFlight.current = true
    setChecking(true)
    setFeedback(null)
    try {
      const result = await refetch({ cancelRefetch: false })
      if (result.isError) throw result.error
      const latest = result.data?.value
      if (!latest)
        throw new Error(
          "The access check returned no result. Please try again."
        )
      if (latest.canLaunch) {
        toast.success("School access restored. Opening your portal.")
      } else {
        setFeedback({
          message: pausedMessage(latest.reason, latest.canManageSubscription),
          failed: false,
          checkedAt: new Date(),
        })
      }
    } catch (cause) {
      setFeedback({
        message:
          cause instanceof Error
            ? cause.message
            : "Unable to check school access. Please try again.",
        failed: true,
      })
    } finally {
      checkInFlight.current = false
      setChecking(false)
    }
  }

  if (!enabled) return children
  if (isLoading) return <PageLoader />

  const accessRevoked =
    error instanceof ApiError && [401, 403, 404].includes(error.status)
  const unavailable = isError && (!access || access.canLaunch || accessRevoked)
  const reason = access?.reason
  const canPay =
    !unavailable &&
    reason === "SubscriptionRequired" &&
    access?.canManageSubscription
  const message = unavailable
    ? "We could not confirm access to this school. Check your connection and try again."
    : reason === "SubscriptionRequired"
      ? canPay
        ? "Your school's trial or paid access has ended. Choose a plan below, or check again after a payment or grace extension."
        : "This school's subscription has expired. Please contact the school owner to arrange payment."
      : pausedMessage(reason)

  if (unavailable || !access?.canLaunch) {
    const visibleFeedback =
      feedback ??
      (isError && !checking
        ? {
            message:
              error instanceof Error
                ? error.message
                : "Unable to check school access. Please try again.",
            failed: true,
          }
        : null)
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <section
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
            aria-labelledby="school-access-title"
          >
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <LockKeyhole className="size-6" aria-hidden="true" />
              </div>
              <div>
                <h1
                  id="school-access-title"
                  className="text-xl font-semibold text-slate-900"
                >
                  {unavailable
                    ? "Unable to check school access"
                    : "School access paused"}
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {message}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  This checks confirmed payments, grace extensions and school
                  approval.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => void checkAccess()}
                disabled={checking || isFetching}
                aria-busy={checking}
                className="gap-2"
              >
                <RefreshCw
                  className={`size-4 ${checking ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
                {checking ? "Checking access…" : "Check access status"}
              </Button>
              <Button variant="outline" asChild>
                <Link to={HomeRoutes.home}>Back to my schools</Link>
              </Button>
            </div>
            {checking && (
              <p role="status" className="mt-4 text-sm text-slate-600">
                Checking your school's latest access status…
              </p>
            )}
            {!checking && visibleFeedback && (
              <div
                role={visibleFeedback.failed ? "alert" : "status"}
                className={`mt-5 rounded-xl border p-4 text-sm ${visibleFeedback.failed ? "border-red-200 bg-red-50 text-red-800" : "border-blue-100 bg-blue-50 text-blue-950"}`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <p>{visibleFeedback.message}</p>
                </div>
                {"checkedAt" in visibleFeedback &&
                  visibleFeedback.checkedAt && (
                    <p className="mt-2 text-xs text-slate-600">
                      Last checked{" "}
                      {visibleFeedback.checkedAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  )}
              </div>
            )}
          </section>
          {canPay && (
            <SchoolIdContext.Provider value={schoolId}>
              <SubscriptionPlanSettings />
            </SchoolIdContext.Provider>
          )}
        </div>
      </main>
    )
  }
  return children
}
