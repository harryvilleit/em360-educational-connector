import {
  CalendarDays,
  Calendar,
  ClipboardList,
  BedDouble,
  HeartPulse,
  UtensilsCrossed,
  BookOpen,
  MonitorPlay,
  Vote,
  Layers,
} from "lucide-react"
import { useNavigate } from "react-router"
import { StatCard } from "@/components/general/StatCard"
import { dashboardCardSurface } from "@/components/general/StatCard"
import { StudentNotLinked } from "@/components/general/StudentNotLinked"
import { useAuthStore } from "@/store/auth.store"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useStudentPortal } from "@/hooks/useStudentPortal"
import { formatClassOptionLabel } from "@/utils/guardianAdapter"
import { HomeRoutes } from "@/routes"

const SHORTCUTS = [
  {
    label: "My Timetable",
    description: "See today's classes and schedule",
    icon: CalendarDays,
    color: "bg-cyan-50 text-cyan-600",
    to: HomeRoutes.toStudentTimetable,
  },
  {
    label: "My Results",
    description: "View grades and academic performance",
    icon: ClipboardList,
    color: "bg-sky-50 text-sky-600",
    to: HomeRoutes.toStudentResults,
  },
  {
    label: "E-Learning",
    description: "Live classes, materials and assignments",
    icon: MonitorPlay,
    color: "bg-teal-50 text-teal-600",
    to: HomeRoutes.toStudentElearning,
  },
  {
    label: "My Hostel",
    description: "View your room and bed assignment",
    icon: BedDouble,
    color: "bg-indigo-50 text-indigo-600",
    to: HomeRoutes.toStudentHostel,
  },
  {
    label: "My Health Record",
    description: "Medical info and sick bay visit history",
    icon: HeartPulse,
    color: "bg-rose-50 text-rose-600",
    to: HomeRoutes.toStudentHealth,
  },
  {
    label: "My Cafeteria",
    description: "Meal plan, wallet and attendance",
    icon: UtensilsCrossed,
    color: "bg-amber-50 text-amber-600",
    to: HomeRoutes.toStudentCafeteria,
  },
  {
    label: "My Library",
    description: "Borrowed books and fines",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600",
    to: HomeRoutes.toStudentLibrary,
  },
  {
    label: "Cast Vote",
    description: "Participate in school elections",
    icon: Vote,
    color: "bg-violet-50 text-violet-600",
    to: HomeRoutes.toStudentVoting,
  },
] as const

export default function StudentHomePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const schoolId = useSchoolId()
  const { isLinked, launch, isLoading } = useStudentPortal(schoolId)

  const firstName = launch?.firstname ?? user?.name?.split(" ")[0]
  const termName = launch?.currentTermName
  const sessionName = launch?.currentSessionName
  const classesCount = launch?.totalClasses
  const subjectsCount = launch?.totalSubscribedSubjects
  const currentClasses = launch?.currentSessionClasses ?? []
  const currentClassDisplay = launch?.currentClassName
    ? formatClassOptionLabel(
        launch.currentClassName,
        launch.currentSchoolArmName ?? null
      )
    : currentClasses.find((item) => item.isCurrent)
      ? formatClassOptionLabel(
          currentClasses.find((item) => item.isCurrent)?.className,
          currentClasses.find((item) => item.isCurrent)?.armName ?? null
        )
      : "No Class Assigned"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {firstName ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's your snapshot
          {launch?.schoolName ? (
            <>
              {" "}
              at <span className="font-medium text-gray-700">{launch.schoolName}</span>.
            </>
          ) : (
            "."
          )}
          <span className="block text-xs text-gray-500">
            Current class: {currentClassDisplay}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Current Term" value={termName ?? "0"} icon={Calendar} color="indigo" />
        <StatCard label="Current Session" value={sessionName ?? "0"} icon={CalendarDays} color="blue" />
        <StatCard label="Total Classes" value={classesCount ?? "0"} icon={Layers} color="cyan" />
        <StatCard label="Subjects" value={subjectsCount ?? "0"} icon={BookOpen} color="violet" />
      </div>

      {!isLoading && !isLinked && <StudentNotLinked />}

      {currentClasses.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-medium tracking-wider text-gray-500 uppercase">
            My Classes
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {currentClasses.map((c) => (
              <div
                key={c.enrollmentId}
                className={`flex items-center justify-between p-4 ${dashboardCardSurface}`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatClassOptionLabel(c.className, c.armName)}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{c.classType}</p>
                </div>
                {c.isCurrent ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    Current
                  </span>
                ) : c.isPrimaryClass ? (
                  <span className="inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                    Primary
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-sm font-medium tracking-wider text-gray-500 uppercase">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SHORTCUTS.map((s) => (
            <button
              key={s.label}
              onClick={() => navigate(s.to(schoolId))}
              className={`flex items-start gap-4 p-5 text-left transition-colors hover:border-cyan-200 hover:bg-cyan-50/30 ${dashboardCardSurface}`}
            >
              <div className={`shrink-0 rounded-lg p-2.5 ${s.color}`}>
                <s.icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{s.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                  {s.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
