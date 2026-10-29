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
import { useParentPortalFilterStore } from "@/store/parentPortalFilter.store"
import { useAuthStore } from "./auth.store"
import { useProductStore } from "./product.store"
import { bootstrap, portalRequest, runtime } from "./runtime"
import { grantedMenu, schoolRoute, type PortalModule } from "./navigation"
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


// Parents
const ParentsOverview = lazy(() => import("@/pages/Dashboard/Parent"))
const ParentList = lazy(() => import("@/pages/Dashboard/Parent/ParentList"))
const AddParent = lazy(() => import("@/pages/Dashboard/Parent/AddParent"))
const ParentProfile = lazy(() => import("@/pages/Dashboard/Parent/ParentProfile"))
const EditParent = lazy(() => import("@/pages/Dashboard/Parent/EditParent"))
const ParentFeesOverview = lazy(() => import("@/pages/Dashboard/Parent/ParentFeesOverview"))
const ParentFeeLedger = lazy(() => import("@/pages/Dashboard/Parent/ParentFeeLedger"))
const ParentTranscript = lazy(() => import("@/pages/Dashboard/Parent/ParentTranscriptOverview"))
const ParentConsentRecords = lazy(() => import("@/pages/Dashboard/Parent/ParentConsentRecords"))
const ParentResults = lazy(() => import("@/pages/Dashboard/Parent/ParentResults"))
const ParentAttendance = lazy(() => import("@/pages/Dashboard/Parent/ParentAttendance"))
const ParentTimetable = lazy(() => import("@/pages/Dashboard/Parent/ParentTimetable"))
const ParentCalendar = lazy(() => import("@/pages/Dashboard/Parent/ParentCalendar"))

// Fee Management
const Fees = lazy(() => import("@/pages/Dashboard/FeeMgt"))
const OnlinePayments = lazy(() => import("@/pages/Dashboard/FeeMgt/OnlinePayments"))
const OnlinePaymentSetup = lazy(() => import("@/pages/Dashboard/FeeMgt/OnlinePaymentSetup"))
const PaymentDisputes = lazy(() => import("@/pages/Dashboard/FeeMgt/PaymentDisputes"))
const PaymentSettlements = lazy(() => import("@/pages/Dashboard/FeeMgt/PaymentSettlements"))
const GenerateInvoice = lazy(() => import("@/pages/Dashboard/FeeMgt/GenerateInvoice"))
const GenerateInvoiceForm = lazy(() => import("@/pages/Dashboard/FeeMgt/GenerateInvoiceFormPage"))
const ViewInvoice = lazy(() => import("@/pages/Dashboard/FeeMgt/ViewInvoice"))
const PaymentType = lazy(() => import("@/pages/Dashboard/FeeMgt/PaymentType"))
const ViewPaymentType = lazy(() => import("@/pages/Dashboard/FeeMgt/ViewPaymentType"))
const PaymentItems = lazy(() => import("@/pages/Dashboard/FeeMgt/PaymentItem"))
const Bills = lazy(() => import("@/pages/Dashboard/FeeMgt/Bills"))
const PaymentReminder = lazy(() => import("@/pages/Dashboard/FeeMgt/PaymentReminder"))
const PaymentReminderDetails = lazy(() => import("@/pages/Dashboard/FeeMgt/PaymentReminderDetails"))
const BookKeeping = lazy(() => import("@/pages/Dashboard/FeeMgt/BookKeeping"))
const TransactionDetails = lazy(() => import("@/pages/Dashboard/FeeMgt/ViewTransactionDetails"))
const TransactionTypes = lazy(() => import("@/pages/Dashboard/FeeMgt/TransactionType"))
const ClassFeePayments = lazy(() => import("@/pages/Dashboard/FeeMgt/ClassFeePayments"))
const PaymentMethods = lazy(() => import("@/pages/Dashboard/FeeMgt/PaymentMethod"))
const SchoolLearning = lazy(() => import("@/pages/Dashboard/SchoolLearning"))

