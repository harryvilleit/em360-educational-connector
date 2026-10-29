import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  BedDouble,
  CheckCircle2,
  Search,
  User,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useHostelStore, mockAllStudents } from "@/store/hostel.store"
import type { Gender, StudentBasic } from "@/types/hostel"
import { useStudentStore } from "@/store/student.store"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  hostelId: string
  gender: Gender
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedRoomId?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-28 shrink-0 text-gray-400">{label}</span>
      <span className="font-medium text-gray-800">{value || "—"}</span>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AssignmentModal({
  hostelId,
  gender,
  open,
  onOpenChange,
  preselectedRoomId,
}: Props) {
  const hostels = useHostelStore((s) => s.hostels)
  const hostelTypes = useHostelStore((s) => s.hostelTypes)
  const bedSpaces = useHostelStore((s) => s.bedSpaces)
  const assignStudent = useHostelStore((s) => s.assignStudent)

  const students = useStudentStore((s) => s.students)

  // ── Step state ──────────────────────────────────────────────────────────────
  const [hostelTypeId, setHostelTypeId] = useState<string>("")
  const [roomId, setRoomId] = useState<string>(preselectedRoomId ?? "")
  const [bedSpaceId, setBedSpaceId] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [search, setSearch] = useState("")
  const [selectedStudent, setSelectedStudent] =
    useState<StudentBasic | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  
  useEffect(() => {
    if (open) {
      setRoomId(preselectedRoomId ?? "")
      setHostelTypeId("")
      setBedSpaceId("")
      setSelectedClass("")
      setSearch("")
      setSelectedStudent(null)
      setErrors({})
    }
  }, [open, preselectedRoomId])


  const hostel = useMemo(
    () => Array.from(hostels.values()).find((h) => h.id === hostelId),
    [hostels, hostelId]
  )
  const availableRooms = useMemo(() => {
    if (!hostel) return []
    return hostel.rooms.filter((r) => {
      if (r.availableSpots <= 0) return false
      if (hostelTypeId && r.hostelTypeId !== hostelTypeId) return false
      return true
    })
  }, [hostel, hostelTypeId])

  const selectedRoom = useMemo(
    () => availableRooms.find((r) => r.id === roomId) ?? null,
    [availableRooms, roomId]
  )
  const availableBeds = useMemo(
    () =>
      roomId
        ? bedSpaces.filter((b) => b.roomId === roomId && !b.isOccupied)
        : [],
    [bedSpaces, roomId]
  )

  // Already-assigned student IDs (active assignments in this hostel)
  const assignedStudentIds = useMemo(() => {
    const ids = new Set<string>()
    if (!hostel) return ids
    for (const room of hostel.rooms) {
      for (const occ of room.occupants) {
        ids.add(occ.studentId)
      }
    }
    return ids
  }, [hostel])

  // Classes: from real student store, filtered by gender match
  const allClasses = useMemo(() => {
    const genderMatch = gender === "male" ? "Male" : "Female"
    const classes = new Set<string>()
    students
      .filter((s) => s.gender === genderMatch)
      .forEach((s) => s.class && classes.add(s.class))
    mockAllStudents
      .filter((s) => s.gender === gender)
      .forEach((s) => classes.add(s.className))
    return Array.from(classes).sort()
  }, [students, gender])

  const searchableStudents = useMemo((): StudentBasic[] => {
    if (!selectedClass) return []

    const genderMatch = gender === "male" ? "Male" : "Female"

    // Real students
    const fromStore: StudentBasic[] = students
      .filter(
        (s) =>
          s.class === selectedClass &&
          s.gender === genderMatch &&
          !assignedStudentIds.has(s.id)
      )
      .map((s) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        className: s.class,
        admissionNumber: s.studentId ?? s.id,
        gender: gender,
      }))

    // Mock students as fallback/supplement
    const fromMock: StudentBasic[] = mockAllStudents.filter(
      (s) =>
        s.className === selectedClass &&
        s.gender === gender &&
        !assignedStudentIds.has(s.id) &&
        !fromStore.some((r) => r.id === s.id)
    )

    return [...fromStore, ...fromMock]
  }, [selectedClass, gender, assignedStudentIds, students])

  // Apply search filter
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return searchableStudents
    const q = search.toLowerCase()
    return searchableStudents.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q)
    )
  }, [searchableStudents, search])

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!roomId) errs.roomId = "Please select a room"
    if (!bedSpaceId) errs.bedSpaceId = "Please select a bed space"
    if (!selectedStudent) errs.student = "Please select a student"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  const onSubmit = async () => {
    if (!validate() || !selectedStudent) return

    try {
      setIsSubmitting(true)
      assignStudent(
        selectedStudent.id,
        roomId,
        selectedStudent,
        bedSpaceId || undefined,
        hostelTypeId || undefined
      )
      onOpenChange(false)
    } catch {
      /* no-op */
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Room change cascade ──────────────────────────────────────────────────────

  const handleRoomChange = (id: string) => {
    setRoomId(id)
    setBedSpaceId("")
    setErrors((e) => ({ ...e, roomId: "" }))
  }

  const handleClassChange = (cls: string) => {
    setSelectedClass(cls)
    setSelectedStudent(null)
    setSearch("")
  }

  const handleSelectStudent = (s: StudentBasic) => {
    setSelectedStudent(s)
    setSearch(`${s.firstName} ${s.lastName}`)
    setErrors((e) => ({ ...e, student: "" }))
  }

  const clearStudent = () => {
    setSelectedStudent(null)
    setSearch("")
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Student to Hostel</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
        
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Hostel Type
              <span className="text-red-500">*</span>
            </Label>
            <Select
              value={hostelTypeId}
              onValueChange={(v) => {
                setHostelTypeId(v === "none" ? "" : v)
                setRoomId("")
                setBedSpaceId("")
              }}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Any type</SelectItem>
                {hostelTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2 — Room */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Room <span className="text-red-500">*</span>
            </Label>
            <Select value={roomId} onValueChange={handleRoomChange}>
              <SelectTrigger
                className={`mt-1.5 w-full ${errors.roomId ? "border-red-400" : ""}`}
              >
                <SelectValue placeholder="Select a room" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No rooms available
                  </div>
                ) : (
                  availableRooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      <span className="font-medium">{r.roomNumber}</span>
                      {r.name && (
                        <span className="ml-1.5 text-gray-400">{r.name}</span>
                      )}
                      <span className="ml-2 text-xs text-green-600">
                        {r.availableSpots} bed
                        {r.availableSpots !== 1 ? "s" : ""} free
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FieldError message={errors.roomId} />
          </div>

          {/* Step 3 — Bed Space */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Bed Space <span className="text-red-500">*</span>
            </Label>
            {!roomId ? (
              <p className="mt-1.5 text-xs text-gray-400">
                Select a room first
              </p>
            ) : availableBeds.length === 0 ? (
              <p className="mt-1.5 text-xs text-red-500">
                No available beds in this room
              </p>
            ) : (
              <div className="mt-1.5 flex w-full flex-wrap gap-2">
                {availableBeds.map((bed) => (
                  <button
                    key={bed.id}
                    type="button"
                    onClick={() => {
                      setBedSpaceId(bed.id)
                      setErrors((e) => ({ ...e, bedSpaceId: "" }))
                    }}
                    className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-all ${
                      bedSpaceId === bed.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                    }`}
                  >
                    <BedDouble className="h-3.5 w-3.5" />
                    {bed.label}
                  </button>
                ))}
              </div>
            )}
            <FieldError message={errors.bedSpaceId} />
          </div>

          {/* Step 4 — Class */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Class <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {allClasses.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No classes found
                  </div>
                ) : (
                  allClasses.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Step 5 — Student search */}
          {selectedClass && (
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Student <span className="text-red-500">*</span>
              </Label>

              {/* Search input */}
              {!selectedStudent ? (
                <div className="relative mt-1.5">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name or admission #…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
              ) : (
                // Selected student chip
                <div className="mt-1.5 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-700">
                      {selectedStudent.firstName[0]}
                      {selectedStudent.lastName[0]}
                    </div>
                    <span className="text-sm font-medium text-blue-800">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </span>
                  </div>
                  <button
                    onClick={clearStudent}
                    className="rounded p-0.5 text-blue-400 hover:text-red-500"
                    aria-label="Remove student"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Dropdown results */}
              {!selectedStudent && search.trim() && (
                <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
                  {filteredStudents.length === 0 ? (
                    <div className="px-3 py-3 text-center text-sm text-gray-400">
                      No students found
                    </div>
                  ) : (
                    filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectStudent(s)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-blue-50"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                          {s.firstName[0]}
                          {s.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {s.firstName} {s.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {s.admissionNumber} · {s.className}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Not yet searched prompt */}
              {!selectedStudent && !search.trim() && (
                <p className="mt-1.5 text-xs text-gray-400">
                  Type a name or admission number to search
                </p>
              )}

              <FieldError message={errors.student} />
            </div>
          )}

          {/* Step 6 — Student info preview */}
          {selectedStudent && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">
                  Student Details
                </p>
              </div>
              <div className="space-y-1.5">
                <InfoRow
                  label="Full Name"
                  value={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                />
                <InfoRow
                  label="Admission #"
                  value={selectedStudent.admissionNumber}
                />
                <InfoRow label="Class" value={selectedStudent.className} />
                <InfoRow
                  label="Gender"
                  value={selectedStudent.gender === "male" ? "Male" : "Female"}
                />
                <InfoRow label="Parent" value={selectedStudent.parentName} />
                <InfoRow
                  label="Parent Phone"
                  value={selectedStudent.parentPhone}
                />
              </div>
            </div>
          )}

          {/* Assignment summary */}
          {selectedRoom && bedSpaceId && selectedStudent && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              <p className="text-sm text-green-700">
                Assigning{" "}
                <strong>
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </strong>{" "}
                to{" "}
                <strong>
                  Room {selectedRoom.roomNumber} —{" "}
                  {availableBeds.find((b) => b.id === bedSpaceId)?.label}
                </strong>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              isSubmitting || !selectedStudent || !roomId || !bedSpaceId
            }
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? "Assigning…" : "Assign Student"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
