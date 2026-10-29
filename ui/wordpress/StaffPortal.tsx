import { lazy } from "react"
const Overview = lazy(() => import("@/pages/Dashboard/StaffManagement"))
const Directory = lazy(
  () => import("@/pages/Dashboard/StaffManagement/StaffListPage")
)
const Leave = lazy(() => import("@/pages/Dashboard/StaffManagement/leave"))
const MyLeave = lazy(
  () => import("@/pages/Dashboard/StaffManagement/leave/MyLeavePage")
)
const Payroll = lazy(
  () => import("@/pages/Dashboard/StaffManagement/PayrollPage")
)
const Performance = lazy(() => import("./performance-v2/main"))
const Availability = lazy(() => import("./Availability"))
const Voting = lazy(
  () => import("@/pages/Dashboard/StaffManagement/StaffVotingPage")
)
const Profile = lazy(() => import("./staff/Profile"))
const Roles = lazy(() => import("./staff/Roles"))
export const staffRoutes = [
  { path: "staff", element: <Overview /> },
  { path: "staff/list", element: <Directory /> },
  { path: "staff/leave", element: <Leave /> },
  { path: "staff/my-leave", element: <MyLeave /> },
  { path: "staff/payroll", element: <Payroll /> },
  { path: "staff/performance", element: <Performance /> },
  { path: "staff/roles", element: <Roles /> },
  { path: "availability", element: <Availability /> },
  { path: "staff/voting", element: <Voting /> },
  { path: "staff/:id", element: <Profile /> },
  { path: "staff/:id/edit", element: <Profile editing /> },
]
