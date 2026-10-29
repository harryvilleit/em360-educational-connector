import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type {
  BedSpace,
  Gender,
  Hostel,
  HostelAssignment,
  HostelState,
  HostelType,
  LeaveReason,
  Room,
  StudentBasic,
  StudentMovementLog,
} from "@/types/hostel"

export const REASON_LABELS: Record<LeaveReason, string> = {
  class: "Class",
  weekend_visit: "Weekend Visit",
  medical: "Medical",
  holiday: "Holiday",
  emergency: "Emergency",
  other: "Other",
}

// ============ MOCK DATA ============

const mockHostelTypes: HostelType[] = [
  {
    id: "HT-STANDARD",
    name: "Boys Hostel",
    description: "Basic accommodation with shared facilities",
    gender: "male",
    amenities: ["Ceiling Fan", "Bunk Beds", "Study Desk", "Storage Locker"],
    createdAt: new Date("2024-08-01"),
  },
  {
    id: "HT-PREMIUM",
    name: "Girls Hostel",
    description: "Enhanced comfort with additional amenities",
    gender: "female",
    amenities: [
      "Air Conditioning",
      "Individual Beds",
      "Study Room",
      "Wardrobe",
      "Private Bathroom",
    ],
    createdAt: new Date("2024-08-01"),
  },
]

const mockStudents: StudentBasic[] = [
  {
    id: "STU001",
    firstName: "Chukwu",
    lastName: "Okafor",
    className: "JSS 1A",
    admissionNumber: "EM-2024-001",
    gender: "male",
    parentId: "PAR001",
    parentName: "Mr. Okafor",
    parentPhone: "08023456789",
  },
  {
    id: "STU002",
    firstName: "Amara",
    lastName: "Nwosu",
    className: "JSS 1B",
    admissionNumber: "EM-2024-002",
    gender: "female",
    parentId: "PAR002",
    parentName: "Mrs. Nwosu",
    parentPhone: "08034567890",
  },
  {
    id: "STU003",
    firstName: "Tunde",
    lastName: "Adeyemi",
    className: "JSS 2A",
    admissionNumber: "EM-2024-003",
    gender: "male",
    parentId: "PAR003",
    parentName: "Mr. Adeyemi",
    parentPhone: "08045678901",
  },
  {
    id: "STU004",
    firstName: "Zainab",
    lastName: "Malik",
    className: "JSS 2B",
    admissionNumber: "EM-2024-004",
    gender: "female",
    parentId: "PAR004",
    parentName: "Alhaji Malik",
    parentPhone: "08056789012",
  },
  {
    id: "STU005",
    firstName: "Chisom",
    lastName: "Eze",
    className: "SSS 1A",
    admissionNumber: "EM-2024-005",
    gender: "male",
  },
  {
    id: "STU006",
    firstName: "Folake",
    lastName: "Oluwaseun",
    className: "SSS 1B",
    admissionNumber: "EM-2024-006",
    gender: "female",
    parentId: "PAR006",
    parentName: "Mrs. Oluwaseun",
    parentPhone: "08067890123",
  },
  {
    id: "STU007",
    firstName: "Obinna",
    lastName: "Ihenacho",
    className: "SSS 2A",
    admissionNumber: "EM-2024-007",
    gender: "male",
  },
  {
    id: "STU008",
    firstName: "Precious",
    lastName: "Okeke",
    className: "JSS 3A",
    admissionNumber: "EM-2024-008",
    gender: "female",
  },
  {
    id: "STU009",
    firstName: "Emmanuel",
    lastName: "Adewale",
    className: "JSS 1A",
    admissionNumber: "EM-2024-009",
    gender: "male",
    parentName: "Mr. Adewale",
    parentPhone: "08011223344",
  },
  {
    id: "STU010",
    firstName: "Grace",
    lastName: "Adekunle",
    className: "JSS 1B",
    admissionNumber: "EM-2024-010",
    gender: "female",
    parentName: "Mrs. Adekunle",
    parentPhone: "08022334455",
  },
  {
    id: "STU011",
    firstName: "David",
    lastName: "Mensah",
    className: "JSS 2A",
    admissionNumber: "EM-2024-011",
    gender: "male",
    parentName: "Mr. Mensah",
    parentPhone: "08033445566",
  },
  {
    id: "STU012",
    firstName: "Ngozi",
    lastName: "Uwajumobi",
    className: "JSS 2B",
    admissionNumber: "EM-2024-012",
    gender: "female",
    parentName: "Mrs. Uwajumobi",
    parentPhone: "08044556677",
  },
  {
    id: "STU013",
    firstName: "Adebayo",
    lastName: "Olayinka",
    className: "SSS 1A",
    admissionNumber: "EM-2024-013",
    gender: "male",
    parentName: "Mr. Olayinka",
    parentPhone: "08055667788",
  },
  {
    id: "STU014",
    firstName: "Chiamaka",
    lastName: "Nweke",
    className: "JSS 1A",
    admissionNumber: "EM-2024-014",
    gender: "female",
    parentName: "Mrs. Nweke",
    parentPhone: "08066778899",
  },
  {
    id: "STU015",
    firstName: "Kelechi",
    lastName: "Okafor",
    className: "JSS 1B",
    admissionNumber: "EM-2024-015",
    gender: "male",
    parentName: "Mr. Okafor",
    parentPhone: "08077889900",
  },
  {
    id: "STU016",
    firstName: "Fatima",
    lastName: "Bello",
    className: "JSS 2A",
    admissionNumber: "EM-2024-016",
    gender: "female",
    parentName: "Alhaja Bello",
    parentPhone: "08088990011",
  },
  {
    id: "STU017",
    firstName: "Segun",
    lastName: "Adeleke",
    className: "SSS 2A",
    admissionNumber: "EM-2024-017",
    gender: "male",
    parentName: "Mr. Adeleke",
    parentPhone: "08099001122",
  },
  {
    id: "STU018",
    firstName: "Ada",
    lastName: "Okonkwo",
    className: "SSS 1B",
    admissionNumber: "EM-2024-018",
    gender: "female",
    parentName: "Mrs. Okonkwo",
    parentPhone: "08010112233",
  },
  {
    id: "STU019",
    firstName: "Bello",
    lastName: "Abubakar",
    className: "JSS 3A",
    admissionNumber: "EM-2024-019",
    gender: "male",
    parentName: "Alhaji Abubakar",
    parentPhone: "08021223344",
  },
  {
    id: "STU020",
    firstName: "Halima",
    lastName: "Yusuf",
    className: "SSS 2B",
    admissionNumber: "EM-2024-020",
    gender: "female",
    parentName: "Alhaja Yusuf",
    parentPhone: "08032334455",
  },
]

