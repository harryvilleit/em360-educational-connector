import type { FormEvent } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { SchoolFacility } from "@/types/public-schools"
import Field from "./Field"
import SettingsCard from "./SettingsCard"

type SchoolFacilitiesSettingsProps = {
  facilities: SchoolFacility[]
  facilityName: string
  facilityImage: File | null
  isAdding: boolean
  onNameChange: (name: string) => void
  onImageChange: (image: File | null) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onDeleteFacility: (facilityId: string) => void
}

export default function SchoolFacilitiesSettings({
  facilities,
  facilityName,
  facilityImage,
  isAdding,
  onNameChange,
  onImageChange,
  onSubmit,
  onDeleteFacility,
}: SchoolFacilitiesSettingsProps) {
  return (
    <SettingsCard
      title="Facilities"
      description="Each facility requires one image and is displayed in the public facilities slider."
    >
      <form
        onSubmit={onSubmit}
        className="grid gap-3 rounded-xl border border-gray-200 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <Field
          label="Facility name"
          required
          value={facilityName}
          onChange={onNameChange}
          placeholder="Science laboratory"
        />
        <label className="space-y-1.5 text-sm font-medium text-gray-800">
          Facility image
          <Input
            id="facility-image"
            type="file"
            required
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => onImageChange(event.target.files?.[0] ?? null)}
          />
        </label>
        <Button
          type="submit"
          disabled={isAdding || !facilityImage || !facilityName.trim()}
        >
          <Plus className="size-4" /> Add
        </Button>
      </form>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((facility) => (
          <article
            key={facility.id}
            className="overflow-hidden rounded-xl border border-gray-200"
          >
            <img
              src={facility.imageUrl}
              alt={facility.name}
              className="aspect-[6/5] w-full object-cover"
            />
            <div className="flex items-center justify-between gap-2 p-3">
              <span className="truncate text-sm font-semibold">
                {facility.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600"
                onClick={() => onDeleteFacility(facility.id)}
                aria-label={`Delete ${facility.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </SettingsCard>
  )
}
