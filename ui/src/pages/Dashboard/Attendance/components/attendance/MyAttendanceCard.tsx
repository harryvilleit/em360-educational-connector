import { useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  DoorOpen,
  LocateFixed,
  LogIn,
  LogOut,
  MapPin,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useAttendancePunch,
  useMyPersistedAttendance,
} from "@/hooks/staffAttendance/useStaffAttendance"
import { getErrorMessage } from "@/utils"
import { captureLocation } from "@/utils/geolocation"

function locationText(distance?: number | null, withinCampus?: boolean | null) {
  if (withinCampus === true) {
    return `On campus${distance != null ? ` · ${Math.round(distance)} m` : ""}`
  }
  if (withinCampus === false) {
    return `Outside campus${distance != null ? ` · ${Math.round(distance)} m` : ""}`
  }
  return "Location recorded"
}

export default function MyAttendanceCard() {
  const schoolId = useSchoolId()
  const { data, isLoading } = useMyPersistedAttendance(schoolId)
  const signIn = useAttendancePunch(schoolId, "SignIn")
  const signOut = useAttendancePunch(schoolId, "SignOut")
  const [locating, setLocating] = useState<"in" | "out" | null>(null)
  const [earlyDialogOpen, setEarlyDialogOpen] = useState(false)
  const [earlyReason, setEarlyReason] = useState("")

  async function punch(kind: "in" | "out", earlyLeaveReason?: string) {
    setLocating(kind)
    try {
      const location = await captureLocation()
      const mutation = kind === "in" ? signIn : signOut
      await mutation.mutateAsync({ ...location, earlyLeaveReason })
      toast.success(
        kind === "in" ? "Signed in successfully." : "Signed out successfully."
      )
      setEarlyDialogOpen(false)
      setEarlyReason("")
    } catch (error) {
      toast.error(getErrorMessage(error, `Unable to sign ${kind}.`))
    } finally {
      setLocating(null)
    }
  }

  function handleSignOut() {
    if (!data || !data.record?.signInAtUtc || data.record.signOutAtUtc) return
    if (data.canLeaveEarly) {
      setEarlyDialogOpen(true)
      return
    }
    void punch("out")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Spinner className="size-6 text-blue-600" />
      </div>
    )
  }

  if (!data?.isStaff || !data.staff) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">
          My attendance
        </h2>
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          This school-owner account is not linked to a staff profile. Staff
          members can use this page to sign in and out; use User Management →
          Attendance to monitor the school.
        </div>
      </div>
    )
  }

  const record = data.record
  const signedIn = Boolean(record?.signInAtUtc)
  const signedOut = Boolean(record?.signOutAtUtc)
  const latestLocation = record?.signOutLocation ?? record?.signInLocation
  const insideCampus = latestLocation?.isWithinCampus

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              My attendance
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {data.staff.name} · {data.staff.role || "Staff"}
            </p>
          </div>
          {latestLocation && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                insideCampus === false
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              <LocateFixed className="size-3.5" />
              {locationText(latestLocation.distanceMetres, insideCampus)}
            </span>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <span className="grid size-8 place-items-center rounded-full bg-green-100 text-green-700">
                <LogIn className="size-4" />
              </span>
              Sign in
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {record?.signInTime ?? "— : —"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Expected by {data.settings.signInCutOffTime}
            </p>
            {record?.signInTime && (
              <span
                className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  record.signInStatus === "Late"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {record.signInStatus === "Late" ? "Late in" : "On time"}
              </span>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <span className="grid size-8 place-items-center rounded-full bg-amber-100 text-amber-700">
                <LogOut className="size-4" />
              </span>
              Sign out
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {record?.signOutTime ?? "— : —"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Scheduled {data.settings.signOutTime}
            </p>
            <span className="mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              {record?.signOutStatus === "EarlyOut"
                ? "Early out"
                : record?.signOutStatus === "OnTime"
                  ? "On time"
                  : "Pending"}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Button
            type="button"
            onClick={() => punch("in")}
            disabled={signedIn || !data.canSignIn || locating !== null}
            className="h-12 bg-green-600 text-white hover:bg-green-700 disabled:bg-slate-100 disabled:text-slate-500"
          >
            {locating === "in" ? (
              <Spinner />
            ) : signedIn ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <MapPin className="size-4" />
            )}
            {locating === "in"
              ? "Recording time and location…"
              : signedIn
                ? `Signed in · ${record?.signInTime ?? "Recorded"}`
                : data.signInWindowClosed
                  ? "Sign in late"
                  : "Sign in"}
          </Button>

          <Button
            type="button"
            onClick={handleSignOut}
            disabled={!signedIn || signedOut || locating !== null}
            className={`h-12 text-white disabled:bg-slate-100 disabled:text-slate-500 ${
              data.canLeaveEarly
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {locating === "out" ? (
              <Spinner />
            ) : signedOut ? (
              <CheckCircle2 className="size-4" />
            ) : data.canLeaveEarly ? (
              <DoorOpen className="size-4" />
            ) : (
              <LogOut className="size-4" />
            )}
            {locating === "out"
              ? "Recording time and location…"
              : signedOut
                ? `Signed out · ${record?.signOutTime ?? "Recorded"}`
                : !signedIn
                  ? "Sign in first"
                  : data.canLeaveEarly
                    ? "Sign out early"
                    : "Sign out"}
          </Button>
        </div>

        {!signedIn && data.signInWindowClosed ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700">
            <Clock3 className="size-3.5" />
            The expected sign-in time has passed. You can still sign in and will
            be recorded as late.
          </p>
        ) : signedIn && !signedOut && data.canLeaveEarly ? (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-red-700">
            <DoorOpen className="size-3.5" />
            Signing out before {data.settings.signOutTime} is recorded as early
            and requires a reason.
          </p>
        ) : signedOut ? (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            <CheckCircle2 className="size-4" />
            Today’s attendance is complete
          </div>
        ) : null}
      </section>

      <Dialog open={earlyDialogOpen} onOpenChange={setEarlyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign out early</DialogTitle>
            <DialogDescription>
              Enter a reason. Your current coordinates will be recorded with the
              sign-out time.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={earlyReason}
            onChange={(event) => setEarlyReason(event.target.value)}
            placeholder="Reason for leaving before the set time"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEarlyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => punch("out", earlyReason.trim())}
              disabled={!earlyReason.trim() || locating !== null}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {locating === "out" && <Spinner />}
              Confirm early sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
