import {
  CalendarCheck2,
  CalendarDays,
  CreditCard,
  FileCheck,
  HeartPulse,
  Megaphone,
  ShieldCheck,
} from "lucide-react"
import type { ConsentRequestI } from "@/api/consent.api/types"
import type { LinkedChild } from "@/types/parent"
import type { NotificationType } from "@/data/parentNotifications"

// Unified item shape used in the notification list
export type ListItem =
  | {
      kind: "regular"
      id: string
      type: NotificationType
      title: string
      body: string
      date: string
      read: boolean
      priority: "high" | "normal"
      term?: string
      session?: string
      metadata?: Record<string, string>
    }
  | {
      kind: "consent"
      id: string
      request: ConsentRequestI
      date: string
      read: boolean
      term?: string
      session?: string
      affectedChildren: LinkedChild[]
    }

export function regularTypeStyle(type: NotificationType) {
  switch (type) {
    case "fee_reminder":
      return { icon: CreditCard, iconBg: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", badge: "Fee Reminder", badgeColor: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" }
    case "announcement":
      return { icon: Megaphone, iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", badge: "Announcement", badgeColor: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" }
    case "event":
      return { icon: CalendarDays, iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", badge: "Event", badgeColor: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" }
    case "result":
      return { icon: FileCheck, iconBg: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400", badge: "Result", badgeColor: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" }
    case "consent":
      return { icon: ShieldCheck, iconBg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400", badge: "Consent", badgeColor: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" }
    case "visitation":
      return { icon: CalendarCheck2, iconBg: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400", badge: "Visitation", badgeColor: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" }
    case "health":
      return { icon: HeartPulse, iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400", badge: "Health", badgeColor: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" }
  }
}
