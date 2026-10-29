import SchoolVideoStorageNotice from "./components/SchoolVideoStorageNotice"
import { useEffect, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getVideoStorage } from "@/api/videoStorage.api"
import { assertSchoolVideoCapacity, schoolVideoUploadDisabledReason } from "@/lib/school-video-storage"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
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
import RichTextEditor from "@/components/general/RichTextEditor"
import YouTubeVideoGuidance from "@/components/general/YouTubeVideoGuidance"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import { usePermissions } from "@/hooks/usePermissions"
import { useSchoolCurriculumAccess } from "@/hooks/subscriptions/useSchoolCurriculumAccess"
import { useELearningStore } from "@/store/elearning.store"
import { isDemoSchoolCourse } from "@/lib/elearning-demo"
import {
  completeTeacherCourseVideoUploadApi,
  createTeacherCourseVideoUploadApi,
  getTeacherCourseVideoUploadApi,
  getAvailableTeacherCourseVideoUploadsApi,
  attachTeacherCourseLessonVideoUploadApi,
  getTeacherCourseVideoUploadPlaybackApi,
  uploadTeacherCourseMaterialApi,
  listAvailableTeacherCourseMaterialsApi,
} from "@/api/teacherCourse.api"
import {
  useTeacherCourseCurriculumMutations,
  useTeacherCourseUploadPolicy,
  useTeacherCourseWorkspace,
  teacherCourseWorkspaceKey,
} from "@/hooks/elearning/useTeacherCourseWorkspace"
import type { FileUploadPolicyI } from "@/api/files.api"
import type { LmsLessonMaterial, LmsLessonType } from "@/types/elearning"
import {
  formatDurationMinutes,
  isYouTubeEmbedUrl,
} from "@/utils/lmsDuration"
import LessonMaterialsUploadField from "../Lms/components/LessonMaterialsUploadField"
import VideoUploadField, {
  type VideoUploadValue,
} from "../Lms/components/VideoUploadField"
import { useELearningCourse } from "./hooks/useELearningCourse"
import CourseVideoPlayer from "@/pages/Dashboard/ELearning/components/CourseVideoPlayer"

const selectTriggerClass =
  "!h-11 w-full min-w-0 rounded-md border-gray-200 bg-white shadow-none"

function parseRealCourseId(courseId?: string) {
  if (!courseId || isDemoSchoolCourse(courseId)) return undefined
  const parts = courseId.split("::")
  return parts.length === 2 && parts[0] && parts[1]
    ? { subjectId: parts[0], classId: parts[1] }
    : undefined
}

