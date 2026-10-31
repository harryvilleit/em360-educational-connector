import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getEnrollment } from "@/data/hostelEnrollments"

export type VisitationStatus = "pending" | "approved" | "declined"
export type VisitLocation = "school" | "hostel"

export interface VisitationRequest {
  id: string
  // Parent / guardian making the request
  parentId: string
  parentName: string
  parentPhone: string
  // Visitor — may differ from parent (e.g. uncle, aunt)
  visitorName: string
  visitorRelationship: string
  // Student being visited
  studentId: string
  studentName: string
  studentClass: string
  // Visit logistics
  location: VisitLocation
  visitDate: string       // ISO: "2025-06-10"
  visitTime: string       // alias for checkInTime — kept for backwards compat
  checkInTime: string     // expected arrival  e.g. "10:00"
  checkOutTime: string    // expected departure e.g. "14:00"
  purpose: string
  notes?: string
  // Additional visitors accompanying the primary visitor
  extraVisitorsCount: number
  extraVisitorsNames?: string
  // Items / package declaration
  bringsItems: boolean
  itemsDescription?: string
  // Review state
  status: VisitationStatus
  adminNote?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  // Hostel details (populated when location === "hostel")
  roomNumber?: string
  hostelName?: string
  supervisorId?: string
  supervisorName?: string
}

export interface SupervisorNotification {
  id: string
  supervisorId: string
  supervisorName: string
  requestId: string
  // Visitor info
  visitorName: string
  visitorRelationship: string
  parentPhone: string
  // Student info
  studentName: string
  roomNumber: string
  hostelName: string
  // Timing
  visitDate: string
  checkInTime: string
  checkOutTime: string
  // Purpose
  purpose: string
  // Extras
  extraVisitorsCount: number
  bringsItems: boolean
  itemsDescription?: string
  approvedBy: string
  read: boolean
  createdAt: string
}

export interface ParentVisitNotification {
  id: string
  parentId: string
  requestId: string
  type: "approved" | "declined"
  studentName: string
  visitDate: string
  visitTime: string
  location: VisitLocation
  adminNote?: string
  read: boolean
  createdAt: string
}

interface VisitationState {
  requests: VisitationRequest[]
  supervisorNotifications: SupervisorNotification[]
  parentNotifications: ParentVisitNotification[]

  submitRequest: (
    data: Omit<VisitationRequest, "id" | "status" | "createdAt">
  ) => VisitationRequest

  approveRequest: (id: string, reviewedBy: string, note?: string) => void
  declineRequest: (id: string, reviewedBy: string, reason: string) => void

  getParentRequests: (parentId: string) => VisitationRequest[]
  getParentNotifications: (parentId: string) => ParentVisitNotification[]
  getSupervisorNotifications: (supervisorId: string) => SupervisorNotification[]

  markParentNotifRead: (id: string) => void
  markSupervisorNotifRead: (id: string) => void
}

export const useVisitationStore = create<VisitationState>()(
  persist(
    (set, get) => ({
      requests: [],
      supervisorNotifications: [],
      parentNotifications: [],

      submitRequest: (data) => {
        const enrollment =
          data.location === "hostel" ? getEnrollment(data.studentId) : undefined

        const request: VisitationRequest = {
          ...data,
          id: crypto.randomUUID(),
          status: "pending",
          // visitTime mirrors checkInTime for backwards-compat displays
          visitTime: data.checkInTime,
          createdAt: new Date().toISOString().split("T")[0],
          roomNumber: enrollment?.roomNumber,
          hostelName: enrollment?.hostelName,
          supervisorId: enrollment?.supervisorId,
          supervisorName: enrollment?.supervisorName,
        }
        set((state) => ({ requests: [request, ...state.requests] }))
        return request
      },

      approveRequest: (id, reviewedBy, note) => {
        set((state) => {
          const req = state.requests.find((r) => r.id === id)
          if (!req) return state

          const updatedRequests = state.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: "approved" as const,
                  adminNote: note,
                  reviewedBy,
                  reviewedAt: new Date().toISOString().split("T")[0],
                }
              : r
          )

          // Parent notification
          const parentNotif: ParentVisitNotification = {
            id: crypto.randomUUID(),
            parentId: req.parentId,
            requestId: id,
            type: "approved",
            studentName: req.studentName,
            visitDate: req.visitDate,
            visitTime: req.visitTime,
            location: req.location,
            adminNote: note,
            read: false,
            createdAt: new Date().toISOString(),
          }

          const newParentNotifs = [...state.parentNotifications, parentNotif]

          // Supervisor notification (only for hostel visits)
          let newSupNotifs = state.supervisorNotifications
          if (
            req.location === "hostel" &&
            req.supervisorId &&
            req.roomNumber &&
            req.hostelName
          ) {
            const supNotif: SupervisorNotification = {
              id: crypto.randomUUID(),
              supervisorId: req.supervisorId,
              supervisorName: req.supervisorName ?? "",
              requestId: id,
              visitorName: req.visitorName,
              visitorRelationship: req.visitorRelationship,
              parentPhone: req.parentPhone,
              studentName: req.studentName,
              roomNumber: req.roomNumber,
              hostelName: req.hostelName,
              visitDate: req.visitDate,
              checkInTime: req.checkInTime,
              checkOutTime: req.checkOutTime,
              purpose: req.purpose,
              extraVisitorsCount: req.extraVisitorsCount,
              bringsItems: req.bringsItems,
              itemsDescription: req.itemsDescription,
              approvedBy: reviewedBy,
              read: false,
              createdAt: new Date().toISOString(),
            }
            newSupNotifs = [...state.supervisorNotifications, supNotif]
          }

          return {
            requests: updatedRequests,
            parentNotifications: newParentNotifs,
            supervisorNotifications: newSupNotifs,
          }
        })
      },

      declineRequest: (id, reviewedBy, reason) => {
        set((state) => {
          const req = state.requests.find((r) => r.id === id)
          if (!req) return state

          const updatedRequests = state.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: "declined" as const,
                  adminNote: reason,
                  reviewedBy,
                  reviewedAt: new Date().toISOString().split("T")[0],
                }
              : r
          )

          const parentNotif: ParentVisitNotification = {
            id: crypto.randomUUID(),
            parentId: req.parentId,
            requestId: id,
            type: "declined",
            studentName: req.studentName,
            visitDate: req.visitDate,
            visitTime: req.visitTime,
            location: req.location,
            adminNote: reason,
            read: false,
            createdAt: new Date().toISOString(),
          }

          return {
            requests: updatedRequests,
            parentNotifications: [...state.parentNotifications, parentNotif],
          }
        })
      },

      getParentRequests: (parentId) =>
        get().requests.filter((r) => r.parentId === parentId),

      getParentNotifications: (parentId) =>
        get().parentNotifications.filter((n) => n.parentId === parentId),

      getSupervisorNotifications: (supervisorId) =>
        get().supervisorNotifications.filter(
          (n) => n.supervisorId === supervisorId
        ),

      markParentNotifRead: (id) =>
        set((state) => ({
          parentNotifications: state.parentNotifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markSupervisorNotifRead: (id) =>
        set((state) => ({
          supervisorNotifications: state.supervisorNotifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
    }),
    { name: "em360-visitation" }
  )
)
