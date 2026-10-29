import { useEffect, useRef, useState } from "react"
import {
  Eye,
  FileText,
  Link2,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
  Video,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getFileUploadLimit,
  getMaterialUploadLimitLabel,
  isExtensionAllowedByUploadPolicy,
  type FileUploadPolicyI,
  uploadFileAndGetUrl,
} from "@/api/files.api"
import { useFileUploadPolicy } from "@/hooks/files"
import type { UploadRequestOptions } from "@/api/upload-request"
import type { LmsLessonMaterial } from "@/types/elearning"
import { cn } from "@/lib/utils"
import LessonMediaPreviewModal, {
  type LessonMediaPreview,
} from "./LessonMediaPreviewModal"

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "zip",
  "txt",
  "csv",
  "rtf",
])

const ACCEPT = [
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.zip,.txt,.csv,.rtf",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/zip",
  "text/plain",
  "text/csv",
  "application/rtf",
].join(",")

const ALLOWED_TYPES_HINT =
  "PDF, Word, Excel, PowerPoint, JPG/PNG/GIF/WebP, ZIP, TXT, CSV, and other common files"

function getAllowedMaterialExtensions(policy: FileUploadPolicyI | undefined) {
  if (!policy?.allowedExtensions?.length) return undefined

  const extensions = policy.allowedExtensions
    .map((extension) => extension.replace(/^\./, "").toLowerCase())
    .filter((extension) => ALLOWED_EXTENSIONS.has(extension))

  return extensions.length > 0 ? extensions : undefined
}

export type LessonMaterialUploadResult = {
  url: string
  fileName?: string
  fileSizeBytes?: number
  contentType?: string
}

export type RecoverableMaterial = LessonMaterialUploadResult & {
  id: string
  fileName: string
  dateCreatedUtc: string
}

type LessonMaterialsUploadFieldProps = {
  materials: LmsLessonMaterial[]
  onChange: (materials: LmsLessonMaterial[]) => void
  uploadFile?: (
    file: File,
    options?: UploadRequestOptions
  ) => Promise<LessonMaterialUploadResult>
  onUploadingChange?: (uploading: boolean) => void
  uploadPolicy?: FileUploadPolicyI
  loadDefaultUploadPolicy?: boolean
  sectionId?: string
  loadAvailable?: () => Promise<RecoverableMaterial[]>
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function titleFromFileName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
}

function materialTypeFromFile(file: File): LmsLessonMaterial["type"] {
  if (file.type === "application/pdf" || file.name.endsWith(".pdf"))
    return "pdf"
  if (file.type.startsWith("video/")) return "video"
  return "document"
}

function MaterialIcon({ type }: { type: LmsLessonMaterial["type"] }) {
  if (type === "video")
    return <Video className="size-5 shrink-0 text-purple-600" />
  if (type === "link")
    return <Link2 className="size-5 shrink-0 text-blue-600" />
  return <FileText className="size-5 shrink-0 text-red-600" />
}

function materialTypeLabel(type: LmsLessonMaterial["type"]) {
  switch (type) {
    case "pdf":
      return "PDF"
    case "video":
      return "Video"
    case "link":
      return "Link"
    default:
      return "Document"
  }
}

