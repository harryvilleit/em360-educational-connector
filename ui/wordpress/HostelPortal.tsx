import { lazy } from "react"
const Overview = lazy(() => import("@/pages/Dashboard/Hostel"))
const Rooms = lazy(() => import("@/pages/Dashboard/Hostel/RoomsPage"))
const CreateRoom = lazy(() => import("@/pages/Dashboard/Hostel/CreateRoomPage"))
const Room = lazy(() => import("./hostel/RoomDetail"))
const EditRoom = lazy(() => import("@/pages/Dashboard/Hostel/EditRoomPage"))
const Types = lazy(() => import("@/pages/Dashboard/Hostel/HostelTypePage"))
const Categories = lazy(
  () => import("@/pages/Dashboard/Hostel/HostelCategoriesPage")
)
const Floors = lazy(() => import("@/pages/Dashboard/Hostel/FloorPage"))
const Beds = lazy(() => import("@/pages/Dashboard/Hostel/BedSpacePage"))
const Parents = lazy(() => import("@/pages/Dashboard/Hostel/ParentsPage"))
const Supervisor = lazy(
  () => import("@/pages/Dashboard/Hostel/SupervisorProfilePage")
)
const Visitors = lazy(() => import("@/pages/Dashboard/Hostel/VisitorsPage"))
const Damage = lazy(() => import("@/pages/Dashboard/Hostel/DamagePage"))
const Attendance = lazy(() => import("@/pages/Dashboard/Hostel/AttendancePage"))
const History = lazy(
  () => import("@/pages/Dashboard/Hostel/AttendanceHistoryPage")
)
const Movement = lazy(() => import("./hostel/Movement"))
const Health = lazy(() => import("./hostel/Health"))
export const hostelRoutes = [
  { path: "hostel", element: <Overview /> },
  { path: "hostel/rooms", element: <Rooms /> },
  { path: "hostel/rooms/create", element: <CreateRoom /> },
  { path: "hostel/rooms/:roomId", element: <Room /> },
  { path: "hostel/rooms/:roomId/edit", element: <EditRoom /> },
  { path: "hostel/hostel-types", element: <Types /> },
  { path: "hostel/hostel-categories", element: <Categories /> },
  { path: "hostel/floors", element: <Floors /> },
  { path: "hostel/bed-spaces", element: <Beds /> },
  { path: "hostel/parents", element: <Parents /> },
  { path: "hostel/supervisors/:supervisorId", element: <Supervisor /> },
  { path: "hostel/visitors", element: <Visitors /> },
  { path: "hostel/damage", element: <Damage /> },
  { path: "hostel/movement", element: <Movement /> },
  { path: "hostel/attendance", element: <Attendance /> },
  { path: "hostel/attendance/history", element: <History /> },
  { path: "hostel/health-records", element: <Health /> },
]
