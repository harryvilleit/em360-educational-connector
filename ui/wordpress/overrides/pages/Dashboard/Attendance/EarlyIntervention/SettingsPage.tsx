// WordPress version: rules can be edited from the saved values, with load errors and retry.
import { type FormEvent, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Save, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useAttendanceInterventionAccess,
  useAttendanceRiskSettings,
  useUpdateAttendanceRiskSettings,
} from "@/hooks/attendanceIntervention"
import type { AttendanceRiskSettingsI } from "@/api/attendanceIntervention.api"
import { DashboardRoutes } from "@/routes"
import { AttendanceInterventionAccessGate, FormField } from "@/pages/Dashboard/Attendance/EarlyIntervention/components"
import { inputClass } from "@/pages/Dashboard/Attendance/EarlyIntervention/utils"

export default function AttendanceInterventionSettingsPage() {
  const navigate = useNavigate()
  const { productId = "" } = useParams()
  const schoolId = useSchoolId()
  const { access } = useAttendanceInterventionAccess(schoolId)
  const { settings, isLoading, isError, refetch } = useAttendanceRiskSettings(schoolId)
  const mutation = useUpdateAttendanceRiskSettings()
  const [draft, setForm] = useState<AttendanceRiskSettingsI>()
  const form = draft ?? settings

  function numberField(name: keyof AttendanceRiskSettingsI, value: string) {
    // Start from the saved rules on the first edit (there is no draft yet).
    setForm((current) => ({ ...(current ?? settings!), [name]: Number(value) }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!form || !access?.canConfigureRules) return
    try {
      await mutation.mutateAsync({ schoolId, ...form })
      setForm(undefined)
    } catch {
      // The mutation shows its own error message; the edits stay in the form.
    }
  }

  return (
    <AttendanceInterventionAccessGate>
      <div className="space-y-6">
        <PageHeader
          title="Early Intervention Risk Rules"
          description="Configure transparent attendance thresholds. Changes affect future calculations and never alter historical attendance records."
          onBack={() => navigate(DashboardRoutes.toAttendanceIntervention(productId))}
          backLabel="Back to Early Intervention"
          icon={<Settings2 className="size-5 text-blue-600" />}
        />
        {!access?.canConfigureRules ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-8 text-center text-sm text-amber-900">
            Only the school owner, SuperAdmin, Principal or Vice Principal can change these rules.
          </div>
        ) : isError ? (
          <div role="alert">
            Risk rules could not be loaded. <Button onClick={() => void refetch()}>Try again</Button>
          </div>
        ) : isLoading || !form ? (
          <p className="py-20 text-center text-sm text-muted-foreground">Loading risk rules…</p>
        ) : (
          <form className="space-y-6" onSubmit={submit}>
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="font-semibold text-gray-900">Assessment window</h2>
              <p className="mt-1 text-sm text-muted-foreground">Only recorded sessions are assessed. A minimum prevents premature alerts.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <NumberField label="Lookback calendar days" value={form.lookbackCalendarDays} min={14} max={180} onChange={(v) => numberField("lookbackCalendarDays", v)} />
                <NumberField label="Minimum marked sessions" value={form.minimumMarkedSessions} min={1} max={120} onChange={(v) => numberField("minimumMarkedSessions", v)} />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="font-semibold text-gray-900">Attendance percentage thresholds</h2>
              <p className="mt-1 text-sm text-muted-foreground">The thresholds must descend from the school target to critical risk.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <NumberField label="School target %" value={form.schoolTargetPercentage} onChange={(v) => numberField("schoolTargetPercentage", v)} />
                <NumberField label="Medium risk below %" value={form.mediumRiskBelowPercentage} onChange={(v) => numberField("mediumRiskBelowPercentage", v)} />
                <NumberField label="High risk below %" value={form.highRiskBelowPercentage} onChange={(v) => numberField("highRiskBelowPercentage", v)} />
                <NumberField label="Critical risk below %" value={form.criticalRiskBelowPercentage} onChange={(v) => numberField("criticalRiskBelowPercentage", v)} />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="font-semibold text-gray-900">Pattern detection</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <RuleToggle checked={form.detectRepeatedLateness} label="Repeated lateness" description="Flag learners who reach the configured late-session count." onChange={(checked) => setForm({ ...form, detectRepeatedLateness: checked })}>
                  <NumberField label="Late-session count" value={form.repeatedLatenessCount} min={1} onChange={(v) => numberField("repeatedLatenessCount", v)} />
                </RuleToggle>
                <RuleToggle checked={form.detectSuddenDecline} label="Sudden decline" description="Compare the current window with the preceding equivalent window." onChange={(checked) => setForm({ ...form, detectSuddenDecline: checked })}>
                  <NumberField label="Percentage-point decline" value={form.suddenDeclinePercentagePoints} min={1} onChange={(v) => numberField("suddenDeclinePercentagePoints", v)} />
                </RuleToggle>
                <RuleToggle checked={form.detectMondayFridayPattern} label="Recurring Monday/Friday absence" description="Highlight repeat edge-of-week absence patterns." onChange={(checked) => setForm({ ...form, detectMondayFridayPattern: checked })}>
                  <NumberField label="Absence count" value={form.recurringDayPatternCount} min={1} onChange={(v) => numberField("recurringDayPatternCount", v)} />
                </RuleToggle>
                <RuleToggle checked={form.detectConsecutiveAbsence} label="Consecutive absence" description="Escalate severity as continuous absence increases." onChange={(checked) => setForm({ ...form, detectConsecutiveAbsence: checked })}>
                  <div className="grid grid-cols-3 gap-2">
                    <NumberField label="Medium" value={form.consecutiveAbsenceMediumCount} min={1} onChange={(v) => numberField("consecutiveAbsenceMediumCount", v)} />
                    <NumberField label="High" value={form.consecutiveAbsenceHighCount} min={2} onChange={(v) => numberField("consecutiveAbsenceHighCount", v)} />
                    <NumberField label="Critical" value={form.consecutiveAbsenceCriticalCount} min={3} onChange={(v) => numberField("consecutiveAbsenceCriticalCount", v)} />
                  </div>
                </RuleToggle>
              </div>
            </section>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={mutation.isPending}><Save className="size-4" />{mutation.isPending ? "Saving…" : "Save risk rules"}</Button>
            </div>
          </form>
        )}
      </div>
    </AttendanceInterventionAccessGate>
  )
}

function NumberField({ label, value, onChange, min = 0, max = 100 }: { label: string; value: number; onChange: (value: string) => void; min?: number; max?: number }) {
  return <FormField label={label}><input className={inputClass} type="number" required min={min} max={max} step="0.1" value={value} onChange={(e) => onChange(e.target.value)} /></FormField>
}

function RuleToggle({ checked, label, description, onChange, children }: { checked: boolean; label: string; description: string; onChange: (checked: boolean) => void; children: React.ReactNode }) {
  return <div className="rounded-xl border border-gray-100 p-4"><label className="flex items-start gap-3"><input type="checkbox" className="mt-1 size-4" checked={checked} onChange={(e) => onChange(e.target.checked)} /><span><span className="block text-sm font-semibold text-gray-900">{label}</span><span className="block text-xs text-muted-foreground">{description}</span></span></label><div className={`mt-4 ${checked ? "" : "pointer-events-none opacity-40"}`}>{children}</div></div>
}
