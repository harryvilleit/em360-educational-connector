import type { HostelEnrollment } from "@/types/hostelEnrollment"

export const HOSTEL_ENROLLMENTS: HostelEnrollment[] = []

export function getEnrollment(studentId: string): HostelEnrollment | undefined {
  return HOSTEL_ENROLLMENTS.find((e) => e.studentId === studentId)
}

export function isHostelBoarder(studentId: string): boolean {
  return HOSTEL_ENROLLMENTS.some((e) => e.studentId === studentId)
}
