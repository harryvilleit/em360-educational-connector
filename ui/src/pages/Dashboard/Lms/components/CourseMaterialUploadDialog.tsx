import { useEffect, useMemo, useRef, useState } from "react"
import { FileArchive, FileText, Loader2, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import {
  getFileUploadLimit,
  getMaterialUploadLimitLabel,
  isExtensionAllowedByUploadPolicy,
  uploadFileAndGetUrl,
} from "@/api/files.api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUpdateLesson } from "@/hooks/lesson"
import { useFileUploadPolicy } from "@/hooks/files"
import type {
  LmsCourseModule,
  LmsLesson,
  LmsLessonMaterial,
} from "@/types/elearning"
import { cn } from "@/lib/utils"

const ALLOWED_EXTENSION =
  /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|gif|webp|zip|txt|csv|rtf)$/i
const ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.zip,.txt,.csv,.rtf"

type LessonChoice = {
  lesson: LmsLesson
  moduleTitle: string
}

type CourseMaterialUploadDialogProps = {
  open: boolean
  onClose: () => void
  courseId: string
  modules: LmsCourseModule[]
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function materialType(file: File): LmsLessonMaterial["type"] {
  if (/\.pdf$/i.test(file.name)) return "pdf"
  return "document"
}

function fileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

export default function CourseMaterialUploadDialog({
  open,
  onClose,
  courseId,
  modules,
}: CourseMaterialUploadDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [lessonId, setLessonId] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    current: number
    total: number
    fileName: string
    percentage: number
  } | null>(null)
  const uploadPolicyQuery = useFileUploadPolicy()
  const uploadPolicy = uploadPolicyQuery.data?.value
  const uploadLimitLabel = getMaterialUploadLimitLabel(uploadPolicy)
  const { updateLessonAsync } = useUpdateLesson()

  const lessons = useMemo<LessonChoice[]>(
    () =>
      modules.flatMap((module) =>
        module.lessons.map((lesson) => ({
          lesson,
          moduleTitle: module.title,
        }))
      ),
    [modules]
  )

  useEffect(() => {
    if (!open) return
    setLessonId(lessons[0]?.lesson.id ?? "")
    setFiles([])
  }, [lessons, open])

  const addFiles = (incoming: FileList | File[]) => {
    const accepted: File[] = []
    for (const file of Array.from(incoming)) {
      const extension = file.name.includes(".")
        ? `.${file.name.split(".").pop()?.toLowerCase()}`
        : ""
      if (
        !ALLOWED_EXTENSION.test(file.name) ||
        !isExtensionAllowedByUploadPolicy(extension, uploadPolicy)
      ) {
        toast.error(`${file.name}: this file type is not supported`)
        continue
      }
      const uploadLimit = getFileUploadLimit(file, uploadPolicy)
      if (uploadLimit && file.size > uploadLimit.maxSizeBytes) {
        toast.error(
          `${file.name}: this file must be ${uploadLimit.label} or smaller`
        )
        continue
      }
      accepted.push(file)
    }

    setFiles((current) => {
      const existing = new Set(current.map(fileKey))
      return [
        ...current,
        ...accepted.filter((file) => !existing.has(fileKey(file))),
      ]
    })
  }

  const save = async () => {
    const selected = lessons.find((item) => item.lesson.id === lessonId)?.lesson
    if (!selected) {
      toast.error("Select the lesson that should receive these materials")
      return
    }
    if (files.length === 0) {
      toast.error("Select at least one material")
      return
    }

    setUploading(true)
    try {
      const uploaded: LmsLessonMaterial[] = []
      for (const [index, file] of files.entries()) {
        setUploadProgress({
          current: index + 1,
          total: files.length,
          fileName: file.name,
          percentage: 0,
        })
        const url = await uploadFileAndGetUrl(file, {
          onProgress: (percentage) =>
            setUploadProgress({
              current: index + 1,
              total: files.length,
              fileName: file.name,
              percentage,
            }),
        })
        uploaded.push({
          id: `mat-${Date.now()}-${uploaded.length}`,
          title: file.name.replace(/\.[^.]+$/, ""),
          type: materialType(file),
          url,
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          fileSizeBytes: file.size,
          contentType: file.type,
        })
      }

      const materials = [...(selected.materials ?? []), ...uploaded]
      await updateLessonAsync({
        id: selected.id,
        courseId,
        title: selected.title,
        shortDescription: selected.description ?? "",
        durationInMinutes: selected.durationMinutes ?? 0,
        sortOrder: selected.order,
        videoUrl: selected.contentUrl ?? "",
        embedUrl: selected.embedUrl ?? "",
        content: selected.htmlContent ?? "",
        materials: materials
          .filter((material) => material.url)
          .map((material) => ({
            fileName: material.fileName ?? material.title,
            fileUrl: material.url!,
          })),
      })

      setFiles([])
      onClose()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Materials could not be uploaded"
      )
    } finally {
      setUploadProgress(null)
      setUploading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && !uploading && onClose()}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add course materials</DialogTitle>
          <DialogDescription>
            Select the lesson where learners should find these resources, then
            upload one or more files.
          </DialogDescription>
        </DialogHeader>

        {lessons.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Add at least one lesson to this course before uploading materials.
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label>Lesson</Label>
              <Select
                value={lessonId}
                onValueChange={setLessonId}
                disabled={uploading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select lesson" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map(({ lesson, moduleTitle }) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {moduleTitle} — {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(event) =>
                event.key === "Enter" && !uploading && inputRef.current?.click()
              }
              onDragOver={(event) => {
                event.preventDefault()
                if (!uploading) setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragOver(false)
                if (!uploading) addFiles(event.dataTransfer.files)
              }}
              onClick={() => !uploading && inputRef.current?.click()}
              className={cn(
                "cursor-pointer rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
                dragOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 bg-gray-50"
              )}
            >
              <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-white shadow-sm">
                {uploading ? (
                  <Loader2 className="size-5 animate-spin text-blue-600" />
                ) : (
                  <Upload className="size-5 text-blue-600" />
                )}
              </div>
              <p className="text-sm font-medium">
                Drag files here or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, ZIP, Word, Excel, PowerPoint, images, TXT and CSV · maximum{" "}
                {uploadLimitLabel}
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept={ACCEPT}
                className="hidden"
                disabled={uploading}
                onChange={(event) => {
                  if (event.target.files) addFiles(event.target.files)
                  event.target.value = ""
                }}
              />
            </div>

            {files.length > 0 && (
              <ul className="max-h-48 space-y-2 overflow-y-auto">
                {files.map((file) => {
                  const Icon = /\.zip$/i.test(file.name)
                    ? FileArchive
                    : FileText
                  return (
                    <li
                      key={fileKey(file)}
                      className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2"
                    >
                      <Icon className="size-4 shrink-0 text-blue-600" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-600"
                        disabled={uploading}
                        onClick={() =>
                          setFiles((current) =>
                            current.filter(
                              (item) => fileKey(item) !== fileKey(file)
                            )
                          )
                        }
                        aria-label={`Remove ${file.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}

            {uploadProgress && (
              <div
                className="rounded-lg border border-blue-100 bg-blue-50 p-3"
                aria-live="polite"
              >
                <div className="flex items-center justify-between gap-3 text-xs text-blue-900">
                  <span className="min-w-0 truncate">
                    Uploading {uploadProgress.current} of {uploadProgress.total}
                    : {uploadProgress.fileName}
                  </span>
                  <span className="shrink-0 font-medium">
                    {uploadProgress.percentage < 100
                      ? `${uploadProgress.percentage}%`
                      : "Processing…"}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-[width] duration-200"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-blue-800">
                  Keep this page open. Slow connections are supported.
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={uploading || lessons.length === 0 || files.length === 0}
            onClick={() => void save()}
          >
            {uploading && <Loader2 className="size-4 animate-spin" />}
            {uploadProgress
              ? uploadProgress.percentage < 100
                ? `Uploading ${uploadProgress.percentage}%`
                : "Processing…"
              : "Add materials"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
