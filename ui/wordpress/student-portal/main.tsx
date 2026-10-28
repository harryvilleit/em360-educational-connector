import React, { lazy, Suspense, useEffect, useState, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes, useLocation } from "react-router"
import { Toaster } from "sonner"
import PageLoader from "@/components/general/PageLoader"
import { TooltipProvider } from "@/components/ui/tooltip"
import { StudentPortalLayout } from "@/layouts/StudentPortal.layout"
import { HomeRoutes } from "@/routes"
import { LifeLabRoutes } from "@/products/lifelab/routes"
import { useAuthStore } from "../auth.store"
import { useProductStore } from "../product.store"
import { bootstrap, runtime, type StudentContext } from "../student-runtime"
import "../../src/index.css"
import "./student-portal.css"

// The exact React screens of the EM360 student portal.
const StudentHome = lazy(() => import("@/pages/StudentHome"))
const Chat = lazy(() => import("@/pages/StudentHome/ChatPage"))
const Profile = lazy(() => import("@/pages/StudentHome/ProfilePage"))
const page = (name: "StudentPortalTimetablePage" | "StudentPortalCalendarPage" | "StudentPortalResultsPage" | "StudentPortalAttendancePage") =>
  lazy(() => import("@/pages/StudentHome/PortalPages").then((m) => ({ default: m[name] })))
const Timetable = page("StudentPortalTimetablePage")
const Calendar = page("StudentPortalCalendarPage")
const Results = page("StudentPortalResultsPage")
const Attendance = page("StudentPortalAttendancePage")
const Subjects = lazy(() => import("@/pages/StudentHome/SubjectsPage"))
const Hostel = lazy(() => import("@/pages/StudentHome/HostelPage"))
const Health = lazy(() => import("@/pages/StudentHome/HealthPage"))
const Cafeteria = lazy(() => import("@/pages/StudentHome/CafeteriaPage"))
const Library = lazy(() => import("@/pages/StudentHome/LibraryPage"))
const Elearning = lazy(() => import("@/pages/StudentHome/ElearningPage"))
const Course = lazy(() => import("@/pages/StudentHome/ELearning/StudentCoursePage"))
const Lesson = lazy(() => import("@/pages/StudentHome/ELearning/StudentLessonPlayerPage"))
const Assignment = lazy(() => import("@/pages/StudentHome/ELearning/StudentCbtPage"))
const LiveRoom = lazy(() => import("@/pages/StudentHome/LiveClassRoomPage"))
const Voting = lazy(() => import("@/pages/StudentHome/VotingPage"))
const Support = lazy(() => import("@/pages/StudentHome/SupportPage"))
const Rating = lazy(() => import("@/pages/Portals/SchoolRatingPage"))

/** Student screens, relative to /student-home/:schoolId (the same paths as on the main site). */
export const studentScreens = [
  "", "chat", "profile", "timetable", "calendar", "results", "subjects", "attendance", "support", "hostel",
  "health", "cafeteria", "library", "elearning", "voting", "rate-school", "lifelab",
] as const

const routes: { path: string; element: ReactNode }[] = [
  { path: HomeRoutes.studentHome, element: <StudentHome /> },
  { path: HomeRoutes.studentChat, element: <Chat /> },
  { path: HomeRoutes.studentProfile, element: <Profile /> },
  { path: HomeRoutes.studentTimetable, element: <Timetable /> },
  { path: HomeRoutes.studentCalendar, element: <Calendar /> },
  { path: HomeRoutes.studentResults, element: <Results /> },
  { path: HomeRoutes.studentSubjects, element: <Subjects /> },
  { path: HomeRoutes.studentAttendance, element: <Attendance /> },
  { path: HomeRoutes.studentSupport, element: <Support /> },
  { path: HomeRoutes.studentHostel, element: <Hostel /> },
  { path: HomeRoutes.studentHealth, element: <Health /> },
  { path: HomeRoutes.studentCafeteria, element: <Cafeteria /> },
  { path: HomeRoutes.studentLibrary, element: <Library /> },
  { path: HomeRoutes.studentElearning, element: <Elearning /> },
  { path: HomeRoutes.studentElearningCourse, element: <Course /> },
  { path: HomeRoutes.studentElearningLesson, element: <Lesson /> },
  { path: HomeRoutes.studentElearningAssignment, element: <Assignment /> },
  { path: HomeRoutes.studentVoting, element: <Voting /> },
  { path: HomeRoutes.studentRateSchool, element: <Rating /> },
  { path: HomeRoutes.studentLiveRoom, element: <LiveRoom /> },
]

