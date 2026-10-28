import { ImagePlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SchoolGalleryImage } from "@/types/public-schools"
import SettingsCard from "./SettingsCard"

type SchoolGallerySettingsProps = {
  galleryImages: SchoolGalleryImage[]
  isUploading: boolean
  onAddImages: (files: File[]) => void
  onDeleteImage: (imageId: string) => void
}

export default function SchoolGallerySettings({
  galleryImages,
  isUploading,
  onAddImages,
  onDeleteImage,
}: SchoolGallerySettingsProps) {
  return (
    <SettingsCard
      title="School gallery"
      description={`Upload up to 10 campus images for the public sidebar slider. ${10 - galleryImages.length} slot(s) remain.`}
    >
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
        <ImagePlus className="size-4" />{" "}
        {isUploading ? "Uploading…" : "Add gallery images"}
        <input
          type="file"
          multiple
          disabled={isUploading || galleryImages.length >= 10}
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []).slice(
              0,
              10 - galleryImages.length
            )
            if (files.length > 0) onAddImages(files)
            event.currentTarget.value = ""
          }}
        />
      </label>
      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
        {galleryImages.map((image) => (
          <div
            key={image.id}
            className="group relative overflow-hidden rounded-xl border border-gray-200"
          >
            <img
              src={image.imageUrl}
              alt={image.caption || "School gallery"}
              className="aspect-[6/5] w-full object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 size-8 opacity-0 transition group-hover:opacity-100"
              onClick={() => onDeleteImage(image.id)}
              aria-label="Delete gallery image"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </SettingsCard>
  )
}
