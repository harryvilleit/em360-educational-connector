import { useEffect, useMemo, useState } from "react"
import { Camera, School } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import Field from "./Field"
import { Textarea } from "@/components/ui/textarea"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGeUserAssignedDashboard,
  useGetTimeZones,
  useUpdateSchoolProfile,
  useUpdateSchoolTimeZone,
} from "@/hooks/products"
import SettingsCard from "./SettingsCard"

function readText(value: unknown, ...keys: string[]) {
  if (!value || typeof value !== "object") return ""
  const record = value as Record<string, unknown>
  const match = keys
    .map((key) => record[key])
    .find((item) => typeof item === "string")
  return typeof match === "string" ? match : ""
}

type ProfileDraft = {
  name: string
  description: string
  registrationNumber: string
  email: string
  phoneNumber: string
  address: string
  city: string
  state: string
  lga: string
}

export default function SchoolProfileSettings() {
  const schoolId = useSchoolId()
  const { userDashboard } = useGeUserAssignedDashboard(schoolId)
  const dashboardValue =
    userDashboard && typeof userDashboard === "object"
      ? (userDashboard as Record<string, unknown>).Value
      : undefined
  const schoolData =
    dashboardValue && typeof dashboardValue === "object"
      ? (dashboardValue as Record<string, unknown>).School
      : null

  const serverDraft = useMemo<ProfileDraft>(
    () => ({
      name: readText(schoolData, "Name", "name"),
      description: readText(schoolData, "Description", "description"),
      registrationNumber: readText(
        schoolData,
        "RegistrationNumber",
        "registrationNumber",
      ),
      email: readText(schoolData, "Email", "email"),
      phoneNumber: readText(
        schoolData,
        "PhoneNumber",
        "phoneNumber",
        "Phone",
        "phone",
      ),
      address: readText(schoolData, "Address", "address"),
      city: readText(schoolData, "City", "city"),
      state: readText(schoolData, "State", "state"),
      lga: readText(schoolData, "LGA", "lga"),
    }),
    [schoolData],
  )
  const [draftOverride, setDraftOverride] = useState<{
    schoolId: string
    value: ProfileDraft
  } | null>(null)
  const draft =
    draftOverride?.schoolId === schoolId ? draftOverride.value : serverDraft
  const [logo, setLogo] = useState<File | null>(null)
  const logoPreview = useMemo(
    () => (logo ? URL.createObjectURL(logo) : ""),
    [logo],
  )
  const { updateSchoolProfileAsync, isLoading: savingProfile } =
    useUpdateSchoolProfile()

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview)
    }
  }, [logoPreview])

  const { timeZones, isLoading: timeZonesLoading } = useGetTimeZones()
  const { updateSchoolTimeZoneAsync, isLoading: savingTimeZone } =
    useUpdateSchoolTimeZone()
  const serverTimeZoneId = readText(schoolData, "TimeZoneId", "timeZoneId")
  const [timeZoneDraft, setTimeZoneDraft] = useState<string | null>(null)
  const timeZoneId = timeZoneDraft ?? serverTimeZoneId
  const timeZoneIds = useMemo(
    () => timeZones.map((zone) => zone.Id),
    [timeZones],
  )
  const labels = useMemo(
    () =>
      Object.fromEntries(timeZones.map((zone) => [zone.Id, zone.DisplayName])),
    [timeZones],
  )
  const timeZoneDirty = !!timeZoneId && timeZoneId !== serverTimeZoneId

  function update(field: keyof ProfileDraft, value: string) {
    setDraftOverride((current) => ({
      schoolId,
      value: {
        ...(current?.schoolId === schoolId ? current.value : serverDraft),
        [field]: value,
      },
    }))
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    if (!schoolId) return
    try {
      const response = await updateSchoolProfileAsync({
        schoolId,
        ...draft,
        logo,
      })
      if (response?.IsSuccess) setLogo(null)
    } catch {
      /* The mutation shows the error; retain the user's draft. */
    }
  }

  async function saveTimeZone() {
    if (!schoolId || !timeZoneDirty) return
    try {
      const response = await updateSchoolTimeZoneAsync({ schoolId, timeZoneId })
      if (response?.IsSuccess) setTimeZoneDraft(null)
    } catch {
      /* The mutation shows the error; retain the selected timezone. */
    }
  }

  const serverLogo = readText(schoolData, "LogoUrl", "logoUrl")

  return (
    <div className="space-y-6">
      <SettingsCard
        title="School Profile"
        description="Update the verified contact details and logo shown across portals."
      >
        <form onSubmit={saveProfile} className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {logoPreview || serverLogo ? (
              <img
                src={logoPreview || serverLogo}
                alt="School logo preview"
                className="size-20 rounded-2xl object-cover ring-1 ring-gray-200"
              />
            ) : (
              <span className="flex size-20 items-center justify-center rounded-2xl bg-blue-600">
                <School className="size-9 text-white" />
              </span>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-blue-600">
              <Camera className="size-4" /> Change logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => setLogo(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              inputClassName="border-gray-200 py-5"
              label="School name"
              required
              value={draft.name}
              onChange={(value) => update("name", value)}
            />
            <Field
              inputClassName="border-gray-200 py-5"
              label="Registration number"
              value={draft.registrationNumber}
              onChange={(value) => update("registrationNumber", value)}
            />
            <Field
              inputClassName="border-gray-200 py-5"
              label="Email"
              required
              type="email"
              value={draft.email}
              onChange={(value) => update("email", value)}
            />
            <Field
              inputClassName="border-gray-200 py-5"
              label="Phone"
              value={draft.phoneNumber}
              onChange={(value) => update("phoneNumber", value)}
            />
            <Field
              inputClassName="border-gray-200 py-5"
              label="Address"
              required
              value={draft.address}
              onChange={(value) => update("address", value)}
            />
            <Field
              inputClassName="border-gray-200 py-5"
              label="City"
              value={draft.city}
              onChange={(value) => update("city", value)}
            />
            <Field
              inputClassName="border-gray-200 py-5"
              label="State"
              value={draft.state}
              onChange={(value) => update("state", value)}
            />
            <Field
              inputClassName="border-gray-200 py-5"
              label="LGA"
              value={draft.lga}
              onChange={(value) => update("lga", value)}
            />
          </div>
          <label className="block space-y-1.5 text-sm font-medium text-gray-800">
            Description
            <Textarea
              className="resize-none"
              value={draft.description}
              onChange={(event) => update("description", event.target.value)}
              rows={3}
              maxLength={1000}
            />
          </label>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={savingProfile}
              className="rounded-xl bg-blue-600 px-8 text-white hover:bg-blue-700"
            >
              {savingProfile ? "Saving…" : "Save Profile"}
            </Button>
          </div>
        </form>
      </SettingsCard>

      <SettingsCard
        title="Timezone"
        description="Dates, attendance days and invoice due dates are calculated in this timezone."
      >
        <div className="space-y-4">
          <Combobox
            value={timeZoneId}
            onValueChange={setTimeZoneDraft}
            options={timeZoneIds}
            disabled={timeZonesLoading || timeZoneIds.length === 0}
            placeholder={
              timeZonesLoading ? "Loading timezones…" : "Select a timezone"
            }
            searchPlaceholder="Search timezones…"
            emptyText="No matching timezone."
            renderValue={(value) => (
              <span className="truncate">{labels[value] ?? value}</span>
            )}
            renderOption={(option) => (
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{option}</span>
                <span className="truncate text-xs text-gray-400">
                  {labels[option]}
                </span>
              </span>
            )}
            className="border-gray-200 py-5"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={saveTimeZone}
              disabled={!timeZoneDirty || savingTimeZone}
              className="rounded-xl bg-blue-600 px-8 text-white hover:bg-blue-700"
            >
              {savingTimeZone ? "Saving…" : "Save Timezone"}
            </Button>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}
