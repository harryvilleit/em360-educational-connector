//  Staff Types

export type EmploymentType = "full-time" | "part-time" | "contract"

export type StaffStatus = "active" | "inactive" | "suspended" | "terminated"

export type Permission =
  | "view_students"
  | "manage_fees"
  | "access_reports"
  | "manage_staff"
  | "manage_attendance"
  | "manage_leave"
  | "manage_roles"
  | "view_dashboard"

//  Core Entities

export interface Role {
  id: string
  name: string
  permissions: Permission[]
  color: string
  staffCount?: number
}

export interface Staff {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: Role
  department: string
  employmentType: EmploymentType
  status: StaffStatus
  dateOfEmployment: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other"
  address?: string
  qualification?: string
  gradeLevel?: string
  gradeStep?: string
  firstAppointmentDate?: string
  presentAppointmentDate?: string
  datePostedToSchool?: string
  stateOfOrigin?: string
  lgaOfOrigin?: string
  town?: string
  serviceNumber?: string
  profilePicture?: string
  documents?: Document[]
  createdAt: string
}

export interface Document {
  id: string
  name: string
  type: string
  uploadedAt: string
  url: string
}

//  Form Types

export interface StaffFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  roleId: string
  department: string
  employmentType: EmploymentType
  status: StaffStatus
  dateOfEmployment: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other"
  address?: string
  qualification?: string
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

export interface RoleFormData {
  name: string
  permissions: Permission[]
  color: string
}

// API / Query Types

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface StaffFilters {
  search?: string
  roleId?: string
  department?: string
  status?: StaffStatus
  page?: number
  pageSize?: number
}
