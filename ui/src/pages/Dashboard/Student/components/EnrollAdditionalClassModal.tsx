import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetClassArms, useGetSecondaryClasses } from "@/hooks/examAndRecords"
import { useEnrollToAdditionalClass } from "@/hooks/studentPortal"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import type { StudentListRow } from "@/utils/studentAdapter"
import { getErrorMessage } from "@/utils"

interface EnrollAdditionalClassModalProps {
  student: StudentListRow
  onClose: () => void
}

export function EnrollAdditionalClassModal({
  student,
  onClose,
}: EnrollAdditionalClassModalProps) {
  const schoolId = useSchoolId()

  const { secondaryClasses, isLoading: loadingClasses } =
    useGetSecondaryClasses(schoolId)

  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const defaultSession =
    sessions.find((s) => s.Terms.some((t) => t.IsCurrent)) ?? sessions[0]

  const [sessionOverride, setSessionOverride] = useState<string | null>(null)
  const [termOverride, setTermOverride] = useState<string | null>(null)
  const [selectedClassId, setSelectedClassId] = useState("")
  const [armOverride, setArmOverride] = useState<string | null>(null)

  const selectedSessionId = sessionOverride ?? defaultSession?.Id ?? ""
  const selectedSession = sessions.find((s) => s.Id === selectedSessionId)

  const selectedTermId =
    termOverride ??
    selectedSession?.Terms.find((t) => t.IsCurrent)?.Id ??
    selectedSession?.Terms[0]?.Id ??
    ""
  const selectedTerm = selectedSession?.Terms.find(
    (t) => t.Id === selectedTermId,
  )

  function handleSessionChange(value: string) {
    setSessionOverride(value)
    setTermOverride("")
  }

  const { classArms } = useGetClassArms(selectedClassId)
  const selectedArmId = armOverride ?? ""

  const { enrollToAdditionalClassAsync, isPending: isEnrolling } =
    useEnrollToAdditionalClass({
      onSuccess: onClose,
      onError: (error) => {
        toast.error(
          getErrorMessage(error, "Failed to enroll student. Please try again."),
        )
      },
    })

  function handleClassChange(value: string) {
    setSelectedClassId(value)
    setArmOverride("")
  }

  async function handleSave() {
    if (!selectedClassId) {
      toast.error("Please select a class")
      return
    }
    if (!selectedSession || !selectedTerm) {
      toast.error("Please select a session and term.")
      return
    }

    try {
      await enrollToAdditionalClassAsync({
        studentId: student.id,
        schoolId,
        schoolClassId: selectedClassId,
        schoolArmId: selectedArmId || undefined,
        schoolSessionId: selectedSession.Id,
        schoolSessionTermId: selectedTerm.Id,
      })
    } catch {
      /* The mutation reports the error and keeps the form open. */
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Enroll to Additional Class
          </DialogTitle>
          <DialogDescription>
            Add {student.firstName} {student.lastName} to a secondary class — a
            club, elective, or auxiliary group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block text-xs font-medium text-gray-500">
                Session
              </Label>
              <Select
                value={selectedSessionId || undefined}
                onValueChange={handleSessionChange}
              >
                <SelectTrigger className="w-full rounded-lg">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.Id} value={s.Id}>
                      {s.SessionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block text-xs font-medium text-gray-500">
                Term
              </Label>
              <Select
                value={selectedTermId || undefined}
                onValueChange={setTermOverride}
              >
                <SelectTrigger className="w-full rounded-lg">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {(selectedSession?.Terms ?? []).map((t) => (
                    <SelectItem key={t.Id} value={t.Id}>
                      {t.TermName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-1 block text-xs font-medium text-gray-500">
              Secondary Class
            </Label>
            {loadingClasses ? (
              <div className="flex h-10 items-center gap-2 text-sm text-gray-400">
                <Loader2 className="size-3.5 animate-spin" />
                Loading classes…
              </div>
            ) : secondaryClasses.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No secondary classes found. Create one first in Classes.
              </p>
            ) : (
              <Select
                value={selectedClassId || undefined}
                onValueChange={handleClassChange}
              >
                <SelectTrigger className="w-full rounded-lg border-gray-300 active:border-blue-600 focus:border-blue-600">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {secondaryClasses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.clsName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {classArms.length > 0 && (
            <div>
              <Label className="mb-1 block text-xs font-medium text-gray-500">
                Arm
              </Label>
              <Select
                value={selectedArmId || undefined}
                onValueChange={setArmOverride}
              >
                <SelectTrigger className="w-full rounded-lg">
                  <SelectValue placeholder="Select arm" />
                </SelectTrigger>
                <SelectContent>
                  {classArms.map((a) => (
                    <SelectItem key={a.Id} value={a.Id}>
                      {a.ArmName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isEnrolling}
            className="flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            {isEnrolling && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
