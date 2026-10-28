import api from "./api"
import { toCamelCase } from "@/utils/caseConversion"
export interface Visit {
  id: string
  studentName: string
  studentId: string
  className?: string
  visitorFirstName: string
  visitorLastName: string
  relationshipToStudent: string
  visitLocation: string
  visitDate: string
  checkInTime: string
  expectedCheckOutTime: string
  reasonForVisit: string
  additionalNotes?: string
  status: string
  rejectionReason?: string
  dateCreated: string
  additionalVisitorCount: number
  additionalVisitorNames?: string
  bringingPackage: boolean
}
export interface Page<T> {
  items: T[]
  totalItems: number
  totalPages: number
  pageNumber: number
  pageSize: number
}
export async function value<T>(response: Promise<unknown>): Promise<T> {
  const data = toCamelCase<{ isSuccess: boolean; message?: string; value: T }>(
    await response,
  )
  if (data.isSuccess === false)
    throw new Error(data.message || "The request could not be completed.")
  return data.value
}
export const visits = (
  schoolId: string,
  pageNumber = 1,
  status?: string,
  visitRequestId?: string,
) =>
  value<Page<Visit>>(
    api.get("/Visitation/GetRequests", {
      params: { schoolId, pageNumber, pageSize: 20, status, visitRequestId },
    }),
  )
export const reviewVisit = (
  id: string,
  status: "Approved" | "Rejected",
  reason: string,
) =>
  value(
    api.post("/Visitation/Review/" + id, {
      newStatus: status,
      rejectionReason: reason || null,
    }),
  )
