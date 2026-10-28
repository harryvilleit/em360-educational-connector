import { useState, type FormEvent } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useAllSchoolStudents } from "@/hooks/useAllSchoolRecords"
import { useCreateLearnerSupportReferral } from "@/hooks/learnerSupport"
import { useStudentSupportSettings } from "@/hooks/studentSupportSettings"
import type { LearnerSupportReferralSource } from "@/api/learnerSupport.api"
import { FormField } from "./components"
import { inputClass, textareaClass } from "./utils"

export default function NewReferralDialog({ schoolId }: { schoolId: string }) {
  const [open, setOpen] = useState(false)
  const { students, isLoading } = useAllSchoolStudents(schoolId)
  const mutation = useCreateLearnerSupportReferral()
  const [studentId, setStudentId] = useState("")
  const [source, setSource] = useState<LearnerSupportReferralSource>("Teacher")
  const [strengths, setStrengths] = useState("")
  const [concern, setConcern] = useState("")
  const [impact, setImpact] = useState("")
  const [strategies, setStrategies] = useState("")
  const { settings } = useStudentSupportSettings(schoolId)
  const [jurisdiction, setJurisdiction] = useState<string>()
  const [safety, setSafety] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    mutation.mutate(
      {
        schoolId,
        studentId,
        referralSource: source,
        strengths,
        concern,
        impact: impact || undefined,
        strategiesTried: strategies || undefined,
        immediateSafetyConcern: safety,
        jurisdictionCode: jurisdiction ?? settings?.jurisdictionCode ?? "",
      },
      { onSuccess: () => setOpen(false) }
    )
  }

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> New referral
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Make a {settings?.learnerSupportName ?? "learner-support"}{" "}
              referral
            </DialogTitle>
            <DialogDescription>
              Record the learner's strengths, the concern and what has already
              been tried. A case manager can triage it next.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Learner">
                <select
                  className={inputClass}
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                >
                  <option value="">
                    {isLoading ? "Loading learners…" : "Select a learner"}
                  </option>
                  {students.map((student) => (
                    <option key={student.studentId} value={student.studentId}>
                      {student.firstname} {student.lastname}{" "}
                      {student.studentGivenId
                        ? `(${student.studentGivenId})`
                        : ""}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Referral source">
                <select
                  className={inputClass}
                  value={source}
                  onChange={(e) =>
                    setSource(e.target.value as LearnerSupportReferralSource)
                  }
                >
                  <option value="Teacher">Teacher</option>
                  <option value="ParentOrGuardian">Parent or guardian</option>
                  <option value="Learner">Learner</option>
                  <option value="HealthProfessional">
                    Health professional
                  </option>
                  <option value="ExternalProfessional">
                    External professional
                  </option>
                  <option value="SchoolLeadership">School leadership</option>
                  <option value="Other">Other</option>
                </select>
              </FormField>
              <FormField
                label="Support framework / jurisdiction"
                hint={`Configured for ${settings?.countryCode || "this school"}. School leaders can change the default in Local Settings.`}
              >
                <input
                  className={inputClass}
                  required
                  maxLength={20}
                  value={jurisdiction ?? settings?.jurisdictionCode ?? ""}
                  onChange={(e) =>
                    setJurisdiction(e.target.value.toUpperCase())
                  }
                />
              </FormField>
              <label className="flex items-center gap-2 self-end rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-800">
                <Checkbox
                  checked={safety}
                  onCheckedChange={(checked) => setSafety(checked === true)}
                />
                Immediate safety or safeguarding concern
              </label>
            </div>
            <FormField label="Strengths">
              <textarea
                className={textareaClass}
                required
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
              />
            </FormField>
            <FormField label="Concern and observed need">
              <textarea
                className={textareaClass}
                required
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
              />
            </FormField>
            <FormField label="Impact on learning or participation">
              <textarea
                className={textareaClass}
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
              />
            </FormField>
            <FormField label="Strategies already tried">
              <textarea
                className={textareaClass}
                value={strategies}
                onChange={(e) => setStrategies(e.target.value)}
              />
            </FormField>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={mutation.isPending || !studentId}
              >
                {mutation.isPending ? "Submitting…" : "Submit referral"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
