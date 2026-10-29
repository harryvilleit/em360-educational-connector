import { useState } from "react"
import SchoolContentEditor, {
  SchoolRichContent,
} from "@/components/general/SchoolContent"
export default function CoursePublicFields({
  description,
  isPublic,
  onDescriptionChange,
  onVisibilityChange,
  disabled = false,
}: {
  description: string
  isPublic: boolean
  onDescriptionChange: (value: string) => void
  onVisibilityChange: (value: boolean) => void
  disabled?: boolean
}) {
  const [preview, setPreview] = useState(false)
  return (
    <div className="space-y-4">
      <SchoolContentEditor
        label="Course description"
        maxLength={20000}
        value={description}
        onChange={onDescriptionChange}
        disabled={disabled}
      />
      <label className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => onVisibilityChange(e.target.checked)}
          disabled={disabled}
          className="mt-1 size-4 accent-blue-600"
        />
        <span>
          <span className="block text-sm font-semibold text-slate-900">
            Show on public school profile
          </span>
          <span className="text-xs text-slate-600">
            Visitors can see the course name and description. Lessons and
            student information stay private.
          </span>
        </span>
      </label>
      <button
        type="button"
        aria-expanded={preview}
        onClick={() => setPreview(!preview)}
        className="text-sm font-semibold text-blue-600"
      >
        {preview ? "Hide preview" : "Preview description"}
      </button>
      {preview && (
        <div className="rounded-xl border border-slate-200 p-5">
          <SchoolRichContent html={description} />
        </div>
      )}
    </div>
  )
}
