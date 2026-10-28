export interface GetStaffDirectoryParamsI {
  schoolId: string
  search?: string
  roleId?: string
  departmentId?: string
  status?: string
  pageNumber?: number
  pageSize?: number
}

export interface StaffRoleOptionI {
  id: string
  name: string
}

export interface StaffDepartmentOptionI {
  id: string
  name: string
}

export interface StaffDirectoryItemI {
  subUserId: string
  userId: string
  fullName: string
  email: string
  profilePicture: string | null
  role: string
  department: string
  /** Nullable in practice — staff can exist with none recorded. */
  employmentType: string | null
  qualification: string | null
  dateOfBirth: string | null
  gender: number | string | null
  status: number | string
  statusLabel: string
  dateCreated: string
  /** Government staff-return fields; optional until the backend serves them. */
  gradeLevel?: string
  gradeStep?: string
  firstAppointmentDate?: string
  presentAppointmentDate?: string
  datePostedToSchool?: string
  stateOfOrigin?: string
  lgaOfOrigin?: string
  town?: string
  serviceNumber?: string
}

export interface StaffDirectoryListI {
  items: StaffDirectoryItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface StaffDirectoryValueI {
  totalStaff: number
  activeCount: number
  inactiveCount: number
  suspendedCount: number
  availableRoles: StaffRoleOptionI[]
  availableDepartments: StaffDepartmentOptionI[]
  staff: StaffDirectoryListI
}

export interface GetStaffDirectoryResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StaffDirectoryValueI
}

// ─── Staff Details ──────────────────────────────────────────────────────────

export interface GetStaffDetailsParamsI {
  subUserId: string
  schoolId: string
}

export interface StaffDetailsI {
  subUserId: string
  userId: string
  fullName: string
  email: string
  phone: string
  address: string | null
  profilePicture: string | null
  status: number | string
  statusLabel: string
  /** Nullable in practice — staff can exist with none recorded. */
  employmentType: string | null
  dateOfBirth: string | null
  gender: number | string | null
  dateOfEmployment: string | null
  role: string
  department: string
  qualification: string | null
  rolePermissions: string[]
  gradeLevel?: string
  gradeStep?: string
  firstAppointmentDate?: string
  presentAppointmentDate?: string
  datePostedToSchool?: string
  stateOfOrigin?: string
  lgaOfOrigin?: string
  town?: string
  serviceNumber?: string
}

export interface GetStaffDetailsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StaffDetailsI
}

// ─── Staff Assigned Classes ─────────────────────────────────────────────────

export interface GetStaffAssignedClassesParamsI {
  subUserId: string
  schoolId: string
}

export interface StaffAssignedClassI {
  classId: string
  className: string
  categoryName: string
}

export interface GetStaffAssignedClassesResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StaffAssignedClassI[]
}

// ─── Staff Assigned Subjects ────────────────────────────────────────────────

export interface GetStaffAssignedSubjectsParamsI {
  subUserId: string
  schoolId: string
}

export interface StaffAssignedSubjectI {
  subjectId: string
  subjectName: string
  subjectCode: string
}

export interface GetStaffAssignedSubjectsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StaffAssignedSubjectI[]
}

// ─── Staff Timetable ────────────────────────────────────────────────────────

export interface GetStaffTimetableParamsI {
  subUserId: string
  schoolId: string
  classId?: string
  subjectId?: string
  sessionId?: string
  termId?: string
  /** 1 = Class, 2 = Assessment. Omit for both. */
  timetableType?: number
}

export interface StaffTimetableSlotI {
  id: string
  schoolId: string
  schoolSessionId: string
  schoolSessionTermId: string
  schoolClassId: string
  schoolClassName: string
  timetableType: number
  timetableTypeName: string
  dayOfWeek: number
  dayOfWeekName: string
  date: string
  formattedDate: string
  weekStartDate: string
  formattedWeekStartDate: string
  periodTypeId: string
  periodTypeName: string
  periodTypeCode: string
  startTime: string
  formattedStartTime: string
  endTime: string
  formattedEndTime: string
  subjectId: string
  subjectName: string
  classMode: number
  classModeName: string
  venue: string | null
  assessmentType: string | null
  dateCreated: string
}

export interface GetStaffTimetableResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StaffTimetableSlotI[]
}
