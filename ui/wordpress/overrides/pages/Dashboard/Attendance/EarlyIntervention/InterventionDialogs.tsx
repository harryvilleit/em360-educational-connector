// WordPress version: failed saves keep the dialog open instead of raising unhandled errors.
import { type FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useAddAttendanceActivity,
  useCloseAttendanceIntervention,
  useCompleteAttendanceActivity,
  useOpenAttendanceIntervention,
  useRecordAttendanceReview,
  useReferAttendanceIntervention,
} from "@/hooks/attendanceIntervention"
import { useStudentSupportSettings } from "@/hooks/studentSupportSettings"
import type {
  AttendanceActivityType,
  AttendanceInterventionActivityI,
  AttendanceReferralDestination,
  AttendanceReviewDecision,
} from "@/api/attendanceIntervention.api"
import { FormField } from "@/pages/Dashboard/Attendance/EarlyIntervention/components"
import { inputClass, textareaClass, toLocalDateInput } from "@/pages/Dashboard/Attendance/EarlyIntervention/utils"

type DialogProps = { open: boolean; onOpenChange: (open: boolean) => void }

export function OpenInterventionDialog({
  open,
  onOpenChange,
  schoolId,
  studentId,
  attendancePercentage,
}: DialogProps & {
  schoolId: string
  studentId: string
  attendancePercentage: number
}) {
  const mutation = useOpenAttendanceIntervention()
  const [reason, setReason] = useState("")
  const [plan, setPlan] = useState("")
  const [target, setTarget] = useState("95")
  const [assignee, setAssignee] = useState("")
  const [reviewDate, setReviewDate] = useState("")

  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      await mutation.mutateAsync({
        schoolId,
        studentId,
        reason,
        planSummary: plan || undefined,
        targetAttendancePercentage: Number(target),
        assignedToName: assignee || undefined,
        nextReviewDate: reviewDate || undefined,
      })
      onOpenChange(false)
    } catch {
      // The mutation reports the error; the dialog stays open.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Open attendance intervention</DialogTitle>
          <DialogDescription>
            Current attendance is {attendancePercentage.toFixed(1)}%. Record why support is
            required and how improvement will be reviewed.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <FormField label="Reason">
            <textarea className={textareaClass} required value={reason} onChange={(e) => setReason(e.target.value)} />
          </FormField>
          <FormField label="Initial plan" hint="Optional: actions already agreed with the learner or family.">
            <textarea className={textareaClass} value={plan} onChange={(e) => setPlan(e.target.value)} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Target attendance %">
              <input className={inputClass} type="number" min="1" max="100" step="0.1" required value={target} onChange={(e) => setTarget(e.target.value)} />
            </FormField>
            <FormField label="Assigned staff">
              <input className={inputClass} value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Name" />
            </FormField>
            <FormField label="Review date">
              <input className={inputClass} type="date" min={toLocalDateInput(new Date())} value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="cancel" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={mutation.isPending}>
              {mutation.isPending ? "Opening…" : "Open intervention"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const activityTypes: AttendanceActivityType[] = [
  "ContactHome",
  "LearnerMeeting",
  "ParentMeeting",
  "AttendancePlan",
  "PastoralSupport",
  "Monitor",
  "Other",
]

export function AddActivityDialog({
  open,
  onOpenChange,
  schoolId,
  caseId,
}: DialogProps & { schoolId: string; caseId: string }) {
  const mutation = useAddAttendanceActivity()
  const [type, setType] = useState<AttendanceActivityType>("ContactHome")
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [contactMethod, setContactMethod] = useState("")
  const [contactedPerson, setContactedPerson] = useState("")
  const [assignee, setAssignee] = useState("")
  const [dueAtUtc, setDueAtUtc] = useState("")

  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      await mutation.mutateAsync({
        schoolId,
        caseId,
        type,
        title,
        details,
        contactMethod: type === "ContactHome" ? contactMethod || undefined : undefined,
        contactedPerson: type === "ContactHome" ? contactedPerson || undefined : undefined,
        assignedToName: assignee || undefined,
        dueAtUtc: dueAtUtc ? new Date(dueAtUtc).toISOString() : undefined,
      })
      onOpenChange(false)
    } catch {
      // The mutation reports the error; the dialog stays open.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add intervention activity</DialogTitle>
          <DialogDescription>Record contact with home or assign a support action.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <FormField label="Activity type">
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as AttendanceActivityType)}>
              {activityTypes.map((item) => <option key={item} value={item}>{item.replace(/([a-z])([A-Z])/g, "$1 $2")}</option>)}
            </select>
          </FormField>
          <FormField label="Title">
            <input className={inputClass} required value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <FormField label="Factual details">
            <textarea className={textareaClass} required value={details} onChange={(e) => setDetails(e.target.value)} />
          </FormField>
          {type === "ContactHome" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Contact method">
                <select className={inputClass} value={contactMethod} onChange={(e) => setContactMethod(e.target.value)} required>
                  <option value="">Select</option><option>Phone</option><option>Email</option><option>SMS</option><option>In person</option><option>Letter</option>
                </select>
              </FormField>
              <FormField label="Person contacted">
                <input className={inputClass} required value={contactedPerson} onChange={(e) => setContactedPerson(e.target.value)} />
              </FormField>
            </div>
          )}
          {type !== "ContactHome" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Assigned staff">
                <input className={inputClass} value={assignee} onChange={(e) => setAssignee(e.target.value)} />
              </FormField>
              <FormField label="Due date and time">
                <input className={inputClass} type="datetime-local" value={dueAtUtc} onChange={(e) => setDueAtUtc(e.target.value)} />
              </FormField>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="cancel" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : "Save activity"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CompleteActivityDialog({
  open,
  onOpenChange,
  schoolId,
  activity,
}: DialogProps & { schoolId: string; activity?: AttendanceInterventionActivityI }) {
  const mutation = useCompleteAttendanceActivity()
  const [outcome, setOutcome] = useState("")
  const [status, setStatus] = useState<"Completed" | "Cancelled">("Completed")
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!activity) return
    try {
      await mutation.mutateAsync({ schoolId, activityId: activity.id, status, outcome })
      onOpenChange(false)
    } catch {
      // The mutation reports the error; the dialog stays open.
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Update action</DialogTitle><DialogDescription>{activity?.title}</DialogDescription></DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <FormField label="Status"><select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as "Completed" | "Cancelled")}><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></select></FormField>
          <FormField label="Outcome"><textarea className={textareaClass} required value={outcome} onChange={(e) => setOutcome(e.target.value)} /></FormField>
          <DialogFooter><Button type="button" variant="cancel" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={mutation.isPending}>Save outcome</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ReviewDialog({ open, onOpenChange, schoolId, caseId }: DialogProps & { schoolId: string; caseId: string }) {
  const mutation = useRecordAttendanceReview()
  const [decision, setDecision] = useState<Exclude<AttendanceReviewDecision, "ReferToLearnerSupport" | "ReferToSafeguarding">>("ContinuePlan")
  const [outcome, setOutcome] = useState("")
  const [nextReviewDate, setNextReviewDate] = useState("")
  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      await mutation.mutateAsync({ schoolId, caseId, decision, outcome, nextReviewDate: nextReviewDate || undefined })
      onOpenChange(false)
    } catch {
      // The mutation reports the error; the dialog stays open.
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Record intervention review</DialogTitle><DialogDescription>The latest attendance percentage is captured by the server when this review is saved.</DialogDescription></DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <FormField label="Decision"><select className={inputClass} value={decision} onChange={(e) => setDecision(e.target.value as typeof decision)}><option value="ContinuePlan">Continue plan</option><option value="AdjustPlan">Adjust plan</option><option value="MoveToMonitoring">Move to monitoring</option><option value="CloseIntervention">Close intervention</option></select></FormField>
          <FormField label="Progress and outcome"><textarea className={textareaClass} required value={outcome} onChange={(e) => setOutcome(e.target.value)} /></FormField>
          {decision !== "CloseIntervention" && <FormField label="Next review date"><input className={inputClass} type="date" min={toLocalDateInput(new Date())} value={nextReviewDate} onChange={(e) => setNextReviewDate(e.target.value)} /></FormField>}
          <DialogFooter><Button type="button" variant="cancel" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={mutation.isPending}>Save review</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ReferralDialog({ open, onOpenChange, schoolId, caseId }: DialogProps & { schoolId: string; caseId: string }) {
  const mutation = useReferAttendanceIntervention()
  const { settings } = useStudentSupportSettings(schoolId)
  const [destination, setDestination] = useState<AttendanceReferralDestination>("LearnerSupport")
  const [reason, setReason] = useState("")
  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      await mutation.mutateAsync({ schoolId, caseId, destination, reason })
      onOpenChange(false)
    } catch {
      // The mutation reports the error; the dialog stays open.
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Secure cross-module referral</DialogTitle><DialogDescription>A restricted case is created in the selected service. Attendance users will see only its reference, not confidential case details.</DialogDescription></DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <FormField label="Destination"><select className={inputClass} value={destination} onChange={(e) => setDestination(e.target.value as AttendanceReferralDestination)}><option value="LearnerSupport">{settings?.learnerSupportName ?? "Learner Support"}</option><option value="Safeguarding">{settings?.safeguardingName ?? "Safeguarding"}</option></select></FormField>
          <FormField label="Factual referral reason"><textarea className={textareaClass} required value={reason} onChange={(e) => setReason(e.target.value)} /></FormField>
          {destination === "Safeguarding" && <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-900">If anyone is in immediate danger, {settings?.emergencyPhoneNumber ? `call ${settings.emergencyServicesName} on ${settings.emergencyPhoneNumber}` : `contact ${settings?.emergencyServicesName ?? "local emergency services"}`}. This referral does not contact emergency services.</div>}
          <DialogFooter><Button type="button" variant="cancel" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={mutation.isPending}>Submit referral</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CloseInterventionDialog({ open, onOpenChange, schoolId, caseId }: DialogProps & { schoolId: string; caseId: string }) {
  const mutation = useCloseAttendanceIntervention()
  const [summary, setSummary] = useState("")
  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      await mutation.mutateAsync({ schoolId, caseId, closureSummary: summary })
      onOpenChange(false)
    } catch {
      // The mutation reports the error; the dialog stays open.
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent><DialogHeader><DialogTitle>Close intervention</DialogTitle><DialogDescription>All open actions must be completed or cancelled first.</DialogDescription></DialogHeader><form className="grid gap-4" onSubmit={submit}><FormField label="Closure summary"><textarea className={textareaClass} required value={summary} onChange={(e) => setSummary(e.target.value)} /></FormField><DialogFooter><Button type="button" variant="cancel" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={mutation.isPending}>Close intervention</Button></DialogFooter></form></DialogContent>
    </Dialog>
  )
}
