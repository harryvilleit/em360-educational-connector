import React, { lazy, Suspense, useEffect, useState, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes, useLocation } from "react-router"
import { Toaster } from "sonner"
import PageLoader from "@/components/general/PageLoader"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ParentPortalLayout } from "@/layouts/ParentPortal.layout"
import { HomeRoutes } from "@/routes"
import { useAuthStore } from "../auth.store"
import { useProductStore } from "../product.store"
import { bootstrap, runtime, type ParentContext } from "../parent-runtime"
import "../../src/index.css"
import "./parent-portal.css"

// The exact React screens of the EM360 parent portal.
const ParentHome = lazy(() => import("@/pages/ParentHome"))
const Profile = lazy(() => import("@/pages/ParentHome/ProfilePage"))
type PortalPage =
  | "ParentPortalFeesPage"
  | "ParentPortalTimetablePage"
  | "ParentPortalCalendarPage"
  | "ParentPortalResultsPage"
  | "ParentPortalAttendancePage"
  | "ParentPortalElectivesPage"
  | "ParentPortalVisitationPage"
  | "ParentPortalConsentPage"
  | "ParentPortalTranscriptPage"
  | "ParentPortalNotificationsPage"
const page = (name: PortalPage) =>
  lazy(() => import("@/pages/ParentHome/PortalPages").then((m) => ({ default: m[name] })))
const Fees = page("ParentPortalFeesPage")
const Timetable = page("ParentPortalTimetablePage")
const Calendar = page("ParentPortalCalendarPage")
const Results = page("ParentPortalResultsPage")
const Attendance = page("ParentPortalAttendancePage")
const Electives = page("ParentPortalElectivesPage")
const Visitation = page("ParentPortalVisitationPage")
const Consent = page("ParentPortalConsentPage")
const Transcript = page("ParentPortalTranscriptPage")
const Notifications = page("ParentPortalNotificationsPage")
const Course = lazy(() => import("@/pages/Dashboard/Parent/ParentCoursePage"))
const Messages = lazy(() => import("@/pages/Dashboard/Parent/Messages"))
const Chat = lazy(() => import("@/pages/ParentHome/ChatPage"))
const Support = lazy(() => import("@/pages/ParentHome/SupportPage"))
const Rating = lazy(() => import("@/pages/Portals/SchoolRatingPage"))

/** Parent screens, relative to /parent-home/:schoolId (the same paths as on the main site). */
export const parentScreens = [
  "", "profile", "fees", "timetable", "calendar", "results", "attendance", "electives", "messages", "chat",
  "visitation", "consent", "transcript", "notifications", "support", "rate-school",
] as const

const routes: { path: string; element: ReactNode }[] = [
  { path: HomeRoutes.parentHome, element: <ParentHome /> },
  { path: HomeRoutes.parentProfile, element: <Profile /> },
  { path: HomeRoutes.parentFees, element: <Fees /> },
  { path: HomeRoutes.parentTimetable, element: <Timetable /> },
  { path: HomeRoutes.parentCalendar, element: <Calendar /> },
  { path: HomeRoutes.parentResults, element: <Results /> },
  { path: HomeRoutes.parentAttendance, element: <Attendance /> },
  { path: HomeRoutes.parentElectives, element: <Electives /> },
  { path: HomeRoutes.parentCourse, element: <Course /> },
  { path: HomeRoutes.parentMessages, element: <Messages /> },
  { path: HomeRoutes.parentChat, element: <Chat /> },
  { path: HomeRoutes.parentVisitation, element: <Visitation /> },
  { path: HomeRoutes.parentConsent, element: <Consent /> },
  { path: HomeRoutes.parentTranscript, element: <Transcript /> },
  { path: HomeRoutes.parentNotifications, element: <Notifications /> },
  { path: HomeRoutes.parentSupport, element: <Support /> },
  { path: HomeRoutes.parentRateSchool, element: <Rating /> },
]

const notifyParentPage = (data: Record<string, unknown>) => {
  if (window.parent !== window) window.parent.postMessage(data, window.location.origin)
}

/** Keeps the WordPress page address in step, so refresh and links reopen the same screen. */
function RouteReporter({ schoolId }: { schoolId: string }) {
  const location = useLocation()
  useEffect(() => {
    const base = `/parent-home/${schoolId}`
    if (location.pathname === base || location.pathname.startsWith(base + "/"))
      notifyParentPage({ type: "em360:parent-route", path: location.pathname.slice(base.length) || "/" })
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

/** Links that leave the school portal open on EM360 in a new tab. */
function OutsidePortal() {
  const location = useLocation()
  const href = runtime().frontendBase ? new URL(location.pathname + location.search, runtime().frontendBase).href : ""
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold">This page is on EM360</h1>
        <p className="mt-2 text-sm text-muted-foreground">It is not part of your school&apos;s website portal.</p>
        <div className="mt-5 flex justify-center gap-3">
          {href.startsWith("https://") && (
            <a className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white" href={href} target="_blank" rel="noopener noreferrer">
              Open on EM360
            </a>
          )}
          <button type="button" className="rounded-md border px-4 py-2 text-sm font-semibold" onClick={() => history.back()}>
            Back to portal
          </button>
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

function start(value: ParentContext) {
  useAuthStore.setState({
    user: { id: value.user.id, name: value.user.name, email: value.user.email, phoneNumber: "", jobTitle: "", staffId: "", status: "active", createdAt: "" },
    _hasHydrated: true,
    hasRefreshSession: true,
  })
  useProductStore.getState().setSchoolName(value.schoolId, value.schoolName)
}

function initialEntry(schoolId: string) {
  const requested = runtime().initialPath.replace(/^\/+|\/+$/g, "")
  const screen = (parentScreens as readonly string[]).includes(requested) ? requested : ""
  return `/parent-home/${schoolId}${screen ? "/" + screen : ""}`
}

function App({ client }: { client: QueryClient }) {
  const [ended, setEnded] = useState(false)
  const context = useQuery({ queryKey: ["wordpress-parent-context"], queryFn: bootstrap, refetchInterval: 60000, enabled: !ended })
  const value = context.data
  if (value && useAuthStore.getState().user?.id !== value.user.id) start(value)
  useEffect(() => {
    const end = () => {
      client.clear()
      useAuthStore.getState().clearAuth()
      setEnded(true)
      notifyParentPage({ type: "em360:session-ended" })
    }
    window.addEventListener("em360:session-ended", end)
    return () => window.removeEventListener("em360:session-ended", end)
  }, [client])
  if (ended) return <p role="alert" className="p-8">Your session ended. Sign in again on the parent portal page.</p>
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
            <Route element={<ParentPortalLayout />}>
              {routes.map((r) => (
                <Route key={r.path} path={r.path} element={r.element} />
              ))}
            </Route>
            <Route path="/login" element={<SignedOut />} />
            <Route path="*" element={<OutsidePortal />} />
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
