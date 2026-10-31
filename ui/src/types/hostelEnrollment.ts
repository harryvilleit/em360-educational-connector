export interface HostelEnrollment {
  studentId: string
  studentName: string
  roomNumber: string
  hostelName: string
  gender: "male" | "female"
  supervisorId: string
  supervisorName: string
  supervisorRole: "House Master" | "House Mistress" | "Assistant"
  supervisorPhone: string
  supervisorEmail: string
}
