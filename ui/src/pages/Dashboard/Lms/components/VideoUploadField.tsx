import { useEffect, useRef, useState } from "react"
import {
  CheckCircle2,
  CirclePause,
  CirclePlay,
  CloudUpload,
  Eye,
  LoaderCircle,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getLessonVideoUploadApi,
  getAvailableLessonVideoUploadsApi,
  getLessonVideoUploadPlaybackApi,
  type LessonVideoUploadI,
} from "@/api/lesson.api"
import {
  TusUploadPausedError,
  uploadLessonVideoTus,
  type TusUploadApi,
  type TusUploadArguments,
  type TusUploadProgress,
} from "@/lib/cloudflareTusUpload"
import {
  formatDurationMinutes,
  isYouTubeEmbedUrl,
  minutesFromSeconds,
} from "@/utils/lmsDuration"
import type { LmsVideoChapter } from "@/types/elearning"
import { isElearningApiId } from "@/lib/elearning-ids"
import TutorVideoStorageNotice from "./TutorVideoStorageNotice"
import CourseVideoPlayer from "@/pages/Dashboard/ELearning/components/CourseVideoPlayer"

export type VideoUploadValue = {
  contentUrl?: string
  youtubeUrl?: string
  videoUploadId?: string
  cloudflareStreamUid?: string
  videoUploadStatus?: "Uploading" | "Processing" | "Ready" | "Failed"
  videoUploadSizeBytes?: number
  duration: string
  durationMinutes: number
  videoFileName?: string
  videoChapters: LmsVideoChapter[]
}

type VideoUploadFieldProps = {
  value: VideoUploadValue
  onChange: (value: VideoUploadValue) => void
  sectionId?: string
  onUploadingChange?: (uploading: boolean) => void
  onAttach?: (uploadId: string) => Promise<void>
  newUploadDisabledReason?: string
  operations?: {
    upload?: (args: TusUploadArguments) => Promise<LessonVideoUploadI>
    tusApi?: TusUploadApi
    storageNamespace?: string
    getStatus: (uploadId: string) => Promise<{ value: LessonVideoUploadI }>
    getAvailableUploads?: (
      sectionId: string
    ) => Promise<{ value: LessonVideoUploadI[] }>
    getPlayback: (
      uploadId: string
    ) => Promise<{ value: { playbackUrl: string } }>
  }
}

type UploadUiState =
  | "idle"
  | "uploading"
  | "paused"
  | "processing"
  | "ready"
  | "error"

function bytesLabel(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 MB"
  const units = ["B", "KB", "MB", "GB"]
  const exponent = Math.min(
    units.length - 1,
    Math.floor(Math.log(value) / Math.log(1024))
  )
  return `${(value / 1024 ** exponent).toFixed(exponent > 1 ? 1 : 0)} ${units[exponent]}`
}

function remainingLabel(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return "Estimating time…"
  if (seconds < 60) return `About ${Math.max(1, Math.ceil(seconds))} sec left`
  return `About ${Math.ceil(seconds / 60)} min left`
}

function stateFromValue(value: VideoUploadValue): UploadUiState {
  if (value.videoUploadStatus === "Ready") return "ready"
  if (value.videoUploadStatus === "Processing") return "processing"
  if (value.videoUploadStatus === "Failed") return "error"
  if (value.videoUploadStatus === "Uploading") return "paused"
  return "idle"
}

