import { useEffect, useRef, useState } from "react"
import { Vote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  getSchoolStudentsApi,
  getStudentByIdApi,
} from "@/api/studentPortal.api"
import type { StudentDetailI } from "@/api/studentPortal.api/types"
import { useSchoolId } from "@/contexts/SchoolContext"
import { searchElectionCandidatesApi } from "@/api/voting.api"
import type { CandidateStudentSearchResultDto } from "@/api/voting.api/types"
import { StudentElectionBallot } from "@/pages/StudentHome/components/StudentElectionBallot"

export default function SupervisedVoting({
  electionId,
  title,
  active,
}: {
  electionId: string
  title: string
  active: boolean
}) {
  const [open, setOpen] = useState(false)
  const [student, setStudent] = useState<StudentDetailI | null>(null)
  const [studentSchoolId, setStudentSchoolId] = useState("")
  const [studentId, setStudentId] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const operation = useRef(0)
  const locked = useRef(false)
  const schoolId = useSchoolId()
  useEffect(
    () => () => {
      operation.current++
    },
    [schoolId, electionId]
  )

  function reset(success = false) {
    operation.current++
    locked.current = false
    setStudent(null)
    setStudentSchoolId("")
    setStudentId("")
    setBusy(false)
    setError("")
    setMessage(success ? "Vote recorded. Ready for the next student." : "")
  }

  function closeStation() {
    reset()
  }

  async function openBallot() {
    const enteredId = studentId.trim()
    if (!enteredId || locked.current || !schoolId) return
    locked.current = true
    const request = ++operation.current
    setBusy(true)
    setError("")
    setMessage("")
    try {
      // Search is only a lookup. Never open a ballot for a partial/name match.
      const matches = new Set<string>()
      let page = 1
      let totalPages = 1
      do {
        const result = await getSchoolStudentsApi({
          schoolId,
          search: enteredId,
          pageNumber: page,
          pageSize: 100,
        })
        if (request !== operation.current) return
        if (!result.isSuccess || !result.value)
          throw new Error("Could not look up this student. Please try again.")
        for (const item of result.value.items) {
          if (
            [item.studentGivenId, item.studentId].some(
              (id) => id?.trim().toLowerCase() === enteredId.toLowerCase()
            )
          )
            matches.add(item.studentId)
        }
        totalPages = result.value.totalPages
        page++
      } while (page <= totalPages)
      if (matches.size !== 1)
        throw new Error(
          matches.size
            ? "This ID matches more than one student. Ask the school to correct the registration records."
            : "Student ID not found. Check the ID and try again."
        )
      const registeredId = [...matches][0]
      const result = await getStudentByIdApi({
        schoolId,
        studentId: registeredId,
      })
      if (request !== operation.current) return
      const profile = result.value
      if (
        !result.isSuccess ||
        !profile ||
        profile.schoolId !== schoolId ||
        profile.studentId !== registeredId
      )
        throw new Error("Could not verify this student's registration.")
      if (!active) throw new Error("This election is no longer open.")
      // The admin student record has no studentSchoolId; resolve it via candidate search
      let candidate: CandidateStudentSearchResultDto | undefined
      for (const term of [enteredId, `${profile.firstname} ${profile.lastname}`]) {
        const lookup = await searchElectionCandidatesApi(schoolId, term)
        if (request !== operation.current) return
        const matches =
          lookup.data ??
          (lookup as { value?: CandidateStudentSearchResultDto[] }).value ??
          []
        candidate = matches.find(
          (item) =>
            item.studentId === registeredId ||
            item.admissionNumber?.trim().toLowerCase() ===
              enteredId.toLowerCase()
        )
        if (candidate) break
      }
      if (!candidate?.studentSchoolId)
        throw new Error(
          "This student could not be found for voting. Check that they are enrolled in an eligible class."
        )
      setStudentSchoolId(candidate.studentSchoolId)
      setStudent(profile)
      setStudentId("")
    } catch (cause) {
      if (request === operation.current)
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to open the ballot. Please try again."
        )
    } finally {
      if (request === operation.current) {
        locked.current = false
        setBusy(false)
      }
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={!active}
        onClick={() => {
          closeStation()
          setOpen(true)
        }}
      >
        <Vote className="size-4" />
        Student voting
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
          if (!value) closeStation()
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Voting station - {title}</DialogTitle>
            <DialogDescription>
              Students enter their ID to open their ballot. After submission,
              the station is ready for the next student.
            </DialogDescription>
          </DialogHeader>
          {student ? (
            <StudentElectionBallot
              key={student.studentId}
              electionId={electionId}
              studentSchoolId={studentSchoolId}
              schoolId={schoolId}
              onBack={() => reset()}
              onSubmitted={() => reset(true)}
            />
          ) : (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                void openBallot()
              }}
            >
              {message && (
                <p role="status" className="text-sm text-emerald-700">
                  {message}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="voting-station-id">
                  Student ID{" "}
                  <span aria-hidden="true" className="text-red-600">
                    *
                  </span>
                </Label>
                <Input
                  id="voting-station-id"
                  autoFocus
                  autoComplete="off"
                  required
                  value={studentId}
                  disabled={busy}
                  onChange={(event) => {
                    setStudentId(event.target.value)
                    setError("")
                    setMessage("")
                  }}
                  placeholder="Enter Student ID and press Enter"
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                disabled={
                  busy || !studentId.trim() || !active
                }
              >
                {busy ? "Opening ballot..." : "Continue"}
              </Button>
              {!active && (
                <p role="alert" className="text-sm text-red-600">
                  This election is no longer open.
                </p>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
