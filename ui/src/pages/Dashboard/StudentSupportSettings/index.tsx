import { useState, type FormEvent, type ReactNode } from "react"
import { Globe2, Save, ShieldCheck } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useStudentSupportSettings,
  useUpdateStudentSupportSettings,
} from "@/hooks/studentSupportSettings"
import type {
  SchoolStudentSupportSettingsI,
  StudentSupportFrameworkProfile,
  UpdateSchoolStudentSupportSettingsPayloadI,
} from "@/api/studentSupportSettings.api"

const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
const textareaClass = `${inputClass} h-24 resize-y py-2`

type Draft = Omit<UpdateSchoolStudentSupportSettingsPayloadI, "schoolId">

function initialDraft(settings: SchoolStudentSupportSettingsI): Draft {
  return {
    profile: settings.profile,
    countryCode: settings.countryCode,
    jurisdictionCode: settings.jurisdictionCode,
    learnerSupportName: settings.learnerSupportName,
    learnerSupportLeadTitle: settings.learnerSupportLeadTitle,
    supportRegisterName: settings.supportRegisterName,
    formalAssessmentLabel: settings.formalAssessmentLabel,
    formalPlanLabel: settings.formalPlanLabel,
    safeguardingName: settings.safeguardingName,
    safeguardingLeadTitle: settings.safeguardingLeadTitle,
    deputySafeguardingLeadTitle: settings.deputySafeguardingLeadTitle,
    emergencyServicesName: settings.emergencyServicesName,
    emergencyPhoneNumber: settings.emergencyPhoneNumber,
    emergencyGuidance: settings.emergencyGuidance,
    localPolicyReference: settings.localPolicyReference,
  }
}

