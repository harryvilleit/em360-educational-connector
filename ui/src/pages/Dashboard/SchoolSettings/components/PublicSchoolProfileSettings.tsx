import PublicSchoolPageSettings, {
  type PublicSchoolPageDraft as Draft,
} from "./PublicSchoolPageSettings"
import { useState } from "react"
import { LoaderCircle } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import SchoolEnquiries from "./SchoolEnquiries"
import SchoolPricingSettings from "./SchoolPricingSettings"
import SchoolGallerySettings from "./SchoolGallerySettings"
import SchoolFacilitiesSettings from "./SchoolFacilitiesSettings"
import {
  useAddSchoolFacility,
  useAddSchoolGalleryImages,
  useDeleteSchoolFacility,
  useDeleteSchoolGalleryImage,
  useSchoolPublicProfileSettings,
  useUpdateSchoolPublicProfile,
} from "@/hooks/publicSchools"
import { type SchoolPublicProfileSettings } from "@/types/public-schools"

const emptyDraft: Draft = {
  description: "",
  tagline: "",
  schoolLevels: [],
  websiteUrl: "",
  establishedYear: "",
  admissionsOpen: false,
  programs: [],
}

function draftFromProfile(data: SchoolPublicProfileSettings): Draft {
  return {
    description: data.description,
    tagline: data.tagline,
    schoolLevels:
      data.schoolLevels?.length > 0
        ? data.schoolLevels
        : data.schoolLevel
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
    websiteUrl: data.websiteUrl ?? "",
    establishedYear: data.establishedYear?.toString() ?? "",
    admissionsOpen: data.admissionsOpen,
    programs: data.programs.map((program) => program.name),
  }
}

export default function PublicSchoolProfileSettings() {
  const schoolId = useSchoolId()
  const [section, setSection] = useState("profile")
  const { data, isPending, error } = useSchoolPublicProfileSettings(schoolId)
  const [draftState, setDraftState] = useState<{
    schoolId: string
    value: Draft
  }>({ schoolId: "", value: emptyDraft })
  const [facilityName, setFacilityName] = useState("")
  const [pendingProgram, setPendingProgram] = useState("")
  const [programError, setProgramError] = useState("")
  const [facilityImage, setFacilityImage] = useState<File | null>(null)
  const updateProfile = useUpdateSchoolPublicProfile(schoolId)
  const addFacility = useAddSchoolFacility(schoolId)
  const deleteFacility = useDeleteSchoolFacility(schoolId)
  const addGallery = useAddSchoolGalleryImages(schoolId)
  const deleteGallery = useDeleteSchoolGalleryImage(schoolId)

  const draft =
    data && draftState.schoolId !== data.schoolId
      ? draftFromProfile(data)
      : draftState.value

  const updateDraft = (update: (current: Draft) => Draft) =>
    setDraftState((current) => {
      const value =
        data && current.schoolId !== data.schoolId
          ? draftFromProfile(data)
          : current.value
      return {
        schoolId: data?.schoolId ?? schoolId,
        value: update(value),
      }
    })

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    await updateProfile.mutateAsync({
      description: draft.description,
      tagline: draft.tagline,
      schoolLevels: draft.schoolLevels,
      schoolLevel: draft.schoolLevels[0] ?? "",
      websiteUrl: draft.websiteUrl || null,
      establishedYear: draft.establishedYear
        ? Number(draft.establishedYear)
        : null,
      admissionsOpen: draft.admissionsOpen,
      programs: draft.programs.map((value) => value.trim()).filter(Boolean),
    })
  }

  async function submitFacility(event: React.FormEvent) {
    event.preventDefault()
    if (!facilityImage || !facilityName.trim()) return
    await addFacility.mutateAsync({
      name: facilityName.trim(),
      image: facilityImage,
    })
    setFacilityName("")
    setFacilityImage(null)
    const input = document.getElementById(
      "facility-image"
    ) as HTMLInputElement | null
    if (input) input.value = ""
  }

  if (isPending) {
    return (
      <div className="flex justify-center py-24">
        <LoaderCircle className="size-6 animate-spin text-blue-600" />
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error?.message || "Public profile settings could not be loaded."}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <nav
        aria-label="Public profile settings"
        className="flex flex-wrap gap-x-6 border-b border-slate-200"
      >
        {["profile", "gallery", "facilities", "pricing", "enquiries"].map(
          (item) => (
            <button
              key={item}
              type="button"
              aria-current={section === item ? "page" : undefined}
              onClick={() => setSection(item)}
              className={`border-b-2 px-1 py-3 text-sm font-semibold capitalize ${section === item ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
            >
              {item}
            </button>
          )
        )}
      </nav>
      {section === "enquiries" && (
        <SchoolEnquiries key={schoolId} schoolId={schoolId} />
      )}
      {section === "pricing" && (
        <SchoolPricingSettings key={schoolId} schoolId={schoolId} />
      )}
      <div hidden={section !== "profile"}>
        <PublicSchoolPageSettings
          schoolId={schoolId}
          countryCode={data.countryCode}
          slug={data.slug}
          draft={draft}
          updateDraft={updateDraft}
          pendingProgram={pendingProgram}
          setPendingProgram={setPendingProgram}
          programError={programError}
          setProgramError={setProgramError}
          isSaving={updateProfile.isPending}
          onSubmit={saveProfile}
        />
      </div>

      <div hidden={section !== "facilities"}>
        <SchoolFacilitiesSettings
          facilities={data.facilities}
          facilityName={facilityName}
          facilityImage={facilityImage}
          isAdding={addFacility.isPending}
          onNameChange={setFacilityName}
          onImageChange={setFacilityImage}
          onSubmit={submitFacility}
          onDeleteFacility={deleteFacility.mutate}
        />
      </div>

      <div hidden={section !== "gallery"}>
        <SchoolGallerySettings
          galleryImages={data.galleryImages}
          isUploading={addGallery.isPending}
          onAddImages={addGallery.mutate}
          onDeleteImage={deleteGallery.mutate}
        />
      </div>
    </div>
  )
}
