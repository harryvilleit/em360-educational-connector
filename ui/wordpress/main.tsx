import React, { lazy, Suspense, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query"
import {
  MemoryRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Outlet,
  Navigate,
} from "react-router"
import { Toaster } from "sonner"
import {
  SchoolIdContext,
  SchoolTimeZoneContext,
  SchoolCurrencyContext,
} from "@/contexts/SchoolContext"
import { useStudentCreateFormStore } from "@/store/studentCreateForm.store"
import { useAuthStore } from "./auth.store"
import { useProductStore } from "./product.store"
import { bootstrap, portalRequest, runtime } from "./runtime"
import { grantedMenu, schoolRoute } from "./navigation"
import "../src/index.css"
import "./portal.css"

const Overview = lazy(() => import("./overview"))
const Dashboard = lazy(() => import("@/pages/Dashboard/Home"))
const Users = lazy(() => import("@/pages/Dashboard/UserManagement/ManageUsers"))
const UserDetails = lazy(
  () => import("@/pages/Dashboard/UserManagement/UserDetailsPage"),
)
const Roles = lazy(() => import("@/pages/Dashboard/UserManagement/JobRoles"))
const IdCards = lazy(() => import("@/pages/Dashboard/Student/BulkIdCardsPage"))
const Attendance = lazy(
  () => import("@/pages/Dashboard/UserManagement/Attendance"),
)
const AttendanceDetail = lazy(
  () => import("@/pages/Dashboard/UserManagement/StaffAttendanceDetail"),
)
const Consent = lazy(
  () => import("@/pages/Dashboard/Parent/ParentConsentOverview"),
)
const ConsentDetail = lazy(
  () => import("@/pages/Dashboard/Parent/ConsentRequestDetail"),
)
const Visitation = lazy(() => import("./visitation"))
const Chat = lazy(() => import("./chat"))
const Notifications = lazy(() => import("./notifications"))
const Academic = lazy(
  () => import("@/pages/Dashboard/UserManagement/AcademicSession"),
)
const AcademicDetail = lazy(
  () => import("@/pages/Dashboard/UserManagement/AcademicSessionDetail"),
)
const Settings = lazy(() => import("@/pages/Dashboard/SchoolSettings"))

const Students = lazy(() => import("@/pages/Dashboard/Student/index"))
const StudentList = lazy(() => import("@/pages/Dashboard/Student/StudentList"))
const AddStudent = lazy(() => import("@/pages/Dashboard/Student/AddStudent"))
const EditStudent = lazy(() => import("@/pages/Dashboard/Student/EditStudent"))
const StudentProfile = lazy(
  () => import("@/pages/Dashboard/Student/StudentProfile"),
)
const ImportStudent = lazy(
  () => import("@/pages/Dashboard/Student/ImportStudent"),
)
const StudentTimetable = lazy(
  () => import("@/pages/Dashboard/Student/StudentTimetableViewPage"),
)
const StudentCalendar = lazy(
  () => import("@/pages/Dashboard/Student/StudentCalendarViewPage"),
)

function Workspace({ context }: { context: any }) {
  const location = useLocation(),
    navigate = useNavigate()
  const school = context.schoolId
  const menu = grantedMenu<{
    id: string
    name: string
    path: string
    permissions: string[]
  }>(context.navigation.menus, location.pathname, school)
  useEffect(() => {
    if (menu && window.parent !== window)
      window.parent.postMessage(
        {
          type: "em360:module-route",
          moduleId: context.navigation.id,
          menuId: menu.id,
          path: location.pathname + location.search,
        },
        window.location.origin,
      )
  }, [menu?.id, location.pathname, location.search])
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (
        event.source !== window.parent ||
        event.origin !== window.location.origin ||
        event.data?.type !== "em360:module-navigate"
      )
        return
      const p = event.data.path
      const target = typeof p === "string" ? schoolRoute(p, school) : undefined
      if (target) navigate(target)
    }
    window.addEventListener("message", listener)
    return () => window.removeEventListener("message", listener)
  }, [school, navigate])
  const permission = /\/students\/(add|import)$/.test(location.pathname)
    ? "create"
    : /\/students\/[^/]+\/edit$/.test(location.pathname)
      ? "update"
      : "view"
  if (!menu || !menu.permissions.some((p) => p.toLowerCase() === permission))
    return (
      <div
        role="alert"
        className="rounded-xl border border-amber-200 bg-amber-50 p-6"
      >
        You do not have access to this school module screen. Select another menu
        from the sidebar.
      </div>
    )
  return (
    <SchoolIdContext value={school}>
      <SchoolTimeZoneContext value={context.timeZone || "UTC"}>
        <SchoolCurrencyContext value={context.currency || "GBP"}>
          <Suspense
            fallback={
              <p role="status" className="p-8">
                Loading {menu.name}…
              </p>
            }
          >
            <Outlet />
          </Suspense>
        </SchoolCurrencyContext>
      </SchoolTimeZoneContext>
    </SchoolIdContext>
  )
}
class ScreenError extends React.Component<
  { children: React.ReactNode },
  { error: boolean }