const createMockHostels = (schoolId: string): Map<string, Hostel> => {
  const hostels = new Map<string, Hostel>()

  const boysRoom1: Room = {
    id: "ROOM-B001",
    hostelId: "HOSTEL-BOYS",
    roomNumber: "B101",
    name: "Eagle Room",
    floor: "Ground Floor",
    hostelTypeId: "HT-STANDARD",
    capacity: 4,
    gender: "male",
    occupants: [
      {
        id: "ASSIGN001",
        studentId: "STU001",
        roomId: "ROOM-B001",
        hostelId: "HOSTEL-BOYS",
        hostelTypeId: "HT-STANDARD",
        bedSpaceId: "BSPC-ROOM-B001-A",
        bedSpaceLabel: "Bed A",
        assignedDate: new Date("2024-09-01"),
        status: "active",
        student: mockStudents[0],
      },
      {
        id: "ASSIGN002",
        studentId: "STU003",
        roomId: "ROOM-B001",
        hostelId: "HOSTEL-BOYS",
        hostelTypeId: "HT-STANDARD",
        bedSpaceId: "BSPC-ROOM-B001-B",
        bedSpaceLabel: "Bed B",
        assignedDate: new Date("2024-09-01"),
        status: "active",
        student: mockStudents[2],
      },
    ],
    availableSpots: 2,
  }

  const boysRoom2: Room = {
    id: "ROOM-B002",
    hostelId: "HOSTEL-BOYS",
    roomNumber: "B102",
    name: "Falcon Room",
    floor: "Ground Floor",
    hostelTypeId: "HT-STANDARD",
    capacity: 4,
    gender: "male",
    occupants: [
      {
        id: "ASSIGN003",
        studentId: "STU007",
        roomId: "ROOM-B002",
        hostelId: "HOSTEL-BOYS",
        hostelTypeId: "HT-STANDARD",
        bedSpaceId: "BSPC-ROOM-B002-A",
        bedSpaceLabel: "Bed A",
        assignedDate: new Date("2024-09-01"),
        moveOutDate: new Date("2024-12-20"),
        status: "active",
        student: mockStudents[6],
      },
    ],
    availableSpots: 3,
  }

  const girlsRoom1: Room = {
    id: "ROOM-G001",
    hostelId: "HOSTEL-GIRLS",
    roomNumber: "G101",
    name: "Rose Room",
    floor: "Ground Floor",
    hostelTypeId: "HT-STANDARD",
    capacity: 4,
    gender: "female",
    occupants: [
      {
        id: "ASSIGN004",
        studentId: "STU002",
        roomId: "ROOM-G001",
        hostelId: "HOSTEL-GIRLS",
        hostelTypeId: "HT-STANDARD",
        bedSpaceId: "BSPC-ROOM-G001-A",
        bedSpaceLabel: "Bed A",
        assignedDate: new Date("2024-09-01"),
        status: "active",
        student: mockStudents[1],
      },
      {
        id: "ASSIGN005",
        studentId: "STU004",
        roomId: "ROOM-G001",
        hostelId: "HOSTEL-GIRLS",
        hostelTypeId: "HT-STANDARD",
        bedSpaceId: "BSPC-ROOM-G001-B",
        bedSpaceLabel: "Bed B",
        assignedDate: new Date("2024-09-01"),
        status: "active",
        student: mockStudents[3],
      },
      {
        id: "ASSIGN006",
        studentId: "STU006",
        roomId: "ROOM-G001",
        hostelId: "HOSTEL-GIRLS",
        hostelTypeId: "HT-STANDARD",
        bedSpaceId: "BSPC-ROOM-G001-C",
        bedSpaceLabel: "Bed C",
        assignedDate: new Date("2024-09-01"),
        status: "active",
        student: mockStudents[5],
      },
    ],
    availableSpots: 1,
  }

  const girlsRoom2: Room = {
    id: "ROOM-G002",
    hostelId: "HOSTEL-GIRLS",
    roomNumber: "G102",
    name: "Lily Room",
    floor: "1st Floor",
    hostelTypeId: "HT-PREMIUM",
    capacity: 4,
    gender: "female",
    occupants: [],
    availableSpots: 4,
  }

  const boysHostel: Hostel = {
    id: "HOSTEL-BOYS",
    schoolId,
    name: "Boys Hostel",
    gender: "male",
    totalCapacity: 8,
    rooms: [boysRoom1, boysRoom2],
    hostelParents: [
      {
        id: "HP001",
        hostelId: "HOSTEL-BOYS",
        fullName: "Mr. Babatunde Lawal",
        phone: "08012345678",
        email: "blawal@greenfield.edu.ng",
        role: "House Master",
        startDate: new Date("2024-08-15"),
        isActive: true,
      },
    ],
    isEnabled: true,
    createdAt: new Date("2024-08-01"),
  }

  const girlsHostel: Hostel = {
    id: "HOSTEL-GIRLS",
    schoolId,
    name: "Girls Hostel",
    gender: "female",
    totalCapacity: 8,
    rooms: [girlsRoom1, girlsRoom2],
    hostelParents: [
      {
        id: "HP002",
        hostelId: "HOSTEL-GIRLS",
        fullName: "Mrs. Adaeze Onyeka",
        phone: "08087654321",
        email: "aonyeka@greenfield.edu.ng",
        role: "House Mistress",
        startDate: new Date("2024-08-15"),
        isActive: true,
      },
    ],
    isEnabled: true,
    createdAt: new Date("2024-08-01"),
  }

  hostels.set("HOSTEL-BOYS", boysHostel)
  hostels.set("HOSTEL-GIRLS", girlsHostel)

  return hostels
}

