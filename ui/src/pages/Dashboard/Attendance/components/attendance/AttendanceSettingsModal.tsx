import { useEffect, useState } from "react"
import { CalendarClock, LocateFixed } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  usePersistedAttendanceSettings,
  useUpdatePersistedAttendanceSettings,
} from "@/hooks/staffAttendance/useStaffAttendance"
import { getErrorMessage } from "@/utils"
import { captureLocation } from "@/utils/geolocation"

interface Props {
  open: boolean
  onClose: () => void
}

export default function AttendanceSettingsModal({ open, onClose }: Props) {
  const schoolId = useSchoolId()
  const { data: settings } = usePersistedAttendanceSettings(schoolId)
  const update = useUpdatePersistedAttendanceSettings(schoolId)
  const [signInTime, setSignInTime] = useState("08:30")
  const [signOutTime, setSignOutTime] = useState("16:30")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [radius, setRadius] = useState("150")
  const [enforce, setEnforce] = useState(false)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    if (!open || !settings) return
    setSignInTime(settings.signInTime)
    setSignOutTime(settings.signOutTime)
    setLatitude(settings.campusLatitude?.toString() ?? "")
    setLongitude(settings.campusLongitude?.toString() ?? "")
    setRadius(String(settings.campusRadiusMetres))
    setEnforce(settings.enforceGeofence)
  }, [open, settings])

  async function useCurrentLocation() {
    setLocating(true)
    try {
      const position = await captureLocation()
      setLatitude(position.latitude.toFixed(7))
      setLongitude(position.longitude.toFixed(7))
      toast.success("Campus centre set to your current location.")
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to get the current location."))
    } finally {
      setLocating(false)
    }
  }

  async function save() {
    try {
      const response = await update.mutateAsync({
        signInTime,
        signOutTime,
        campusLatitude: latitude.trim() ? Number(latitude) : null,
        campusLongitude: longitude.trim() ? Number(longitude) : null,
        campusRadiusMetres: Number(radius),
        enforceGeofence: enforce,
      })
      const effectiveDate = response.value?.effectiveFromDate
      toast.success(
        effectiveDate
          ? `Settings saved. The new policy applies from ${new Date(`${effectiveDate}T12:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}.`
          : "Attendance settings updated."
      )
      onClose()
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Unable to update attendance settings.")
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Attendance settings</DialogTitle>
          <DialogDescription>
            Set the school’s attendance windows and campus location. Times use
            the school timezone configured in School Settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="attendance-sign-in">Sign-in time</Label>
              <Input
                id="attendance-sign-in"
                type="time"
                value={signInTime}
                onChange={(event) => setSignInTime(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="attendance-sign-out">Sign-out time</Label>
              <Input
                id="attendance-sign-out"
                type="time"
                value={signOutTime}
                onChange={(event) => setSignOutTime(event.target.value)}
              />
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
            <CalendarClock className="mt-0.5 size-5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-semibold">Effective-dated policy</p>
              <p className="mt-1 text-xs leading-5 text-blue-700">
                Changes take effect on the next school day. Existing attendance
                records keep the sign-in and sign-out times that applied when
                they were recorded, so historical statuses never change.
              </p>
              {settings?.isScheduled && settings.effectiveFromDate && (
                <p className="mt-2 text-xs font-semibold text-blue-800">
                  A policy is scheduled for{" "}
                  {new Date(
                    `${settings.effectiveFromDate}T12:00:00`
                  ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  . Saving again will replace it for that effective day.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Campus geofence
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Coordinates are captured for every staff punch. Enforcing the
                  geofence blocks punches outside the configured radius.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={useCurrentLocation}
                disabled={locating}
              >
                {locating ? <Spinner /> : <LocateFixed className="size-4" />}
                Use current location
              </Button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="campus-latitude">Latitude</Label>
                <Input
                  id="campus-latitude"
                  inputMode="decimal"
                  value={latitude}
                  onChange={(event) => setLatitude(event.target.value)}
                  placeholder="7.3775"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campus-longitude">Longitude</Label>
                <Input
                  id="campus-longitude"
                  inputMode="decimal"
                  value={longitude}
                  onChange={(event) => setLongitude(event.target.value)}
                  placeholder="3.9470"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campus-radius">Radius (metres)</Label>
                <Input
                  id="campus-radius"
                  type="number"
                  min="20"
                  max="5000"
                  value={radius}
                  onChange={(event) => setRadius(event.target.value)}
                />
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg bg-slate-50 p-3">
              <Checkbox
                checked={enforce}
                onCheckedChange={(checked) => setEnforce(checked === true)}
                className="mt-0.5"
              />
              <span>
                <span className="block text-sm font-medium text-slate-800">
                  Require staff to be inside the campus geofence
                </span>
                <span className="block text-xs text-slate-500">
                  Leave off to record location without blocking attendance.
                </span>
              </span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={save}
            disabled={update.isPending}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {update.isPending && <Spinner />}
            Save settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
