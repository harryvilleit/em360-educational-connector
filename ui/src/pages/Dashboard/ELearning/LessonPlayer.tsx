import { useCallback, useMemo, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  FolderOpen,
  LoaderCircle,
  Pencil,
  PlayCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DashboardRoutes } from "@/routes"
import { useSchoolId } from "@/contexts/SchoolContext"
import { cn } from "@/lib/utils"
import { isDemoSchoolCourse } from "@/lib/elearning-demo"
import { useTeacherCourseWorkspace } from "@/hooks/elearning/useTeacherCourseWorkspace"
import { formatDurationMinutes } from "@/utils/lmsDuration"
import { useELearningCourse } from "./hooks/useELearningCourse"
import CourseVideoPlayer from "./components/CourseVideoPlayer"
import InteractiveHtmlLesson from "./components/InteractiveHtmlLesson"
import { sanitizeHtml } from "@/lib/sanitizeHtml"
import { useSchoolLessonVideoPlayback } from "@/hooks/elearning/useSchoolLessonVideoPlayback"

function parseRealCourseId(courseId?: string) {
  if (!courseId || isDemoSchoolCourse(courseId)) return undefined
  const parts = courseId.split("::")
  return parts.length === 2 && parts[0] && parts[1]
    ? { subjectId: parts[0], classId: parts[1] }
    : undefined
}

