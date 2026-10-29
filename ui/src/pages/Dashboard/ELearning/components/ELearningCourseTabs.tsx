import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import {
  Plus,
  FileText,
  BookOpen,
  Video,
  Mic,
  ClipboardList,
  Users,
  MessageCircle,
  Download,
  PlayCircle,
  Brain,
  LayoutGrid,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { dashboardCardSurface } from "@/components/general/StatCard"
import { DashboardRoutes } from "@/routes"
import { useELearningStore } from "@/store/elearning.store"
import { filterByCourse } from "@/lib/elearning-course"
import type {
  LiveClassSession,
  ClassRecording,
  ELearningAssignment,
  LmsCourseModule,
  LmsEnrollment,
  SchoolSubjectCourse,
} from "@/types/elearning"
import type { CourseTab } from "../../Lms/components/CourseTabs"
import UpcomingClassesList from "./UpcomingClassesList"
import AssignmentsTable from "./AssignmentsTable"
import AssignmentFormModal from "./AssignmentFormModal"
import AdaptiveInsightsPanel from "./AdaptiveInsightsPanel"
import CourseOverviewPanel from "./CourseOverviewPanel"
import type { AssignmentForm } from "./AssignmentFormModal"
import type {
  TeacherCourseAssignmentAnswerModeI,
  TeacherCourseAssignmentImportResponseI,
  TeacherCourseRefI,
  TeacherCourseMaterialUploadI,
} from "@/api/teacherCourse.api"
import { toast } from "sonner"

export type { CourseTab }

const tabs: { id: CourseTab; label: string; icon: typeof FileText }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "curriculum", label: "Curriculum", icon: FileText },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "insights", label: "Insights", icon: Brain },
  { id: "certificates", label: "E-Books", icon: BookOpen },
  { id: "materials", label: "Materials", icon: FileText },
  { id: "recordings", label: "Recordings", icon: Video },
  { id: "live", label: "Live classes", icon: Mic },
  { id: "enrollments", label: "Students", icon: Users },
  { id: "chat", label: "Chat", icon: MessageCircle },
]

type ELearningCourseTabsProps = {
  course: SchoolSubjectCourse
  modules: LmsCourseModule[]
  sessions: LiveClassSession[]
  recordings?: ClassRecording[]
  enrollments?: LmsEnrollment[]
  assignments?: ELearningAssignment[]
  courseRef?: TeacherCourseRefI
  courseMaterials?: TeacherCourseMaterialUploadI[]
  canManageCurriculum?: boolean
  onUploadCourseMaterial?: (file: File) => void | Promise<void>
  isUploadingCourseMaterial?: boolean
  activeTab: CourseTab
  onTabChange: (tab: CourseTab) => void
  curriculumSlot: React.ReactNode
  onJoinSession?: (session: LiveClassSession) => void | Promise<void>
  isJoiningSession?: boolean
  onCreateAssignment?: (assignment: AssignmentForm) => void | Promise<void>
  onUpdateAssignment?: (
    assignmentId: string,
    assignment: AssignmentForm
  ) => void | Promise<void>
  onApproveAssignment?: (assignmentId: string) => void | Promise<unknown>
  onDeleteAssignment?: (assignmentId: string) => void | Promise<unknown>
  onReopenAssignment?: (
    assignmentId: string,
    attemptId: string
  ) => void | Promise<unknown>
  onInterpretAssignmentDocument?: (
    file: File,
    answerMode: TeacherCourseAssignmentAnswerModeI
  ) => Promise<TeacherCourseAssignmentImportResponseI>
  isInterpretingAssignment?: boolean
  isPublishingAssignment?: boolean
  isApprovingAssignment?: boolean
  isDeletingAssignment?: boolean
  isReopeningAssignment?: boolean
  readOnly?: boolean
  /** Extra content for the Overview tab's side column (e.g. the AI course builder). */
  overviewAside?: React.ReactNode
  /** Lets the page header open the create-assignment form. */
  createAssignmentOpen?: boolean
  onCreateAssignmentOpenChange?: (open: boolean) => void
}

