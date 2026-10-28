export interface GetHostelOverviewParamsI {
  schoolId?: string
}

export interface HostelOverviewSummaryI {
  totalBeds: number
  occupied: number
  available: number
  occupancyRate: number
}

export interface HostelOverviewBreakdownI {
  hostelId: string
  hostelName: string
  categoryName: string
  totalBeds: number
  occupied: number
  available: number
  occupancyRate: number
}

export interface HostelOverviewI {
  overallSummary: HostelOverviewSummaryI
  hostelBreakdowns: HostelOverviewBreakdownI[]
}

export interface GetHostelOverviewResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelOverviewI
}



export interface HostelSupervisorRefI {
  supervisorId: string
  supervisorName: string
}

export interface HostelItemI {
  id: string
  name: string
  categoryId: string
  categoryName: string
  schoolId: string
  supervisors: HostelSupervisorRefI[]
  status: number | string
  dateCreated: string
  floorCount: number
  roomCount: number
}

export interface CreateHostelsPayloadI {
  hostelCategoryId: string
  schoolId: string
  names: string[]
}

export interface CreateHostelsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelItemI[]
}

export interface UpdateHostelPayloadI {
  id: string
  name: string
  hostelCategoryId: string
  status: number | string
}

export interface UpdateHostelResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelItemI
}

export interface DeleteHostelResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface GetAllHostelsParamsI {
  schoolId?: string
  pageNumber?: number
  pageSize?: number
  keyword?: string
}

export interface PaginatedHostelsValueI {
  items: HostelItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetAllHostelsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedHostelsValueI
}

export interface GetHostelByIdResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelItemI
}



export interface HostelCategoryItemI {
  id: string
  name: string
  schoolId: string
  status: number | string
  dateCreated: string
  hostelCount: number
}

export interface CreateHostelCategoriesPayloadI {
  schoolId: string
  names: string[]
}

export interface CreateHostelCategoriesResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelCategoryItemI[]
}

export interface UpdateHostelCategoryPayloadI {
  id: string
  name: string
}

export interface UpdateHostelCategoryResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelCategoryItemI
}

export interface DeleteHostelCategoryResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface GetAllHostelCategoriesParamsI {
  schoolId?: string
  pageNumber?: number
  pageSize?: number
  keyword?: string
}

export interface PaginatedHostelCategoriesValueI {
  items: HostelCategoryItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetAllHostelCategoriesResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedHostelCategoriesValueI
}

export interface GetHostelCategoryByIdResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelCategoryItemI
}



export interface HostelRoomItemI {
  id: string
  hostelId: string
  hostelName: string
  hostelType: number | string
  roomNumber: string
  roomName: string
  floor: string
  description: string
  amenities: string[]
  status: number | string
  dateCreated: string
  bedSpaceCount: number
  occupiedBeds: number
  totalBeds: number
}

export interface CreateHostelRoomPayloadI {
  hostelId: string
  roomNumber: string
  roomName: string
  floor?: string
  description?: string
  amenities?: string[]
}

export interface CreateHostelRoomResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelRoomItemI
}

export interface UpdateHostelRoomPayloadI {
  id: string
  hostelId: string
  roomNumber: string
  roomName: string
  floor?: string
  description?: string
  amenities?: string[]
  status: number | string
}

export interface UpdateHostelRoomResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelRoomItemI
}

export interface DeleteHostelRoomResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface GetAllHostelRoomsParamsI {
  schoolId?: string
  pageNumber?: number
  pageSize?: number
  keyword?: string
}

export interface PaginatedHostelRoomsValueI {
  items: HostelRoomItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetAllHostelRoomsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedHostelRoomsValueI
}

export interface GetHostelRoomByIdResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelRoomItemI
}

export interface GetHostelRoomsByHostelTypeResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelRoomItemI[]
}

export interface GetAvailableHostelRoomsParamsI {
  schoolId?: string
}

export interface GetAvailableHostelRoomsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelRoomItemI[]
}