export default function ELearningLessonPlayerPage() {
  const { productId, courseId, lessonId } = useParams<{
    productId: string
    courseId: string
    lessonId: string
  }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const schoolId = useSchoolId()
  const isDemo = isDemoSchoolCourse(courseId)
  const readOnly = searchParams.get("mode") === "readonly"
  const viewerQuery = searchParams.toString()
  const withViewerContext = useCallback(
    (path: string) => (viewerQuery ? `${path}?${viewerQuery}` : path),
    [viewerQuery]
  )
  const parsed = useMemo(() => parseRealCourseId(courseId), [courseId])
  const courseRef = useMemo(
    () =>
      parsed
        ? { schoolId, subjectId: parsed.subjectId, classId: parsed.classId }
        : undefined,
    [parsed, schoolId]
  )
  const demo = useELearningCourse(isDemo ? courseId : undefined)
  const real = useTeacherCourseWorkspace(courseId, courseRef)
  const modules = isDemo ? demo.modules : real.modules
  const orderedModules = useMemo(
    () =>
      [...modules]
        .sort((a, b) => a.order - b.order)
        .map((module) => ({
          ...module,
          lessons: [...module.lessons].sort((a, b) => a.order - b.order),
        })),
    [modules]
  )
  const orderedLessons = useMemo(
    () => orderedModules.flatMap((module) => module.lessons),
    [orderedModules]
  )
  const currentIndex = orderedLessons.findIndex((item) => item.id === lessonId)
  const lesson = currentIndex >= 0 ? orderedLessons[currentIndex] : undefined
  const {
    playback: videoPlayback,
    isLoading: videoPlaybackLoading,
    error: videoPlaybackError,
  } = useSchoolLessonVideoPlayback(
    courseRef,
    lesson?.id,
    lesson?.videoUploadId,
    lesson?.videoUploadStatus
  )
  const previousLesson =
    currentIndex > 0 ? orderedLessons[currentIndex - 1] : undefined
  const nextLesson =
    currentIndex >= 0 && currentIndex < orderedLessons.length - 1
      ? orderedLessons[currentIndex + 1]
      : undefined
  const course = isDemo
    ? demo.course
    : real.workspace
      ? {
          subject: real.workspace.subjectName,
          className: real.workspace.className,
        }
      : undefined
  const [autoAdvance, setAutoAdvance] = useState(true)
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(
    () => new Set()
  )

  const backToCourse = useCallback(
    () =>
      navigate(
        withViewerContext(
          DashboardRoutes.toELearningCourseDetail(
            productId ?? "",
            courseId ?? ""
          )
        )
      ),
    [courseId, navigate, productId, withViewerContext]
  )
  const openLesson = useCallback(
    (targetLessonId: string) =>
      navigate(
        withViewerContext(
          DashboardRoutes.toELearningLesson(
            productId ?? "",
            courseId ?? "",
            targetLessonId
          )
        )
      ),
    [courseId, navigate, productId, withViewerContext]
  )
  const markCurrentComplete = useCallback(() => {
    if (!lesson) return
    setCompletedLessonIds((current) => {
      const next = new Set(current)
      next.add(lesson.id)
      return next
    })
  }, [lesson])
  const completeAndAutoAdvance = useCallback(() => {
    markCurrentComplete()
    if (autoAdvance && nextLesson) openLesson(nextLesson.id)
  }, [autoAdvance, markCurrentComplete, nextLesson, openLesson])
  const goToNext = () => {
    markCurrentComplete()
    if (nextLesson) openLesson(nextLesson.id)
    else backToCourse()
  }

  if (!isDemo && real.isLoading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Loading lesson…
      </div>
    )
  }
  if (!course || !lesson) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Lesson not found
      </div>
    )
  }

  const isVideo = lesson.type === "video"
  const videoUrl = lesson.videoUploadId
    ? (videoPlayback?.playbackUrl ?? "")
    : (lesson.contentUrl ?? "")
  const completedCount = new Set([
    ...orderedLessons.filter((item) => item.completed).map((item) => item.id),
    ...completedLessonIds,
  ]).size

  return (
    <div className="-m-4 min-h-screen bg-slate-950 sm:-m-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950 px-5 py-4 text-white">
        <Button
          variant="ghost"
          className="gap-2 text-white hover:bg-white/10 hover:text-white"
          onClick={backToCourse}
        >
          <ArrowLeft className="size-4" />
          Back to {course.subject}
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-semibold">{lesson.title}</p>
          <p className="text-xs text-slate-400">
            Lesson {currentIndex + 1} of {orderedLessons.length} ·{" "}
            {course.subject} · {course.className}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={autoAdvance}
            onClick={() => setAutoAdvance((enabled) => !enabled)}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-white/20 px-3 text-xs font-medium text-white transition-colors hover:bg-white/10"
          >
            <span
              className={cn(
                "size-2 rounded-full",
                autoAdvance ? "bg-emerald-400" : "bg-slate-500"
              )}
            />
            Autoplay {autoAdvance ? "on" : "off"}
          </button>
          {!readOnly && (
            <Button
              variant="outline"
              className="gap-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onClick={() =>
                navigate(
                  DashboardRoutes.toELearningLessonEdit(
                    productId ?? "",
                    courseId ?? "",
                    lesson.id
                  )
                )
              }
            >
              <Pencil className="size-4" />
              Edit lesson
            </Button>
          )}
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-[minmax(0,1fr)_420px]">
        <main className="min-w-0 bg-slate-950">
          {isVideo && videoUrl ? (
            <div className="flex min-h-[58vh] items-center justify-center bg-black">
              <div className="aspect-video min-h-80 w-full">
                <CourseVideoPlayer
                  key={`${lesson.id}:${videoUrl}`}
                  url={videoUrl}
                  title={lesson.title}
                  autoPlay={autoAdvance}
                  onEnded={completeAndAutoAdvance}
                />
              </div>
            </div>
          ) : isVideo ? (
            <div className="flex min-h-[58vh] flex-col items-center justify-center gap-3 bg-black px-6 text-center text-slate-300">
              {videoPlaybackLoading && (
                <LoaderCircle className="size-7 animate-spin text-blue-400" />
              )}
              {(videoPlaybackLoading || videoPlaybackError) && <p role="status" className="text-sm">
                {videoPlaybackLoading ? "Preparing secure video playback…" : videoPlaybackError}
              </p>}
            </div>
          ) : (
            <InteractiveHtmlLesson
              key={lesson.id}
              lessonId={lesson.id}
              title={lesson.title}
              html={lesson.htmlContent ?? ""}
              onComplete={completeAndAutoAdvance}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950 px-5 py-3 text-white sm:px-8">
            <Button
              variant="ghost"
              className="gap-2 text-white hover:bg-white/10 hover:text-white"
              disabled={!previousLesson}
              onClick={() => previousLesson && openLesson(previousLesson.id)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <p className="text-xs text-slate-400">
              {isVideo
                ? autoAdvance
                  ? "The next lesson opens automatically when this video ends."
                  : "Select Next when you finish this video."
                : "Interactive exercises can complete automatically, or continue when ready."}
            </p>
            <Button className="gap-2" onClick={goToNext}>
              {nextLesson ? "Complete & continue" : "Finish course preview"}
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <section className="border-t border-white/10 bg-slate-900 px-6 py-7 text-white sm:px-10">
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {lesson.duration}
                </span>
                <span>
                  {isVideo ? "Video lesson" : "Interactive HTML lesson"}
                </span>
                {(lesson.materials?.length ?? 0) > 0 && (
                  <span>{lesson.materials?.length} downloadable resources</span>
                )}
              </div>
              {lesson.description && (
                <div
                  className="prose prose-invert prose-sm mt-5 max-w-none text-slate-200"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(lesson.description),
                  }}
                />
              )}
            </div>
          </section>
        </main>

        <aside className="border-l border-slate-200 bg-white lg:max-h-[calc(100vh-73px)] lg:overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-900">Course content</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {orderedModules.length} sections · {orderedLessons.length}{" "}
                  lessons
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {completedCount}/{orderedLessons.length}
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {orderedModules.map((module, sectionIndex) => (
              <section key={module.id}>
                <div className="bg-slate-50 px-5 py-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Section {sectionIndex + 1}: {module.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {module.lessons.length} lessons ·{" "}
                    {formatDurationMinutes(
                      module.lessons.reduce(
                        (sum, item) => sum + (item.durationMinutes ?? 0),
                        0
                      )
                    )}
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {module.lessons.map((item, lessonIndex) => {
                    const active = item.id === lesson.id
                    const completed =
                      Boolean(item.completed) || completedLessonIds.has(item.id)
                    const resources = item.materials ?? []
                    const Icon = item.type === "video" ? PlayCircle : FileText
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "px-4 py-3 transition-colors",
                          active ? "bg-blue-50" : "hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            className="flex min-w-0 flex-1 items-start gap-3 text-left"
                            onClick={() => openLesson(item.id)}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                                active
                                  ? "bg-blue-600 text-white"
                                  : completed
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                              )}
                            >
                              {completed ? (
                                <CheckCircle2 className="size-4" />
                              ) : (
                                lessonIndex + 1
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-slate-900">
                                {item.title}
                              </span>
                              <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <Icon className="size-3.5" />
                                {item.duration}
                              </span>
                            </span>
                          </button>

                          {resources.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 shrink-0 gap-1 px-2 text-xs text-blue-700"
                                >
                                  <FolderOpen className="size-3.5" />
                                  Resources
                                  <ChevronDown className="size-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="min-w-64"
                              >
                                {resources.map((resource) => (
                                  <DropdownMenuItem key={resource.id} asChild>
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      download
                                      className="flex cursor-pointer items-center gap-2 px-3 py-2"
                                    >
                                      <Download className="size-4" />
                                      <span className="min-w-0 flex-1 truncate">
                                        {resource.title}
                                      </span>
                                    </a>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
