export interface Result<T> {
  isSuccess: boolean
  statusCode: number
  message: string
  value: T
}

export interface SchoolOverviewResponse {
  schoolId: string
  schoolName: string
  selectedSessionId: string
  selectedSessionName: string
  selectedTermId: string
  selectedTermName: string
  availableSessions: OverviewSessionFilter[]
  kpis: SchoolOverviewKpis
  weeklyAttendance: WeeklyAttendance
  enrollmentBreakdown: EnrollmentBreakdown
  recentActivities: SchoolRecentActivity[]
  upcomingEvents: SchoolUpcomingEvent[]
}

export interface OverviewSessionFilter {
  id: string
  sessionName: string
  isCurrent: boolean
  terms: OverviewTermFilter[]
}

export interface OverviewTermFilter {
  id: string
  termName: string
  status: string
  isCurrent: boolean
}

export interface SchoolOverviewKpis {
  totalStudents: number
  studentsThisTermDelta: number 
  totalTeachers: number
  teachersThisTermDelta: number 
  activeParentsCount: number
  activeParentsSubtitle: string 
  classesRunningCount: number
  levelsCount: number
  classesRunningSubtitle: string 
  averageAttendancePercentage: number 
  attendanceVsLastWeekDelta: number 
  totalFeesCollected: number
  feesTarget: number
  feesTargetPercentage: number 
  currencyCode: string 
  formattedFeesCollected: string 
}

export interface WeeklyAttendance {
  weekLabel: string 
  days: DayAttendance[]
}

export interface DayAttendance {
  dayName: string 
  date: string 
  presentCount: number
  absentCount: number
}

export interface EnrollmentBreakdown {
  totalEnrolled: number
  levels: LevelEnrollment[]
}

export interface LevelEnrollment {
  levelName: string 
  studentCount: number
  percentage: number
}

export interface SchoolRecentActivity {
  id: string
  title: string
  subtitle: string
  activityType: "Enrollment" | "Payment" | "Results" | "Staff" | "Timetable"
  occurredAt: string
  timeAgo: string
}

export interface SchoolUpcomingEvent {
  id: string
  title: string
  description: string
  eventType: "Academic" | "Meeting" | "Sports" | "Exam" | "Finance" | "Event"
  startDate: string 
  endDate?: string
  formattedDate: string 
  affectsAllClasses: boolean
}
