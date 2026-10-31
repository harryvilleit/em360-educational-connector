import { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, BookOpen, CheckCircle2, ClipboardCheck, Download, FileText, PlayCircle, Video } from "lucide-react"
import { getParentCourse, getParentLessonPlayback, type ParentCourseDetail } from "@/api/parentCourses.api"
import { HomeRoutes } from "@/routes"
import CourseVideoPlayer from "@/pages/Dashboard/ELearning/components/CourseVideoPlayer"
import { sanitizeHtml } from "@/lib/sanitizeHtml"

type Tab = "curriculum" | "assignments" | "ebooks" | "materials" | "recordings"
const tabs: { id: Tab; title: string; icon: typeof BookOpen }[] = [
  { id: "curriculum", title: "Curriculum", icon: BookOpen },
  { id: "assignments", title: "Assignments", icon: ClipboardCheck },
  { id: "ebooks", title: "E-Books", icon: BookOpen },
  { id: "materials", title: "Materials", icon: FileText },
  { id: "recordings", title: "Recordings", icon: Video },
]

const dateText = (value: string) => new Date(value).toLocaleString(undefined, {
  dateStyle: "medium", timeStyle: "short",
})

export default function ParentCoursePage() {
  const { schoolId = "", studentId = "", classId = "", subjectId = "" } = useParams()
  const [params] = useSearchParams()
  const sessionId = params.get("sessionId") ?? ""
  const termId = params.get("termId") ?? ""
  const [tab, setTab] = useState<Tab>("curriculum")
  const [lessonId, setLessonId] = useState("")
  const navigate = useNavigate()
  const { data: course, isPending, isError } = useQuery({
    queryKey: ["parent-course", schoolId, studentId, sessionId, termId, classId, subjectId],
    queryFn: () => getParentCourse({ schoolId, studentId, sessionId, termId, classId, subjectId }),
    enabled: !!schoolId && !!studentId && !!sessionId && !!termId && !!classId && !!subjectId,
  })
  const lesson = course?.sections.flatMap(section => section.lessons).find(item => item.id === lessonId)
  const { data: playback, isPending: videoLoading, isError: videoError } = useQuery({
    queryKey: ["parent-lesson-playback", schoolId, studentId, sessionId, termId, classId, subjectId, lessonId],
    queryFn: () => getParentLessonPlayback({ schoolId, studentId, sessionId, termId, classId, subjectId, lessonId }),
    enabled: !!lesson?.hasVideo,
    staleTime: 0,
  })
  const back = () => navigate(HomeRoutes.toParentElectives(schoolId))

  return (
    <div className="pb-12">
      <button type="button" onClick={back} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600">
        <ArrowLeft className="size-4" /> Back to courses
      </button>
      {!sessionId || !termId ? (
        <Empty text="Choose a session and term from the courses page." />
      ) : isPending ? (
        <div className="py-24 text-center text-sm text-slate-500">Loading course…</div>
      ) : isError || !course ? (
        <Empty text="This course is unavailable for the selected child and term." />
      ) : (
        <>
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 px-6 py-8 text-white shadow-xl sm:px-9">
            <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center">
              <div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">{course.className}</span>
                <h1 className="mt-4 text-3xl font-black sm:text-4xl">{course.subjectName}</h1>
                <p className="mt-3 text-sm text-blue-100">{course.teacherName || "Teacher not assigned"} · {course.lessonCount} lessons</p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm ring-1 ring-white/15">
                  <CheckCircle2 className="size-4 text-emerald-300" /> {course.completedLessonCount}/{course.lessonCount} lessons completed by your child
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
                <div className="flex items-end justify-between"><span className="text-sm text-blue-100">Child's progress</span><strong className="text-3xl">{Math.round(course.progressPercent)}%</strong></div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${Math.min(100, Math.max(0, course.progressPercent))}%` }} /></div>
                <p className="mt-3 text-xs text-blue-100">Progress reflects your child's completed lessons.</p>
              </div>
            </div>
          </section>
          {lesson && <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <button type="button" onClick={() => setLessonId("")} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700"><ArrowLeft className="size-4" /> Back to course content</button>
            <h2 className="text-xl font-bold text-slate-950">{lesson.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{lesson.isCompleted ? "Completed by your child" : "Not completed"} · Read-only lesson view</p>
            {lesson.hasVideo && (videoLoading ? <p className="mt-5 text-sm text-slate-500">Preparing video…</p> : videoError || !playback?.playbackUrl ? <p className="mt-5 text-sm text-amber-700">Video is currently unavailable.</p> :
              <div className="mt-5 aspect-video min-h-80 overflow-hidden rounded-xl bg-black">
                <CourseVideoPlayer url={playback.playbackUrl} title={lesson.title} /></div>)}
            {lesson.description && <p className="mt-5 text-sm text-slate-700">{lesson.description}</p>}
            {lesson.htmlContent && <div className="prose mt-5 max-w-none text-sm text-slate-800" dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.htmlContent) }} />}
            {lesson.materials.map(file => <a key={file.id} href={file.fileUrl} target="_blank" rel="noreferrer" className="mt-4 mr-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700"><Download className="size-4" />{file.displayName}</a>)}
          </section>}
          {!lesson && <><div className="mt-7 overflow-x-auto border-b border-slate-200">
            <div className="flex min-w-max gap-1" role="tablist" aria-label="Course information">
              {tabs.map(({ id, title, icon: Icon }) => (
                <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                  className={`inline-flex items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-semibold ${tab === id ? "border-b-2 border-blue-600 bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
                  <Icon className="size-4" /> {title}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6" role="tabpanel">
            {tab === "curriculum" && <Curriculum course={course} onOpenLesson={setLessonId} />}
            {tab === "assignments" && <Assignments course={course} />}
            {(tab === "ebooks" || tab === "materials") && <Materials course={course} pdfOnly={tab === "ebooks"} />}
            {tab === "recordings" && (course.recordings.length ? (
              <div className="grid gap-4 md:grid-cols-2">{course.recordings.map(recording => (
                <article key={recording.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <Video className="size-7 text-blue-600" /><h3 className="mt-3 font-bold text-slate-900">{recording.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{dateText(recording.startedAtUtc)}</p>
                  {recording.fileUrl && <a href={recording.fileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600"><PlayCircle className="size-4" /> Watch recording</a>}
                </article>
              ))}</div>
            ) : <Empty text="No recordings are available yet." />)}
          </div>
          </>}
        </>
      )}
    </div>
  )
}

function Curriculum({ course, onOpenLesson }: { course: ParentCourseDetail; onOpenLesson: (id: string) => void }) {
  if (!course.sections.length) return <Empty text="No lessons have been added to this course yet." />
  return <div className="space-y-4">{course.sections.map((section, index) => (
    <section key={section.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4"><span className="text-xs font-bold uppercase tracking-wide text-blue-600">Section {index + 1}</span><h2 className="font-bold text-slate-950">{section.title}</h2></div>
      <div className="divide-y divide-slate-100">{section.lessons.map(lesson => (
        <div key={lesson.id} className="flex gap-3 px-5 py-4">
          {lesson.isCompleted ? <CheckCircle2 className="mt-1 size-5 shrink-0 text-emerald-600" /> : <BookOpen className="mt-1 size-5 shrink-0 text-blue-600" />}
          <div><p className="font-semibold text-slate-900">{lesson.title}</p><p className="mt-1 text-xs text-slate-500">{lesson.contentType === "video" ? "Video" : "Lesson"} · {lesson.durationMinutes} min · {lesson.isCompleted ? "Completed" : "Not completed"}</p>
            {lesson.description && <p className="mt-2 text-sm text-slate-600">{lesson.description}</p>}
            <button type="button" className="mt-2 text-sm font-semibold text-blue-700 hover:underline" onClick={() => onOpenLesson(lesson.id)}>View lesson</button>
            {lesson.materials.map(material => <a key={material.id} href={material.fileUrl} target="_blank" rel="noreferrer" className="mt-2 mr-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600"><Download className="size-3.5" />{material.displayName}</a>)}
          </div>
        </div>
      ))}</div>
    </section>
  ))}</div>
}

function Assignments({ course }: { course: ParentCourseDetail }) {
  if (!course.assignments.length) return <Empty text="No assignments are available for this course and term." />
  return <div className="grid gap-4 md:grid-cols-2">{course.assignments.map(assignment => {
    const done = !!assignment.submittedAtUtc
    const marked = assignment.score !== null
    const status = assignment.status === "in_progress" ? "In progress" : marked ? "Marked" : done ? "Submitted · awaiting marking" : assignment.status === "ended" ? "Ended without submission" : "Not submitted"
    return <article key={assignment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3"><h3 className="font-bold text-slate-950">{assignment.title}</h3><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${marked ? "bg-emerald-100 text-emerald-700" : done ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{status}</span></div>
      <p className="mt-3 text-sm text-slate-600">Due {dateText(assignment.dueDateUtc)}</p>
      {assignment.submittedAtUtc && <p className="mt-1 text-xs text-slate-500">Submitted {dateText(assignment.submittedAtUtc)}</p>}
      {assignment.instructions && <p className="mt-3 text-sm text-slate-600">{assignment.instructions}</p>}
      {marked && <div className="mt-4 rounded-xl bg-emerald-50 p-4"><p className="font-bold text-emerald-900">Result{assignment.markedAttemptNumber ? ` (attempt ${assignment.markedAttemptNumber})` : ""}: {assignment.score}%</p>
        {assignment.feedback.length > 0 && <div className="mt-2 space-y-1 text-sm text-emerald-900">{assignment.feedback.map((feedback, index) => <p key={index}>{feedback}</p>)}</div>}
      </div>}
    </article>
  })}</div>
}

function Materials({ course, pdfOnly }: { course: ParentCourseDetail; pdfOnly: boolean }) {
  const files = [
    ...course.courseMaterials.map(file => ({ ...file, name: file.originalFileName, origin: "Course resource" })),
    ...course.sections.flatMap(section => section.lessons.flatMap(lesson => lesson.materials.map(file => ({ ...file, name: file.displayName, origin: lesson.title })))),
  ].filter(file => !pdfOnly || file.contentType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))
  if (!files.length) return <Empty text={pdfOnly ? "No E-Books are available yet." : "No materials are available yet."} />
  return <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    {files.map(file => <div key={file.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><p className="truncate font-semibold text-slate-900">{file.name}</p><p className="text-xs text-slate-500">{file.origin}</p></div>
      <a href={file.fileUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-blue-700"><Download className="size-4" /> Download</a></div>)}
  </div>
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500">{text}</div>
}
