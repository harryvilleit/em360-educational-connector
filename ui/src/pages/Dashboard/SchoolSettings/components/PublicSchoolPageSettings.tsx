import { publicSiteUrl } from "@/lib/portal-navigation"
import type { FormEvent } from "react"
import { ExternalLink, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HomeRoutes } from "@/routes"
import { countryName } from "@/lib/public-schools"
import { PUBLIC_SCHOOL_LEVELS } from "@/types/public-schools"
import SettingsCard from "./SettingsCard"
import Field from "./Field"

export type PublicSchoolPageDraft = {
  description: string
  tagline: string
  schoolLevels: string[]
  websiteUrl: string
  establishedYear: string
  admissionsOpen: boolean
  programs: string[]
}

type PublicSchoolPageSettingsProps = {
  schoolId: string
  slug?: string | null
  countryCode?: string | null
  draft: PublicSchoolPageDraft
  updateDraft: (
    update: (current: PublicSchoolPageDraft) => PublicSchoolPageDraft
  ) => void
  pendingProgram: string
  setPendingProgram: (value: string) => void
  programError: string
  setProgramError: (value: string) => void
  isSaving: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function PublicSchoolPageSettings({
  schoolId,
  slug,
  countryCode,
  draft,
  updateDraft,
  pendingProgram,
  setPendingProgram,
  programError,
  setProgramError,
  isSaving,
  onSubmit,
}: PublicSchoolPageSettingsProps) {
  const setField = <K extends keyof PublicSchoolPageDraft>(
    key: K,
    value: PublicSchoolPageDraft[K]
  ) => updateDraft((current) => ({ ...current, [key]: value }))

  function addProgram() {
    const name = pendingProgram.trim()
    const error = !name
      ? "Enter a program name"
      : name.length > 160
        ? "Programs cannot exceed 160 characters"
        : draft.programs.length >= 50
          ? "You can add up to 50 programs"
          : draft.programs.some(
                (program) => program.trim().toLowerCase() === name.toLowerCase()
              )
            ? "This program has already been added"
            : ""
    setProgramError(error)
    if (error) return
    updateDraft((current) => ({
      ...current,
      programs: [...current.programs, name],
    }))
    setPendingProgram("")
  }

  const toggleSchoolLevel = (level: string) =>
    updateDraft((current) => ({
      ...current,
      schoolLevels: current.schoolLevels.includes(level)
        ? current.schoolLevels.filter((value) => value !== level)
        : [...current.schoolLevels, level],
    }))

  return (
    <SettingsCard
      title="Public school page"
      description="Every field below is loaded from the database and shown on your public school page."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          Name, logo, address, city, state/LGA, phone and email are managed
          under <strong>School Profile</strong>. Country is managed in the
          school's financial profile and currently resolves to{" "}
          <strong>{countryCode ? countryName(countryCode) : "not set"}</strong>.
        </div>
        {!countryCode?.trim() && (
          <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Set your country to appear in the school directory</p>
            <p className="mt-1">Your public page can be opened by link, but your school will not appear in country listings until a country is saved. Go to <strong>Billing &amp; Plan → School financial profile</strong>, select your country, and save.</p>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Public tagline"
            value={draft.tagline}
            onChange={(value) => setField("tagline", value)}
            maxLength={240}
          />
          <fieldset className="space-y-2 rounded-xl border border-gray-200 p-3">
            <legend className="px-1 text-sm font-medium text-gray-800">
              School levels
            </legend>
            <p className="text-xs text-muted-foreground">
              Select every level offered by the school.
            </p>
            <div className="flex flex-wrap gap-2">
              {PUBLIC_SCHOOL_LEVELS.map((level) => {
                const checked = draft.schoolLevels.includes(level)
                return (
                  <label
                    key={level}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                      checked
                        ? "border-blue-600 bg-blue-50 font-medium text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSchoolLevel(level)}
                      className="size-4 accent-blue-600"
                    />
                    {level}
                  </label>
                )
              })}
            </div>
            {draft.schoolLevels.length === 0 && (
              <p className="text-xs font-medium text-red-600">
                Select at least one school level.
              </p>
            )}
          </fieldset>
          <Field
            label="Website URL"
            type="url"
            value={draft.websiteUrl}
            onChange={(value) => setField("websiteUrl", value)}
          />
          <Field
            label="Established year"
            type="number"
            value={draft.establishedYear}
            onChange={(value) => setField("establishedYear", value)}
          />
        </div>
        <label className="block space-y-1.5 text-sm font-medium text-gray-800">
          About the school
          <Textarea
            rows={6}
            maxLength={5000}
            value={draft.description}
            onChange={(event) => setField("description", event.target.value)}
          />
        </label>
        <div className="space-y-2">
          <label
            htmlFor="settings-program-title"
            className="text-sm font-medium text-gray-800"
          >
            Programs offered
          </label>
          {draft.programs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {draft.programs.map((program, index) => (
                <span
                  key={`${program}-${index}`}
                  className="flex max-w-full items-center gap-2 rounded-full border border-chart-2 bg-chart-2/5 px-3 py-1.5 text-sm"
                >
                  <span className="min-w-0 break-words">{program}</span>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      updateDraft((current) => ({
                        ...current,
                        programs: current.programs.filter(
                          (_, itemIndex) => itemIndex !== index
                        ),
                      }))
                      setProgramError("")
                    }}
                    aria-label={`Remove ${program}`}
                    className="shrink-0 text-destructive"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              id="settings-program-title"
              maxLength={160}
              value={pendingProgram}
              disabled={isSaving}
              aria-invalid={!!programError}
              aria-describedby={
                programError ? "settings-program-error" : undefined
              }
              onChange={(event) => {
                setPendingProgram(event.target.value)
                setProgramError("")
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  addProgram()
                }
              }}
              placeholder="e.g. WAEC, Cambridge IGCSE"
              className="min-w-0 border-chart-2 py-6"
            />
            <Button
              type="button"
              onClick={addProgram}
              disabled={!pendingProgram.trim() || isSaving}
              className="shrink-0 cursor-pointer bg-chart-2 text-white"
            >
              <Plus size={16} /> Add
            </Button>
          </div>
          {programError && (
            <p
              id="settings-program-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {programError}
            </p>
          )}
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm font-medium text-gray-800">
          <input
            type="checkbox"
            checked={draft.admissionsOpen}
            onChange={(event) =>
              setField("admissionsOpen", event.target.checked)
            }
            className="size-4 accent-blue-600"
          />
          Admissions are currently open
        </label>
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <a
              href={publicSiteUrl(HomeRoutes.toSchoolDetail(slug || schoolId))}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="size-4" /> Preview public page
            </a>
          </Button>
          <Button
            type="submit"
            disabled={isSaving || draft.schoolLevels.length === 0}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isSaving ? "Saving…" : "Save public page"}
          </Button>
        </div>
      </form>
    </SettingsCard>
  )
}
