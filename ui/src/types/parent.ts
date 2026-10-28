export interface LinkedChild {
  id: string
  name: string
  class: string
  studentId: string
  avatarInitials: string
}

export interface Parent {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  occupation: string
  relationship: "Father" | "Mother" | "Guardian"
  children: LinkedChild[]
  createdAt: string
  avatarInitials: string
  numberOfStudents?: number
}

export interface BroadcastMessage {
  id: string
  title: string
  body: string
  sentAt: string
  sentBy: string
  audience: "All Parents" | "Class" | "Individual"
  audienceLabel?: string
  read: boolean
}
