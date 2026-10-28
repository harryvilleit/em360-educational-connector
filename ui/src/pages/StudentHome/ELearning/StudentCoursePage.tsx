import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  FolderOpen,
  MessageCircle,
  Mic,
  PlayCircle,
  Radio,
  Target,
  Video,
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
import { useStudentCourseWorkspace } from "@/hooks/elearning/useStudentELearning"
import { useGetLiveClasses } from "@/hooks/liveClass"
import StudentAdaptivePanel from "./StudentAdaptivePanel"
import type {
  StudentAssignmentI,
  StudentCourseSectionI,
  StudentCourseMaterialI,
  StudentLessonI,
} from "@/api/studentElearning.api"

type StudentCourseTab =
  | "curriculum"
  | "assignments"
  | "progress"
  | "ebooks"
  | "materials"
  | "recordings"
  | "live"
  | "chat"

const tabs: { id: StudentCourseTab; label: string; icon: typeof BookOpen }[] = [
  { id: "curriculum", label: "Curriculum", icon: BookOpen },
  { id: "assignments", label: "Assignments", icon: ClipboardCheck },
  { id: "progress", label: "My progress", icon: Target },
  { id: "ebooks", label: "E-Books", icon: BookOpen },
  { id: "materials", label: "Materials", icon: FileText },
  { id: "recordings", label: "Recordings", icon: Video },
  { id: "live", label: "Live classes", icon: Mic },
  { id: "chat", label: "Chat", icon: MessageCircle },
]