function SettingsForm({
  schoolId,
  settings,
}: {
  schoolId: string
  settings: SchoolStudentSupportSettingsI
}) {
  const [draft, setDraft] = useState(() => initialDraft(settings))
  const mutation = useUpdateStudentSupportSettings()
  const disabled = !settings.canConfigure || mutation.isPending
  const field = (name: keyof Draft, value: string) =>
    setDraft((current) => ({ ...current, [name]: value }))

  function applyProfile(profile: StudentSupportFrameworkProfile) {
    if (profile === "UnitedKingdom") {
      setDraft((current) => ({
        ...current,
        profile,
        countryCode: "GB",
        jurisdictionCode: "GB-ENG",
        learnerSupportName: "SEND & Learner Support",
        learnerSupportLeadTitle: "SENCO / Learner Support Lead",
        supportRegisterName: "SEND Register",
        formalAssessmentLabel: "Statutory Assessment",
        formalPlanLabel: "Education, Health and Care Plan",
        safeguardingName: "Safeguarding and Child Protection",
        safeguardingLeadTitle: "Designated Safeguarding Lead (DSL)",
        deputySafeguardingLeadTitle: "Deputy Designated Safeguarding Lead",
        emergencyServicesName: "emergency services",
        emergencyPhoneNumber: "999",
        emergencyGuidance: "Then follow the school's safeguarding procedure.",
      }))
      return
    }
    setDraft((current) => ({
      ...current,
      profile,
      countryCode: current.countryCode === "GB" ? "" : current.countryCode,
      jurisdictionCode:
        current.countryCode && current.countryCode !== "GB"
          ? current.countryCode
          : "INTL",
      learnerSupportName: "Learner Support",
      learnerSupportLeadTitle: "Learner Support Lead",
      supportRegisterName: "Support Register",
      formalAssessmentLabel: "Formal Support Assessment",
      formalPlanLabel: "Individual Support Plan",
      safeguardingName: "Safeguarding and Child Protection",
      safeguardingLeadTitle: "Safeguarding Lead",
      deputySafeguardingLeadTitle: "Deputy Safeguarding Lead",
      emergencyServicesName: "local emergency services",
      emergencyPhoneNumber: "",
      emergencyGuidance:
        "Follow the school's local emergency and child-protection procedure.",
    }))
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    mutation.mutate({ schoolId, ...draft })
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      {!settings.canConfigure && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          These settings are visible to school staff. Only the school owner,
          SuperAdmin, Principal or Vice Principal can change them.
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Country and framework</CardTitle>
          <p className="text-sm text-muted-foreground">
            International uses country-neutral language. UK restores SEND,
            statutory-plan and DSL terminology.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Field label="Framework profile">
            <select
              className={inputClass}
              disabled={disabled}
              value={draft.profile}
              onChange={(event) =>
                applyProfile(event.target.value as StudentSupportFrameworkProfile)
              }
            >
              <option value="International">International</option>
              <option value="UnitedKingdom">United Kingdom</option>
            </select>
          </Field>
          <Field label="Country code" hint="ISO two-letter code, for example NG, KE, ZA or GH.">
            <input
              className={inputClass}
              disabled={disabled}
              maxLength={2}
              required
              value={draft.countryCode}
              onChange={(event) => field("countryCode", event.target.value.toUpperCase())}
            />
          </Field>
          <Field label="Support framework / jurisdiction" hint="Stored on new learner-support referrals.">
            <input
              className={inputClass}
              disabled={disabled}
              maxLength={20}
              required
              value={draft.jurisdictionCode}
              onChange={(event) => field("jurisdictionCode", event.target.value.toUpperCase())}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Learner-support terminology</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <TextField label="Module name" name="learnerSupportName" draft={draft} field={field} disabled={disabled} />
          <TextField label="Lead role title" name="learnerSupportLeadTitle" draft={draft} field={field} disabled={disabled} />
          <TextField label="Support register name" name="supportRegisterName" draft={draft} field={field} disabled={disabled} />
          <TextField label="Formal assessment label" name="formalAssessmentLabel" draft={draft} field={field} disabled={disabled} />
          <TextField label="Formal plan label" name="formalPlanLabel" draft={draft} field={field} disabled={disabled} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Safeguarding terminology and local response</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <TextField label="Module name" name="safeguardingName" draft={draft} field={field} disabled={disabled} />
          <TextField label="Lead role title" name="safeguardingLeadTitle" draft={draft} field={field} disabled={disabled} />
          <TextField label="Deputy role title" name="deputySafeguardingLeadTitle" draft={draft} field={field} disabled={disabled} />
          <TextField label="Emergency service name" name="emergencyServicesName" draft={draft} field={field} disabled={disabled} />
          <Field label="Emergency phone number" hint="Leave blank if the school should not display one universal number.">
            <input
              className={inputClass}
              disabled={disabled}
              maxLength={40}
              value={draft.emergencyPhoneNumber || ""}
              onChange={(event) => field("emergencyPhoneNumber", event.target.value)}
            />
          </Field>
          <Field label="Local policy or authority reference" hint="Policy name, authority or secure internal reference.">
            <input
              className={inputClass}
              disabled={disabled}
              maxLength={500}
              value={draft.localPolicyReference || ""}
              onChange={(event) => field("localPolicyReference", event.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Emergency guidance" hint="Shown anywhere a concern can be reported. Confirm it against local law and school policy.">
              <textarea
                className={textareaClass}
                disabled={disabled}
                required
                value={draft.emergencyGuidance}
                onChange={(event) => field("emergencyGuidance", event.target.value)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {settings.canConfigure && (
        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={disabled}>
            <Save className="size-4" />
            {mutation.isPending ? "Saving…" : "Save local settings"}
          </Button>
        </div>
      )}
    </form>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-gray-700">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  )
}

function TextField({
  label,
  name,
  draft,
  field,
  disabled,
}: {
  label: string
  name: keyof Draft
  draft: Draft
  field: (name: keyof Draft, value: string) => void
  disabled: boolean
}) {
  return (
    <Field label={label}>
      <input
        className={inputClass}
        disabled={disabled}
        maxLength={120}
        required
        value={String(draft[name] || "")}
        onChange={(event) => field(name, event.target.value)}
      />
    </Field>
  )
}

export default function StudentSupportSettingsPage() {
  const schoolId = useSchoolId()
  const { settings, isPending, isError } = useStudentSupportSettings(schoolId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Local student-support settings"
        description="Adapt learner support and safeguarding to your country's terminology, services and emergency procedure."
        icon={<Globe2 className="size-5 text-blue-700" />}
      />
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        EM360 supplies the workflow and secure record. Each school remains
        responsible for confirming its labels, referral bodies, emergency
        number and procedure against local law and policy.
      </div>
      {isPending ? (
        <div className="space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-56 w-full" /></div>
      ) : isError || !settings ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">The local settings could not be loaded.</CardContent></Card>
      ) : (
        <SettingsForm key={`${settings.profile}-${settings.countryCode}-${settings.jurisdictionCode}`} schoolId={schoolId} settings={settings} />
      )}
    </div>
  )
}