> {
  state = { error: false }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    return this.state.error ? (
      <div role="alert" className="p-8">
        This screen could not be loaded.{" "}
        <button className="underline" onClick={() => window.location.reload()}>
          Reload the module
        </button>
      </div>
    ) : (
      this.props.children
    )
  }
}
const client = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: true },
    mutations: { retry: false },
  },
})
function App() {
  const [ended, setEnded] = useState(false)
  const context = useQuery({
    queryKey: ["wordpress-context"],
    queryFn: bootstrap,
    refetchInterval: 60000,
    enabled: !ended,
  })
  const value = context.data
  useEffect(() => {
    if (!value) return
    useAuthStore.setState({
      user: value.user,
      _hasHydrated: true,
      hasRefreshSession: true,
    })
    useAuthStore
      .getState()
      .setPermissionsForProduct(
        value.schoolId,
        value.dashboard.Modules,
        value.dashboard.UserRole,
      )
    useProductStore.getState().setGeneralProductId(value.productId)
    useProductStore.getState().setSchoolName(value.schoolId, value.schoolName)
  }, [value])
  useEffect(() => {
    const end = () => {
      client.clear()
      useStudentCreateFormStore.getState().resetForm()
      useAuthStore.getState().clearAuth()
      setEnded(true)
      if (window.parent !== window)
        window.parent.postMessage(
          { type: "em360:session-ended" },
          location.origin,
        )
    }
    window.addEventListener("em360:session-ended", end)
    return () => window.removeEventListener("em360:session-ended", end)
  }, [])
  if (ended)
    return (
      <p role="alert" className="p-8">
        Your session ended. Sign in again through the school portal.
      </p>
    )
  if (context.isPending)
    return (
      <p role="status" className="p-8">
        Loading school module…
      </p>
    )
  if (context.isError)
    return (
      <div role="alert" className="p-8">
        {context.error.message}{" "}
        <button onClick={() => void context.refetch()} className="underline">
          Try again
        </button>
      </div>
    )
  const config = runtime()
  const selected = config.menuId
    ? value.navigation.menus.find((m: { id: string }) => m.id === config.menuId)
    : undefined
  // Resolve the same server-issued menu ID as the outer sidebar. Never silently
  // replace an invalid destination with Overview or manufacture an owner grant.
  const initial = schoolRoute(
    selected?.path ?? config.initialPath,
    value.schoolId,
  )
  if (!initial)
    return (
      <p role="alert" className="p-8">
        This menu has an unsupported screen address. Ask the school
        administrator to check the menu configuration.
      </p>
    )
  return (
    <MemoryRouter initialEntries={[initial]}>
      <ScreenError>
        <Routes>
          <Route
            path="/dashboard/:productId"
            element={<Workspace context={value} />}
          >
            <Route path="students" element={<Students />} />
            <Route path="students/list" element={<StudentList />} />
            <Route path="students/add" element={<AddStudent />} />
            <Route path="students/import" element={<ImportStudent />} />
            <Route path="students/:studentId" element={<StudentProfile />} />
            <Route path="students/:studentId/edit" element={<EditStudent />} />
            <Route
              path="students/:studentId/timetable"
              element={<StudentTimetable />}
            />
            <Route
              path="students/:studentId/calendar"
              element={<StudentCalendar />}
            />
            <Route path="users" element={<Overview />} />
            <Route path="users/dashboard" element={<Dashboard />} />
            <Route path="users/manage" element={<Users />} />
            <Route path="users/manage/:subUserId" element={<UserDetails />} />
            <Route path="users/job-roles" element={<Roles />} />
            <Route path="users/id-cards" element={<IdCards />} />
            <Route path="users/attendance" element={<Attendance />} />
            <Route
              path="users/attendance/:staffId"
              element={<AttendanceDetail />}
            />
            <Route path="users/consent" element={<Consent />} />
            <Route
              path="users/consent/:consentRequestId"
              element={<ConsentDetail />}
            />
            <Route path="parents/consent" element={<Consent />} />
            <Route
              path="parents/consent/:consentRequestId"
              element={<ConsentDetail />}
            />
            <Route path="users/visitation" element={<Visitation />} />
            <Route
              path="users/visitation/:requestId"
              element={<Visitation />}
            />
            <Route path="parents/visitation" element={<Visitation />} />
            <Route
              path="parents/visitation/:requestId"
              element={<Visitation />}
            />
            <Route path="users/chat" element={<Chat />} />
            <Route path="users/notifications" element={<Notifications />} />
            <Route path="users/academic" element={<Academic />} />
            <Route
              path="users/academic/:sessionId"
              element={<AcademicDetail />}
            />
            <Route path="users/settings" element={<Settings />} />
          </Route>
          <Route
            path="*"
            element={
              <p role="alert" className="p-8">
                Choose a school module menu from the school portal.
              </p>
            }
          />
        </Routes>
      </ScreenError>
      <Toaster richColors />
    </MemoryRouter>
  )
}
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}>
    <App />
  </QueryClientProvider>,
)
