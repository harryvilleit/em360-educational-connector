// ─── Timetable ────────────────────────────────────────────────────────────────

export interface TimetableSlotI {
  id: string
  schoolId: string
  schoolSessionId: string
  schoolSessionTermId: string
  schoolClassId: string
  schoolClassName: string
  timetableType: number
  timetableTypeName: string
  // Trust dayOfWeekName for display — dayOfWeek is only needed on the write
  // path (see dayNameToApiDayOfWeek in timetable.utils.ts).
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
  classMode: number | null
  classModeName: string
  venue: string
  assessmentType: string
  dateCreated: string
}

export interface TimetableWeekI {
  schoolId: string
  schoolSessionId: string
  schoolSessionTermId: string
  schoolClassId: string
  weekStartDate: string
  formattedWeekStartDate: string
  weekEndDate: string
  totalSlotsThisWeek: number
  slots: TimetableSlotI[]
}

export interface CreateTimetableSlotInputI {
  timetableType: number
  startTime: string
  endTime: string
  date: string
  dayOfWeek: number
  periodTypeId: string
  classMode?: number
  subjectId?: string
  venue?: string
  assessmentType?: string
}

export interface CreateTimetablePayloadI {
  schoolId: string
  schoolSessionId: string
  schoolSessionTermId: string
  schoolClassId: string
  weekStartDate: string
  slots: CreateTimetableSlotInputI[]
}

export interface CreateTimetableResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: TimetableWeekI
}

export interface GetTimetableByWeekParamsI {
  schoolId?: string
  sessionId?: string
  termId?: string
  timetableType?: number
  weekStartDate?: string
  classId?: string
}

export interface GetTimetableByWeekResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: TimetableWeekI
}

/**
 * Teacher-scoped weekly timetable (TeacherPortalController).
 * The teacher is resolved from the JWT server-side, so no teacherId is passed;
 * slots come back filtered to the teacher's assigned classes + subjects.
 */
export interface GetTeacherTimetableWeekParamsI {
  schoolId: string
  schoolSessionId: string
  schoolSessionTermId: string
  /** TimetableType: 1 = Class, 2 = Assessment. */
  timetableType: number
  /** Monday of the week, "YYYY-MM-DD". */
  weekStartDate?: string
}

export interface GetTeacherTimetableRangeParamsI {
  schoolId: string
  schoolSessionId: string
  schoolSessionTermId: string

  /** TimetableType.Class = 1 */
  timetableType: number

  startDate: string

  endDate: string

  /**
   * Optional class filter. Omit for "all classes" — the backend then returns
   * every class the teacher is assigned to.
   */
  schoolClassId?: string
}

export interface TimetableRangeI {
  schoolId: string
  schoolSessionId: string
  schoolSessionTermId: string

  startDate: string

  endDate: string

  totalSlots: number

  slots: TimetableSlotI[]
}

export interface GetTeacherTimetableRangeResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number

  value: TimetableRangeI
}

export interface UpdateTimetableSlotPayloadI {
  id: string
  schoolId: string
  date: string
  startTime: string
  endTime: string
  dayOfWeek: number
  weekStartDate: string
  periodTypeId: string
  classMode?: number
  subjectId?: string
  venue?: string
  assessmentType?: string
}

export interface UpdateTimetableSlotResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: TimetableSlotI
}

export interface DeleteTimetableSlotResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface GetAllTimetablesParamsI {
  schoolId?: string
  sessionId?: string
  termId?: string
  timetableType?: number
  classId?: string
  dateFrom?: string
  dateTo?: string
  pageNumber?: number
  pageSize?: number
}

export interface PaginatedTimetableSlotsValueI {
  items: TimetableSlotI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetAllTimetablesResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedTimetableSlotsValueI
}

export interface GetTimetableOverviewParamsI {
  schoolId?: string
  sessionId?: string
  termId?: string
}

export interface TimetableOverviewI {
  classesWithTimetable: number
  upcomingTests: number
  upcomingExams: number
  upcomingCalendarEvents: number
}

export interface GetTimetableOverviewResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: TimetableOverviewI
}


