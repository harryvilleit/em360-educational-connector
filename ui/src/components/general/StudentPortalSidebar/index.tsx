import { Link, useLocation } from "react-router"
import {
  BedDouble,
  Gamepad2,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  CircleHelp,
  GraduationCap,
  HeartPulse,
  HeartHandshake,
  LogOut,
  MessageSquare,
  MonitorPlay,
  Star,
  UtensilsCrossed,
  Users,
  type LucideIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { HomeRoutes } from "@/routes"

interface StudentMenuItem {
  id: string
  title: string
  url: string
  icon: LucideIcon
}

function getStudentMenuItems(schoolId: string): StudentMenuItem[] {
  return [
    {
      id: "overview",
      title: "Overview",
      url: HomeRoutes.toStudentHome(schoolId),
      icon: Users,
    },
    {
      id: "chat",
      title: "Chat",
      url: HomeRoutes.toStudentChat(schoolId),
      icon: MessageSquare,
    },
    {
      id: "timetable",
      title: "Timetable",
      url: HomeRoutes.toStudentTimetable(schoolId),
      icon: CalendarDays,
    },
    {
      id: "calendar",
      title: "School Calendar",
      url: HomeRoutes.toStudentCalendar(schoolId),
      icon: CalendarRange,
    },
    {
      id: "results",
      title: "Results",
      url: HomeRoutes.toStudentResults(schoolId),
      icon: GraduationCap,
    },
    {
      id: "subjects",
      title: "My Subjects",
      url: HomeRoutes.toStudentSubjects(schoolId),
      icon: BookOpen,
    },
    {
      id: "attendance",
      title: "Attendance",
      url: HomeRoutes.toStudentAttendance(schoolId),
      icon: CalendarCheck2,
    },
    {
      id: "support",
      title: "My Support",
      url: HomeRoutes.toStudentSupport(schoolId),
      icon: HeartHandshake,
    },
    {
      id: "lifelab",
      title: "LifeLab",
      url: `/student-home/${encodeURIComponent(schoolId)}/lifelab`,
      icon: Gamepad2,
    },
    {
      id: "elearning",
      title: "E-Learning",
      url: HomeRoutes.toStudentElearning(schoolId),
      icon: MonitorPlay,
    },
    {
      id: "tutor-courses",
      title: "Tutor Courses",
      url: HomeRoutes.toLearnerHub(),
      icon: GraduationCap,
    },
    {
      id: "hostel",
      title: "Hostel",
      url: HomeRoutes.toStudentHostel(schoolId),
      icon: BedDouble,
    },
    {
      id: "health",
      title: "Health Record",
      url: HomeRoutes.toStudentHealth(schoolId),
      icon: HeartPulse,
    },
    {
      id: "cafeteria",
      title: "Cafeteria",
      url: HomeRoutes.toStudentCafeteria(schoolId),
      icon: UtensilsCrossed,
    },
    {
      id: "library",
      title: "Library",
      url: HomeRoutes.toStudentLibrary(schoolId),
      icon: BookOpen,
    },
    {
      id: "rating",
      title: "Rate School",
      url: HomeRoutes.toStudentRateSchool(schoolId),
      icon: Star,
    },
    {
      id: "help",
      title: "Help Centre",
      url: HomeRoutes.help,
      icon: CircleHelp,
    },
  ]
}

interface StudentPortalSidebarProps extends React.ComponentProps<
  typeof Sidebar
> {
  schoolId: string
  schoolName?: string
  schoolStatus?: string
  onLogoutClick?: () => void
}

export function StudentPortalSidebar({
  schoolId,
  schoolName,
  schoolStatus,
  onLogoutClick,
  ...props
}: StudentPortalSidebarProps) {
  const pathname = useLocation().pathname
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const menuItems = getStudentMenuItems(schoolId)

  return (
    <Sidebar
      collapsible="icon"
      className="[&>div]:border-none [&>div]:bg-linear-to-b [&>div]:from-cyan-600 [&>div]:via-cyan-500 [&>div]:to-sky-600"
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 4px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <SidebarHeader className="relative overflow-hidden px-3 py-4">
        <div className="pointer-events-none absolute -top-6 -left-6 h-24 w-24 rounded-full bg-white/10" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent" asChild>
              <Link to={HomeRoutes.home} aria-label="Go to main dashboard">
                <img src="/em360-logo.png" alt="" className="size-9 rounded-full bg-white object-contain ring-1 ring-white/30" />
                <div className="grid flex-1 text-left text-base leading-tight">
                  <span className="truncate font-bold tracking-tight text-white">
                    EM360
                  </span>
                  <span className="truncate text-xs font-semibold text-cyan-100 uppercase">
                    Student Portal
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-2 [scrollbar-color:rgba(255,255,255,0.6)_transparent] [scrollbar-width:auto] [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/60 hover:[&::-webkit-scrollbar-thumb]:bg-white/80 [&::-webkit-scrollbar-track]:bg-transparent">
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  data-active={pathname === item.url}
                  className="rounded-xl px-3 py-5 font-medium text-cyan-100 transition-all duration-150 hover:bg-white/10 hover:text-white data-[active=true]:bg-white data-[active=true]:font-semibold data-[active=true]:text-cyan-700 data-[active=true]:shadow-sm [&_svg]:text-current!"
                >
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="size-4 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />

      <SidebarFooter className="border-t border-white/10 px-3 py-3">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            {onLogoutClick && (
              <SidebarMenuButton
                tooltip="Log Out"
                onClick={onLogoutClick}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-cyan-100 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="size-4 shrink-0" />
              </SidebarMenuButton>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white ring-1 ring-white/30">
                {schoolName?.charAt(0).toUpperCase() || "S"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white capitalize">
                  {schoolName || "Your School"}
                </p>
                {schoolStatus && (
                  <p className="truncate text-xs text-cyan-100 capitalize">
                    {schoolStatus}
                  </p>
                )}
              </div>
            </div>

            {onLogoutClick && (
              <button
                onClick={onLogoutClick}
                className="flex cursor-pointer items-center gap-2 text-xs font-medium text-cyan-100 transition-colors hover:text-white"
              >
                <LogOut className="size-3.5 shrink-0" />
                Log Out
              </button>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
