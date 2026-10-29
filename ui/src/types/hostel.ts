export type Gender = "male" | "female"

export type StudentBasic = {
  id: string
  firstName: string
  lastName: string
  className: string
  admissionNumber: string
  gender?: Gender
  parentId?: string
  parentName?: string
  parentPhone?: string
}

export type HostelType = {
  id: string
  name: string
  description?: string
  gender: Gender | "both"
  amenities: string[]
  createdAt: Date
}

export type BedSpace = {
  id: string
  roomId: string
  hostelId: string
  label: string
  isOccupied: boolean
  assignmentId?: string
  studentId?: string
  studentName?: string
}

export type HostelParent = {
  id: string
  hostelId: string
  fullName: string
  phone: string
  email: string
  role: "House Master" | "House Mistress" | "Assistant"
  startDate: Date
  isActive: boolean
  assignedRoomIds?: string[]
}

export type Room = {
  id: string
  hostelId: string
  roomNumber: string
  name?: string
  floor?: string
  hostelTypeId?: string
  description?: string
  amenities?: string[]
  capacity: number
  gender: Gender
  occupants: HostelAssignment[]
  availableSpots: number
}

export type HostelAssignment = {
  id: string
  studentId: string
  roomId: string
  hostelId: string
  hostelTypeId?: string
  bedSpaceId?: string
  bedSpaceLabel?: string
  assignedDate: Date
  moveOutDate?: Date
  status: "active" | "moved_out" | "waitlisted"
  student: StudentBasic
}

export type LeaveReason =
  | "class"
  | "weekend_visit"
  | "medical"
  | "holiday"
  | "emergency"
  | "other"

export type StudentMovementLog = {
  id: string
  studentId: string
  studentName: string
  roomId: string
  hostelId: string
  signOutDate: Date
  expectedReturnDate?: Date
  actualReturnDate?: Date
  reason: LeaveReason
  destination?: string
  approvedBy?: string
  notes?: string
  status: "out" | "returned" | "overdue"
}

export type Hostel = {
  id: string
  schoolId: string
  name: string
  gender: Gender
  totalCapacity: number
  rooms: Room[]
  hostelParents: HostelParent[]
  isEnabled: boolean
  createdAt: Date
}

export interface HostelState {
  hostels: Map<string, Hostel>
  hostelTypes: HostelType[]
  bedSpaces: BedSpace[]
  movementLogs: StudentMovementLog[]
  initializeHostels: (schoolId: string) => void
  getHostelByGender: (gender: Gender) => Hostel | undefined
  assignStudent: (
    studentId: string,
    roomId: string,
    student: StudentBasic,
    bedSpaceId?: string,
    hostelTypeId?: string
  ) => HostelAssignment
  bulkAssignStudents: (
    assignments: Array<{
      studentId: string
      roomId: string
      student: StudentBasic
    }>
  ) => void
  getHostelParents: (hostelId: string) => HostelParent[]
  signOutStudent: (
    log: Omit<StudentMovementLog, "id" | "signOutDate" | "status">
  ) => void
  signInStudent: (logId: string) => void
  getMovementLogsByHostel: (hostelId: string) => StudentMovementLog[]
  getCurrentlyOutStudents: (hostelId: string) => StudentMovementLog[]
}
