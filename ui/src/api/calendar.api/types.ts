// ─── Calendar ─────────────────────────────────────────────────────────────────

export interface CalendarAffectedClassI {
  schoolClassId: string
  schoolClassName: string
}

export interface CalendarEventI {
  id: string
  schoolId: string
  title: string
  startDate: string
  startTime: string | null
  formattedStartDate: string
  endDate: string | null
  endTime: string | null
  formattedEndDate: string
  eventType: number
  eventTypeName: string
  description: string
  affectsAllClasses: boolean
  affectedClasses: CalendarAffectedClassI[]
  status: number
  statusName: string
  dateCreated: string
}

// affectsAllClasses: false requires schoolClassIds to be set
export interface CreateCalendarEventPayloadI {
  schoolId: string
  title: string
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  eventType: number
  description?: string
  affectsAllClasses: boolean
  schoolClassIds?: string[]
}

export interface CreateCalendarEventResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: CalendarEventI
}

// affectsAllClasses: false replaces the event's class mappings with schoolClassIds
export interface UpdateCalendarEventPayloadI {
  id: string
  title: string
  startDate: string
  endDate: string
  startTime?: string
  endTime?: string
  eventType: number
  description?: string
  affectsAllClasses: boolean
  schoolClassIds?: string[]
}

export interface UpdateCalendarEventResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: CalendarEventI
}

export interface DeleteCalendarEventResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

// classId, when set, returns school-wide events plus events specific to that class
export interface GetCalendarEventsParamsI {
  schoolId: string
  startDate?: string
  endDate?: string
  classId?: string
  studentId?: string
  eventType?: number
}

export interface GetCalendarEventsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: CalendarEventI[]
}
