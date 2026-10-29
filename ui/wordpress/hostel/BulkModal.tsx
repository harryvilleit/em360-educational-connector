import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { request } from "../rebuilt/service"
import { inputClass } from "../rebuilt/shared"
import { parseAssignments } from "./csv"
export { parseAssignments } from "./csv"
export default function BulkModal({
  hostelId,
  open,
  onOpenChange,
}: {
  hostelId: string
  gender?: string
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [text, setText] = useState("studentId,bedSpaceId\n"),
    [rows, setRows] = useState<ReturnType<typeof parseAssignments>>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [results, setResults] = useState<string[]>([]),
    cache = useQueryClient()
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) onOpenChange(v)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk bed assignments</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500">
          Use existing student and bed IDs. Each assignment is checked against
          the school and selected hostel.
        </p>
        <textarea
          aria-label="Assignment CSV"
          className={inputClass + " min-h-40 font-mono"}
          value={text}
          disabled={busy}
          onChange={(e) => {
            setText(e.target.value)
            setRows([])
            setResults([])
          }}
        />
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => {
            try {
              setRows(parseAssignments(text))
              setError("")
            } catch (e) {
              setError((e as Error).message)
            }
          }}
        >
          Validate CSV
        </Button>
        {rows.length > 0 && <p>{rows.length} assignments ready to process.</p>}
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        <Button
          disabled={!rows.length || busy || results.length > 0}
          onClick={async () => {
            setBusy(true)
            setResults([])
            for (const row of rows) {
              try {
                const bed = await request("/BedSpace/GetById/" + row.bedSpaceId)
                const room = await request("/HostelRoom/GetById/" + bed.roomId)
                if (room.hostelId !== hostelId)
                  throw Error("The bed is not in the selected hostel.")
                await request("/WordPressHostel/AssignBed", "POST", row)
                setResults((v) => [...v, row.studentId + ": assigned"])
              } catch (e) {
                setResults((v) => [
                  ...v,
                  row.studentId + ": " + (e as Error).message,
                ])
              }
            }
            await cache.invalidateQueries()
            setBusy(false)
          }}
        >
          {busy ? "Processing…" : "Confirm assignments"}
        </Button>
        {results.length > 0 && (
          <div role="status" className="space-y-2 text-sm">
            <p className="font-medium">
              {results.length} of {rows.length} processed. Successful rows are
              saved; failed rows can be corrected and submitted separately.
            </p>
            {results.map((r, i) => (
              <p key={i}>{r}</p>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
