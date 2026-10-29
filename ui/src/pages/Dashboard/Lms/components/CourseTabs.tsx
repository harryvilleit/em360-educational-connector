import CourseLearnersPanel from "./CourseLearnersPanel"
import { useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import {
  Plus,
  FileText,
  Award,
  Video,
  Mic,
  ClipboardList,
  Users,
  Eye,
  TicketPercent,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { dashboardCardSurface } from "@/components/general/StatCard"
import { DashboardRoutes } from "@/routes"
import { useLmsStore } from "@/store/lms.store"
import type {
  LmsCertificate,
  LmsCourse,
  LmsCourseModule,
  LiveClassSession,
} from "@/types/elearning"
import UpcomingClassesList from "../../ELearning/components/UpcomingClassesList"
import ScheduleCourseLiveClassModal from "./ScheduleCourseLiveClassModal"
import CourseAssignmentsPanel from "./CourseAssignmentsPanel"
import CourseMaterialUploadDialog from "./CourseMaterialUploadDialog"
import LessonMediaPreviewModal, {
  type LessonMediaPreview,
} from "./LessonMediaPreviewModal"
import { useState } from "react"
import { toast } from "sonner"
import { useTutorCourses } from "@/hooks/course"
import { useTutorMyProfile } from "@/hooks/tutor"
import {
  useMyLmsLiveClasses,
  useSaveLmsLiveClass,
  useTutorLmsLiveClasses,
} from "@/hooks/lmsLiveClass"
import { buildLiveClassPayload } from "@/lib/lms-live-class-form"
import CourseCouponsPanel from "./CourseCouponsPanel"

export type CourseTab =
  | "overview"
  | "curriculum"
  | "assignments"
  | "certificates"
  | "materials"
  | "recordings"
  | "live"
  | "enrollments"
  | "coupons"
  | "chat"
  | "insights"

const tabs: { id: CourseTab; label: string; icon: typeof FileText }[] = [
  { id: "curriculum", label: "Curriculum", icon: FileText },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "materials", label: "Materials", icon: FileText },
  { id: "recordings", label: "Recordings", icon: Video },
  { id: "live", label: "Live classes", icon: Mic },
  { id: "enrollments", label: "Enrollments", icon: Users },
  { id: "coupons", label: "Coupons", icon: TicketPercent },
]

type CourseTabsProps = {
  course: LmsCourse
  modules: LmsCourseModule[]
  activeTab: CourseTab
  onTabChange: (tab: CourseTab) => void
  isTutor: boolean
  curriculumSlot: React.ReactNode
}

export default function CourseTabs({
  course,
  modules,
  activeTab,
  onTabChange,
  isTutor,
  curriculumSlot,
}: CourseTabsProps) {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const certificates = useLmsStore((s) => s.certificates)
  const tutorCourses = useTutorCourses(isTutor)
  const tutorProfile = useTutorMyProfile(isTutor)
  const tutorLive = useTutorLmsLiveClasses(isTutor)
  const learnerLive = useMyLmsLiveClasses(!isTutor)
  const liveActions = useSaveLmsLiveClass()
  const liveSessions = isTutor ? tutorLive.sessions : learnerLive.sessions
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [materialUploadOpen, setMaterialUploadOpen] = useState(false)
  const [preview, setPreview] = useState<LessonMediaPreview | null>(null)

  const courseCerts = useMemo(
    () => certificates.filter((c) => c.courseTitle === course.title),
    [certificates, course.title]
  )
  const courseLive = useMemo(
    () => liveSessions.filter((s) => s.courseId === course.id),
    [liveSessions, course.id]
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

  const recordings = useMemo(
    () =>
      liveSessions
        .filter((s) => s.courseId === course.id && s.recordingUrl)
        .map((s) => ({
          id: s.id,
          title: s.title,
          duration: `${s.startTime} – ${s.endTime}`,
          recordedAt: s.scheduledDate,
          views: s.participantCount,
        })),
    [liveSessions, course.id]
  )

  return (
    // The minimum height stops the page shrinking (and jumping up) when a short tab opens.
    <div className="min-h-[calc(100vh-6rem)] space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-gray-100 pb-1">
        {tabs
          .filter((tab) => isTutor || (tab.id !== "coupons" && tab.id !== "enrollments"))
          .map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-muted-foreground hover:bg-gray-50"
              }`}
            >
              <tab.icon className="size-3.5" />
              {tab.label}
            </button>
          ))}
      </div>

      {activeTab === "curriculum" && curriculumSlot}

      {activeTab === "coupons" && isTutor && (
        <CourseCouponsPanel course={course} />
      )}

      {activeTab === "assignments" && (
        <CourseAssignmentsPanel course={course} isTutor={isTutor} />
      )}

      {activeTab === "certificates" && (
        <div className={dashboardCardSurface}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="font-semibold">Certificates</h3>
          </div>
          <DataTable
            columns={[
              {
                key: "learner",
                header: "Learner",
                render: (r: LmsCertificate) => r.learnerName,
              },
              {
                key: "issued",
                header: "Issued",
                render: (r: LmsCertificate) => r.issuedAt,
              },
              {
                key: "status",
                header: "Status",
                render: (r: LmsCertificate) => r.status,
              },
            ]}
            data={courseCerts}
            getRowKey={(r) => r.id}
            emptyState={
              <div className="py-12 text-center text-sm text-muted-foreground">
                No certificates issued yet
              </div>
            }
          />
        </div>
      )}

      {activeTab === "materials" && (
        <div className={dashboardCardSurface}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div>
              <h3 className="font-semibold">Lesson materials</h3>
              <p className="text-xs text-muted-foreground">
                PDFs, ZIP files and learning resources available to course
                learners
              </p>
            </div>
            {isTutor && (
              <Button
                type="button"
                className="h-9 gap-2 rounded-md"
                onClick={() => setMaterialUploadOpen(true)}
              >
                <Plus className="size-4" />
                Add material
              </Button>
            )}
          </div>
          {lessonMaterials.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No materials attached yet
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
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
                      onClick={() =>
                        setPreview({
                          title: m.title,
                          url: m.url!,
                          kind:
                            m.type === "pdf"
                              ? "pdf"
                              : m.type === "video"
                                ? "video"
                                : "document",
                          fileName: m.fileName,
                        })
                      }
                    >
                      <Eye className="size-3.5" />
                      Preview
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
          <LessonMediaPreviewModal
            open={!!preview}
            onClose={() => setPreview(null)}
            media={preview}
          />
          <CourseMaterialUploadDialog
            open={materialUploadOpen}
            onClose={() => setMaterialUploadOpen(false)}
            courseId={course.id}
            modules={modules}
          />
        </div>
      )}

      {activeTab === "recordings" && (
        <div className={dashboardCardSurface}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="font-semibold">Session recordings</h3>
          </div>
          {recordings.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Recordings appear after live sessions end
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recordings.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <p className="text-sm font-medium">{r.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {r.recordedAt}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "live" && (
        <div className="space-y-4">
          {isTutor && (
            <div className="flex justify-end">
              <Button
                className="h-9 rounded-md"
                onClick={() => setScheduleOpen(true)}
              >
                <Plus className="size-4" />
                Schedule live class
              </Button>
            </div>
          )}
          <UpcomingClassesList
            sessions={courseLive}
            onJoin={(session: LiveClassSession) =>
              navigate(
                DashboardRoutes.toLmsLiveRoom(productId ?? "", session.id)
              )
            }
          />
          <ScheduleCourseLiveClassModal
            open={scheduleOpen}
            onClose={() => setScheduleOpen(false)}
            courses={tutorCourses.courses.map(({ id, title }) => ({
              id,
              title,
            }))}
            defaultCourseId={course.id}
            currency={tutorProfile.myProfile?.currency ?? "USD"}
            countryCode={tutorProfile.myProfile?.countryCode ?? ""}
            isSaving={liveActions.create.isPending}
            onSubmit={async (data) => {
              await liveActions.create.mutateAsync(buildLiveClassPayload(data))
              toast.success("Live class scheduled and invitations queued")
            }}
          />
        </div>
      )}

      {activeTab === "enrollments" && isTutor && (
        <CourseLearnersPanel courseId={course.id} isTutor={isTutor} />
      )}
    </div>
  )
}