export default function ELearningLessonEditorPage() {
  const { productId, courseId, lessonId } = useParams<{
    productId: string
    courseId: string
    lessonId: string
  }>()
  const [searchParams] = useSearchParams()
  const moduleId = searchParams.get("moduleId")
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const schoolId = useSchoolId()
  const { canManageCurriculum, isLoading: isPlanLoading } =
    useSchoolCurriculumAccess(isDemoSchoolCourse(courseId) ? "" : schoolId)
  const { isOwner } = usePermissions()
  const isDemo = isDemoSchoolCourse(courseId)
  const storageQuery = useQuery({
    queryKey: ["school-video-storage", schoolId],
    queryFn: () => getVideoStorage(schoolId),
    enabled: !isDemo && !!schoolId,
    refetchInterval: 30000,
    retry: false,
  })
  const uploadDisabledReason = storageQuery.isPending
    ? "Checking school video storage…"
    : storageQuery.isError
      ? "School video storage could not be checked. Refresh and try again."
      : schoolVideoUploadDisabledReason(storageQuery.data)
  const parsed = useMemo(() => parseRealCourseId(courseId), [courseId])
  const courseRef = useMemo(
    () =>
      parsed
        ? { schoolId, subjectId: parsed.subjectId, classId: parsed.classId }
        : undefined,
    [parsed, schoolId]
  )
  const schoolVideoOperations = useMemo(
    () =>
      courseRef
        ? {
            storageNamespace: `school:${courseRef.schoolId}:${courseRef.subjectId}:${courseRef.classId}`,
            tusApi: {
              requiresDuration: true,
              createUpload: (payload: {
                sectionId: string
                fileName: string
                contentType: string
                fileSizeBytes: number
                durationSeconds?: number
              }) => {
                // The file duration is read before requesting a new upload.
                // The API also reserves minutes atomically before issuing its URL.
                return queryClient.fetchQuery({
                  queryKey: ["school-video-storage", courseRef.schoolId],
                  queryFn: () => getVideoStorage(courseRef.schoolId),
                  staleTime: 0,
                }).then(async (storage) => {
                  assertSchoolVideoCapacity(storage, payload.durationSeconds)
                  try {
                    return await createTeacherCourseVideoUploadApi(courseRef, payload)
                  } finally {
                    void queryClient.invalidateQueries({ queryKey: ["school-video-storage", courseRef.schoolId] })
                  }
                })
              },
              completeUpload: (uploadId: string) =>
                completeTeacherCourseVideoUploadApi(courseRef, uploadId),
            },
            getStatus: (uploadId: string) =>
              getTeacherCourseVideoUploadApi(courseRef, uploadId),
            getAvailableUploads: (sectionId: string) =>
              getAvailableTeacherCourseVideoUploadsApi(courseRef, sectionId),
            getPlayback: (uploadId: string) =>
              getTeacherCourseVideoUploadPlaybackApi(courseRef, uploadId),
          }
        : undefined,
    [courseRef, queryClient]
  )

  const addLesson = useELearningStore((s) => s.addLesson)
  const updateLesson = useELearningStore((s) => s.updateLesson)
  const demo = useELearningCourse(isDemo ? courseId : undefined)
  const real = useTeacherCourseWorkspace(courseId, courseRef)
  const schoolUploadPolicyQuery = useTeacherCourseUploadPolicy(!isDemo)
  const mutations = useTeacherCourseCurriculumMutations(courseRef)

  const schoolUploadPolicy = useMemo<FileUploadPolicyI | undefined>(() => {
    const policy = schoolUploadPolicyQuery.data?.value
    if (!policy) return undefined

    return {
      maxImageSizeMB: policy.maxLessonMaterialSizeMB,
      maxDocumentSizeMB: policy.maxLessonMaterialSizeMB,
      maxMediaSizeMB: policy.maxLessonMaterialSizeMB,
      allowedExtensions: policy.allowedLessonMaterialExtensions,
    }
  }, [schoolUploadPolicyQuery.data?.value])

  const modules = isDemo ? demo.modules : real.modules
  const course = isDemo
    ? demo.course
    : real.workspace
      ? {
          subject: real.workspace.subjectName,
          className: real.workspace.className,
        }
      : undefined
  const isNew = lessonId === "new"
  const lesson = isNew
    ? null
    : modules.flatMap((m) => m.lessons).find((item) => item.id === lessonId)
  const sectionId = moduleId || lesson?.moduleId || ""
  const section = modules.find((item) => item.id === sectionId)

  const [title, setTitle] = useState(lesson?.title ?? "")
  const [type, setType] = useState<LmsLessonType>(lesson?.type ?? "video")
  const [durationMinutesInput, setDurationMinutesInput] = useState(
    String(lesson?.durationMinutes ?? 15)
  )
  const [description, setDescription] = useState(lesson?.description ?? "")
  const [htmlContent, setHtmlContent] = useState(lesson?.htmlContent ?? "")
  const [videoValue, setVideoValue] = useState<VideoUploadValue>({
    contentUrl: lesson?.contentUrl,
    youtubeUrl:
      lesson?.contentUrl && isYouTubeEmbedUrl(lesson.contentUrl)
        ? lesson.contentUrl
        : undefined,
    videoUploadId: lesson?.videoUploadId,
    videoUploadStatus: lesson?.videoUploadStatus,
    videoUploadSizeBytes: lesson?.videoUploadSizeBytes,
    videoFileName: lesson?.videoFileName,
    duration: lesson?.duration ?? "15min",
    durationMinutes: lesson?.durationMinutes ?? 15,
    videoChapters: [],
  })
  const [materials, setMaterials] = useState<LmsLessonMaterial[]>(
    lesson?.materials ?? []
  )
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [videoUploading, setVideoUploading] = useState(false)

  useEffect(() => {
    if (!lesson) return
    setTitle(lesson.title)
    setType(lesson.type === "video" ? "video" : "article")
    setDurationMinutesInput(String(lesson.durationMinutes ?? 15))
    setDescription(lesson.description ?? "")
    setHtmlContent(lesson.htmlContent ?? "")
    setVideoValue({
      contentUrl: lesson.contentUrl,
      youtubeUrl:
        lesson.contentUrl && isYouTubeEmbedUrl(lesson.contentUrl)
          ? lesson.contentUrl
          : undefined,
      videoUploadId: lesson.videoUploadId,
      videoUploadStatus: lesson.videoUploadStatus,
      videoUploadSizeBytes: lesson.videoUploadSizeBytes,
      videoFileName: lesson.videoFileName,
      duration: lesson.duration,
      durationMinutes: lesson.durationMinutes ?? 15,
      videoChapters: [],
    })
    setMaterials(lesson.materials ?? [])
    // Keep edits intact if the course workspace refetches while the form is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, isNew])

  const originalVideoUrl = lesson?.contentUrl?.trim() ?? ""
  const preservedLegacyVideoUrl = Boolean(
    !isNew &&
    !videoValue.videoUploadId &&
    videoValue.contentUrl?.trim() === originalVideoUrl &&
    originalVideoUrl &&
    !isYouTubeEmbedUrl(originalVideoUrl)
  )
  const contentUrl =
    videoValue.youtubeUrl ??
    (preservedLegacyVideoUrl ? (videoValue.contentUrl ?? "") : "")
  const normalizedVideoUrl = contentUrl.trim()
  const isYouTubeVideo = isYouTubeEmbedUrl(normalizedVideoUrl)
  // Preserve a saved legacy video URL unless the teacher replaces it.
  const isExistingDirectVideo = Boolean(
    preservedLegacyVideoUrl && normalizedVideoUrl === originalVideoUrl
  )
  const hasInvalidYouTubeUrl = Boolean(
    normalizedVideoUrl && !isYouTubeVideo && !isExistingDirectVideo
  )
  const durationMinutes = Number(durationMinutesInput)
  const hasValidDuration =
    /^\d+$/.test(durationMinutesInput) &&
    durationMinutes >= 1 &&
    durationMinutes <= 1440

  const goBack = () => {
    if (!courseId) return
    navigate(DashboardRoutes.toELearningCourseDetail(productId ?? "", courseId))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Lesson title is required")
      return
    }
    if (!sectionId) {
      toast.error("Select a section for this lesson")
      return
    }
    if (uploading || videoUploading) {
      toast.error("Wait for uploads to finish or pause the video upload")
      return
    }
    if (!hasValidDuration) {
      toast.error("Duration must be a whole number from 1 to 1440 minutes")
      return
    }
    if (type === "video" && hasInvalidYouTubeUrl) {
      toast.error("Enter a valid YouTube video link")
      return
    }
    if (type === "article" && !htmlContent.trim()) {
      toast.error("Enter the HTML lesson content")
      return
    }
    if (materials.some((item) => !item.title.trim())) {
      toast.error("Enter a name for each uploaded material")
      return
    }

    setSaving(true)
    try {
      if (isDemo) {
        const payload = {
          title: title.trim(),
          type: type === "video" ? ("video" as const) : ("article" as const),
          duration: `${durationMinutes}min`,
          durationMinutes,
          description: description.trim() || undefined,
          htmlContent: type === "article" ? htmlContent : undefined,
          contentUrl: type === "video" ? contentUrl.trim() : undefined,
          materials,
        }
        if (isNew) {
          const id = addLesson(sectionId, payload)
          if (!id) throw new Error("Could not add lesson")
          toast.success("Lesson created")
        } else if (lessonId) {
          updateLesson(lessonId, payload)
          toast.success("Lesson saved")
        }
      } else {
        const payload = {
          sectionId,
          lessonId: isNew ? undefined : lessonId,
          title: title.trim(),
          contentType:
            type === "video" ? ("video" as const) : ("html" as const),
          durationMinutes,
          sortOrder: isNew ? (section?.lessons.length ?? 0) + 1 : lesson?.order,
          description: description.trim() || undefined,
          htmlContent: type === "article" ? htmlContent : undefined,
          videoUrl: type === "video" ? contentUrl.trim() : undefined,
          videoUploadId:
            type === "video" ? videoValue.videoUploadId : undefined,
          materials: materials.map((item) => ({
            displayName: item.title.trim(),
            originalFileName: item.fileName ?? item.title,
            fileUrl: item.url ?? "",
            contentType: item.contentType ?? "application/octet-stream",
            sizeBytes: item.fileSizeBytes ?? 0,
          })),
        }
        if (isNew) await mutations.createLessonAsync(payload)
        else await mutations.updateLessonAsync(payload)
      }
      goBack()
    } catch (error) {
      if (isDemo) {
        toast.error(
          error instanceof Error ? error.message : "Could not save lesson"
        )
      }
    } finally {
      setSaving(false)
    }
  }

  if (!isDemo && (real.isLoading || isPlanLoading)) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Loading lesson…
      </div>
    )
  }
  if (!isDemo && !canManageCurriculum) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <p className="font-semibold text-slate-900">Curriculum requires Professional or Complete</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Schools on Essential or without an active plan can still use assignments and course materials.
        </p>
        <Button variant="outline" className="mt-5" onClick={goBack}>Back to course</Button>
      </div>
    )
  }
  if (!isDemo && isOwner) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <p className="text-sm font-semibold text-slate-800">
          This course is read-only for the school owner
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Only the assigned teacher can create or edit course content.
        </p>
        <Button variant="outline" className="mt-5" onClick={goBack}>
          Back to course
        </Button>
      </div>
    )
  }
  if (!course) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Course not found
      </div>
    )
  }
  if (!section) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 py-12">
        <Button variant="ghost" className="h-9 gap-2" onClick={goBack}>
          <ArrowLeft className="size-4" />
          Back to course
        </Button>
        <p className="text-sm text-muted-foreground">
          Add a curriculum section first, then create a lesson from the course
          page.
        </p>
      </div>
    )
  }

  const busy = saving || mutations.isSavingLesson || uploading || videoUploading

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 sm:px-6">
      <Button
        variant="ghost"
        className="h-9 gap-2"
        onClick={goBack}
        disabled={busy}
      >
        <ArrowLeft className="size-4" />
        Back to {course.subject}
      </Button>

      <div>
        <p className="text-xs font-semibold tracking-wide text-blue-600 uppercase">
          {section.title}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "New lesson" : "Edit lesson"}
        </h1>
      </div>

      <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-2">
          <Label htmlFor="lesson-title">Title *</Label>
          <Input
            id="lesson-title"
            className="h-11 rounded-md"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as LmsLessonType)}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Recorded video / YouTube</SelectItem>
                <SelectItem value="article">Article / HTML content</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              max={1440}
              step={1}
              inputMode="numeric"
              className="h-11 rounded-md"
              value={durationMinutesInput}
              aria-invalid={
                durationMinutesInput.length > 0 && !hasValidDuration
              }
              onChange={(event) => {
                const nextValue = event.target.value
                if (nextValue === "" || /^\d+$/.test(nextValue)) {
                  setDurationMinutesInput(nextValue)
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <RichTextEditor value={description} onChange={setDescription} />
        </div>

        {type === "video" && !isDemo && <SchoolVideoStorageNotice
          storage={storageQuery.data}
          isLoading={storageQuery.isPending}
          disabledReason={uploadDisabledReason}
          onRefresh={() => { void storageQuery.refetch() }}
        />}

        {type === "video" && !isDemo ? (
          <VideoUploadField
            sectionId={sectionId}
            operations={schoolVideoOperations}
            newUploadDisabledReason={uploadDisabledReason}
            onUploadingChange={setVideoUploading}
            onAttach={!isNew && lessonId && courseRef
              ? async (uploadId) => {
                  await attachTeacherCourseLessonVideoUploadApi(
                    courseRef, lessonId, uploadId
                  )
                  void queryClient.invalidateQueries({
                    queryKey: teacherCourseWorkspaceKey(courseRef),
                  }).catch(() => undefined)
                }
              : undefined}
            value={{
              ...videoValue,
              videoFileName:
                videoValue.videoFileName ??
                (isExistingDirectVideo
                  ? "Previously uploaded video"
                  : undefined),
              durationMinutes: hasValidDuration ? durationMinutes : 0,
              duration: hasValidDuration
                ? formatDurationMinutes(durationMinutes)
                : "",
            }}
            onChange={(next) => {
              setVideoValue(next)
              if (
                next.durationMinutes > 0 &&
                next.durationMinutes !== durationMinutes
              ) {
                setDurationMinutesInput(String(next.durationMinutes))
              }
            }}
          />
        ) : type === "video" ? (
          <div className="space-y-4">
            <YouTubeVideoGuidance />
            <div className="space-y-2">
              <Label htmlFor="video-url">YouTube video link (optional)</Label>
              <Input
                id="video-url"
                type="url"
                className="h-11 rounded-md"
                placeholder="https://www.youtube.com/watch?v=..."
                value={contentUrl}
                aria-invalid={hasInvalidYouTubeUrl}
                onChange={(event) =>
                  setVideoValue((current) => ({
                    ...current,
                    youtubeUrl: event.target.value,
                  }))
                }
              />
              {hasInvalidYouTubeUrl && (
                <p className="text-xs text-red-600">
                  Enter a valid YouTube watch, share, Shorts, Live or embed URL.
                </p>
              )}
              {isExistingDirectVideo && (
                <p className="text-xs text-amber-700">
                  This previously saved direct video remains supported. Replace
                  it with a YouTube link if you change the video.
                </p>
              )}
            </div>
            {isYouTubeVideo && (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-black">
                <div className="aspect-video w-full">
                  <CourseVideoPlayer
                    key={normalizedVideoUrl}
                    url={normalizedVideoUrl}
                    title="YouTube video preview"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label>HTML lesson content *</Label>
            <RichTextEditor
              value={htmlContent}
              onChange={setHtmlContent}
              height={420}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Lesson materials (optional)</Label>
          <LessonMaterialsUploadField
            materials={materials}
            onChange={setMaterials}
            sectionId={!isDemo ? sectionId : undefined}
            loadAvailable={courseRef && sectionId && !isDemo
              ? async () => {
                  const response = await listAvailableTeacherCourseMaterialsApi(courseRef, sectionId)
                  return response.value.map((item) => ({
                    id: item.id, dateCreatedUtc: item.dateCreatedUtc,
                    fileName: item.originalFileName, url: item.fileUrl,
                    fileSizeBytes: item.sizeBytes, contentType: item.contentType,
                  }))
                }
              : undefined}
            onUploadingChange={setUploading}
            uploadPolicy={schoolUploadPolicy}
            loadDefaultUploadPolicy={false}
            uploadFile={
              courseRef
                ? async (file, options) => {
                    const response = await uploadTeacherCourseMaterialApi(
                      courseRef,
                      file,
                      options,
                      sectionId
                    )
                    return {
                      url: response.value.fileUrl,
                      fileName: response.value.originalFileName,
                      fileSizeBytes: response.value.sizeBytes,
                      contentType: response.value.contentType,
                    }
                  }
                : undefined
            }
          />
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          <Button
            className="gap-2"
            onClick={() => void handleSave()}
            disabled={busy}
          >
            <Save className="size-4" />
            {videoUploading
              ? "Uploading video…"
              : uploading
                ? "Uploading materials…"
                : saving
                  ? "Saving…"
                  : "Save lesson"}
          </Button>
        </div>
      </div>
    </div>
  )
}
