import React, { Suspense, lazy, useEffect, useState } from "react"
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
  Outlet,
  useLocation,
  useNavigate,
} from "react-router"
import { downloadPrivate } from "./service"
import { Toaster, toast } from "sonner"
import {
  SchoolIdContext,
  SchoolTimeZoneContext,
  SchoolCurrencyContext,
  SchoolCurrencyConfiguredContext,
} from "@/contexts/SchoolContext"
import { useAuthStore } from "../auth.store"
import { useProductStore } from "../product.store"
import { bootstrap, runtime, type PortalContext } from "./runtime"
import { permittedMenu, schoolRoute } from "./navigation"
import { hostelRoutes } from "../HostelPortal"
import { staffRoutes } from "../StaffPortal"
import "../../src/index.css"
import "../portal.css"
import "./portal.css"
const Notes = lazy(() => import("../LessonNotes"))
const Editor = lazy(() => import("../LessonNoteEditor"))
const routes = [
  ...hostelRoutes,
  ...staffRoutes,
  { path: "elearning/lesson-notes", element: <Notes /> },
  { path: "elearning/lesson-notes/create", element: <Editor /> },
  { path: "elearning/lesson-notes/:noteId/edit", element: <Editor /> },
]
const client = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false, staleTime: 15000 },
    mutations: { retry: false },
  },
})
class ScreenError extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <div role="alert" className="p-6">
        This screen could not be loaded. Select the menu again or reload the
        portal.
      </div>
    ) : (
      this.props.children
    )
  }
}
function Workspace({ context }: { context: PortalContext }) {
  const location = useLocation(),
    navigate = useNavigate()
  const menu = permittedMenu(
    context.navigation.menus,
    location.pathname,
    context.schoolId
  )
  useEffect(() => {
    if (menu && window.parent !== window)
      window.parent.postMessage(
        {
          type: "em360:module-route",
          moduleId: context.navigation.id,
          menuId: menu.id,
          path: location.pathname + location.search,
        },
        window.location.origin
      )
  }, [menu?.id, context.navigation.id, location.pathname, location.search])
  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (
        e.source !== window.parent ||
        e.origin !== window.location.origin ||
        e.data?.type !== "em360:module-navigate"
      )
        return
      const target =
        typeof e.data.path === "string" &&
        schoolRoute(e.data.path, context.schoolId)
      if (target) navigate(target)
    }
    window.addEventListener("message", listener)
    return () => window.removeEventListener("message", listener)
  }, [context.schoolId, navigate])
  if (!menu)
    return (
      <div
        role="alert"
        className="rounded-xl border border-amber-200 bg-amber-50 p-6"
      >
        You do not have access to this school module screen. Select a permitted
        menu from the sidebar.
      </div>
    )
  return (
    <SchoolIdContext value={context.schoolId}>
      <SchoolTimeZoneContext value={context.timeZone || "UTC"}>
        <SchoolCurrencyContext value={context.currency || "GBP"}>
          <SchoolCurrencyConfiguredContext value={!!context.currency}>
            <ScreenError key={location.pathname}>
              <Suspense
                fallback={
                  <p role="status" className="p-6">
                    Loading {menu.name}…
                  </p>
                }
              >
                <Outlet />
              </Suspense>
            </ScreenError>
          </SchoolCurrencyConfiguredContext>
        </SchoolCurrencyContext>
      </SchoolTimeZoneContext>
    </SchoolIdContext>
  )
}
function App() {
  const [ended, setEnded] = useState(false),
    [ready, setReady] = useState<PortalContext>()
  const query = useQuery({
    queryKey: ["wp-rebuilt-context", runtime().module],
    queryFn: bootstrap,
    enabled: !ended,
    refetchInterval: () =>
      document.visibilityState === "visible" && navigator.onLine
        ? 60000
        : false,
  })
  useEffect(() => {
    const value = query.data
    if (!value) return
    useAuthStore.setState({
      user: value.user as any,
      _hasHydrated: true,
      hasRefreshSession: true,
    })
    useAuthStore
      .getState()
      .setPermissionsForProduct(
        value.schoolId,
        value.dashboard.Modules,
        value.dashboard.UserRole
      )
    useProductStore.getState().setGeneralProductId(value.productId)
    useProductStore.getState().setSchoolName(value.schoolId, value.schoolName)
    setReady(value)
  }, [query.data])
  useEffect(() => {
    const download = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest?.("a[href]")
      const reference = link?.getAttribute("href") || ""
      const match =
        /^em360-staff-document:([\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})$/i.exec(
          reference
        )
      if (!match) return
      event.preventDefault()
      void downloadPrivate(
        "/WordPressStaff/LeaveAttachments/" + match[1]
      ).catch((error) => toast.error(error.message))
    }
    document.addEventListener("click", download, true)
    return () => document.removeEventListener("click", download, true)
  }, [])
  useEffect(() => {
    const end = () => {
      setEnded(true)
      setReady(undefined)
      client.clear()
      useAuthStore.getState().clearAuth()
      if (window.parent !== window)
        window.parent.postMessage(
          { type: "em360:session-ended" },
          location.origin
        )
    }
    window.addEventListener("em360:session-ended", end)
    return () => window.removeEventListener("em360:session-ended", end)
  }, [])
  if (ended)
    return (
      <p role="alert" className="p-6">
        Your session ended. Sign in again through the school portal.
      </p>
    )
  const status = (query.error as any)?.status
  if (query.isError && (!ready || [401, 403, 404].includes(status)))
    return (
      <div role="alert" className="p-6">
        {query.error.message}
        <button className="ml-3 underline" onClick={() => void query.refetch()}>
          Try again
        </button>
      </div>
    )
  if (!ready)
    return (
      <p role="status" className="p-6">
        Loading school workspace…
      </p>
    )
  const config = runtime(),
    selected = ready.navigation.menus.find((m) => m.id === config.menuId)
  const initial = schoolRoute(
    config.initialPath || selected?.path,
    ready.schoolId
  )
  if (!initial)
    return (
      <p role="alert" className="p-6">
        This menu has an unsupported screen address. Select a menu from the
        school portal.
      </p>
    )
  return (
    <>
      <MemoryRouter initialEntries={[initial]}>
        {query.isError && (
          <div role="status" className="mb-3 rounded-lg bg-amber-50 p-3">
            Unable to refresh access. Your open form has been preserved.
            <button
              className="ml-3 underline"
              onClick={() => void query.refetch()}
            >
              Retry
            </button>
          </div>
        )}
        <Routes>
          <Route
            path="/dashboard/:productId"
            element={<Workspace context={ready} />}
          >
            {routes.map((r) => (
              <Route key={r.path} {...r} />
            ))}
          </Route>
          <Route
            path="*"
            element={<p role="alert">Select a supported school module menu.</p>}
          />
        </Routes>
      </MemoryRouter>
      <Toaster richColors />
    </>
  )
}
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={client}>
    <App />
  </QueryClientProvider>
)
