import type { Permission } from "@/schema/user.schema"
import type { Customer } from "@/types/fee"
import {
  ClipboardList,
  User,
  Users2,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react"

export const STEPS = [
  { id: 1, label: "Basic Info", icon: User },
  { id: 2, label: "Review", icon: ClipboardList },
]

export const USER_MANAGEMENT_STATS_CONFIG = [
  { id: "totalUsers", label: "Total Users", icon: Users2, color: "blue" as const },
  { id: "activeUsers", label: "Active Users", icon: UserCheck, color: "green" as const },
  { id: "inactiveUsers", label: "Inactive Users", icon: UserX, color: "red" as const },
  { id: "pendingUsers", label: "Pending Users", icon: Clock, color: "amber" as const },

]




export const SEED_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Mrs. Adaeze Okafor",
    phone: "08012345678",
    type: "parent",
    students: ["Chiamaka Okafor", "Kelechi Okafor"],
  },
  {
    id: "c2",
    name: "Mr. Emeka Nwosu",
    email: "emeka@email.com",
    type: "parent",
    students: ["Ifeanyi Nwosu", "Nkechi Nwosu", "Emeka Nwosu"],
  },
  {
    id: "c3",
    name: "Ms Ofure",
    type: "parent",
    students: ["Natasha Ofure"],
  },
  {
    id: "c4",
    name: "Mr. Babatunde Fashola",
    email: "tunde@email.com",
    phone: "08087654321",
    type: "parent",
    students: ["Tomiwa Fashola"],
  },
]

export const permissionLabels: Record<Permission, string> = {
  1: "Create",
  2: "Update",
  3: "Delete",
  4: "View",
}

export const permissionColors: Record<Permission, string> = {
  1: "border-green-200 bg-green-50 text-green-700",
  2: "border-amber-200 bg-amber-50 text-amber-700",
  3: "border-red-200 bg-red-50 text-red-600",
  4: "border-blue-200 bg-blue-50 text-blue-700",
}

export const classes = [
  "Nur 1",
  "Nur2",
  "Pry 1",
  "Pry 2",
  "Pry 3",
  "Pry 4",
  "Pry 5",
  "Pry 6",
  "JSS 1A",
  "JSS 1B",
  "JSS 1C",
  "JSS 2A",
  "JSS 2B",
  "JSS 2C",
  "JSS 3A",
  "JSS 3B",
  "JSS 3C",
  "SSS 1A",
  "SSS 1B",
  "SSS 1C",
  "SSS 2A",
  "SSS 2B",
  "SSS 2C",
  "SSS 3A",
  "SSS 3B",
  "SSS 3C",
]

export type PaymentStatus = "owing" | "part-payment" | "complete"

export const mockSchoolInfo = {
  name: "Greenfield Academy",
  address: "12 Education Close, Victoria Island, Lagos, Nigeria",
  phone: "+234 801 234 5678",
  email: "info@greenfieldacademy.edu.ng",
  registrationNumber: "RC-20045678",
  website: "www.greenfieldacademy.edu.ng",

  logoUrl: null as string | null,
}

export type SchoolInfo = typeof mockSchoolInfo