export default function VideoUploadField({
  value,
  onChange,
  sectionId,
  onUploadingChange,
  onAttach,
  newUploadDisabledReason,
  operations,
}: VideoUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resumeOnlyRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const valueRef = useRef(value)
  const previewUploadIdRef = useRef(value.videoUploadId)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadUiState>(() =>
    stateFromValue(value)
  )
  const [progress, setProgress] = useState<TusUploadProgress>({
    uploadedBytes:
      value.videoUploadStatus === "Ready"
        ? (value.videoUploadSizeBytes ?? 0)
        : 0,
    totalBytes: value.videoUploadSizeBytes ?? 0,
    percentage: value.videoUploadStatus === "Ready" ? 100 : 0,
    bytesPerSecond: 0,
  })
  const [statusMessage, setStatusMessage] = useState("")
  const [error, setError] = useState("")
  const [playbackUrl, setPlaybackUrl] = useState("")
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState("")
  const [attaching, setAttaching] = useState(false)
  const [attachError, setAttachError] = useState("")
  const [attachedUploadId, setAttachedUploadId] = useState("")
  const [availableUploads, setAvailableUploads] = useState<LessonVideoUploadI[]>([])
  const [availableLoading, setAvailableLoading] = useState(false)
  const [availableError, setAvailableError] = useState("")
  const [availableRefresh, setAvailableRefresh] = useState(0)
  const youtubeUrl =
    value.youtubeUrl ??
    (value.contentUrl && isYouTubeEmbedUrl(value.contentUrl)
      ? value.contentUrl
      : "")
  const hasInvalidYouTubeUrl = Boolean(
    youtubeUrl && !isYouTubeEmbedUrl(youtubeUrl)
  )
  const isLegacyUploadedVideo = Boolean(
    value.contentUrl &&
    value.videoFileName &&
    !isYouTubeEmbedUrl(value.contentUrl)
  )
  const hasMainVideo = Boolean(value.videoUploadId || isLegacyUploadedVideo)

  useEffect(
    () => () => {
      abortRef.current?.abort()
    },
    []
  )

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    if (previewUploadIdRef.current !== value.videoUploadId) {
      setPlaybackUrl("")
      setPreviewError("")
      previewUploadIdRef.current = value.videoUploadId
    }
  }, [value.videoUploadId])

  // School Management loads an existing lesson after this field can mount.
  // Keep the preview button in sync when its saved upload arrives later.
  useEffect(() => {
    if (value.videoUploadId && value.videoUploadStatus) {
      setUploadState(stateFromValue(value))
    }
  }, [value.videoUploadId, value.videoUploadStatus])

  useEffect(() => {
    onUploadingChange?.(uploadState === "uploading" || attaching)
  }, [onUploadingChange, uploadState, attaching])

  useEffect(() => {
    if (!sectionId || value.videoUploadId ||
      (!operations?.getAvailableUploads && !isElearningApiId(sectionId))) return
    let cancelled = false
    setAvailableLoading(true)
    setAvailableError("")
    void (operations?.getAvailableUploads ?? getAvailableLessonVideoUploadsApi)(sectionId)
      .then((response) => {
        if (!cancelled) setAvailableUploads(response.value ?? [])
      })
      .catch((caught) => {
        if (!cancelled) setAvailableError(
          caught instanceof Error ? caught.message : "Could not load saved videos."
        )
      })
      .finally(() => {
        if (!cancelled) setAvailableLoading(false)
      })
    return () => { cancelled = true }
  }, [sectionId, value.videoUploadId, operations, availableRefresh])

  useEffect(() => {
    const uploadId = value.videoUploadId
    if (!uploadId || value.videoUploadStatus !== "Ready") return
    let cancelled = false
    setPreviewLoading(true)
    setPreviewError("")
    void (operations?.getPlayback ?? getLessonVideoUploadPlaybackApi)(uploadId)
      .then((response) => {
        if (cancelled) return
        const url = response.value?.playbackUrl?.trim()
        if (!url) throw new Error("The playback service returned no video URL.")
        setPlaybackUrl(url)
      })
      .catch((caught) => {
        if (!cancelled) setPreviewError(
          caught instanceof Error ? caught.message : "Video preview is not ready yet."
        )
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false)
      })
    return () => { cancelled = true }
  }, [value.videoUploadId, value.videoUploadStatus, operations])

  useEffect(() => {
    const uploadId = value.videoUploadId
    if (!uploadId ||
      (value.videoUploadStatus !== "Processing" &&
        value.videoUploadStatus !== "Uploading")) return

    let cancelled = false
    let timer: number | undefined
    const refresh = async () => {
      try {
        const response = await (
          operations?.getStatus ?? getLessonVideoUploadApi
        )(uploadId)
        if (cancelled) return
        const upload = response.value
        onChange({
          ...valueRef.current,
          cloudflareStreamUid: upload.cloudflareStreamUid,
          videoUploadStatus:
            upload.status === "Uploading" ? "Processing" : upload.status,
          videoUploadSizeBytes: upload.fileSizeBytes,
          videoFileName: upload.fileName,
        })
        if (upload.status === "Ready") {
          setUploadState("ready")
          setStatusMessage("Recorded video is ready")
          toast.success("Cloudflare finished processing the recorded video")
          return
        }
        if (upload.status === "Failed") {
          setUploadState("error")
          setError(
            upload.failureReason || "Cloudflare could not process this video."
          )
          return
        }
        setStatusMessage(
          upload.processingPercent > 0
            ? `Cloudflare is optimising the video · ${Math.floor(upload.processingPercent)}%`
            : "Cloudflare is optimising the video for playback."
        )
        timer = window.setTimeout(refresh, 5_000)
      } catch {
        if (!cancelled) timer = window.setTimeout(refresh, 10_000)
      }
    }

    timer = window.setTimeout(refresh, 2_000)
    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [onChange, operations, value.videoUploadId, value.videoUploadStatus])

  const readDuration = (file: File) => {
    const objectUrl = URL.createObjectURL(file)
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      const durationMinutes = minutesFromSeconds(video.duration)
      onChange({
        ...valueRef.current,
        durationMinutes,
        duration: formatDurationMinutes(durationMinutes),
      })
      URL.revokeObjectURL(objectUrl)
    }
    video.onerror = () => URL.revokeObjectURL(objectUrl)
    video.src = objectUrl
  }

  const applyCompletedUpload = (upload: LessonVideoUploadI, file: File) => {
    const nextState =
      upload.status === "Ready"
        ? "ready"
        : upload.status === "Failed"
          ? "error"
          : "processing"
    setUploadState(nextState)
    setStatusMessage(
      nextState === "ready"
        ? "Recorded video is ready"
        : "Upload complete. Cloudflare is optimising the video for playback."
    )
    setError(upload.failureReason ?? "")
    setAttachedUploadId("")
    setAttachError("")
    onChange({
      ...valueRef.current,
      contentUrl: undefined,
      videoUploadId: upload.id,
      cloudflareStreamUid: upload.cloudflareStreamUid,
      videoUploadStatus: upload.status,
      videoUploadSizeBytes: upload.fileSizeBytes,
      videoFileName: upload.fileName || file.name,
    })
  }

  const attachVideoToLesson = async (uploadId: string) => {
    if (!onAttach) return
    setAttaching(true)
    setAttachError("")
    try {
      await onAttach(uploadId)
      setAttachedUploadId(uploadId)
      setStatusMessage("Video saved to this lesson automatically.")
      toast.success("Video saved to this lesson")
    } catch (caught) {
      const message = caught instanceof Error
        ? caught.message
        : "The video uploaded, but could not be saved to this lesson."
      setAttachError(message)
      toast.error("Video uploaded, but automatic lesson update failed")
    } finally {
      setAttaching(false)
    }
  }

  const startUpload = async (file: File) => {
    if (!sectionId) {
      toast.error("Save or select the course section before uploading a video")
      return
    }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setUploadState("uploading")
    setError("")
    setPlaybackUrl("")
    setPreviewError("")
    setStatusMessage("Connecting to Cloudflare…")
    try {
      const upload = await (operations?.upload ?? uploadLessonVideoTus)({
        sectionId,
        file,
        signal: controller.signal,
        api: operations?.tusApi,
        storageNamespace: operations?.storageNamespace,
        resumeOnly: resumeOnlyRef.current,
        onProgress: (next) => {
          setProgress(next)
          setStatusMessage(
            `${bytesLabel(next.uploadedBytes)} of ${bytesLabel(next.totalBytes)} · ${remainingLabel(next.remainingSeconds)}`
          )
        },
        onRetry: (attempt, seconds) =>
          setStatusMessage(
            `Connection interrupted. Retrying in ${seconds}s (attempt ${attempt})…`
          ),
      })
      applyCompletedUpload(upload, file)
      toast.success("Recorded video uploaded to Cloudflare")
      await attachVideoToLesson(upload.id)
    } catch (caught) {
      if (caught instanceof TusUploadPausedError) {
        setUploadState("paused")
        setStatusMessage(
          "Upload paused. You can continue without starting again."
        )
        return
      }
      const message =
        caught instanceof Error ? caught.message : "Video upload failed."
      setUploadState("error")
      setError(message)
      setStatusMessage(
        "Your progress was kept where possible. Select retry to continue."
      )
    }
  }

  const chooseFile = (file?: File) => {
    if (!file) return
    if (newUploadDisabledReason && !resumeOnlyRef.current && uploadState !== "paused") {
      toast.error(newUploadDisabledReason)
      return
    }
    if (!file.type.startsWith("video/")) {
      toast.error("Select a valid video file")
      return
    }
    setSelectedFile(file)
    setProgress({
      uploadedBytes: 0,
      totalBytes: file.size,
      percentage: 0,
      bytesPerSecond: 0,
    })
    readDuration(file)
    void startUpload(file)
  }

  const pause = () => abortRef.current?.abort()

  const clearMainVideo = () => {
    abortRef.current?.abort()
    setSelectedFile(null)
    setPlaybackUrl("")
    setPreviewError("")
    setAttachError("")
    setAttachedUploadId("")
    setUploadState("idle")
    setProgress({
      uploadedBytes: 0,
      totalBytes: 0,
      percentage: 0,
      bytesPerSecond: 0,
    })
    setStatusMessage("")
    setError("")
    onChange({
      ...valueRef.current,
      contentUrl: undefined,
      videoUploadId: undefined,
      cloudflareStreamUid: undefined,
      videoUploadStatus: undefined,
      videoUploadSizeBytes: undefined,
      videoFileName: undefined,
      videoChapters: [],
    })
  }

  const selectSavedVideo = async (saved: LessonVideoUploadI) => {
    setAvailableLoading(true)
    setAvailableError("")
    try {
      const response = await (operations?.getStatus ?? getLessonVideoUploadApi)(saved.id)
      const upload = response.value
      if (upload.status === "Failed") throw new Error(
        upload.failureReason || "Cloudflare could not process this video."
      )
      // A completed upload can still be processing when the lesson is edited.
      const status = upload.status === "Uploading" ? "Processing" : upload.status
      setUploadState(status === "Ready" ? "ready" : "processing")
      setSelectedFile(null)
      setPlaybackUrl("")
      setPreviewError("")
      onChange({
        ...valueRef.current,
        contentUrl: undefined,
        videoUploadId: upload.id,
        cloudflareStreamUid: upload.cloudflareStreamUid,
        videoUploadStatus: status,
        videoUploadSizeBytes: upload.fileSizeBytes,
        videoFileName: upload.fileName,
      })
      await attachVideoToLesson(upload.id)
    } catch (caught) {
      setAvailableError(
        caught instanceof Error ? caught.message : "Could not select this video."
      )
    } finally {
      setAvailableLoading(false)
    }
  }

  const previewUploadedVideo = async () => {
    if (isLegacyUploadedVideo && value.contentUrl) {
      setPlaybackUrl(value.contentUrl)
      return
    }
    if (!value.videoUploadId) return
    setPreviewLoading(true)
    setPreviewError("")
    setPlaybackUrl("")
    try {
      const response = await (
        operations?.getPlayback ?? getLessonVideoUploadPlaybackApi
      )(value.videoUploadId)
      const url = response.value?.playbackUrl?.trim()
      if (!url) throw new Error("The playback service returned no video URL.")
      setPlaybackUrl(url)
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Video preview is not ready yet"
      setPreviewError(message)
      toast.error(message)
    } finally {
      setPreviewLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {!operations && <TutorVideoStorageNotice />}
      <section className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
        <div>
          <Label className="font-semibold">Recorded lesson video (Cloudflare)</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Recommended. Uploads go directly to Cloudflare in resumable chunks,
            so weak or interrupted connections can continue from the last saved
            point.
          </p>
        </div>

        {newUploadDisabledReason && <p role="status" className="text-xs text-blue-900">{newUploadDisabledReason}</p>}

        {!hasMainVideo && uploadState === "idle" ? (
          <button
            type="button"
            disabled={!!newUploadDisabledReason}
            onClick={() => { resumeOnlyRef.current = false; fileInputRef.current?.click() }}
            className="flex w-full flex-col items-center rounded-lg border-2 border-dashed border-blue-200 bg-white px-4 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CloudUpload className="mb-2 size-8 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              Choose recorded video
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              MP4, WebM or MOV · large files supported
            </span>
          </button>
        ) : (
          <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {selectedFile?.name ??
                    value.videoFileName ??
                    "Recorded video"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {bytesLabel(
                    selectedFile?.size ?? value.videoUploadSizeBytes ?? 0
                  )}
                  {value.durationMinutes > 0
                    ? ` · ${formatDurationMinutes(value.durationMinutes)}`
                    : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {(uploadState === "ready" || isLegacyUploadedVideo) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    disabled={previewLoading}
                    onClick={() => void previewUploadedVideo()}
                  >
                    {previewLoading ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                    {previewLoading ? "Loading..." : playbackUrl ? "Retry preview" : "Preview"}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-red-600"
                  onClick={clearMainVideo}
                >
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              </div>
            </div>

            {uploadState === "uploading" && (
              <>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-[width]"
                    style={{ width: `${Math.max(1, progress.percentage)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">{statusMessage}</span>
                  <span className="font-semibold text-blue-700">
                    {Math.floor(progress.percentage)}%
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={pause}
                >
                  <CirclePause className="size-3.5" /> Pause
                </Button>
              </>
            )}

            {(uploadState === "paused" || uploadState === "error") &&
              selectedFile && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
                  <span>{error || statusMessage}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 bg-white"
                    onClick={() => void startUpload(selectedFile)}
                  >
                    {uploadState === "paused" ? (
                      <CirclePlay className="size-3.5" />
                    ) : (
                      <RefreshCw className="size-3.5" />
                    )}
                    {uploadState === "paused" ? "Resume" : "Retry"}
                  </Button>
                </div>
              )}

            {uploadState === "processing" && (
              <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3 text-xs text-blue-800">
                <LoaderCircle className="size-4 animate-spin" /> {statusMessage}
              </div>
            )}

            {(uploadState === "ready" || isLegacyUploadedVideo) && (
              <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="size-4" /> Recorded video ready.
                {!isLegacyUploadedVideo &&
                  " Students will receive secure Cloudflare playback."}
              </div>
            )}
            {attaching && (
              <p role="status" className="text-xs text-blue-700">
                Saving this video to the lesson…
              </p>
            )}
            {attachedUploadId === value.videoUploadId && attachedUploadId && (
              <p role="status" className="text-xs text-emerald-800">
                Video saved to this lesson automatically. Use Save lesson for other edits.
              </p>
            )}
            {attachError && value.videoUploadId && onAttach && (
              <div role="alert" className="space-y-2 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
                <p>Video uploaded, but the lesson update failed: {attachError}</p>
                <Button type="button" variant="outline" size="sm"
                  disabled={attaching}
                  onClick={() => void attachVideoToLesson(value.videoUploadId!)}>
                  Retry saving video
                </Button>
              </div>
            )}
            {!onAttach && value.videoUploadId && (
              <p className="text-xs text-amber-800">
                Save the lesson to keep this video attached. If you leave before
                saving, you can find this upload again in this section.
              </p>
            )}
          </div>
        )}

        {!hasMainVideo && uploadState === "idle" && sectionId &&
          (operations?.getAvailableUploads || isElearningApiId(sectionId)) && (
          <div className="space-y-2 rounded-lg border border-blue-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Videos already uploaded for this section</p>
              <Button type="button" variant="outline" size="sm"
                disabled={availableLoading}
                onClick={() => setAvailableRefresh((count) => count + 1)}>
                <RefreshCw className="size-3.5" /> Refresh
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Unattached videos can be reused here for 24 hours after upload; save the lesson to keep one.
            </p>
            {availableLoading && <p className="text-xs">Loading saved videos…</p>}
            {availableError && <p role="alert" className="text-xs text-red-700">{availableError}</p>}
            {!availableLoading && !availableError && availableUploads.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No unattached uploads were found. Videos added directly in the
                Cloudflare dashboard are not linked to a lesson; upload the file
                here to link it securely.
              </p>
            )}
            {availableUploads.map((upload) => (
              <div key={upload.id} className="flex items-center justify-between gap-3 border-t pt-2">
                <span className="min-w-0 truncate text-xs" title={upload.fileName}>
                  {upload.fileName} · {upload.status}
                </span>
                <Button type="button" size="sm" variant="outline"
                  disabled={availableLoading}
                  onClick={() => void selectSavedVideo(upload)}>Use video</Button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          className="hidden"
          onChange={(event) => {
            chooseFile(event.target.files?.[0])
            event.currentTarget.value = ""
          }}
        />

        {!hasMainVideo && uploadState === "idle" && (
          <div className="space-y-1">
            <Button type="button" variant="outline" size="sm" onClick={() => {
              resumeOnlyRef.current = true
              fileInputRef.current?.click()
            }}>Resume an interrupted upload</Button>
            <p className="text-xs text-muted-foreground">Select the same file on this device. An unexpired upload continues using its reserved storage.</p>
          </div>
        )}

        {!selectedFile &&
          (uploadState === "paused" || uploadState === "error") && (
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-2 bg-white"
              onClick={() => { resumeOnlyRef.current = true; fileInputRef.current?.click() }}
            >
              <Upload className="size-4" /> Select video again to resume
            </Button>
          )}

        {playbackUrl && (
          <div className="space-y-2">
            <div className="overflow-hidden rounded-lg border bg-black">
              {isLegacyUploadedVideo ? (
                <video
                  src={playbackUrl}
                  controls
                  className="aspect-video w-full"
                />
              ) : (
                <div className="aspect-video w-full">
                  <CourseVideoPlayer
                    key={playbackUrl}
                    url={playbackUrl}
                    title="Recorded video preview"
                  />
                </div>
              )}
            </div>
            {!isLegacyUploadedVideo && (
              <p className="text-xs text-muted-foreground">
                If the player stays blank, try Retry preview or{" "}
                <a
                  href={playbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-700 underline"
                >
                  open the Cloudflare player in a new tab
                </a>
                .
              </p>
            )}
          </div>
        )}
        {previewError && (
          <p role="alert" className="text-xs text-red-700">
            {previewError}
          </p>
        )}
      </section>

      <section className="space-y-2 rounded-xl border border-gray-200 p-4">
        <div>
          <Label htmlFor="youtube-video-url">YouTube video link (free)</Label>
          <p className="mt-1 text-xs text-muted-foreground">
            {operations ? "Cloudflare plays first when ready. Otherwise, this YouTube link is used. Leave both empty to keep the video area blank." : "Used only when no recorded video is uploaded or processing fails. It is not compulsory."}
          </p>
        </div>
        <Input
          id="youtube-video-url"
          type="url"
          className="h-10 rounded-md border-gray-200"
          placeholder="https://www.youtube.com/watch?v=..."
          value={youtubeUrl}
          aria-invalid={hasInvalidYouTubeUrl}
          onChange={(event) =>
            onChange({
              ...value,
              youtubeUrl: event.target.value.trim() || undefined,
              contentUrl:
                value.contentUrl && !isYouTubeEmbedUrl(value.contentUrl)
                  ? value.contentUrl
                  : undefined,
            })
          }
        />
        {hasInvalidYouTubeUrl && (
          <p className="text-xs text-red-600">
            Enter a valid YouTube watch, share, Shorts, Live, or embed URL.
          </p>
        )}
      </section>
    </div>
  )
}
