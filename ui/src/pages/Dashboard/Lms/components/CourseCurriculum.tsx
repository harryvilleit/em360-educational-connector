import { useMemo } from "react"
import { isCloudflarePlayerUrl } from "@/lib/video-audio"
import { getYouTubeVideoId } from "@/utils/lmsDuration"
import CourseVideoPlayer from "../../ELearning/components/CourseVideoPlayer"
import {
  ChevronDown,
  Clock,
  Eye,
  FileText,
  MonitorCheck,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { dashboardCardSurface } from "@/components/general/StatCard"
import { formatDurationMinutes } from "@/utils/lmsDuration"
import {
  getLessonDisplayIcon,
  getLessonTypeLabel,
  getLessonVideoSrc,
  getSectionDurationMinutes,
  isLessonEmbedPlayback,
  lessonHasDetails,
  lessonHasVideo,
} from "@/lib/lms-lesson-display"
import type { CourseCurriculumProps } from "@/types/elearning"
import { useLmsStore } from "@/store/lms.store"
import { useCourseCurriculum } from "../hooks/useCourseCurriculum"
import LessonMediaPreviewModal from "./LessonMediaPreviewModal"

export default function CourseCurriculum({
  modules,
  isTutor,
  onLessonClick,
  onViewLesson,
  onEditLesson,
  onDeleteLesson,
  onMoveLesson,
  onViewCourse,
  onAddModule,
  onEditModule,
  onDeleteModule,
  onAddLesson,
  canDeleteCurriculum = true,
  deleteDisabledReason,
}: CourseCurriculumProps) {
  const quizzes = useLmsStore((s) => s.quizzes)
  const quizzesById = useMemo(
    () => new Map(quizzes.map((q) => [q.id, q])),
    [quizzes]
  )
  const {
    totalLessons,
    totalDurationMinutes,
    preview,
    isSectionOpen,
    isLessonOpen,
    setSectionOpen,
    setLessonOpen,
    handleViewLesson,
    openMaterialPreview,
    openLessonVideoPreview,
    closePreview,
  } = useCourseCurriculum({ modules, onLessonClick, onViewLesson })

  return (
    <div className={dashboardCardSurface}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Course content</h2>
          <p className="text-sm text-muted-foreground">
            {modules.length} sections · {totalLessons} lectures ·{" "}
            {formatDurationMinutes(totalDurationMinutes)} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onViewCourse && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-md"
              onClick={onViewCourse}
            >
              <Eye className="size-4" />
              View
            </Button>
          )}
          {isTutor && onAddModule && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-md"
              onClick={onAddModule}
            >
              <Plus className="size-4" />
              Add section
            </Button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {modules.map((mod) => {
          const sectionOpen = isSectionOpen(mod.id)
          const sectionMinutes = getSectionDurationMinutes(mod)

          return (
            <Collapsible
              key={mod.id}
              open={sectionOpen}
              onOpenChange={(open) => setSectionOpen(mod.id, open)}
            >
              <div className="flex items-center justify-between gap-2 bg-gray-50/80 px-5 py-3">
                <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <ChevronDown
                    className={`size-4 shrink-0 text-gray-500 transition-transform ${
                      sectionOpen ? "" : "-rotate-90"
                    }`}
                  />
                  <span className="truncate font-semibold text-gray-900">
                    {mod.title}
                  </span>
                </CollapsibleTrigger>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {mod.lessons.length} lectures ·{" "}
                    {formatDurationMinutes(sectionMinutes)}
                  </span>
                  {isTutor && onEditModule && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-md"
                      onClick={() => onEditModule(mod)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                  )}
                  {isTutor && onDeleteModule && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={!canDeleteCurriculum}
                      title={
                        !canDeleteCurriculum ? deleteDisabledReason : undefined
                      }
                      onClick={() => onDeleteModule(mod)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  )}
                  {isTutor && onAddLesson && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-md"
                      onClick={() => onAddLesson(mod.id)}
                    >
                      <Plus className="size-3.5" />
                      Lesson
                    </Button>
                  )}
                </div>
              </div>

              <CollapsibleContent>
                <div className="divide-y divide-gray-50">
                  {mod.lessons.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-muted-foreground">
                      No lessons in this section yet
                    </p>
                  ) : (
                    mod.lessons.map((lesson, lessonIndex) => {
                      const Icon = getLessonDisplayIcon(lesson)
                      const hasVideo = lessonHasVideo(lesson)
                      const materials = lesson.materials ?? []
                      const linkedQuiz = lesson.quizId
                        ? quizzesById.get(lesson.quizId)
                        : undefined
                      const videoSrc = getLessonVideoSrc(lesson)
                      const lessonOpen = isLessonOpen(lesson.id)
                      const hasDetails = lessonHasDetails(lesson)

                      return (
                        <Collapsible
                          key={lesson.id}
                          open={lessonOpen}
                          onOpenChange={(open) =>
                            setLessonOpen(lesson.id, open)
                          }
                        >
                          <div className="px-5 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <CollapsibleTrigger
                                className="flex min-w-0 flex-1 items-start gap-2 text-left"
                                disabled={!hasDetails}
                              >
                                <ChevronDown
                                  className={`mt-0.5 size-4 shrink-0 text-gray-500 transition-transform ${
                                    lessonOpen ? "" : "-rotate-90"
                                  } ${!hasDetails ? "opacity-30" : ""}`}
                                />
                                <Icon
                                  className={`mt-0.5 size-5 shrink-0 ${
                                    hasVideo ? "text-blue-600" : "text-gray-400"
                                  }`}
                                />
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                      {lesson.title}
                                    </h3>
                                    {linkedQuiz && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                                        <MonitorCheck className="size-3" />
                                        Quiz
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                                    <span>{getLessonTypeLabel(lesson)}</span>
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="size-3" />
                                      {lesson.duration}
                                    </span>
                                    {materials.length > 0 && (
                                      <span>
                                        {materials.length} file
                                        {materials.length > 1 ? "s" : ""}
                                      </span>
                                    )}
                                    {lesson.completed && (
                                      <span>✓ Completed</span>
                                    )}
                                  </p>
                                </div>
                              </CollapsibleTrigger>

                              <div className="flex shrink-0 items-center gap-1.5">
                                {isTutor && onMoveLesson && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8"
                                      disabled={lessonIndex === 0}
                                      aria-label={`Move ${lesson.title} up`}
                                      onClick={() =>
                                        onMoveLesson(mod, lessonIndex, -1)
                                      }
                                    >
                                      <ArrowUp className="size-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8"
                                      disabled={
                                        lessonIndex === mod.lessons.length - 1
                                      }
                                      aria-label={`Move ${lesson.title} down`}
                                      onClick={() =>
                                        onMoveLesson(mod, lessonIndex, 1)
                                      }
                                    >
                                      <ArrowDown className="size-3.5" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1.5 rounded-md"
                                  onClick={() => handleViewLesson(lesson)}
                                >
                                  <Eye className="size-3.5" />
                                  View
                                </Button>
                                {isTutor && onEditLesson && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1.5 rounded-md"
                                    onClick={() => onEditLesson(lesson)}
                                  >
                                    <Pencil className="size-3.5" />
                                    Edit
                                  </Button>
                                )}
                                {isTutor && onDeleteLesson && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1.5 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700"
                                    disabled={!canDeleteCurriculum}
                                    title={
                                      !canDeleteCurriculum
                                        ? deleteDisabledReason
                                        : undefined
                                    }
                                    onClick={() => onDeleteLesson(lesson)}
                                  >
                                    <Trash2 className="size-3.5" />
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </div>

                            <CollapsibleContent>
                              <div className="mt-3 space-y-3 pl-6">
                                {hasVideo && videoSrc && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                      Video
                                    </p>
                                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-black">
                                      <div className="aspect-video min-h-80 w-full">
                                        {isCloudflarePlayerUrl(videoSrc) ||
                                        getYouTubeVideoId(videoSrc) ? (
                                          <CourseVideoPlayer
                                            url={videoSrc}
                                            title={`${lesson.title} video`}
                                          />
                                        ) : isLessonEmbedPlayback(
                                            lesson,
                                            videoSrc
                                          ) ? (
                                          <iframe
                                            src={videoSrc}
                                            title={`${lesson.title} video`}
                                            className="h-full w-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          />
                                        ) : (
                                          <video
                                            src={videoSrc}
                                            controls
                                            className="h-full w-full"
                                          />
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 gap-1.5 rounded-md px-0 text-blue-600 hover:text-blue-700"
                                      onClick={() =>
                                        openLessonVideoPreview(lesson)
                                      }
                                    >
                                      <PlayCircle className="size-3.5" />
                                      Open video fullscreen
                                    </Button>
                                  </div>
                                )}

                                {materials.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                      Materials
                                    </p>
                                    <ul className="space-y-1.5">
                                      {materials.map((material) => (
                                        <li
                                          key={material.id}
                                          className="flex items-center justify-between gap-3 rounded-md border border-gray-100 bg-gray-50/80 px-3 py-2"
                                        >
                                          <div className="flex min-w-0 items-center gap-2">
                                            <FileText className="size-4 shrink-0 text-red-500" />
                                            <div className="min-w-0">
                                              <p className="truncate text-sm text-gray-800">
                                                {material.title}
                                              </p>
                                              <p className="text-[11px] text-muted-foreground capitalize">
                                                {material.type}
                                                {material.fileName &&
                                                material.fileName !==
                                                  material.title
                                                  ? ` · ${material.fileName}`
                                                  : ""}
                                              </p>
                                            </div>
                                          </div>
                                          {material.url && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="h-7 shrink-0 gap-1 rounded-md"
                                              onClick={() =>
                                                openMaterialPreview(material)
                                              }
                                            >
                                              <Eye className="size-3.5" />
                                              Preview
                                            </Button>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      )
                    })
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>

      <LessonMediaPreviewModal
        open={!!preview}
        onClose={closePreview}
        media={preview}
      />
    </div>
  )
}
