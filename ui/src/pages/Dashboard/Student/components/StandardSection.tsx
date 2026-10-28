import { useState } from "react"
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Religion, StandardSectionProps } from "@/types/student"
import { Textarea } from "@/components/ui/textarea"
import { FieldError } from "./FieldError"

export function StandardSection({
  admissionDate,
  onAdmissionDateChange,
  historyAverage,
  onHistoryAverageChange,
  religion,
  religionOther,
  homeAddress,
  previousSchool,
  historySession,
  historyTerm,
  historyClass,
  historyLeaving,
  errors,
  clearError,
  onReligionChange,
  onReligionOtherChange,
  onHomeAddressChange,
  onPreviousSchoolChange,
  onHistorySessionChange,
  onHistoryTermChange,
  onHistoryClassChange,
  onHistoryLeavingChange,
  onSave,
  onBack,
}: StandardSectionProps) {
  const [isEditingOtherReligion, setIsEditingOtherReligion] = useState(
    () => religion === "Other" && !religionOther,
  )

  return (
    <div className="space-y-6 px-4 pb-6 sm:px-6">
      <label className="block space-y-1.5 text-sm font-medium text-gray-700">
        Admission Date
        <Input
          aria-label="Admission Date"
          type="date"
          value={admissionDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => onAdmissionDateChange(e.target.value)}
        />
      </label>
      {/* Personal Details */}
      <div>
        <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Personal Details
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Religion
            </Label>
            {religion === "Other" && !isEditingOtherReligion ? (
              <div className="relative">
                <Input
                  value={religionOther}
                  readOnly
                  placeholder="Please specify religion"
                  className="rounded-md border-gray-200 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingOtherReligion(true)}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Edit religion"
                >
                  <Pencil className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <Select
                  value={religion}
                  onValueChange={(v) => {
                    onReligionChange(v as Religion)
                    setIsEditingOtherReligion(v === "Other")
                  }}
                >
                  <SelectTrigger className="w-full rounded-md border-gray-200">
                    <SelectValue placeholder="Select religion (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Christianity", "Islam", "Traditional", "Other"].map(
                      (r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                {religion === "Other" && (
                  <Input
                    autoFocus
                    value={religionOther}
                    onChange={(e) => onReligionOtherChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && religionOther.trim()) {
                        e.preventDefault()
                        setIsEditingOtherReligion(false)
                      }
                    }}
                    placeholder="Type religion and press Enter"
                    className="rounded-md border-gray-200"
                  />
                )}
              </>
            )}
          </div>

          {/* Home Address */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Home Address <span className="text-red-500">*</span>
            </Label>
            <Input
              value={homeAddress}
              onChange={(e) => {
                onHomeAddressChange(e.target.value)
                clearError("homeAddress")
              }}
              placeholder="Student's home address"
              className={`rounded-md h-11 ${errors.homeAddress ? "border-red-400" : "border-gray-200"}`}
            />
            <FieldError message={errors.homeAddress} />
          </div>
        </div>
      </div>

      {/* Academic History */}
      <div>
        <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Academic History{" "}
          <span className="font-normal text-gray-400 normal-case">
            (optional — add one record)
          </span>
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Previous School */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Previous School
            </Label>
            <Input
              value={previousSchool}
              onChange={(e) => onPreviousSchoolChange(e.target.value)}
              placeholder="Previous school name (optional)"
              className="rounded-md border-gray-200 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Last Class
            </Label>
            <Input
              value={historyClass}
              onChange={(e) => onHistoryClassChange(e.target.value)}
              placeholder="e.g. JSS 2"
              className="rounded-md border-gray-200 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Last Session
            </Label>
            <Input
              value={historySession}
              onChange={(e) => onHistorySessionChange(e.target.value)}
              placeholder="e.g. 2023/2024"
              className="rounded-md border-gray-200 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">Term</Label>
            <Input
              value={historyTerm}
              onChange={(e) => onHistoryTermChange(e.target.value)}
              placeholder="e.g. First Term"
              className="rounded-md border-gray-200 h-11"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-sm font-medium text-gray-700">
              Reason For Leaving
            </Label>
            <Textarea
              value={historyLeaving}
              onChange={(e) => onHistoryLeavingChange(e.target.value)}
              placeholder="e.g. Relocation"
              className="rounded-md border-gray-200 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <label className="block space-y-1.5 text-sm font-medium text-gray-700">
        Previous Average (%)
        <Input
          aria-label="Previous Average"
          type="number"
          min="0"
          max="100"
          value={historyAverage}
          onChange={(e) => onHistoryAverageChange(e.target.value)}
        />
      </label>
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full rounded-md border-gray-200 sm:w-auto"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={onSave}
          className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
        >
          Continue
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
