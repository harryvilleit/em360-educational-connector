import React, { Suspense, useEffect, useState, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query"
import { MemoryRouter, Outlet, Route, Routes, useLocation } from "react-router"
import { Toaster } from "sonner"
import {
  SchoolCurrencyConfiguredContext,
  SchoolCurrencyContext,
  SchoolIdContext,
  SchoolTimeZoneContext,
} from "@/contexts/SchoolContext"
import { normaliseCurrencyCode } from "@/utils/currency"
import { useAuthStore } from "./auth.store"
import { useProductStore } from "./product.store"
import { relativePath } from "./navigation"
import { bootstrap, runtime } from "./module-runtime"
import "../src/index.css"
import "./portal.css"

/**
 * Shared frame for standalone WordPress module builds. It renders the original
 * React pages unchanged; only identity, permissions and transport are adapted.
 */
export interface ModuleShellOptions {
  /** Shown while the server context loads. */
  title: string
  /** Every menu URL this module may open, exactly as issued by the server. */
  menuPaths: readonly string[]
  /** Routes relative to /dashboard/:productId. */
  routes: { path: string; element: ReactNode }[]
}

interface Menu {
  id: string
  name: string
  path: string
  permissions: string[]
}

const canView = (m: Menu) =>
  m.permissions.some((p) => p.trim().toLowerCase() === "view")

/**
 * A menu screen needs its own View grant. Other screens (for example a case
 * opened from a list) belong to the longest granted menu that contains them,
 * matching the main site's route guard.
 */
export function grantedMenu(
  menus: Menu[],
  menuPaths: readonly string[],
  pathname: string,
  school: string
): Menu | undefined {
  const path = relativePath(pathname, school)
  if (!path) return undefined
  const own = (m: Menu) => relativePath(m.path, school)
  const usable = menus.filter((m) => {
    const p = own(m)
    return !!p && menuPaths.includes(p) && canView(m)
  })
  if (menuPaths.includes(path)) return usable.find((m) => own(m) === path)
  return usable
    .filter((m) => path.startsWith(own(m) + "/"))
    .sort((a, b) => b.path.length - a.path.length)[0]
}

function Workspace({
  context,
  menuPaths,
}: {
  context: any
  menuPaths: readonly string[]
}) {
  const location = useLocation()
  const school: string = context.schoolId
  const menu = grantedMenu(
    context.navigation.menus,
    menuPaths,
    location.pathname,
    school
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
  }, [menu?.id, location.pathname, location.search])
  if (!menu)
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
        <SchoolCurrencyContext value={normaliseCurrencyCode(context.currency)}>
          <SchoolCurrencyConfiguredContext value={!!context.currency?.trim()}>
            <Suspense
              fallback={
                <p role="status" className="p-8">
                  Loading {menu.name}…
                </p>
              }
            >
              <Outlet />
            </Suspense>
          </SchoolCurrencyConfiguredContext>
        </SchoolCurrencyContext>
      </SchoolTimeZoneContext>
    </SchoolIdContext>
  )
}

class ScreenError extends React.Component<
  { children: ReactNode },
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

function App({
  options,
  client,
}: {
  options: ModuleShellOptions
  client: QueryClient
}) {
  const [ended, setEnded] = useState(false)
  const context = useQuery({
    queryKey: ["wordpress-context", runtime().module],
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
        value.dashboard.UserRole
      )
    useProductStore.getState().setGeneralProductId(value.productId)
    useProductStore.getState().setSchoolName(value.schoolId, value.schoolName)
  }, [value])
  useEffect(() => {
    const end = () => {
      client.clear()
      useAuthStore.getState().clearAuth()
      setEnded(true)
      if (window.parent !== window)
        window.parent.postMessage(
          { type: "em360:session-ended" },
          location.origin
        )
    }
    window.addEventListener("em360:session-ended", end)
    return () => window.removeEventListener("em360:session-ended", end)
  }, [client])
  if (ended)
    return (
      <p role="alert" className="p-8">
        Your session ended. Sign in again through the school portal.
      </p>
    )
  if (context.isPending)
    return (
      <p role="status" className="p-8">
        Loading {options.title}…
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
  const selected: Menu | undefined = config.menuId
    ? value.navigation.menus.find((m: Menu) => m.id === config.menuId)
    : undefined
  // Open the server-issued menu; never substitute another screen for an unknown one.
  const target = relativePath(
    selected?.path ?? config.initialPath,
    value.schoolId
  )
  if (!target || !options.menuPaths.includes(target))
    return (
      <p role="alert" className="p-8">
        This menu has an unsupported screen address. Ask the school
        administrator to check the menu configuration.
      </p>
    )
  const initial = target.replace(/^\/dashboard/, "/dashboard/" + value.schoolId)
  return (
    <MemoryRouter initialEntries={[initial]}>
      <ScreenError>
        <Routes>
          <Route
            path="/dashboard/:productId"
            element={
              <Workspace context={value} menuPaths={options.menuPaths} />
            }
          >
            {options.routes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
          </Route>
          <Route
            path="*"
            element={
              <p role="alert" className="p-8">
                Choose a menu from the school portal.
              </p>
            }
          />
        </Routes>
      </ScreenError>
      <Toaster richColors />
    </MemoryRouter>
  )
}

export function mountModule(options: ModuleShellOptions) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: true },
      mutations: { retry: false },
    },
  })
  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={client}>
      <App options={options} client={client} />
    </QueryClientProvider>
  )
}