// Exams and Records
const Exams = lazy(() => import("@/pages/Dashboard/ExamsAndRecords"))
const ExamClasses = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/ClassesPage"))
const ExamClassDetail = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/ClassDetailPage"))
const ExamSubjects = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/SubjectsPage"))
const ExamCategories = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/CategoriesPage"))
const ExamDepartments = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/DepartmentsPage"))
const ManageTeachers = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/ManageTeachers"))
const TeacherDetail = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/ManageTeacherDetailPage"))
const TeacherTimetableView = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/TeacherTimetableViewPage"))
const GradeBookSettings = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/GradeBookSettings"))
const GradeDetail = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/GradeDetailPage"))
const TeacherGradeEntry = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/TeacherGradeEntry"))
const StudentGradeEntry = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/StudentGradeEntry"))
const ApproveGrades = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/ApproveGradesPage"))
const WorksheetDetail = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/WorksheetDetailPage"))
const ViewResults = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/ViewStudentResults"))
const ClassResults = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/ManageClassResults"))
const PromoteStudents = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/PromoteStudents"))
const Broadsheet = lazy(() => import("@/pages/Dashboard/ExamsAndRecords/BroadsheetPage"))

// Attendance
const AttendanceOverview = lazy(() => import("@/pages/Dashboard/Attendance"))
const StudentAttendanceDashboard = lazy(() => import("@/pages/Dashboard/Attendance/StudentAttendanceDashboardPage"))
const MarkAttendance = lazy(() => import("@/pages/Dashboard/Attendance/MarkAttendancePage"))
const AttendanceRecords = lazy(() => import("@/pages/Dashboard/Attendance/RecordsPage"))
const StudentAttendance = lazy(() => import("@/pages/Dashboard/Attendance/StudentAttendancePage"))
const StaffAttendance = lazy(() => import("@/pages/Dashboard/Attendance/StaffAttendancePage"))
const ScanAttendance = lazy(() => import("@/pages/Dashboard/Attendance/ScanAttendancePage"))
const EarlyIntervention = lazy(() => import("@/pages/Dashboard/Attendance/EarlyIntervention"))
const RiskQueue = lazy(() => import("@/pages/Dashboard/Attendance/EarlyIntervention/RiskQueuePage"))
const InterventionSettings = lazy(() => import("@/pages/Dashboard/Attendance/EarlyIntervention/SettingsPage"))
const StudentRisk = lazy(() => import("@/pages/Dashboard/Attendance/EarlyIntervention/StudentRiskPage"))

// Timetable
const Timetable = lazy(() => import("@/pages/Dashboard/Timetable"))
const ManageTimetable = lazy(() => import("@/pages/Dashboard/Timetable/ManageTimetable"))
const SchoolCalendar = lazy(() => import("@/pages/Dashboard/Timetable/SchoolCalendarPage"))
const PeriodTypes = lazy(() => import("@/pages/Dashboard/Timetable/PeriodTypesPage"))
const TimetableTypes = lazy(() => import("@/pages/Dashboard/Timetable/TimetableTypesPage"))

// E-Learning (Lesson Notes run in the separate Hostel/Staff/Lesson Notes bundle)
const ELearning = lazy(() => import("@/pages/Dashboard/ELearning"))
const Courses = lazy(() => import("@/pages/Dashboard/ELearning/Courses"))
const TeacherTimetable = lazy(() => import("@/pages/Dashboard/ELearning/TeacherTimetable"))
const CourseDetail = lazy(() => import("@/pages/Dashboard/ELearning/CourseDetail"))
const LessonPlayer = lazy(() => import("@/pages/Dashboard/ELearning/LessonPlayer"))
const LessonEditor = lazy(() => import("@/pages/Dashboard/ELearning/LessonEditor"))
const LiveClasses = lazy(() => import("@/pages/Dashboard/ELearning/LiveClasses"))
const LiveClassRoom = lazy(() => import("@/pages/Dashboard/ELearning/LiveClassRoom"))

/** Hostel, Staff, Availability and Lesson Notes are a separate bundle (assets/rebuilt-v0172): reopen the frame there. */
function SeparateBundle({ module }: { module: PortalModule }) {
  const location = useLocation()
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("module", module)
    url.searchParams.set("path", location.pathname.replace(/^\/dashboard\/[^/]+/, "/dashboard") + location.search)
    url.searchParams.delete("menu")
    window.location.replace(url.href)
  }, [location.pathname, location.search, module])
  return (
    <p role="status" className="p-8">
      Opening…
    </p>
  )
}