export default function ELearningCourseTabs({
  course,
  modules,
  sessions,
  recordings: recordingsProp,
  enrollments: enrollmentsProp,
  assignments: assignmentsProp,
  courseRef,
  courseMaterials = [],
  canManageCurriculum = true,
  onUploadCourseMaterial,
  isUploadingCourseMaterial = false,
  activeTab,
  onTabChange,
  curriculumSlot,
  onJoinSession,
  isJoiningSession = false,
  onCreateAssignment,
  onUpdateAssignment,
  onApproveAssignment,
  onDeleteAssignment,
  onReopenAssignment,
  onInterpretAssignmentDocument,
  isInterpretingAssignment = false,
  isPublishingAssignment = false,
  isApprovingAssignment = false,
  isDeletingAssignment = false,
  isReopeningAssignment = false,
  readOnly = false,
  overviewAside,
  createAssignmentOpen: createAssignmentOpenProp,
  onCreateAssignmentOpenChange,
}: ELearningCourseTabsProps) {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const assignments = useELearningStore((s) => s.assignments)
  const recordingsStore = useELearningStore((s) => s.recordings)
  const addAssignment = useELearningStore((s) => s.addAssignment)

  const [createAssignmentOpenState, setCreateAssignmentOpenState] = useState(false)
  const createAssignmentOpen = createAssignmentOpenProp ?? createAssignmentOpenState
  const setCreateAssignmentOpen = (open: boolean) => {
    if (onCreateAssignmentOpenChange) onCreateAssignmentOpenChange(open)
    else setCreateAssignmentOpenState(open)
  }
  const [editingAssignment, setEditingAssignment] =
    useState<ELearningAssignment | null>(null)

  const courseAssignments = useMemo(
    () => assignmentsProp ?? filterByCourse(assignments, course),
    [assignments, assignmentsProp, course]
  )

  const courseRecordings = useMemo(
    () => recordingsProp ?? filterByCourse(recordingsStore, course),
    [recordingsProp, recordingsStore, course]
  )

  const lessonMaterials = useMemo(() => {
    const lessons = modules.flatMap((m) => m.lessons)
    return lessons.flatMap((l) =>
      (l.materials ?? []).map((mat) => ({
        ...mat,
        lessonTitle: l.title,
        lessonId: l.id,
      }))
    )
  }, [modules])
  const eBooks = [
    ...courseMaterials.filter((material) =>
      material.contentType === "application/pdf" || material.originalFileName.toLowerCase().endsWith(".pdf")
    ).map((material) => ({ id: material.id, title: material.originalFileName, url: material.fileUrl })),
    ...lessonMaterials.filter((material) => material.type === "pdf").map((material) => ({
      id: material.id, title: material.title, url: material.url,
    })),
  ]

  const courseEnrollments = useMemo(
    () => enrollmentsProp ?? [],
    [enrollmentsProp]
  )

  const enrollmentCols: DataTableColumn<LmsEnrollment>[] = [
    { key: "name", header: "Student", render: (r) => r.learnerName },
    { key: "email", header: "Email", render: (r) => r.email },
    {
      key: "progress",
      header: "Study progress",
      render: (r) => (
        <div className="min-w-44">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              {Math.round(r.progress)}%
            </span>
            <span className="text-muted-foreground">
              {r.completedLessons ?? 0}/{r.totalLessons ?? 0} lessons
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                r.progress >= 100 ? "bg-emerald-500" : "bg-blue-600"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, r.progress))}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "last-studied",
      header: "Last studied",
      render: (r) =>
        r.lastStudiedAt
          ? new Date(r.lastStudiedAt).toLocaleString()
          : "Not started",
    },
    { key: "status", header: "Status", render: (r) => r.status },
  ]

  const courseDefaults = {
    schoolId: courseRef?.schoolId,
    courseId: course.id,
    subject: course.subject,
    className: course.className,
    uploadedBy: course.teacherName,
    totalStudents: course.studentCount,
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] space-y-4">
      {!canManageCurriculum && (
        <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Sections and lessons require an active Professional or Complete plan. Assignments, Materials and E-Books remain available.
        </p>
      )}
      <div
        role="tablist"
        aria-label="Course sections"
        className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-2xl bg-slate-100 p-1"
      >
        {tabs
          .filter((tab) => !readOnly || tab.id !== "chat")
          .map((tab) => (
            <button
              key={tab.id}
              type="button"
              disabled={tab.id === "curriculum" && !canManageCurriculum}
              title={tab.id === "curriculum" && !canManageCurriculum
                ? "Curriculum requires an active Professional or Complete plan"
                : undefined}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                activeTab === tab.id
                  ? "bg-white font-semibold text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <tab.icon className="size-3.5" />
              {tab.label}
            </button>
          ))}
      </div>

      {activeTab === "overview" && (
        <CourseOverviewPanel
          modules={modules}
          sessions={sessions}
          assignments={courseAssignments}
          enrollments={courseEnrollments}
          courseRef={courseRef}
          canManageCurriculum={canManageCurriculum}
          readOnly={readOnly}
          onTabChange={onTabChange}
          onCreateAssignment={readOnly ? undefined : () => setCreateAssignmentOpen(true)}
          onJoinSession={onJoinSession}
          asideSlot={overviewAside}
        />
      )}

      {activeTab === "curriculum" && curriculumSlot}

      {activeTab === "assignments" && (
        <div className={dashboardCardSurface}>
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="font-semibold">Assignments</h3>
              <p className="text-xs text-muted-foreground">
                {readOnly
                  ? "Review assignments created for this class"
                  : "Create objective, written, or voice-answer CBTs for this class"}
              </p>
            </div>
            {!readOnly && (
              <Button
                size="sm"
                className="h-8 rounded-md"
                onClick={() => setCreateAssignmentOpen(true)}
              >
                <Plus className="size-3.5" />
                Create assignment
              </Button>
            )}
          </div>
          <AssignmentsTable
            assignments={courseAssignments}
            courseRef={courseRef}
            onEdit={(assignment) => setEditingAssignment(assignment)}
            onApprove={onApproveAssignment}
            onDelete={onDeleteAssignment}
            onReopen={onReopenAssignment}
            isApproving={isApprovingAssignment}
            isDeleting={isDeletingAssignment}
            isReopening={isReopeningAssignment}
            readOnly={readOnly}
            compact
          />
        </div>
      )}

      {activeTab === "insights" && (
        <AdaptiveInsightsPanel courseRef={courseRef} readOnly={readOnly} />
      )}

      {activeTab === "certificates" && (
        <div className={dashboardCardSurface}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="font-semibold">E-Books</h3>
            <p className="text-xs text-muted-foreground">PDF books uploaded under Materials appear here.</p>
          </div>
          {eBooks.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No PDF books uploaded yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {eBooks.map((book) => (
                <div key={book.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="min-w-0 truncate text-sm font-medium">{book.title}</span>
                  {book.url && <Button variant="outline" className="h-8 shrink-0" asChild>
                    <a href={book.url} target="_blank" rel="noreferrer">Open book</a>
                  </Button>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "materials" && (
        <div className={dashboardCardSurface}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="font-semibold">Course materials</h3>
              <p className="text-xs text-muted-foreground">
                Share resources with students without creating sections or lessons.
              </p>
            </div>
            {onUploadCourseMaterial && (
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                {isUploadingCourseMaterial ? "Uploading…" : "Upload material"}
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                  disabled={isUploadingCourseMaterial}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0]
                    event.currentTarget.value = ""
                    if (file) void onUploadCourseMaterial(file)
                  }}
                />
              </label>
            )}
          </div>
          {courseMaterials.length === 0 && lessonMaterials.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No materials uploaded yet
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {courseMaterials.map((material) => (
                <div key={material.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{material.originalFileName}</p>
                    <p className="text-xs text-muted-foreground">Course resource</p>
                  </div>
                  <Button variant="outline" className="h-8 shrink-0 gap-1.5 rounded-md" asChild>
                    <a href={material.fileUrl} target="_blank" rel="noreferrer" download>
                      <Download className="size-3.5" /> Download
                    </a>
                  </Button>
                </div>
              ))}
              {lessonMaterials.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.lessonTitle} · {m.type}
                    </p>
                  </div>
                  {m.url && (
                    <Button
                      variant="outline"
                      className="h-8 shrink-0 gap-1.5 rounded-md"
                      asChild
                    >
                      <a href={m.url} target="_blank" rel="noreferrer" download>
                        <Download className="size-3.5" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "recordings" && (
        <div className={dashboardCardSurface}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="font-semibold">Session recordings</h3>
          </div>
          {courseRecordings.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Recordings appear after live sessions end
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {courseRecordings.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.recordedAt).toLocaleString()} · {r.duration}
                    </span>
                  </div>
                  {r.videoUrl && (
                    <Button variant="outline" className="h-8 gap-1.5" asChild>
                      <a href={r.videoUrl} target="_blank" rel="noreferrer">
                        <PlayCircle className="size-3.5" />
                        Watch
                      </a>
                    </Button>
                  )}
                  <div>
                    <p className="text-sm font-medium">{r.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.recordedAt).toLocaleString()} · {r.duration}
                    </span>
                  </div>
                  {r.videoUrl && (
                    <Button variant="outline" className="h-8 gap-1.5" asChild>
                      <a href={r.videoUrl} target="_blank" rel="noreferrer">
                        <PlayCircle className="size-3.5" />
                        Watch
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "live" && (
        <div className="space-y-4">
          <UpcomingClassesList
            sessions={sessions}
            emptyMessage="No online or hybrid timetable periods for this course in the current term"
            isJoining={isJoiningSession}
            onJoin={
              readOnly
                ? undefined
                : (session) => {
                    if (onJoinSession) {
                      void onJoinSession(session)
                      return
                    }
                    navigate(
                      DashboardRoutes.toELearningLiveRoom(
                        productId ?? "",
                        session.id
                      )
                    )
                  }
            }
          />
        </div>
      )}

      {activeTab === "enrollments" && (
        <div className={dashboardCardSurface}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="font-semibold">Students offering this course</h3>
            <p className="text-xs text-muted-foreground">
              Active subject enrollments for this class
            </p>
          </div>
          <DataTable
            columns={enrollmentCols}
            data={courseEnrollments}
            getRowKey={(r) => r.id}
            emptyState={
              <div className="py-12 text-center text-sm text-muted-foreground">
                No enrollments yet
              </div>
            }
          />
        </div>
      )}

      {!readOnly && (
        <AssignmentFormModal
          open={createAssignmentOpen || !!editingAssignment}
          initialAssignment={editingAssignment}
          onClose={() => {
            setCreateAssignmentOpen(false)
            setEditingAssignment(null)
          }}
          courseDefaults={courseDefaults}
          onInterpretDocument={onInterpretAssignmentDocument}
          isInterpreting={isInterpretingAssignment}
          isSaving={isPublishingAssignment}
          onSubmit={async (data) => {
            if (editingAssignment && onUpdateAssignment) {
              await onUpdateAssignment(editingAssignment.id, data)
              setEditingAssignment(null)
              return
            }
            if (onCreateAssignment) {
              await onCreateAssignment(data)
              return
            }
            addAssignment({ ...data, status: "draft" })
            toast.success("Assignment saved as draft")
          }}
        />
      )}
    </div>
  )
}
