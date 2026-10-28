import { useState, type FormEvent } from "react"
import { CheckCircle2, ShieldAlert } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useAllSchoolStudents } from "@/hooks/useAllSchoolRecords"
import { useReportSafeguardingConcern } from "@/hooks/safeguarding"
import { useStudentSupportSettings } from "@/hooks/studentSupportSettings"
import type {
  ApiResult,
  SafeguardingConcernCategory,
  SafeguardingConcernReceiptI,
} from "@/api/safeguarding.api"
import {
  EmergencyBanner,
  FormField,
  SafeguardingAccessGate,
} from "./components"
import {
  concernCategories,
  formatDateTime,
  inputClass,
  labelFromCode,
  textareaClass,
  toLocalDateTimeInput,
} from "./utils"

function ReportConcernForm() {
  const schoolId = useSchoolId()
  const { students, isLoading } = useAllSchoolStudents(schoolId)
  const mutation = useReportSafeguardingConcern()
  const { settings } = useStudentSupportSettings(schoolId)
  const [receipt, setReceipt] = useState<SafeguardingConcernReceiptI>()
  const [studentId, setStudentId] = useState("")
  const [category, setCategory] = useState<SafeguardingConcernCategory>("Other")
  const [incidentAt, setIncidentAt] = useState(toLocalDateTimeInput(new Date()))
  const [location, setLocation] = useState("")
  const [summary, setSummary] = useState("")
  const [details, setDetails] = useState("")
  const [ownWords, setOwnWords] = useState("")
  const [danger, setDanger] = useState(false)
  const [emergencyContacted, setEmergencyContacted] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    mutation.mutate(
      {
        schoolId,
        studentId,
        category,
        incidentAtUtc: new Date(incidentAt).toISOString(),
        incidentLocation: location || undefined,
        concernSummary: summary,
        concernDetails: details,
        learnersOwnWords: ownWords || undefined,
        immediateDanger: danger,
        emergencyServicesContacted: emergencyContacted,
      },
      {
        onSuccess: (value) =>
          setReceipt((value as ApiResult<SafeguardingConcernReceiptI>).value),
      }
    )
  }

  if (receipt)
    return (
      <div className="space-y-6">
        <PageHeader
          title="Concern submitted"
          description="The safeguarding team has received the record."
          icon={<CheckCircle2 className="size-5 text-emerald-700" />}
          iconBg="bg-emerald-50"
        />
        <Card className="mx-auto max-w-2xl">
          <CardContent className="py-10 text-center">
            <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
            <h2 className="mt-4 text-xl font-semibold">
              Secure receipt {receipt.caseNumber}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Submitted {formatDateTime(receipt.reportedAtUtc)}. Case details
              are now restricted to authorised safeguarding staff.
            </p>
            {receipt.immediateDanger && (
              <p className="mt-4 font-medium text-red-800">
                If danger remains immediate, {settings?.emergencyPhoneNumber
                  ? `call ${settings.emergencyServicesName} on ${settings.emergencyPhoneNumber}`
                  : `contact ${settings?.emergencyServicesName ?? "local emergency services"}`}.
                {" "}{settings?.emergencyGuidance}
              </p>
            )}
            <Button
              className="mt-6"
              variant="outline"
              onClick={() => {
                setReceipt(undefined)
                setStudentId("")
                setSummary("")
                setDetails("")
                setOwnWords("")
              }}
            >
              Report another concern
            </Button>
          </CardContent>
        </Card>
      </div>
    )

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Report a ${settings?.safeguardingName?.toLowerCase() ?? "safeguarding"} concern`}
        description="Record what you saw or were told. Submit facts promptly; do not investigate."
        icon={<ShieldAlert className="size-5 text-red-700" />}
        iconBg="bg-red-50"
      />
      <EmergencyBanner />
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Concern details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={submit}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Learner">
                <select
                  required
                  className={inputClass}
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
              <FormField label="Concern category">
                <select
                  className={inputClass}
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as SafeguardingConcernCategory)
                  }
                >
                  {concernCategories.map((value) => (
                    <option key={value} value={value}>
                      {labelFromCode(value)}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="When did it happen?">
                <input
                  className={inputClass}
                  required
                  type="datetime-local"
                  value={incidentAt}
                  onChange={(e) => setIncidentAt(e.target.value)}
                />
              </FormField>
              <FormField label="Location">
                <input
                  className={inputClass}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where the concern arose"
                />
              </FormField>
            </div>
            <FormField
              label="Brief factual summary"
              hint="A concise description for safeguarding triage."
            >
              <input
                className={inputClass}
                required
                maxLength={300}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </FormField>
            <FormField
              label="What did you observe or what were you told?"
              hint="Use the learner's exact words where possible. Avoid assumptions or leading questions."
            >
              <textarea
                className={textareaClass}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </FormField>
            <FormField label="Learner's own words (optional)">
              <textarea
                className={textareaClass}
                value={ownWords}
                onChange={(e) => setOwnWords(e.target.value)}
              />
            </FormField>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-950">
                <Checkbox
                  checked={danger}
                  onCheckedChange={(v) => setDanger(v === true)}
                />
                Immediate danger or urgent safety risk
              </label>
              <label className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium">
                <Checkbox
                  checked={emergencyContacted}
                  onCheckedChange={(v) => setEmergencyContacted(v === true)}
                />
                Emergency services have been contacted
              </label>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={mutation.isPending || !studentId}
              >
                {mutation.isPending
                  ? "Submitting securely…"
                  : "Submit concern securely"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ReportConcernPage() {
  return (
    <SafeguardingAccessGate require="submit">
      <ReportConcernForm />
    </SafeguardingAccessGate>
  )
}
