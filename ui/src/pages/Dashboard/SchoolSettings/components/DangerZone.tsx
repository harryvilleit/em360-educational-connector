import { useState } from "react"
import { endPortalSession } from "@/lib/portal-navigation"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useDeleteSchool, useGeUserAssignedDashboard } from "@/hooks/products"
import { HomeRoutes } from "@/routes"
import SettingsCard from "./SettingsCard"

export default function DangerZone() {
  const schoolId = useSchoolId()
  const { userDashboard } = useGeUserAssignedDashboard(schoolId)
  const { deleteSchoolAsync, isLoading } = useDeleteSchool()
  const [confirmation, setConfirmation] = useState("")
  const value =
    userDashboard && typeof userDashboard === "object"
      ? (userDashboard as Record<string, unknown>).Value
      : undefined
  const school =
    value && typeof value === "object"
      ? (value as Record<string, unknown>).School
      : undefined
  const schoolName =
    school && typeof school === "object"
      ? String(
          (school as Record<string, unknown>).Name ??
            (school as Record<string, unknown>).name ??
            "",
        )
      : ""
  const confirmed = !!schoolName && confirmation.trim() === schoolName

  async function deleteSchool() {
    if (!confirmed) return
    try {
      const response = await deleteSchoolAsync(schoolId)
      if (response?.IsSuccess) endPortalSession(HomeRoutes.home)
    } catch {
      /* The mutation displays the error and keeps this screen open. */
    }
  }

  return (
    <SettingsCard
      title="Danger Zone"
      description="Permanent school data and account operations."
      danger
    >
      <div className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50/60 p-5 sm:flex-row sm:items-center">
        <AlertTriangle className="size-6 shrink-0 text-red-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">
            Delete this school
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            This permanently removes the school and dependent records. Only the
            school owner can continue.
          </p>
        </div>
        <AlertDialog onOpenChange={(open) => !open && setConfirmation("")}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              className="shrink-0 rounded-xl"
            >
              Delete School
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {schoolName || "this school"}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. Type the exact school name to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <label className="space-y-1.5 text-sm font-medium text-gray-800">
              School name
              <Input
                autoComplete="off"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder={schoolName}
              />
            </label>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={!confirmed || isLoading}
                onClick={() => void deleteSchool()}
              >
                {isLoading ? "Deleting…" : "Delete permanently"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SettingsCard>
  )
}
