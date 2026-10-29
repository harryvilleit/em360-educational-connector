import { Download, ExternalLink, Maximize2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { isPdfUrl, toEmbedPlaybackUrl } from "@/utils/lmsDuration"
import CourseVideoPlayer from "../../ELearning/components/CourseVideoPlayer"
import { isCloudflarePlayerUrl } from "@/lib/video-audio"
import { getYouTubeVideoId } from "@/utils/lmsDuration"
import type {
  LmsLessonMediaPreview,
  LmsLessonMediaPreviewKind,
} from "@/types/elearning"

export type { LmsLessonMediaPreview as LessonMediaPreview }

type LessonMediaPreviewModalProps = {
  open: boolean
  onClose: () => void
  media: LmsLessonMediaPreview | null
}

function resolveKind(media: LmsLessonMediaPreview): LmsLessonMediaPreviewKind {
  if (media.kind) return media.kind
  const url = media.url.toLowerCase()
  if (isPdfUrl(media.url, media.fileName)) return "pdf"
  if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url)) return "image"
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return "video"
  if (/youtube\.com|youtu\.be|vimeo\.com/.test(url)) return "embed"
  if (isCloudflarePlayerUrl(media.url)) return "embed"
  return "document"
}

export default function LessonMediaPreviewModal({
  open,
  onClose,
  media,
}: LessonMediaPreviewModalProps) {
  if (!media?.url) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Preview unavailable</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            No file or URL to preview.
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  const kind = resolveKind(media)
  const playbackUrl =
    kind === "embed" ? toEmbedPlaybackUrl(media.url) : media.url

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton
        className="flex h-[min(92vh,900px)] w-[min(96vw,1100px)] max-w-none flex-col gap-3 overflow-hidden p-4 sm:max-w-none"
      >
        <DialogHeader className="shrink-0 space-y-1 pr-8 text-left">
          <DialogTitle className="truncate">{media.title}</DialogTitle>
          {media.fileName && media.fileName !== media.title && (
            <p className="truncate text-xs text-muted-foreground">
              {media.fileName}
            </p>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-black/95">
          {kind === "image" ? (
            <img
              src={media.url}
              alt={media.title}
              className="h-full w-full object-contain"
            />
          ) : kind === "embed" &&
            (isCloudflarePlayerUrl(media.url) ||
              getYouTubeVideoId(media.url)) ? (
            <CourseVideoPlayer url={media.url} title={media.title} />
          ) : kind === "video" && !/youtube|youtu\.be|vimeo/.test(media.url) ? (
            <video src={media.url} controls className="h-full w-full" />
          ) : kind === "pdf" || kind === "embed" || kind === "document" ? (
            <iframe
              title={media.title}
              src={playbackUrl}
              className="h-full w-full bg-white"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-white p-6 text-center">
              <p className="text-sm text-muted-foreground">
                This file type can&apos;t be previewed here.
              </p>
              <Button
                variant="primary"
                className="h-9 gap-2 rounded-md"
                asChild
              >
                <a href={media.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Open in new tab
                </a>
              </Button>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <Button variant="outline" className="h-9 gap-2 rounded-md" asChild>
            <a href={media.url} target="_blank" rel="noreferrer">
              <Maximize2 className="size-4" />
              Open fullscreen
            </a>
          </Button>
          {(kind === "pdf" || kind === "document") && (
            <Button variant="primary" className="h-9 gap-2 rounded-md" asChild>
              <a href={media.url} download target="_blank" rel="noreferrer">
                <Download className="size-4" />
                Download
              </a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
