import {
  Users,
  UserPlus,
  CreditCard,
  DoorOpen,
  ShieldCheck,
  FileText,
  type LucideIcon,
} from "lucide-react"
import { DashboardRoutes } from "@/routes"

export interface ParentShortcut {
  id: string
  label: string
  description: string
  icon: LucideIcon
  colorClass: string
  to: (productId: string) => string
}

export const PARENT_SHORTCUTS: ParentShortcut[] = [
  {
    id: "parent-list",
    label: "Parent List",
    description: "View and manage all registered parents",
    icon: Users,
    colorClass: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    to: (p) => DashboardRoutes.toParentList(p),
  },
  {
    id: "add-parent",
    label: "Add Parent",
    description: "Register a new parent or guardian",
    icon: UserPlus,
    colorClass: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    to: (p) => DashboardRoutes.toParentAdd(p),
  },
  {
    id: "consent-management",
    label: "Consent Management",
    description: "Review and track parental consent requests",
    icon: ShieldCheck,
    colorClass: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    to: (p) => DashboardRoutes.toParentConsentOverview(p),
  },
  {
    id: "school-fees",
    label: "School Fees",
    description: "Invoices, payments and outstanding balances",
    icon: CreditCard,
    colorClass: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    to: (p) => DashboardRoutes.toParentFeesOverview(p),
  },
  {
    id: "visitation",
    label: "Visitation Requests",
    description: "Review and approve parent visit requests",
    icon: DoorOpen,
    colorClass: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    to: (p) => DashboardRoutes.toParentVisitationOverview(p),
  },
  {
    id: "transcript",
    label: "Request Transcript",
    description: "Review and approve academic transcript requests",
    icon: FileText,
    colorClass: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    to: (p) => DashboardRoutes.toParentTranscriptOverview(p),
  },
]
