import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AdvancedSectionProps, BloodGroup } from "@/types/student"

export function AdvancedSection({
  behavioralNotes,
  extracurriculars,
  welfareType,
  welfareDate,
  welfareDescription,
  welfareReportedBy,
  onBehavioralNotesChange,
  onExtracurricularsChange,
  onWelfareTypeChange,
  onWelfareDateChange,
  onWelfareDescriptionChange,
  onWelfareReportedByChange,
  bloodGroup,
  genotype,
  allergies,
  chronicConditions,
  disabilities,
  hasSpecialNeeds,
  specialNeedsDesc,
  onBloodGroupChange,
  onGenotypeChange,
  onAllergiesChange,
  onChronicConditionsChange,
  onDisabilitiesChange,
  onHasSpecialNeedsToggle,
  onSpecialNeedsDescChange,
  onSave,
  onBack,
  isSubmitting,
}: AdvancedSectionProps) {
  return (
    <div className="space-y-6 px-4 pb-6 sm:px-6">
      {/* Medical */}
      <div>
        <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Medical Information
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Blood Group
            </Label>
            <Select
              value={bloodGroup}
              onValueChange={(v) => onBloodGroupChange(v as BloodGroup)}
            >
              <SelectTrigger className="w-full rounded-md border-gray-200">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Genotype
            </Label>
            <Select value={genotype} onValueChange={onGenotypeChange}>
              <SelectTrigger className="w-full rounded-md border-gray-200">
                <SelectValue placeholder="Select genotype" />
              </SelectTrigger>
              <SelectContent>
                {["AA", "AS", "SS", "AC", "SC"].map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-sm font-medium text-gray-700">
              Allergies
            </Label>
            <Input
              value={allergies}
              onChange={(e) => onAllergiesChange(e.target.value)}
              placeholder="e.g. Penicillin, Peanuts (optional)"
              className="rounded-md border-gray-200"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-sm font-medium text-gray-700">
              Chronic Conditions
            </Label>
            <Input
              value={chronicConditions}
              onChange={(e) => onChronicConditionsChange(e.target.value)}
              placeholder="e.g. Asthma, Sickle Cell (optional)"
              className="rounded-md border-gray-200"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-sm font-medium text-gray-700">
              Disabilities
            </Label>
            <Input
              value={disabilities}
              onChange={(e) => onDisabilitiesChange(e.target.value)}
              placeholder="e.g. Visual impairment (optional)"
              className="rounded-md border-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Special Needs */}
      <div>
        <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Special Needs
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-label="Student has special needs"
              aria-checked={hasSpecialNeeds}
              onClick={onHasSpecialNeedsToggle}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                hasSpecialNeeds ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  hasSpecialNeeds ? "translate-x-5" : ""
                }`}
              />
            </button>
            <Label className="text-sm font-medium text-gray-700">
              This student has special needs
            </Label>
          </div>
          {hasSpecialNeeds && (
            <Textarea
              value={specialNeedsDesc}
              onChange={(e) => onSpecialNeedsDescChange(e.target.value)}
              placeholder="Describe the special needs and any accommodations required..."
              rows={3}
              className="resize-none rounded-md border-gray-200"
            />
          )}
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold">Welfare & Activities</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            Welfare Type
            <select
              aria-label="Welfare Type"
              className="block w-full rounded-md border p-2"
              value={welfareType}
              onChange={(e) => onWelfareTypeChange(e.target.value)}
            >
              <option value="">No welfare record</option>
              {[
                "Medical",
                "Behavioral",
                "Counseling",
                "Incident",
                "Special Needs",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            Welfare Date
            <Input
              aria-label="Welfare Date"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={welfareDate}
              onChange={(e) => onWelfareDateChange(e.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm sm:col-span-2">
            Welfare Description
            <Textarea
              aria-label="Welfare Description"
              value={welfareDescription}
              onChange={(e) => onWelfareDescriptionChange(e.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm">
            Reported By
            <Input
              aria-label="Reported By"
              value={welfareReportedBy}
              onChange={(e) => onWelfareReportedByChange(e.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm">
            Activities (comma separated)
            <Input
              aria-label="Activities"
              value={extracurriculars}
              onChange={(e) => onExtracurricularsChange(e.target.value)}
            />
          </label>
          <label className="space-y-2 text-sm sm:col-span-2">
            Behavioral Notes
            <Textarea
              aria-label="Behavioral Notes"
              value={behavioralNotes}
              onChange={(e) => onBehavioralNotesChange(e.target.value)}
            />
          </label>
        </div>
      </section>
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full rounded-md border-gray-200 sm:w-auto"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={isSubmitting}
          className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Student"
          )}
        </Button>
      </div>
    </div>
  )
}
