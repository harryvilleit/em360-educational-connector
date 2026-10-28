import type { DayName, PeriodMode } from "@/types/timetable"

export interface ClassNotification {
  id: string
  className: string
  day: DayName
  subject: string
  teacher?: string
  mode: PeriodMode
  startTime: string
  endTime: string
  read: boolean
  createdAt: string
}

export interface ClassNotificationState {
  notifications: ClassNotification[]
  notifyClassCreated: (
    data: Omit<ClassNotification, "id" | "read" | "createdAt">
  ) => void
  markAllRead: (className: string) => void
}