const createMockBedSpaces = (): BedSpace[] => [
  // ROOM-B001: 4 beds, 2 occupied
  {
    id: "BSPC-ROOM-B001-A",
    roomId: "ROOM-B001",
    hostelId: "HOSTEL-BOYS",
    label: "Bed A",
    isOccupied: true,
    assignmentId: "ASSIGN001",
    studentId: "STU001",
    studentName: "Chukwu Okafor",
  },
  {
    id: "BSPC-ROOM-B001-B",
    roomId: "ROOM-B001",
    hostelId: "HOSTEL-BOYS",
    label: "Bed B",
    isOccupied: true,
    assignmentId: "ASSIGN002",
    studentId: "STU003",
    studentName: "Tunde Adeyemi",
  },
  {
    id: "BSPC-ROOM-B001-C",
    roomId: "ROOM-B001",
    hostelId: "HOSTEL-BOYS",
    label: "Bed C",
    isOccupied: false,
  },
  {
    id: "BSPC-ROOM-B001-D",
    roomId: "ROOM-B001",
    hostelId: "HOSTEL-BOYS",
    label: "Bed D",
    isOccupied: false,
  },
  // ROOM-B002: 4 beds, 1 occupied
  {
    id: "BSPC-ROOM-B002-A",
    roomId: "ROOM-B002",
    hostelId: "HOSTEL-BOYS",
    label: "Bed A",
    isOccupied: true,
    assignmentId: "ASSIGN003",
    studentId: "STU007",
    studentName: "Obinna Ihenacho",
  },
  {
    id: "BSPC-ROOM-B002-B",
    roomId: "ROOM-B002",
    hostelId: "HOSTEL-BOYS",
    label: "Bed B",
    isOccupied: false,
  },
  {
    id: "BSPC-ROOM-B002-C",
    roomId: "ROOM-B002",
    hostelId: "HOSTEL-BOYS",
    label: "Bed C",
    isOccupied: false,
  },
  {
    id: "BSPC-ROOM-B002-D",
    roomId: "ROOM-B002",
    hostelId: "HOSTEL-BOYS",
    label: "Bed D",
    isOccupied: false,
  },
  // ROOM-G001: 4 beds, 3 occupied
  {
    id: "BSPC-ROOM-G001-A",
    roomId: "ROOM-G001",
    hostelId: "HOSTEL-GIRLS",
    label: "Bed A",
    isOccupied: true,
    assignmentId: "ASSIGN004",
    studentId: "STU002",
    studentName: "Amara Nwosu",
  },
  {
    id: "BSPC-ROOM-G001-B",
    roomId: "ROOM-G001",
    hostelId: "HOSTEL-GIRLS",
    label: "Bed B",
    isOccupied: true,
    assignmentId: "ASSIGN005",
    studentId: "STU004",
    studentName: "Zainab Malik",
  },
  {
    id: "BSPC-ROOM-G001-C",
    roomId: "ROOM-G001",
    hostelId: "HOSTEL-GIRLS",
    label: "Bed C",
    isOccupied: true,
    assignmentId: "ASSIGN006",
    studentId: "STU006",
    studentName: "Folake Oluwaseun",
  },
  {
    id: "BSPC-ROOM-G001-D",
    roomId: "ROOM-G001",
    hostelId: "HOSTEL-GIRLS",
    label: "Bed D",
    isOccupied: false,
  },
  // ROOM-G002: 4 beds, all available
  {
    id: "BSPC-ROOM-G002-A",
    roomId: "ROOM-G002",
    hostelId: "HOSTEL-GIRLS",
    label: "Bed A",
    isOccupied: false,
  },
  {
    id: "BSPC-ROOM-G002-B",
    roomId: "ROOM-G002",
    hostelId: "HOSTEL-GIRLS",
    label: "Bed B",
    isOccupied: false,
  },
  {
    id: "BSPC-ROOM-G002-C",
    roomId: "ROOM-G002",
    hostelId: "HOSTEL-GIRLS",
    label: "Bed C",
    isOccupied: false,
  },
  {
    id: "BSPC-ROOM-G002-D",
    roomId: "ROOM-G002",
    hostelId: "HOSTEL-GIRLS",
    label: "Bed D",
    isOccupied: false,
  },
]