export default function StudentCoursePage() {
  const { schoolId = "", subjectId = "", classId = "" } = useParams<{
    schoolId: string
    subjectId: string
    classId: string
  }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<StudentCourseTab>("curriculum")
  const { workspace, isLoading, isError } = useStudentCourseWorkspace(
    schoolId,
    subjectId,
    classId
  )
  const { liveClasses } = useGetLiveClasses(
    { schoolId, schoolClassId: classId, pageSize: 100 },
    { refetchInterval: 20_000, staleTime: 10_000, refetchOnWindowFocus: true }
  )
  const courseLiveClasses = useMemo(
    () => liveClasses.filter((item) => item.subjectId === subjectId),
    [liveClasses, subjectId]
  )

  if (isLoading) {
    return <div className="py-24 text-center text-sm text-slate-400">Loading course…</div>
  }
  if (isError || !workspace) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <h1 className="text-xl font-bold text-slate-900">Course unavailable</h1>
        <p className="mt-2 text-sm text-slate-500">
          This course could not be loaded or is no longer part of your enrollment.
        </p>
        <Button
          variant="outline"
          className="mt-5"
          onClick={() => navigate(HomeRoutes.toStudentSubjects(schoolId))}
        >
          Back to courses
        </Button>
      </div>
    )
  }

  const firstLesson = workspace.sections
    .flatMap((section) => section.lessons)
    .sort((a, b) => a.sortOrder - b.sortOrder)[0]
  const continueLessonId = workspace.nextLessonId || firstLesson?.id
  const openLesson = (lessonId: string) =>
    navigate(
      HomeRoutes.toStudentElearningLesson(
        schoolId,
        subjectId,
        classId,
        lessonId
      )
    )

  return (
    <div className="pb-10">
      <button
        type="button"
        onClick={() => navigate(HomeRoutes.toStudentSubjects(schoolId))}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft className="size-4" /> Back to courses
      </button>

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 text-white shadow-xl">
        <div className="grid gap-8 px-6 py-8 sm:px-9 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100 ring-1 ring-white/15">
              {workspace.className}
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              {workspace.subjectName}
            </h1>
            <p className="mt-3 text-sm text-blue-100">
              {workspace.teacherName || "Teacher not assigned"} · {workspace.lessonCount} lessons
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                disabled={!continueLessonId}
                onClick={() => continueLessonId && openLesson(continueLessonId)}
                className="h-11 rounded-xl bg-white px-5 font-bold text-blue-800 hover:bg-blue-50"
              >
                <PlayCircle className="size-5" />
                {workspace.completedLessonCount > 0 ? "Continue learning" : "Start learning"}
              </Button>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/15">
                <CheckCircle2 className="size-4 text-emerald-300" />
                {workspace.completedLessonCount}/{workspace.lessonCount} completed
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
            <div className="flex items-end justify-between">
              <p className="text-sm font-medium text-blue-100">Your progress</p>
              <p className="text-3xl font-black">{Math.round(workspace.progressPercent)}%</p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                style={{ width: `${workspace.progressPercent}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-blue-100">
              Your progress is saved automatically on every lesson.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-7 overflow-x-auto border-b border-slate-200">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === "chat") {
                  navigate(
                    `${HomeRoutes.toStudentChat(schoolId)}?subjectId=${encodeURIComponent(subjectId)}&classId=${encodeURIComponent(classId)}`
                  )
                  return
                }
                setActiveTab(tab.id)
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-semibold transition",
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <tab.icon className="size-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "curriculum" && (
          <CurriculumPanel sections={workspace.sections} onOpenLesson={openLesson} />
        )}
        {activeTab === "assignments" && (
          <AssignmentsPanel
            assignments={workspace.assignments}
            onOpen={(assignment) =>
              navigate(
                HomeRoutes.toStudentElearningAssignment(
                  schoolId,
                  subjectId,
                  classId,
                  assignment.id
                )
              )
            }
          />
        )}
        {activeTab === "progress" && (
          <StudentAdaptivePanel
            course={{ schoolId, subjectId, classId }}
            onOpenLesson={openLesson}
          />
        )}
        {activeTab === "ebooks" && (
          <MaterialsPanel sections={workspace.sections} courseMaterials={workspace.courseMaterials ?? []} pdfOnly />
        )}
        {activeTab === "materials" && (
          <MaterialsPanel sections={workspace.sections} courseMaterials={workspace.courseMaterials ?? []} />
        )}
        {activeTab === "recordings" && (
          <RecordingsPanel recordings={workspace.recordings} />
        )}
        {activeTab === "live" && (
          <LiveClassesPanel
            classes={courseLiveClasses}
            onJoin={(sessionId) =>
              navigate(HomeRoutes.toStudentLiveRoom(schoolId, sessionId))
            }
          />
        )}
      </div>
    </div>
  )
}

function CurriculumPanel({
  sections,
  onOpenLesson,
}: {
  sections: StudentCourseSectionI[]
  onOpenLesson: (lessonId: string) => void
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  if (sections.length === 0) return <EmptyPanel label="Course lessons have not been added yet." />
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-bold text-slate-950">Course content</h2>
        <p className="mt-1 text-sm text-slate-500">
          {sections.length} sections · {sections.reduce((sum, s) => sum + s.lessons.length, 0)} lessons
        </p>
      </div>
      <div className="divide-y divide-slate-200">
        {sections.map((section, sectionIndex) => {
          const isCollapsed = collapsed.has(section.id)
          return (
            <div key={section.id}>
              <button
                type="button"
                onClick={() =>
                  setCollapsed((current) => {
                    const next = new Set(current)
                    if (next.has(section.id)) next.delete(section.id)
                    else next.add(section.id)
                    return next
                  })
                }
                className="flex w-full items-center justify-between gap-4 bg-slate-50 px-5 py-4 text-left sm:px-6"
              >
                <span>
                  <span className="block font-bold text-slate-900">
                    Section {sectionIndex + 1}: {section.title}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {section.completedLessons}/{section.lessons.length} completed · {section.durationMinutes} min
                  </span>
                </span>
                <ChevronDown className={cn("size-5 transition", isCollapsed && "-rotate-90")} />
              </button>
              {!isCollapsed && (
                <div className="divide-y divide-slate-100">
                  {section.lessons.map((lesson, lessonIndex) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      number={lessonIndex + 1}
                      onOpen={() => onOpenLesson(lesson.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function LessonRow({ lesson, number, onOpen }: { lesson: StudentLessonI; number: number; onOpen: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:flex-nowrap sm:px-6">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 text-left">
        <span className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          lesson.isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-700"
        )}>
          {lesson.isCompleted ? <CheckCircle2 className="size-4" /> : number}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold text-slate-900">{lesson.title}</span>
          <span className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            {lesson.contentType === "video" ? <PlayCircle className="size-3.5" /> : <FileText className="size-3.5" />}
            {lesson.contentType === "video" ? "Video" : "Interactive content"} · {lesson.durationMinutes} min
          </span>
        </span>
      </button>
      {lesson.materials.length > 0 && <ResourceMenu lesson={lesson} />}
      <Button variant="outline" className="h-9 rounded-lg" onClick={onOpen}>
        {lesson.isCompleted ? "Study again" : "View"}
      </Button>
    </div>
  )
}

function ResourceMenu({ lesson }: { lesson: StudentLessonI }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 gap-1.5 rounded-lg text-blue-700">
          <FolderOpen className="size-4" /> Resources <ChevronDown className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        {lesson.materials.map((material) => (
          <DropdownMenuItem key={material.id} asChild>
            <a href={material.fileUrl} target="_blank" rel="noreferrer" download className="flex cursor-pointer gap-2">
              <Download className="size-4" />
              <span className="min-w-0 flex-1 truncate">{material.displayName}</span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AssignmentsPanel({ assignments, onOpen }: { assignments: StudentAssignmentI[]; onOpen: (assignment: StudentAssignmentI) => void }) {
  if (assignments.length === 0) return <EmptyPanel label="No approved assignments are available." />
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {assignments.map((assignment) => {
        const closed = assignment.studentStatus === "submitted" || assignment.studentStatus === "ended"
        return (
          <article key={assignment.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                  {assignment.assignmentType === "voice" ? "Voice CBT" : "CBT"}
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-950">{assignment.title}</h3>
              </div>
              <span className={cn(
                "rounded-full px-2.5 py-1 text-xs font-bold capitalize",
                closed ? "bg-slate-100 text-slate-600" : assignment.studentStatus === "in_progress" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              )}>
                {assignment.studentStatus.replace("_", " ")}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><ClipboardCheck className="size-3.5" /> {assignment.questions.length} questions</span>
              <span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" /> {assignment.durationMinutes || "Untimed"}{assignment.durationMinutes ? " min" : ""}</span>
            </div>
            <p className="mt-3 text-xs text-slate-500">Due {new Date(assignment.dueDateUtc).toLocaleString()}</p>
            <Button
              className="mt-5 w-full rounded-xl"
              variant={closed ? "outline" : "default"}
              disabled={closed}
              onClick={() => onOpen(assignment)}
            >
              {assignment.studentStatus === "in_progress" ? "Continue assignment" : assignment.studentStatus === "reopened" ? "Restart assignment" : closed ? "Assignment closed" : "Start assignment"}
            </Button>
            {assignment.studentStatus === "ended" && (
              <p className="mt-2 text-center text-xs text-amber-700">Ask your teacher to reopen this assignment.</p>
            )}
          </article>
        )
      })}
    </div>
  )
}

function MaterialsPanel({ sections, courseMaterials, pdfOnly = false }: {
  sections: StudentCourseSectionI[]
  courseMaterials: StudentCourseMaterialI[]
  pdfOnly?: boolean
}) {
  const isPdf = (file: { contentType: string; originalFileName: string }) =>
    file.contentType === "application/pdf" || file.originalFileName.toLowerCase().endsWith(".pdf")
  const materials = sections.flatMap((section) => section.lessons.flatMap((lesson) => lesson.materials.map((material) => ({ ...material, lessonTitle: lesson.title }))))
    .filter((material) => !pdfOnly || isPdf(material))
  const visibleCourseMaterials = courseMaterials.filter((material) => !pdfOnly || isPdf(material))
  if (materials.length === 0 && visibleCourseMaterials.length === 0) return <EmptyPanel label={pdfOnly ? "No PDF books are available yet." : "No course materials are available."} />
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">
        {visibleCourseMaterials.map((material) => (
          <div key={material.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{material.originalFileName}</p>
              <p className="mt-1 text-xs text-slate-500">Course resource</p>
            </div>
            <Button variant="outline" asChild className="shrink-0 rounded-lg">
              <a href={material.fileUrl} target="_blank" rel="noreferrer" download><Download className="size-4" /> Download</a>
            </Button>
          </div>
        ))}
        {materials.map((material) => (
          <div key={material.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{material.displayName}</p>
              <p className="mt-1 text-xs text-slate-500">{material.lessonTitle} · {material.originalFileName}</p>
            </div>
            <Button variant="outline" asChild className="shrink-0 rounded-lg">
              <a href={material.fileUrl} target="_blank" rel="noreferrer" download><Download className="size-4" /> Download</a>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecordingsPanel({ recordings }: { recordings: { id: string; title: string; fileUrl?: string | null; recordedAtUtc: string; durationSeconds?: number | null }[] }) {
  if (recordings.length === 0) return <EmptyPanel label="Recordings will appear after live classes end." />
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {recordings.map((recording) => (
        <article key={recording.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex aspect-video items-center justify-center bg-slate-950"><Video className="size-10 text-blue-300" /></div>
          <div className="p-4">
            <h3 className="font-bold text-slate-900">{recording.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{new Date(recording.recordedAtUtc).toLocaleString()} · {recording.durationSeconds ? `${Math.ceil(recording.durationSeconds / 60)} min` : "Duration unavailable"}</p>
            {recording.fileUrl && <Button asChild variant="outline" className="mt-4 w-full rounded-xl"><a href={recording.fileUrl} target="_blank" rel="noreferrer"><PlayCircle className="size-4" /> Watch recording</a></Button>}
          </div>
        </article>
      ))}
    </div>
  )
}

function LiveClassesPanel({ classes, onJoin }: { classes: { id: string; title: string; status: string; scheduledDate: string; startTime: string; endTime: string; teacherName?: string | null }[]; onJoin: (id: string) => void }) {
  if (classes.length === 0) return <EmptyPanel label="No live classes are scheduled for this course." />
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {classes.map((item) => (
        <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <Radio className={cn("size-5", item.status === "Live" ? "animate-pulse text-rose-500" : "text-blue-500")} />
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{item.status}</span>
          </div>
          <h3 className="mt-4 font-bold text-slate-900">{item.title}</h3>
          <p className="mt-2 text-sm text-slate-500">{new Date(`${item.scheduledDate}T00:00:00`).toLocaleDateString()} · {item.startTime.slice(0, 5)}–{item.endTime.slice(0, 5)}</p>
          <Button className="mt-4 w-full rounded-xl" disabled={item.status !== "Live"} onClick={() => onJoin(item.id)}>{item.status === "Live" ? "Join class" : "Not live yet"}</Button>
        </article>
      ))}
    </div>
  )
}

function EmptyPanel({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500">{label}</div>
}
