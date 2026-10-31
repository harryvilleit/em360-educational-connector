import { Suspense, useState } from "react"
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router"
import { ChevronDown, LogOut, UserCircle } from "lucide-react"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import PageLoader from "@/components/general/PageLoader"
import { useLogout } from "@/hooks/auth"
import { getGreeting, getInitials } from "@/utils"
import { HomeRoutes } from "@/routes"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  SchoolCurrencyContext,
  SchoolIdContext,
  SchoolTimeZoneContext,
} from "@/contexts/SchoolContext"
import { GuardianPortalProvider } from "@/contexts/GuardianPortalContext"
import { ParentPortalSidebar } from "@/components/general/ParentPortalSidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ConfirmLogout from "@/components/general/ConfirmLogout"
import { useGetUserSubProducts } from "@/hooks/products"
import { toSlug } from "@/utils/slug"
import { Button } from "@/components/ui/button"
import { normaliseCurrencyCode } from "@/utils/currency"
import SchoolPortalAccessGate from "@/components/general/SchoolPortalAccessGate"
import AiHelpSearch from "@/components/general/AiHelpSearch"

export function ParentPortalLayout() {
  const navigate = useNavigate()
  const { isHydrated, user, redirect } = useAuthRedirect(true)
  const { schoolId: rawSchoolId } = useParams<{ schoolId: string }>()
  const location = useLocation() as { state?: { schoolId?: string } }
  const {
    userProducts,
    isLoading: schoolsLoading,
    isError: schoolsError,
    refetch: refetchSchools,
  } = useGetUserSubProducts()
  const school = (userProducts?.value?.parentSchools ?? []).find(
    (item) =>
      item.id === rawSchoolId ||
      item.id === location.state?.schoolId ||
      toSlug(item.name) === rawSchoolId
  )
  const resolvedSchoolId = school?.id ?? ""
  const { logout } = useLogout()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  if (!isHydrated) return <PageLoader />
  if (redirect.shouldRedirect) return <Navigate to={redirect.to} replace />
  if (schoolsLoading) return <PageLoader />
  if (schoolsError) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-semibold">
            Unable to load parent portal
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Check your connection and try again.
          </p>
          <Button className="mt-5" onClick={() => void refetchSchools()}>
            Try Again
          </Button>
        </div>
      </main>
    )
  }
  if (!school) return <Navigate to={HomeRoutes.home} replace />

  const schoolName = school.name || "Your School"
  const schoolStatus = school.status
  const initials = getInitials(user?.name)

  return (
    <SchoolPortalAccessGate schoolId={resolvedSchoolId}>
      <SidebarProvider>
        <ParentPortalSidebar
          schoolId={rawSchoolId ?? ""}
          schoolName={schoolName}
          schoolStatus={schoolStatus}
          onLogoutClick={() => setShowLogoutDialog(true)}
        />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 w-full shrink-0 items-center justify-between gap-3 bg-white px-4 shadow-sm">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-6" />
              <p className="text-lg font-medium text-muted-foreground">
                {getGreeting()}
              </p>
            </div>

            <AiHelpSearch
              portal="parent"
              schoolId={resolvedSchoolId}
              compact
              className="hidden w-full max-w-md md:block"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-full border border-gray-100 bg-gray-50 py-1.5 pr-3 pl-1.5 transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {initials}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm leading-tight font-semibold text-gray-900 capitalize">
                      {user?.name ?? "User"}
                    </p>
                    <p className="text-xs leading-tight text-muted-foreground">
                      {user?.email ?? ""}
                    </p>
                  </div>
                  <ChevronDown className="size-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-56 rounded-xl border-gray-100 p-1"
              >
                <DropdownMenuLabel className="px-3 py-2">
                  <p className="text-sm leading-tight font-semibold text-gray-900 capitalize">
                    {user?.name ?? "User"}
                  </p>
                  <p className="text-xs leading-tight text-muted-foreground">
                    {user?.email ?? ""}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg px-3 py-2"
                  onClick={() =>
                    navigate(HomeRoutes.toParentProfile(rawSchoolId ?? ""))
                  }
                >
                  <UserCircle className="size-4 text-gray-500" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <div className="flex w-full flex-1 flex-col gap-4 px-6 py-6">
            <AiHelpSearch
              portal="parent"
              schoolId={resolvedSchoolId}
              className="md:hidden"
            />
            <SchoolIdContext.Provider value={resolvedSchoolId}>
              <SchoolCurrencyContext.Provider
                value={normaliseCurrencyCode(school.baseCurrency)}
              >
                <SchoolTimeZoneContext.Provider
                  value={school.timeZoneId ?? "UTC"}
                >
                  <GuardianPortalProvider>
                    <Suspense fallback={<PageLoader />}>
                      <Outlet />
                    </Suspense>
                  </GuardianPortalProvider>
                </SchoolTimeZoneContext.Provider>
              </SchoolCurrencyContext.Provider>
            </SchoolIdContext.Provider>
          </div>
        </SidebarInset>

        <ConfirmLogout
          open={showLogoutDialog}
          onOpenChange={setShowLogoutDialog}
          onClick={() => logout()}
        />
      </SidebarProvider>
    </SchoolPortalAccessGate>
  )
}
