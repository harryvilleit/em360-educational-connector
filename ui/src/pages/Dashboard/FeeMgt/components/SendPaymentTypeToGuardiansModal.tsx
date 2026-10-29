import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import {
  useGetEligibleStudents,
  useSendPaymentTypeToGuardians,
} from "@/hooks/feeManagement"
import type { SchoolPaymentStructureI } from "@/api/feeManagement.api/types"

interface Props {
  paymentType: SchoolPaymentStructureI | null
  onClose: () => void
}

export default function SendPaymentTypeToGuardiansModal({
  paymentType,
  onClose,
}: Props) {
  const schoolId = useSchoolId()
  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const { eligibleStudents, isLoading: studentsLoading } =
    useGetEligibleStudents(paymentType?.id ?? "")
  const { sendToGuardians, isPending } = useSendPaymentTypeToGuardians({
    onSuccess: onClose,
  })

  if (!paymentType) return null

  const term = sessions
    .find((s) => s.Id === paymentType.sessionId)
    ?.Terms.find((t) => t.Id === paymentType.termId)

  function handleConfirm() {
    if (!paymentType || !term) return
    sendToGuardians({
      schoolId,
      paymentStructureId: paymentType.id,
      schoolSessionId: paymentType.sessionId,
      schoolSessionTermId: paymentType.termId,
      schoolClassId: paymentType.classId,
      dueDate: term.EndDate,
    })
  }

  return (
    <Dialog open onOpenChange={(v) => !v && !isPending && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Send to all guardians
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Generates an invoice for every student in{" "}
            <strong>{paymentType.className}</strong> ({paymentType.termName},{" "}
            {paymentType.sessionName}) who doesn&apos;t already have one, so
            the fee appears on their guardian&apos;s parent portal.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {studentsLoading ? (
            "Loading students…"
          ) : (
            <>
              <strong>{eligibleStudents.length}</strong> student
              {eligibleStudents.length === 1 ? "" : "s"} found in this class.
              Students who&apos;ve already been sent an invoice for this term
              are skipped automatically.
            </>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleConfirm}
            disabled={isPending || studentsLoading || !term}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Send className="size-4" />
                Send
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
