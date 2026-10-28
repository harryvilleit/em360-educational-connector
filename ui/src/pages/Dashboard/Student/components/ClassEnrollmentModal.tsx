import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
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
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllClasses, useGetClassArms } from "@/hooks/examAndRecords"
import { useEnrollStudent, useGetStudentById } from "@/hooks/studentPortal"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import type { StudentListRow } from "@/utils/studentAdapter"
import { autoGenerateEnrollmentInvoice } from "@/utils/autoGenerateEnrollmentInvoice"
import { getErrorMessage } from "@/utils"

interface ClassEnrollmentModalProps {
  student: StudentListRow
  onClose: () => void
}

export function ClassEnrollmentModal({
  student,
  onClose,
}: ClassEnrollmentModalProps) {
  const schoolId = useSchoolId()

  const { student: detail } = useGetStudentById({
    studentId: student.id,
    schoolId,
  })
  const { classes } = useGetAllClasses({ schoolId, pageSize: 200 })

  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const defaultSession =
    sessions.find((s) => s.Terms.some((t) => t.IsCurrent)) ?? sessions[0]

  const [sessionOverride, setSessionOverride] = useState<string | null>(null)
  const [termOverride, setTermOverride] = useState<string | null>(null)
  const [classOverride, setClassOverride] = useState<string | null>(null)
  const [armOverride, setArmOverride] = useState<string | null>(null)

  // Default to the current session/term until the user picks one explicitly.
  const selectedSessionId = sessionOverride ?? defaultSession?.Id ?? ""
  const selectedSession = sessions.find((s) => s.Id === selectedSessionId)

  const selectedTermId =
    termOverride ??
    selectedSession?.Terms.find((t) => t.IsCurrent)?.Id ??
    selectedSession?.Terms[0]?.Id ??
    ""
  const selectedTerm = selectedSession?.Terms.find(
    (t) => t.Id === selectedTermId
  )

  function handleSessionChange(value: string) {
    setSessionOverride(value)
    setTermOverride("")
  }

  // Default to the student's current class/arm until the user picks one explicitly.
  const defaultClassId =
    classes.find((c) => c.ClsName === detail?.schoolClassName)?.Id ?? ""
  const selectedClassId = classOverride ?? defaultClassId

  const { classArms } = useGetClassArms(selectedClassId)

  const defaultArmId =
    classArms.find((a) => a.ArmName === detail?.schoolArmName)?.Id ?? ""
  const selectedArmId = armOverride ?? defaultArmId

  const { enrollStudent, isPending: isEnrolling } = useEnrollStudent({
    onSuccess: () => {
      onClose()

      // Best-effort: if a Payment Type already covers this class/session/term,
      // this generates the invoice immediately so it appears on the parent
      // portal right away instead of waiting on a bursar to run Generate
      // Invoice. Silently skipped if there's no structure set up yet.
      if (selectedSession && selectedTerm) {
        autoGenerateEnrollmentInvoice({
          schoolId,
          studentId: student.id,
          guardianId: detail?.guardians?.[0]?.id,
          schoolSessionId: selectedSession.Id,
          schoolSessionTermId: selectedTerm.Id,
          schoolClassId: selectedClassId,
          dueDate: selectedTerm.EndDate,
        }).then((result) => {
          if (result === "created") {
            toast.success(
              "Fee invoice generated for this term — visible on the parent portal."
            )
          } else if (result === "failed") {
            toast.error(
              "Enrolled, but couldn't auto-generate the fee invoice. Use Generate Invoice to create it manually."
            )
          }
        })
      }
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, "Failed to enroll student. Please try again.")
      )
    },
  })

  function handleClassChange(value: string) {
    setClassOverride(value)
    setArmOverride("")
  }

  function handleSave() {
    if (!selectedClassId) {
      toast.error("Please select a class")
      return
    }
    if (!selectedSession || !selectedTerm) {
      toast.error("Please select a session and term.")
      return
    }

    enrollStudent({
      studentId: student.id,
      schoolId,
      schoolClassId: selectedClassId,
      schoolArmId: selectedArmId || undefined,
      schoolSessionId: selectedSession.Id,
      schoolSessionTermId: selectedTerm.Id,
    })
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
          
            Class Enrollment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label className="mb-1 block text-xs font-medium text-gray-500">
              Student Name
            </Label>
            <p className="text-sm font-medium text-gray-900">
              {student.firstName} {student.lastName}
            </p>
          </div>

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
              Class
            </Label>
            <Select
              value={selectedClassId || undefined}
              onValueChange={handleClassChange}
            >
              <SelectTrigger className="w-full rounded-lg border-gray-300 active:border-blue-600 focus:border-blue-600">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.Id} value={c.Id}>
                    {c.ClsName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