/** Screens that create or change records need the matching permission, not only View. */
function requiredPermission(pathname: string) {
  if (/\/(students\/(add|import)|parents\/add|fees\/invoice\/new|elearning\/lesson-notes\/create|elearning\/courses\/[^/]+\/lessons\/new\/edit)$/.test(pathname))
    return "create"
  if (/\/(students|parents|elearning\/lesson-notes|elearning\/courses\/[^/]+\/lessons)\/[^/]+\/edit$/.test(pathname))
    return "update"
  return "view"
}

const gradingWorkflows = [
  ["grade-entry", "By subject"],
  ["student-grade-entry", "By student"],
  ["approve-grades", "Review worksheets"],
  ["manage-class-results", "Class results"],
  ["broadsheet", "Broadsheet"],
] as const

function Workspace({ context }: { context: any }) {
  const location = useLocation(),
    navigate = useNavigate()
  const school = context.schoolId
  const module = runtime().module
  const menu = grantedMenu<{
    id: string
    name: string
    path: string
    permissions: string[]
  }>(context.navigation.menus, location.pathname, school, module)
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
      const target = typeof p === "string" ? schoolRoute(p, school, module) : undefined
      if (target) navigate(target)
    }
    window.addEventListener("message", listener)
    return () => window.removeEventListener("message", listener)
  }, [school, navigate, module])
  const permission = requiredPermission(location.pathname)
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
            {module === "exams" && (
              <nav aria-label="Grading workflows" className="mb-6 flex flex-wrap gap-2">
                {gradingWorkflows.map(([path, label]) => {
                  const target = `/dashboard/${school}/exams_and_records/${path}`
                  return grantedMenu(context.navigation.menus, target, school, "exams") ? (
                    <button
                      key={path}
                      type="button"
                      aria-current={location.pathname === target ? "page" : undefined}
                      className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 aria-[current=page]:bg-blue-100"
                      onClick={() => navigate(target)}
                    >
                      {label}
                    </button>
                  ) : null
                })}
              </nav>
            )}
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
      useParentPortalFilterStore.getState().setGuardian("")
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
    config.module,
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
            <Route path="fees" element={<Fees />} />
            <Route path="fees/online-payments" element={<OnlinePayments />} />
            <Route path="fees/online-payment-setup" element={<OnlinePaymentSetup />} />
            <Route path="fees/payment-disputes" element={<PaymentDisputes />} />
            <Route path="fees/payment-settlements" element={<PaymentSettlements />} />
            <Route path="fees/invoice/generate" element={<GenerateInvoice />} />
            <Route path="fees/invoice/new" element={<GenerateInvoiceForm />} />
            <Route path="fees/invoice/:invoiceId" element={<ViewInvoice />} />
            <Route path="fees/payment-types/create" element={<PaymentType />} />
            <Route path="fees/payment-types/:paymentTypeId" element={<ViewPaymentType />} />
            <Route path="fees/payment-items" element={<PaymentItems />} />
            <Route path="fees/bills" element={<Bills />} />
            <Route path="fees/payment-reminder" element={<PaymentReminder />} />
            <Route path="fees/payment-reminder/details" element={<PaymentReminderDetails />} />
            <Route path="fees/book-keeping" element={<BookKeeping />} />
            <Route path="fees/book-keeping/:transactionId" element={<TransactionDetails />} />
            <Route path="fees/transaction-types" element={<TransactionTypes />} />
            <Route path="fees/class-fee-payments" element={<ClassFeePayments />} />
            <Route path="fees/payment-methods" element={<PaymentMethods />} />
            <Route path="school-learning" element={<SchoolLearning />} />
            <Route path="exams_and_records" element={<Exams />} />
            <Route path="exams_and_records/classes" element={<ExamClasses />} />
            <Route path="exams_and_records/classes/:classId" element={<ExamClassDetail />} />
            <Route path="exams_and_records/subjects" element={<ExamSubjects />} />
            <Route path="exams_and_records/categories" element={<ExamCategories />} />
            <Route path="exams_and_records/departments" element={<ExamDepartments />} />
            <Route path="exams_and_records/manage-teachers" element={<ManageTeachers />} />
            <Route path="exams_and_records/manage-teachers/:teacherId" element={<TeacherDetail />} />
            <Route path="exams_and_records/manage-teachers/:teacherId/timetable" element={<TeacherTimetableView />} />
            <Route path="exams_and_records/grade-book-settings" element={<GradeBookSettings />} />
            <Route path="exams_and_records/grade-book-settings/:gradeId" element={<GradeDetail />} />
            <Route path="exams_and_records/grade-entry" element={<TeacherGradeEntry />} />
            <Route path="exams_and_records/student-grade-entry" element={<StudentGradeEntry />} />
            <Route path="exams_and_records/approve-grades" element={<ApproveGrades />} />
            <Route path="exams_and_records/approve-grades/:worksheetId" element={<WorksheetDetail />} />
            <Route path="exams_and_records/view-results" element={<ViewResults />} />
            <Route path="exams_and_records/manage-class-results" element={<ClassResults />} />
            <Route path="exams_and_records/promote-students" element={<PromoteStudents />} />
            <Route path="exams_and_records/broadsheet" element={<Broadsheet />} />
            <Route path="parents" element={<ParentsOverview />} />
            <Route path="parents/list" element={<ParentList />} />
            <Route path="parents/add" element={<AddParent />} />
            <Route path="parents/:parentId" element={<ParentProfile />} />
            <Route path="parents/:parentId/edit" element={<EditParent />} />
            <Route path="parents/fees" element={<ParentFeesOverview />} />
            <Route path="parents/:parentId/fees" element={<ParentFeeLedger />} />
            <Route path="parents/transcript" element={<ParentTranscript />} />
            <Route path="parents/:parentId/transcript" element={<ParentTranscript />} />
            <Route path="parents/:parentId/notifications" element={<ParentConsentRecords />} />
            <Route path="parents/:parentId/visitation" element={<Visitation />} />
            <Route path="parents/:parentId/results" element={<ParentResults />} />
            <Route path="parents/:parentId/attendance" element={<ParentAttendance />} />
            <Route path="parents/:parentId/timetable" element={<ParentTimetable />} />
            <Route path="parents/:parentId/calendar" element={<ParentCalendar />} />
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
            <Route path="attendance" element={<AttendanceOverview />} />
            <Route path="attendance/students" element={<StudentAttendanceDashboard />} />
            <Route path="attendance/students/mark" element={<MarkAttendance />} />
            <Route path="attendance/students/records" element={<AttendanceRecords />} />
            <Route path="attendance/students/:studentId" element={<StudentAttendance />} />
            <Route path="attendance/staff" element={<StaffAttendance />} />
            <Route path="attendance/scan" element={<ScanAttendance />} />
            <Route path="attendance/early-intervention" element={<EarlyIntervention />} />
            <Route path="attendance/early-intervention/risks" element={<RiskQueue />} />
            <Route path="attendance/early-intervention/settings" element={<InterventionSettings />} />
            <Route path="attendance/early-intervention/students/:studentId" element={<StudentRisk />} />
            <Route path="staff/*" element={<SeparateBundle module="staff" />} />
            <Route path="availability" element={<SeparateBundle module="staff" />} />
            <Route path="hostel/*" element={<SeparateBundle module="hostel" />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="timetable/manage" element={<ManageTimetable />} />
            <Route path="timetable/calendar" element={<SchoolCalendar />} />
            <Route path="timetable/period-types" element={<PeriodTypes />} />
            <Route path="timetable/timetable-types" element={<TimetableTypes />} />
            <Route path="elearning" element={<ELearning />} />
            <Route path="elearning/courses" element={<Courses />} />
            <Route path="elearning/teachers/:teacherId/courses" element={<Courses />} />
            <Route path="elearning/teachers/:teacherId/timetable" element={<TeacherTimetable />} />
            <Route path="elearning/courses/:courseId" element={<CourseDetail />} />
            <Route path="elearning/courses/:courseId/lessons/:lessonId" element={<LessonPlayer />} />
            <Route path="elearning/courses/:courseId/lessons/:lessonId/edit" element={<LessonEditor />} />
            <Route path="elearning/live-classes" element={<LiveClasses />} />
            <Route path="elearning/live-classes/:sessionId/room" element={<LiveClassRoom />} />
            <Route path="elearning/lesson-notes/*" element={<SeparateBundle module="elearning" />} />
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
            <Route path="chat" element={<Chat />} />
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
