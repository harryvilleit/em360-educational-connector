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
export function SupervisorModal({
  open,
  onClose,
  defaultHostelId,
}: {
  open: boolean
  onClose: () => void
  defaultHostelId?: string
}) {
  const schoolId = useSchoolId(),
    [hostelId, setHostel] = useState(defaultHostelId || ""),
    [supervisorId, setPerson] = useState(""),
    [role, setRole] = useState(1),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1),
    [error, setError] = useState("")
  const people = useRead(
      "/WordPressHostel/Supervisors",
      { search: useDebouncedValue(search, 250), page },
      open
    ),
    hostels = useRead("/Hostel/GetAll", { schoolId, pageSize: 100 }, open),
    save = useSave()
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !save.isPending) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign hostel supervisor</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            try {
              await save.mutateAsync({
                path: "/Hostel/AssignSupervisor",
                body: { hostelId, supervisorId, role },
              })
              onClose()
            } catch (e) {
              setError((e as Error).message)
            }
          }}
        >
          <Field label="Search school staff">
            <input
              className={inputClass}
              value={search}
              maxLength={120}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </Field>
          <Field label="Supervisor">
            <select
              className={inputClass}
              required
              value={supervisorId}
              onChange={(e) => setPerson(e.target.value)}
            >
              <option value="">Choose a person</option>
              {people.data?.items?.map((p: Row) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.email}
                </option>
              ))}
            </select>
          </Field>
          {people.data?.totalPages > 1 && (
            <Pager
              page={page}
              total={people.data.totalPages}
              setPage={setPage}
            />
          )}
          <Field label="Hostel">
            <select
              className={inputClass}
              required
              value={hostelId}
              onChange={(e) => setHostel(e.target.value)}
            >
              <option value="">Choose a hostel</option>
              {hostels.data?.items?.map((h: Row) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Supervisor role">
            <select
              className={inputClass}
              value={role}
              onChange={(e) => setRole(Number(e.target.value))}
            >
              <option value={1}>House master</option>
              <option value={2}>House mistress</option>
              <option value={3}>Assistant</option>
            </select>
          </Field>
          {(error || people.error || hostels.error) && (
            <p role="alert" className="text-red-700">
              {error || people.error?.message || hostels.error?.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={save.isPending || !supervisorId || !hostelId}
          >
            {save.isPending ? "Saving…" : "Assign supervisor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
