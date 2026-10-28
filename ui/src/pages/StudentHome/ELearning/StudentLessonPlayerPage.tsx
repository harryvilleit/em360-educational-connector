import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  FolderOpen,
  LoaderCircle,
  PlayCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { HomeRoutes } from "@/routes"
import {
  useSaveStudentLessonProgress,
  useStudentCourseWorkspace,
} from "@/hooks/elearning/useStudentELearning"
import CourseVideoPlayer from "@/pages/Dashboard/ELearning/components/CourseVideoPlayer"
import InteractiveHtmlLesson from "@/pages/Dashboard/ELearning/components/InteractiveHtmlLesson"
import { formatDurationMinutes } from "@/utils/lmsDuration"
import { sanitizeHtml } from "@/lib/sanitizeHtml"
import { useSchoolLessonVideoPlayback } from "@/hooks/elearning/useSchoolLessonVideoPlayback"

export default function StudentLessonPlayerPage() {
  const {
    schoolId = "",
    subjectId = "",
    classId = "",
    lessonId = "",
  } = useParams<{
    schoolId: string
    subjectId: string
    classId: string
    lessonId: string
  }>()
  const navigate = useNavigate()
  const [autoAdvance, setAutoAdvance] = useState(true)
  const [locallyCompleted, setLocallyCompleted] = useState<Set<string>>(
    () => new Set()
  )
  const { workspace, isLoading } = useStudentCourseWorkspace(
    schoolId,
    subjectId,
    classId
  )
  const progressMutation = useSaveStudentLessonProgress({
    schoolId,
    subjectId,
    classId,
  })

  const sections = useMemo(
    () =>
      (workspace?.sections ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((section) => ({
          ...section,
          lessons: section.lessons
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder),
        })),
    [workspace?.sections]
  )
  const lessons = useMemo(
    () => sections.flatMap((section) => section.lessons),
    [sections]
  )
  const currentIndex = lessons.findIndex((item) => item.id === lessonId)
  const lesson = currentIndex >= 0 ? lessons[currentIndex] : undefined
  const courseRef = useMemo(
    () => ({ schoolId, subjectId, classId }),
    [classId, schoolId, subjectId]
  )
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
    currentIndex > 0 ? lessons[currentIndex - 1] : undefined
  const nextLesson = currentIndex >= 0 ? lessons[currentIndex + 1] : undefined

  const backToCourse = useCallback(
    () =>
      navigate(
        HomeRoutes.toStudentElearningCourse(schoolId, subjectId, classId)
      ),
    [classId, navigate, schoolId, subjectId]
  )
  const openLesson = useCallback(
    (targetLessonId: string) =>
      navigate(
        HomeRoutes.toStudentElearningLesson(
          schoolId,
          subjectId,
          classId,
          targetLessonId
        )
      ),
    [classId, navigate, schoolId, subjectId]
  )

  useEffect(() => {
    if (!lessonId) return
    progressMutation.mutate({
      lessonId,
      lastPositionSeconds: 0,
      isCompleted: false,
    })
    // Opening a lesson is deliberately recorded once per lesson navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  const completeLesson = useCallback(async () => {
    if (!lesson) return
    setLocallyCompleted((current) => new Set(current).add(lesson.id))
    await progressMutation.mutateAsync({
      lessonId: lesson.id,
      lastPositionSeconds: Math.max(
        lesson.lastPositionSeconds,
        lesson.durationMinutes * 60
      ),
      isCompleted: true,
    })
  }, [lesson, progressMutation])

  const completeAndAdvance = useCallback(async () => {
    await completeLesson()
    if (autoAdvance && nextLesson) openLesson(nextLesson.id)
  }, [autoAdvance, completeLesson, nextLesson, openLesson])

  const continueManually = async () => {
    await completeLesson()
    if (nextLesson) openLesson(nextLesson.id)
    else backToCourse()
  }

  if (isLoading) {
    return (
      <div className="py-24 text-center text-sm text-slate-400">
        Loading lesson…
      </div>
    )
  }
  if (!workspace || !lesson) {
    return (
      <div className="py-24 text-center">
        <p className="font-semibold text-slate-800">Lesson not found</p>
        <Button variant="outline" className="mt-4" onClick={backToCourse}>
          Back to course
        </Button>
      </div>
    )
  }

  const completedCount = lessons.filter(
    (item) => item.isCompleted || locallyCompleted.has(item.id)
  ).length
  const videoUrl = lesson.videoUploadId
    ? (videoPlayback?.playbackUrl ?? "")
    : (lesson.videoUrl ?? "")

  return (
    <div className="-m-4 min-h-screen bg-slate-950 sm:-m-6">
      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-slate-950 px-4 py-3 text-white sm:px-6">
        <Button
          variant="ghost"
          className="gap-2 text-white hover:bg-white/10 hover:text-white"
          onClick={backToCourse}
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">
            Back to {workspace.subjectName}
          </span>
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-bold">{lesson.title}</p>
          <p className="text-xs text-slate-400">
            Lesson {currentIndex + 1} of {lessons.length}
          </p>
        </div>
        <button
          type="button"
          aria-pressed={autoAdvance}
          onClick={() => setAutoAdvance((current) => !current)}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 px-3 text-xs font-semibold"
        >
          <span
            className={cn(
              "size-2 rounded-full",
              autoAdvance ? "bg-emerald-400" : "bg-slate-500"
            )}
          />
          Autoplay {autoAdvance ? "on" : "off"}
        </button>
      </header>

      <div className="grid min-h-[calc(100vh-65px)] lg:grid-cols-[minmax(0,1fr)_410px]">
        <main className="min-w-0">
          {lesson.contentType === "video" && videoUrl ? (
            <div className="flex min-h-[58vh] items-center bg-black">
              <div className="aspect-video min-h-80 w-full">
                <CourseVideoPlayer
                  key={`${lesson.id}:${videoUrl}`}
                  url={videoUrl}
                  title={lesson.title}
                  autoPlay={autoAdvance}
                  onEnded={() => void completeAndAdvance()}
                />
              </div>
            </div>
          ) : lesson.contentType === "video" ? (
            <div className="flex min-h-[58vh] flex-col items-center justify-center gap-3 bg-black px-6 text-center text-slate-300">
              {videoPlaybackLoading && (
                <LoaderCircle className="size-7 animate-spin text-blue-400" />
              )}
              {(videoPlaybackLoading || videoPlaybackError) && <p role="status" className="text-sm">
                {videoPlaybackLoading ? "Preparing secure video playback…" : videoPlaybackError}
              </p>}
            </div>
          ) : (
            <div className="bg-white">
              <InteractiveHtmlLesson
                key={lesson.id}
                lessonId={lesson.id}
                title={lesson.title}
                html={lesson.htmlContent ?? ""}
                onComplete={() => void completeAndAdvance()}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/10 bg-slate-950 px-5 py-3 text-white">
            <Button
              variant="ghost"
              disabled={!previousLesson}
              onClick={() => previousLesson && openLesson(previousLesson.id)}
              className="gap-2 text-white hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="size-4" /> Previous
            </Button>
            <p className="hidden text-xs text-slate-400 md:block">
              {lesson.contentType === "video"
                ? autoAdvance
                  ? "The next lesson starts when this video finishes."
                  : "Select Complete & continue when you finish this video."
                : "Complete the activity, or continue when you are ready."}
            </p>
            <Button
              className="gap-2 rounded-xl"
              disabled={progressMutation.isPending}
              onClick={() => void continueManually()}
            >
              {nextLesson ? "Complete & continue" : "Finish course"}
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <section className="bg-slate-900 px-6 py-7 text-white sm:px-10">
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-4" /> {lesson.durationMinutes} min
                </span>
                <span>
                  {lesson.contentType === "video"
                    ? "Video lesson"
                    : "Interactive lesson"}
                </span>
                {lesson.materials.length > 0 && (
                  <span>{lesson.materials.length} resources</span>
                )}
              </div>
              {lesson.description && (
                <div
                  className="prose prose-invert prose-sm mt-5 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(lesson.description),
                  }}
                />
              )}
            </div>
          </section>
        </main>

        <aside className="border-l border-slate-200 bg-white lg:max-h-[calc(100vh-65px)] lg:overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-black text-slate-950">Course content</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {sections.length} sections · {lessons.length} lessons
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                {completedCount}/{lessons.length}
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {sections.map((section, sectionIndex) => (
              <section key={section.id}>
                <div className="bg-slate-50 px-5 py-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Section {sectionIndex + 1}: {section.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {section.lessons.length} lessons ·{" "}
                    {formatDurationMinutes(section.durationMinutes)}
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {section.lessons.map((item, index) => {
                    const active = item.id === lesson.id
                    const completed =
                      item.isCompleted || locallyCompleted.has(item.id)
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "px-4 py-3",
                          active ? "bg-blue-50" : "hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => openLesson(item.id)}
                            className="flex min-w-0 flex-1 items-start gap-3 text-left"
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
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
                                index + 1
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-slate-900">
                                {item.title}
                              </span>
                              <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                {item.contentType === "video" ? (
                                  <PlayCircle className="size-3.5" />
                                ) : (
                                  <FileText className="size-3.5" />
                                )}
                                {item.durationMinutes} min
                              </span>
                            </span>
                          </button>
                          {item.materials.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1 px-2 text-xs text-blue-700"
                                >
                                  <FolderOpen className="size-3.5" />{" "}
                                  <ChevronDown className="size-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="min-w-64"
                              >
                                {item.materials.map((resource) => (
                                  <DropdownMenuItem key={resource.id} asChild>
                                    <a
                                      href={resource.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      download
                                      className="flex cursor-pointer gap-2"
                                    >
                                      <Download className="size-4" />
                                      <span className="min-w-0 flex-1 truncate">
                                        {resource.displayName}
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