const mockMovementLogs: StudentMovementLog[] = [
  {
    id: "MOV001",
    studentId: "STU003",
    studentName: "Tunde Adeyemi",
    roomId: "ROOM-B001",
    hostelId: "HOSTEL-BOYS",
    signOutDate: new Date(Date.now() - 86400000 * 2),
    expectedReturnDate: new Date(Date.now() + 86400000),
    reason: "weekend_visit",
    destination: "Home - Ikeja",
    approvedBy: "Mr. Babatunde Lawal",
    status: "out",
  },
  {
    id: "MOV002",
    studentId: "STU006",
    studentName: "Folake Oluwaseun",
    roomId: "ROOM-G001",
    hostelId: "HOSTEL-GIRLS",
    signOutDate: new Date(Date.now() - 86400000 * 5),
    expectedReturnDate: new Date(Date.now() - 86400000 * 2),
    reason: "medical",
    destination: "St. Nicholas Hospital",
    approvedBy: "Mrs. Adaeze Onyeka",
    status: "overdue",
  },
]

// ============ STORE CREATION ============

export const mockAllStudents = mockStudents

export const useHostelStore = create<HostelState>()(
  persist(
    (set, get) => ({
      hostels: new Map(),
      hostelTypes: [],
      bedSpaces: [],
      movementLogs: [],

      initializeHostels: (schoolId: string) => {
        const currentTypes = get().hostelTypes
        set({
          hostels: createMockHostels(schoolId),
          bedSpaces: createMockBedSpaces(),
          hostelTypes:
            currentTypes.length === 0 ? mockHostelTypes : currentTypes,
          movementLogs: mockMovementLogs,
        })
      },

      getHostelByGender: (gender: Gender) => {
        const { hostels } = get()
        for (const hostel of hostels.values()) {
          if (hostel.gender === gender) return hostel
        }
        return undefined
      },

      // ============ ASSIGNMENT ============

      assignStudent: (studentId, roomId, student, bedSpaceId, hostelTypeId) => {
        let newAssignment: HostelAssignment | null = null

        set((state) => {
          const newHostels = new Map(state.hostels)

          for (const hostel of newHostels.values()) {
            const room = hostel.rooms.find((r) => r.id === roomId)
            if (!room) continue

            const bedSpaceLabel = bedSpaceId
              ? state.bedSpaces.find((b) => b.id === bedSpaceId)?.label
              : undefined

            newAssignment = {
              id: `ASSIGN-${Date.now()}`,
              studentId,
              roomId,
              hostelId: hostel.id,
              hostelTypeId,
              bedSpaceId,
              bedSpaceLabel,
              assignedDate: new Date(),
              status: "active",
              student,
            }

            room.occupants.push(newAssignment)
            room.availableSpots = room.capacity - room.occupants.length
            newHostels.set(hostel.id, hostel)
            break
          }

          const updatedBedSpaces = bedSpaceId
            ? state.bedSpaces.map((b) =>
                b.id === bedSpaceId
                  ? {
                      ...b,
                      isOccupied: true,
                      assignmentId: newAssignment!.id,
                      studentId,
                      studentName: `${student.firstName} ${student.lastName}`,
                    }
                  : b
              )
            : state.bedSpaces

          return { hostels: newHostels, bedSpaces: updatedBedSpaces }
        })

        return newAssignment!
      },

      bulkAssignStudents: (assignments) => {
        assignments.forEach(({ studentId, roomId, student }) => {
          get().assignStudent(studentId, roomId, student)
        })
      },

      getHostelParents: (hostelId) =>
        get().hostels.get(hostelId)?.hostelParents || [],

      // ============ MOVEMENT LOGS ============

      signOutStudent: (log) => {
        const newLog: StudentMovementLog = {
          id: `MOV-${Date.now()}`,
          ...log,
          signOutDate: new Date(),
          status: "out",
        }
        set((state) => ({ movementLogs: [...state.movementLogs, newLog] }))
      },

      signInStudent: (logId) => {
        set((state) => ({
          movementLogs: state.movementLogs.map((log) =>
            log.id === logId
              ? { ...log, status: "returned", actualReturnDate: new Date() }
              : log
          ),
        }))
      },

      getMovementLogsByHostel: (hostelId) =>
        get().movementLogs.filter((log) => log.hostelId === hostelId),

      getCurrentlyOutStudents: (hostelId) =>
        get().movementLogs.filter(
          (log) => log.hostelId === hostelId && log.status !== "returned"
        ),
    }),
    {
      name: "hostel-store",
      // `hostels` is a Map, which JSON.stringify silently flattens to "{}".
      // Serialize it as an entries array instead, and revive it back into a
      // Map on load. Corrupted/legacy values (from before this fix) come
      // back as `undefined` here, which drops the key from the persisted
      // state so the store's fresh `new Map()` default takes over instead
      // of crashing on `.size`/`.values()`.
      storage: createJSONStorage(() => localStorage, {
        replacer: (key, value) =>
          key === "hostels" && value instanceof Map
            ? Array.from(value.entries())
            : value,
        reviver: (key, value) => {
          if (key !== "hostels") return value
          return Array.isArray(value) ? new Map(value) : undefined
        },
      }),
    }
  )
)
