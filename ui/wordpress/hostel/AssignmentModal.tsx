import { useState } from "react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRead, useSave, type Row } from "../rebuilt/service"
import { Field, Pager, inputClass } from "../rebuilt/shared"
interface Props {
  hostelId: string
  gender?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedRoomId?: string
}
export default function AssignmentModal(props: Props) {
  return props.open ? (
    <Assignment
      key={props.hostelId + ":" + (props.preselectedRoomId || "")}
      {...props}
    />
  ) : null
}
function Assignment({
  hostelId,
  open,
  onOpenChange,
  preselectedRoomId,
}: Props) {
  const schoolId = useSchoolId(),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [studentId, setStudent] = useState(""),
    [roomId, setRoom] = useState(preselectedRoomId || ""),
    [bedSpaceId, setBed] = useState(""),
    [error, setError] = useState("")
  const students = useRead(
    "/WordPressHostel/Students",
    { search: useDebouncedValue(search, 250), page, unassigned: true },
    open
  )
  const rooms = useRead(
    "/HostelRoom/GetByHostel/" + hostelId,
    { schoolId },
    open && !!hostelId
  )
  const beds = useRead("/BedSpace/GetByRoom/" + roomId, {}, open && !!roomId),
    save = useSave()
  const roomRows = Array.isArray(rooms.data)
    ? rooms.data
    : rooms.data?.items || []
  const bedRows = (
    Array.isArray(beds.data) ? beds.data : beds.data?.items || []
  ).filter((b: Row) => !b.studentId)
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!save.isPending) onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign student to a bed</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setError("")
            try {
              await save.mutateAsync({
                path: "/WordPressHostel/AssignBed",
                body: { studentId, bedSpaceId },
              })
              onOpenChange(false)
            } catch (e) {
              setError((e as Error).message)
            }
          }}
        >
          <Field label="Search unassigned students">
            <input
              className={inputClass}
              maxLength={120}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
                setStudent("")
              }}
            />
          </Field>
          <Field label="Student">
            <select
              className={inputClass}
              value={studentId}
              required
              onChange={(e) => setStudent(e.target.value)}
            >
              <option value="">Choose a student</option>
              {students.data?.items?.map((s: Row) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.admissionNumber} — {s.className}
                </option>
              ))}
            </select>
          </Field>
          {students.data?.totalPages > 1 && (
            <Pager
              page={page}
              total={students.data.totalPages}
              setPage={setPage}
            />
          )}
          <Field label="Room">
            <select
              className={inputClass}
              required
              value={roomId}
              onChange={(e) => {
                setRoom(e.target.value)
                setBed("")
              }}
            >
              <option value="">Choose a room</option>
              {roomRows.map((r: Row) => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber} — {r.roomName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Available bed">
            <select
              className={inputClass}
              required
              value={bedSpaceId}
              onChange={(e) => setBed(e.target.value)}
            >
              <option value="">Choose a bed</option>
              {bedRows.map((b: Row) => (
                <option key={b.id} value={b.id}>
                  {b.bedLabel}
                </option>
              ))}
            </select>
          </Field>
          {(error || students.error || rooms.error || beds.error) && (
            <p role="alert" className="text-red-700">
              {error ||
                students.error?.message ||
                rooms.error?.message ||
                beds.error?.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={save.isPending || !studentId || !bedSpaceId}
          >
            {save.isPending ? "Assigning…" : "Assign bed"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