const notifyParent = (data: Record<string, unknown>) => {
  if (window.parent !== window) window.parent.postMessage(data, window.location.origin)
}

/** Keeps the WordPress page address in step, so refresh and links reopen the same screen. */
function RouteReporter({ schoolId }: { schoolId: string }) {
  const location = useLocation()
  useEffect(() => {
    const base = `/student-home/${schoolId}`
    if (location.pathname === base || location.pathname.startsWith(base + "/"))
      notifyParent({ type: "em360:student-route", path: location.pathname.slice(base.length) || "/" })
  }, [location.pathname, schoolId])
  return null
}

/** The React layout sends signed-out users to /login; in WordPress the page shows its own sign-in. */
function SignedOut() {
  useEffect(() => {
    window.dispatchEvent(new Event("em360:session-ended"))
  }, [])
  return <PageLoader />
}

/** Links that leave the school portal (for example Tutor Courses) open on EM360 in a new tab. */
function OutsidePortal({ schoolId }: { schoolId: string }) {
  const location = useLocation()
  const href = runtime().frontendBase ? new URL(location.pathname + location.search, runtime().frontendBase).href : ""
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold">This page is on EM360</h1>
        <p className="mt-2 text-sm text-muted-foreground">It is not part of your school&apos;s website portal.</p>
        <div className="mt-5 flex justify-center gap-3">
          {href.startsWith("https://") && (
            <a className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white" href={href} target="_blank" rel="noopener noreferrer">
              Open on EM360
            </a>
          )}
          <a className="rounded-md border px-4 py-2 text-sm font-semibold" href={"#" + schoolId} onClick={(e) => { e.preventDefault(); history.back() }}>
            Back to portal
          </a>
        </div>
      </div>
    </main>
  )
}

class ScreenError extends React.Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    return this.state.error ? (
      <div role="alert" className="p-8">
        This screen could not be loaded.{" "}
        <button className="underline" onClick={() => window.location.reload()}>Reload the portal</button>
      </div>
    ) : (
      this.props.children
    )
  }
}

function start(value: StudentContext) {
  useAuthStore.setState({
    user: { id: value.user.id, name: value.user.name, email: value.user.email, phoneNumber: "", jobTitle: "", staffId: "", status: "active", createdAt: "" },
    _hasHydrated: true,
    hasRefreshSession: true,
  })
  useProductStore.getState().setSchoolName(value.schoolId, value.schoolName)
}

function initialEntry(schoolId: string) {
  const requested = runtime().initialPath.replace(/^\/+|\/+$/g, "")
  const screen = (studentScreens as readonly string[]).includes(requested) ? requested : ""
  return `/student-home/${schoolId}${screen ? "/" + screen : ""}`
}

function App({ client }: { client: QueryClient }) {
  const [ended, setEnded] = useState(false)
  const context = useQuery({ queryKey: ["wordpress-student-context"], queryFn: bootstrap, refetchInterval: 60000, enabled: !ended })
  const value = context.data
  if (value && useAuthStore.getState().user?.id !== value.user.id) start(value)
  useEffect(() => {
    const end = () => {
      client.clear()
      useAuthStore.getState().clearAuth()
      setEnded(true)
      notifyParent({ type: "em360:session-ended" })
    }
    window.addEventListener("em360:session-ended", end)
    return () => window.removeEventListener("em360:session-ended", end)
  }, [client])
  if (ended) return <p role="alert" className="p-8">Your session ended. Sign in again on the student portal page.</p>
  if (context.isPending) return <PageLoader />
  if (context.isError)
    return (
      <div role="alert" className="p-8">
        {context.error.message}{" "}
        <button onClick={() => void context.refetch()} className="underline">Try again</button>
      </div>
    )
  const schoolId = value!.schoolId
  return (
    <MemoryRouter initialEntries={[initialEntry(schoolId)]}>
      <RouteReporter schoolId={schoolId} />
      <ScreenError>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<StudentPortalLayout />}>
              {routes.map((r) => (
                <Route key={r.path} path={r.path} element={r.element} />
              ))}
            </Route>
            {/* LifeLab runs on its own EM360 service, which this website frame cannot reach. */}
            <Route path={LifeLabRoutes.student} element={<OutsidePortal schoolId={schoolId} />} />
            <Route path="/login" element={<SignedOut />} />
            <Route path="*" element={<OutsidePortal schoolId={schoolId} />} />
          </Routes>
        </Suspense>
      </ScreenError>
      <Toaster position="top-right" />
    </MemoryRouter>
  )
}

const client = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: true }, mutations: { retry: false } },
})
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}>
    <TooltipProvider>
      <App client={client} />
    </TooltipProvider>
  </QueryClientProvider>,
)