export default function LessonMaterialsUploadField({
  materials,
  onChange,
  uploadFile,
  onUploadingChange,
  uploadPolicy: providedUploadPolicy,
  loadDefaultUploadPolicy = true,
  sectionId,
  loadAvailable,
}: LessonMaterialsUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [activeUpload, setActiveUpload] = useState<{
    fileName: string
    progress: number
  } | null>(null)
  const [preview, setPreview] = useState<LessonMediaPreview | null>(null)
  const [available, setAvailable] = useState<RecoverableMaterial[]>([])
  const [availableLoading, setAvailableLoading] = useState(false)
  const [availableError, setAvailableError] = useState("")
  const [refresh, setRefresh] = useState(0)
  const loaderRef = useRef(loadAvailable)
  loaderRef.current = loadAvailable

  useEffect(() => {
    if (!sectionId || !loaderRef.current) return
    let cancelled = false
    setAvailableLoading(true)
    setAvailableError("")
    void loaderRef.current().then((items) => {
      if (!cancelled) setAvailable(items)
    }).catch((error) => {
      if (!cancelled) setAvailableError(
        error instanceof Error ? error.message : "Could not load previous uploads."
      )
    }).finally(() => {
      if (!cancelled) setAvailableLoading(false)
    })
    return () => { cancelled = true }
  }, [sectionId, refresh])
  const uploadPolicyQuery = useFileUploadPolicy({
    enabled: loadDefaultUploadPolicy,
  })
  const uploadPolicy = providedUploadPolicy ?? uploadPolicyQuery.data?.value
  const uploadLimitLabel = getMaterialUploadLimitLabel(uploadPolicy)
  const allowedMaterialExtensions = getAllowedMaterialExtensions(uploadPolicy)
  const allowedTypesHint = allowedMaterialExtensions
    ? allowedMaterialExtensions
        .map((extension) => extension.toUpperCase())
        .join(", ")
    : ALLOWED_TYPES_HINT
  const acceptedFileTypes = allowedMaterialExtensions
    ? allowedMaterialExtensions.map((extension) => `.${extension}`).join(",")
    : ACCEPT

  useEffect(() => {
    onUploadingChange?.(uploadingCount > 0)
  }, [onUploadingChange, uploadingCount])

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
      if (
        !ALLOWED_EXTENSIONS.has(extension) ||
        !isExtensionAllowedByUploadPolicy(extension, uploadPolicy)
      ) {
        toast.error(`${file.name}: only ${allowedTypesHint} are allowed`)
        return false
      }
      const uploadLimit = getFileUploadLimit(file, uploadPolicy)
      if (uploadLimit && file.size > uploadLimit.maxSizeBytes) {
        toast.error(
          `${file.name}: this file must be ${uploadLimit.label} or smaller`
        )
        return false
      }
      return true
    })
    if (list.length === 0) return

    setUploadingCount((c) => c + list.length)
    const uploaded: LmsLessonMaterial[] = []

    for (const file of list) {
      try {
        setActiveUpload({ fileName: file.name, progress: 0 })
        const uploadOptions: UploadRequestOptions = {
          onProgress: (progress) =>
            setActiveUpload({ fileName: file.name, progress }),
        }
        const result = uploadFile
          ? await uploadFile(file, uploadOptions)
          : { url: await uploadFileAndGetUrl(file, uploadOptions) }
        uploaded.push({
          id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: titleFromFileName(file.name) || file.name,
          type: materialTypeFromFile(file),
          url: result.url,
          fileName: result.fileName ?? file.name,
          fileSize: formatFileSize(file.size),
          fileSizeBytes: result.fileSizeBytes ?? file.size,
          contentType: result.contentType ?? file.type,
        })
        toast.success(`${file.name} uploaded`)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : `Failed to upload ${file.name}`
        )
      } finally {
        setUploadingCount((c) => Math.max(0, c - 1))
      }
    }

    setActiveUpload(null)

    if (uploaded.length > 0) {
      onChange([...materials, ...uploaded])
      setRefresh((count) => count + 1)
    }
  }

  const updateMaterial = (id: string, patch: Partial<LmsLessonMaterial>) => {
    onChange(materials.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  const removeMaterial = (id: string) => {
    onChange(materials.filter((m) => m.id !== id))
  }

  return (
    <div className="space-y-3">
      <Label>Attach materials to this lesson</Label>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          void addFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
          dragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100/80"
        )}
      >
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
          {uploadingCount > 0 ? (
            <Loader2 className="size-5 animate-spin text-blue-600" />
          ) : (
            <Upload className="size-5 text-gray-500" />
          )}
        </div>
        <p className="text-sm font-medium text-gray-800">
          {uploadingCount > 0
            ? `Uploading ${uploadingCount} file${uploadingCount > 1 ? "s" : ""}…`
            : "Drag & drop files here, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {allowedTypesHint} · maximum {uploadLimitLabel}
        </p>
        {activeUpload && (
          <div className="mx-auto mt-4 max-w-sm" aria-live="polite">
            <div className="mb-1 flex items-center justify-between gap-3 text-xs text-gray-600">
              <span className="truncate">{activeUpload.fileName}</span>
              <span className="shrink-0">
                {activeUpload.progress < 100
                  ? `${activeUpload.progress}%`
                  : "Processing…"}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-[width] duration-200"
                style={{ width: `${activeUpload.progress}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Keep this page open while the upload completes.
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedFileTypes}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {sectionId && loadAvailable && (
        <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Uploads from this section not saved to a lesson</p>
            <Button type="button" variant="outline" size="sm"
              disabled={availableLoading}
              onClick={() => setRefresh((count) => count + 1)}>
              <RefreshCw className="mr-1 size-3.5" /> Refresh
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Reuse an uploaded file within 24 hours by adding it to this lesson and saving.
          </p>
          {availableError && <p role="alert" className="text-xs text-red-600">{availableError}</p>}
          {availableLoading && <p className="text-xs text-muted-foreground">Loading uploads…</p>}
          {available.filter((item) => !materials.some((m) => m.url === item.url)).map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 rounded-md bg-white p-2 text-xs">
              <span className="min-w-0 truncate" title={item.fileName}>{item.fileName}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => {
                onChange([...materials, {
                  id: item.id,
                  title: titleFromFileName(item.fileName) || item.fileName,
                  type: item.fileName.toLowerCase().endsWith(".pdf") ? "pdf" : "document",
                  url: item.url,
                  fileName: item.fileName,
                  fileSizeBytes: item.fileSizeBytes,
                  fileSize: item.fileSizeBytes ? formatFileSize(item.fileSizeBytes) : undefined,
                  contentType: item.contentType,
                }])
              }}>Reuse</Button>
            </div>
          ))}
        </div>
      )}

      {materials.length > 0 && (
        <ul className="space-y-2">
          {materials.map((material) => (
            <li
              key={material.id}
              className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                  <MaterialIcon type={material.type} />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">
                        {[
                          material.fileName,
                          material.fileSize,
                          materialTypeLabel(material.type),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {material.url && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-blue-600"
                          onClick={() =>
                            setPreview({
                              title:
                                material.title ||
                                material.fileName ||
                                "Material",
                              url: material.url!,
                              kind:
                                material.type === "pdf"
                                  ? "pdf"
                                  : material.type === "video"
                                    ? "video"
                                    : "document",
                              fileName: material.fileName,
                            })
                          }
                          aria-label="Preview file"
                        >
                          <Eye className="size-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-red-600"
                        onClick={() => removeMaterial(material.id)}
                        aria-label="Remove file"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Material name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      className="h-9 text-sm"
                      value={material.title}
                      onChange={(e) =>
                        updateMaterial(material.id, { title: e.target.value })
                      }
                      placeholder="Name for this material"
                      required
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <LessonMediaPreviewModal
        open={!!preview}
        onClose={() => setPreview(null)}
        media={preview}
      />
    </div>
  )
}
