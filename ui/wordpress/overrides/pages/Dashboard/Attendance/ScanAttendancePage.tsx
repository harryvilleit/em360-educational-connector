// WordPress version: ID cards are verified against the school's records on the server
// (/WordPressAttendance/Lookup) and arrivals are saved to the attendance register
// (/WordPressAttendance/Scan). The main site matches cards against lists loaded in the browser.
import { useEffect, useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Camera, CheckCircle2, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/general/PageHeader"
import { usePermissions } from "@/hooks/usePermissions"
import { parseIdCardQrText } from "@/lib/idCards"
import { attendanceRequest } from "../../../../attendance/service"
import { useCameraScanner } from "../../../../attendance/useCameraScanner"

interface Person {
  kind: string
  name: string
  description: string
  displayId: string
  schoolDate: string
}
interface Arrivals {
  items: { id: string; kind: string; name: string }[]
  total: number
}

export default function ScanAttendancePage() {
  const canMark = usePermissions().canUpdate("/dashboard/attendance/scan")
  const client = useQueryClient()
  const [qrText, setQrText] = useState("")
  const [person, setPerson] = useState<Person | null>(null)
  const [card, setCard] = useState<ReturnType<typeof parseIdCardQrText>>(null)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState("")
  const [busy, setBusy] = useState(false)
  const [page, setPage] = useState(1)
  // Ignore results of a verification that a newer scan has replaced.
  const request = useRef(0)
  const inFlight = useRef(false)
  const arrivals = useQuery({
    queryKey: ["wordpress-attendance-arrivals", page],
    queryFn: () => attendanceRequest<Arrivals>("Recent?page=" + page),
  })
  const scanner = useCameraScanner((text) => {
    if (!inFlight.current) void verify(text)
  })
  useEffect(
    () => () => {
      request.current++
    },
    [],
  )

  async function verify(text: string) {
    if (inFlight.current) return
    const current = ++request.current
    setPerson(null)
    setCard(null)
    setError("")
    setSaved("")
    const parsed = parseIdCardQrText(text)
    if (!parsed) {
      setError("This is not a recognized EM360 ID card.")
      return
    }
    inFlight.current = true
    setBusy(true)
    scanner.stop()
    try {
      const found = await attendanceRequest<Person>("Lookup", parsed)
      if (request.current === current) {
        setPerson(found)
        setCard(parsed)
      }
    } catch (e) {
      if (request.current === current) setError(e instanceof Error ? e.message : "Unable to verify this ID. Try again.")
    } finally {
      if (request.current === current) {
        setBusy(false)
        inFlight.current = false
      }
    }
  }

  async function markPresent() {
    if (!card || !canMark || inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setError("")
    try {
      const result = await attendanceRequest<{ person: Person; alreadyRecorded: boolean }>("Scan", card)
      setPerson(result.person)
      setSaved(
        result.alreadyRecorded
          ? "Attendance was already recorded. The existing record was preserved."
          : "Arrival saved to the school attendance register.",
      )
      await client.invalidateQueries({ predicate: (q) => /attendance/i.test(String(q.queryKey[0])) })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save. Try again; duplicate arrivals are checked on the server.")
    } finally {
      setBusy(false)
      inFlight.current = false
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scan ID Card"
        description="Verify a student or staff ID, confirm their identity, and record today's arrival."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-4 rounded-2xl border bg-white p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <Camera className="size-5 text-blue-600" /> ID-card scanner
          </h2>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-950">
            <video ref={scanner.videoRef} playsInline muted className="h-full w-full object-cover" />
            {scanner.status !== "scanning" && (
              <span className="absolute inset-0 grid place-items-center text-sm text-white">
                Start the camera to scan an EM360 ID card
              </span>
            )}
          </div>
          <canvas ref={scanner.canvasRef} hidden />
          <div className="flex gap-2">
            <Button
              disabled={busy || scanner.status === "starting"}
              onClick={() => (scanner.status === "scanning" ? scanner.stop() : void scanner.start())}
            >
              {scanner.status === "scanning" ? "Stop camera" : "Start camera"}
            </Button>
          </div>
          {scanner.error && (
            <p role="alert" className="text-sm text-red-700">
              {scanner.error} You can also paste the card's QR text below.
            </p>
          )}
          <label htmlFor="card-qr" className="block text-sm font-medium">
            QR text / external scanner input
          </label>
          <Textarea
            id="card-qr"
            value={qrText}
            onChange={(e) => setQrText(e.target.value)}
            maxLength={4000}
            rows={4}
            placeholder={"Student ID Card\nStudent ID: STU-001"}
          />
          <Button variant="outline" disabled={busy || !qrText.trim()} onClick={() => void verify(qrText)}>
            <ScanLine className="size-4" />
            Verify ID
          </Button>
        </section>
        <section className="space-y-4 rounded-2xl border bg-white p-5" aria-live="polite">
          <h2 className="font-semibold">Confirm identity</h2>
          {busy && <p>Checking school records…</p>}
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}
          {person ? (
            <>
              <div className="rounded-xl bg-blue-50 p-5">
                <p className="text-xs tracking-wide text-blue-700 uppercase">{person.kind}</p>
                <h3 className="mt-2 text-2xl font-semibold">{person.name}</h3>
                <p className="mt-1 text-sm">{person.description}</p>
                <p className="mt-2 text-xs break-all text-slate-600">
                  ID: {person.displayId} · School date: {person.schoolDate}
                </p>
              </div>
              <p className="text-sm text-slate-600">
                Confirm the person is present before saving. Staff scans record arrival only; staff still sign out
                through their attendance page.
              </p>
              <Button disabled={!canMark || busy || !!saved} onClick={() => void markPresent()}>
                Mark present
              </Button>
              {!canMark && <p className="text-sm text-slate-500">Your role can verify IDs but cannot mark attendance.</p>}
              {saved && (
                <p role="status" className="flex gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-800">
                  <CheckCircle2 className="size-5 shrink-0" />
                  {saved}
                </p>
              )}
            </>
          ) : (
            !busy && (
              <p className="py-12 text-center text-sm text-slate-500">
                Scan or paste an ID card to verify it against this school's records.
              </p>
            )
          )}
        </section>
      </div>
      <section className="rounded-2xl border bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Today's recorded arrivals</h2>
            <p className="text-sm text-slate-500">
              School-wide student and staff records, including classroom and self-service entries.
            </p>
          </div>
          <Button variant="outline" onClick={() => void arrivals.refetch()}>
            Refresh
          </Button>
        </div>
        {arrivals.isError ? (
          <p role="alert">Arrivals could not be loaded. Use Refresh to retry.</p>
        ) : arrivals.isLoading ? (
          <p>Loading arrivals…</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-slate-500">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {arrivals.data?.items.map((a) => (
                    <tr key={a.kind + a.id} className="border-b last:border-0">
                      <td className="p-3">{a.name}</td>
                      <td className="p-3 capitalize">{a.kind}</td>
                      <td className="p-3 text-green-700">Arrival recorded</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!arrivals.data?.items.length && (
              <p className="py-6 text-center text-sm text-slate-500">No arrivals have been recorded today.</p>
            )}
            <div className="mt-4 flex items-center justify-end gap-3">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm">Page {page}</span>
              <Button
                variant="outline"
                disabled={page * 25 >= (arrivals.data?.total ?? 0)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