export interface HostelAttendanceStudentRecordI {
  id: string
  sessionId: string
  studentId: string
  studentName: string
  registrationNumber: string
  className: string
  bedSpaceId?: string
  roomName: string
  bedName: string
  status: number
  remarks?: string
}

export interface HostelAttendanceSessionI {
  id: string
  hostelId: string
  hostelName: string
  date: string
  period: number
  conductedByUserId: string
  conductedByUserName: string
  totalPresent: number
  totalAbsent: number
  totalLate: number
  totalExcused: number
  dateCreated: string
  studentRecords: HostelAttendanceStudentRecordI[]
}

export interface GetRollCallSheetParamsI {
  hostelId: string
  date: string
  period: number
}

export interface GetRollCallSheetResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelAttendanceSessionI
}

export interface SubmitHostelAttendancePayloadI {
  hostelId: string
  date: string
  period: number
  studentRecords: HostelAttendanceStudentRecordI[]
}

export interface SubmitHostelAttendanceResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface GetHostelAttendanceHistoryParamsI {
  schoolId?: string
  hostelId?: string
  period?: number
  date?: string
  pageNumber?: number
  pageSize?: number
}

export interface PaginatedHostelAttendanceSessionsValueI {
  items: HostelAttendanceSessionI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetHostelAttendanceHistoryResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedHostelAttendanceSessionsValueI
}

export interface GetHostelAttendanceSessionByIdResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelAttendanceSessionI
}



export interface HostelReportItemI {
  id: string
  hostelId: string
  hostelName: string
  roomId: string
  roomNumber: string
  reportType: string
  title: string
  description: string
  reportedBy: string
  estimatedCost: number
  status: string
  studentId?: string
  studentName?: string
  dateCreated: string
  dateModified: string
}

export interface GetHostelReportOverviewParamsI {
  hostelId?: string
}

export interface HostelReportOverviewI {
  totalReports: number
  propertyDamageCount: number
  incidentCount: number
}

export interface GetHostelReportOverviewResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelReportOverviewI
}

export interface GetAllHostelReportsParamsI {
  hostelId?: string
  reportType?: string
  status?: string
  searchString?: string
  pageNumber?: number
  pageSize?: number
}

export interface PaginatedHostelReportsValueI {
  items: HostelReportItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetAllHostelReportsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedHostelReportsValueI
}

export interface GetHostelReportByIdResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelReportItemI
}

export interface FileHostelReportPayloadI {
  hostelId: string
  roomId: string
  reportType: number
  title: string
  description: string
  reportedBy: string
  estimatedCost: number
}

export interface FileHostelReportResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelReportItemI
}

export interface BillHostelReportParamsI {
  id: string
}

export interface BillHostelReportPayloadI {
  reportId: string
  studentId: string
}

export interface BillHostelReportResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelReportItemI
}

export interface WaiveHostelReportResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelReportItemI
}

export interface DeleteHostelReportResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}



// One row per (hostel, supervisor) assignment — a supervisor covering
// multiple hostels appears once per hostel here.
export interface HostelSupervisorAssignmentI {
  userId: string
  hostelId: string
  hostelName: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  status: number | string
  dateAssigned: string
}

// Aggregated across every hostel the supervisor is assigned to.
export interface HostelSupervisorProfileI {
  supervisorId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  status: number | string
  dateJoined: string
  hostelIds: string[]
  hostelNames: string[]
  assignedRoomsMessage: string
  studentsUnderCare: number
  reportsFiled: number
  resolvedReports: number
  openReports: number
}

export interface AssignHostelSupervisorPayloadI {
  hostelId: string
  supervisorId: string
}

export interface AssignHostelSupervisorResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface UnassignHostelSupervisorPayloadI {
  hostelId: string
  supervisorId: string
}

export interface UnassignHostelSupervisorResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface GetAllHostelSupervisorsParamsI {
  schoolId?: string
  pageNumber?: number
  pageSize?: number
  keyword?: string
}

export interface PaginatedHostelSupervisorsValueI {
  items: HostelSupervisorAssignmentI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetAllHostelSupervisorsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedHostelSupervisorsValueI
}

export interface GetHostelSupervisorProfileResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelSupervisorProfileI
}



export interface HostelVisitorStudentI {
  studentId: string
  studentName: string
}

export interface HostelVisitorItemI {
  id: string
  hostelId: string
  students: HostelVisitorStudentI[]
  visitorFullName: string
  visitorFirstName: string
  visitorLastName: string
  visitorPhone: string
  relationship: string
  reason: string
  visitDate: string
  expectedCheckInTime?: string
  expectedCheckOutTime?: string
  actualCheckInTime?: string
  actualCheckOutTime?: string
  additionalVisitorCount: number
  additionalVisitorNames?: string
  broughtPackage: boolean
  dateCreated: string
}

export interface RecordHostelVisitorPayloadI {
  hostelId: string
  studentIds: string[]
  visitorFirstName: string
  visitorLastName: string
  visitorPhone: string
  relationship: string
  reason: string
  visitDate: string
  expectedCheckInTime?: string
  expectedCheckOutTime?: string
  additionalVisitorCount?: number
  additionalVisitorNames?: string
  broughtPackage?: boolean
}

export interface RecordHostelVisitorResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelVisitorItemI
}

export interface GetAllHostelVisitorsParamsI {
  hostelId?: string
  searchString?: string
  fromDate?: string
  toDate?: string
  pageNumber?: number
  pageSize?: number
}

export interface PaginatedHostelVisitorsValueI {
  items: HostelVisitorItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetAllHostelVisitorsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedHostelVisitorsValueI
}

export interface GetHostelVisitorByIdResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelVisitorItemI
}

export interface UpdateHostelVisitorPayloadI {
  id: string
  studentIds: string[]
  visitorFirstName: string
  visitorLastName: string
  visitorPhone: string
  relationship: string
  reason: string
  visitDate: string
  expectedCheckInTime?: string
  expectedCheckOutTime?: string
  additionalVisitorCount?: number
  additionalVisitorNames?: string
  broughtPackage?: boolean
}

export interface UpdateHostelVisitorResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HostelVisitorItemI
}

export interface SignInOutHostelVisitorPayloadI {
  id: string
  isSignIn: boolean
}

export interface SignInOutHostelVisitorResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface DeleteHostelVisitorResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}



export interface BedSpaceItemI {
  id: string
  roomId: string
  roomNumber: string
  roomName: string
  hostelName: string
  bedLabel: string
  studentId?: string
  studentName?: string
  admissionNumber?: string
  // Read back as the enum name (e.g. "Active") rather than its ordinal.
  status: number | string
  dateCreated: string
}

export interface CreateBedSpacePayloadI {
  roomId: string
  bedLabel: string
}

export interface CreateBedSpaceResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: BedSpaceItemI
}

export interface UpdateBedSpacePayloadI {
  id: string
  roomId: string
  bedLabel: string
  // Pass-through of the value read from BedSpaceItemI.status — may already
  // be the enum name rather than its ordinal.
  status: number | string
}

export interface UpdateBedSpaceResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: BedSpaceItemI
}

export interface DeleteBedSpaceResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface AssignBedSpacePayloadI {
  bedSpaceId: string
  studentId: string
}

export interface AssignBedSpaceResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: BedSpaceItemI
}

export interface ReleaseBedSpaceResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: BedSpaceItemI
}

export interface GetAllBedSpacesParamsI {
  schoolId?: string
  pageNumber?: number
  pageSize?: number
  keyword?: string
}

export interface PaginatedBedSpacesValueI {
  items: BedSpaceItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetAllBedSpacesResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedBedSpacesValueI
}

export interface GetBedSpaceByIdResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: BedSpaceItemI
}

export interface GetBedSpacesByRoomResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: BedSpaceItemI[]
}

export interface GetAvailableBedSpacesParamsI {
  schoolId?: string
  hostelId?: string
  roomId?: string
}

export interface GetAvailableBedSpacesResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: BedSpaceItemI[]
}

export interface GetBedSpacesByStudentResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: BedSpaceItemI[]
}
