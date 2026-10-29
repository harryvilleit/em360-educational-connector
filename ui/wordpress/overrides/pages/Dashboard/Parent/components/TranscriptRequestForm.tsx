import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetSchoolParents,
  useGetGuardianChildren,
  useGetGuardianDetails,
} from "@/hooks/guardian"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  submitTranscript,
  type TranscriptSubmission,
} from "@/api/parentManagement.api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
export function TranscriptRequestForm({
  guardianId: fixedGuardian,
  onClose,
}: {
  guardianId?: string
  onClose: () => void
}) {
  const schoolId = useSchoolId(),
    client = useQueryClient()
  const [search, setSearch] = useState(""),
    [guardianId, setGuardian] = useState(fixedGuardian || ""),
    [recipient, setRecipient] = useState(1)
  const keyword = useDebouncedValue(search, 300)
  const parents = useGetSchoolParents({
      schoolId: fixedGuardian ? "" : schoolId,
      pageNumber: 1,
      pageSize: 20,
      search: keyword || undefined,
    }),
    children = useGetGuardianChildren({ schoolId, guardianId }),
    detail = useGetGuardianDetails({ guardianId: fixedGuardian || "" })
  const mutation = useMutation({
    mutationFn: submitTranscript,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["parent-transcripts"] })
      toast.success("Transcript request saved.")
      onClose()
    },
  })
  return (
    <Dialog open onOpenChange={(v) => !v && !mutation.isPending && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Transcript Request</DialogTitle>
          <DialogDescription>
            Record a request for a linked child in this school.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (mutation.isPending) return
            const f = new FormData(e.currentTarget)
            const data = Object.fromEntries(f.entries())
            mutation.mutate({
              ...data,
              schoolId,
              guardianId,
              recipientType: recipient,
            } as unknown as TranscriptSubmission)
          }}
        >
          {!fixedGuardian ? (
            <>
              <Input
                aria-label="Search parents"
                placeholder="Search parents by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <label className="block text-sm">
                Parent
                <select
                  aria-label="Parent"
                  required
                  className="mt-1 w-full rounded-lg border p-2"
                  value={guardianId}
                  onChange={(e) => setGuardian(e.target.value)}
                >
                  <option value="">Select parent</option>
                  {parents.parents.map((p) => (
                    <option key={p.guardianId} value={p.guardianId}>
                      {p.fullName} — {p.email}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-xs text-slate-500">
                Showing up to 20 matches; refine the search if needed.
              </p>
              {parents.isError && (
                <p role="alert">
                  Unable to load parents.{" "}
                  <button type="button" onClick={() => void parents.refetch()}>
                    Try again
                  </button>
                </p>
              )}
            </>
          ) : (
            <p>{detail.guardian?.fullName || "Selected parent"}</p>
          )}
          <label className="block text-sm">
            Child
            <select
              key={guardianId}
              name="studentId"
              aria-label="Child"
              required
              className="mt-1 w-full rounded-lg border p-2"
              defaultValue=""
            >
              <option value="">Select child</option>
              {children.children.map((c) => (
                <option key={c.studentId} value={c.studentId}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </label>
          {guardianId && !children.isLoading && !children.children.length && (
            <p className="text-sm">
              Link a child to this parent before creating a request.
            </p>
          )}
          {children.isError && (
            <p role="alert">
              Unable to load linked children.{" "}
              <button type="button" onClick={() => void children.refetch()}>
                Try again
              </button>
            </p>
          )}
          <label className="block text-sm">
            Recipient
            <select
              aria-label="Recipient"
              className="mt-1 w-full rounded-lg border p-2"
              value={recipient}
              onChange={(e) => setRecipient(Number(e.target.value))}
            >
              <option value={1}>Parent / Self</option>
              <option value={2}>Official institution</option>
            </select>
          </label>
          {recipient === 2 && (
            <>
              <label className="block text-sm">
                Institution name
                <Input name="institutionName" required maxLength={200} />
              </label>
              <label className="block text-sm">
                Institution address
                <Input name="institutionAddress" required maxLength={500} />
              </label>
            </>
          )}
          <label className="block text-sm">
            Contact person
            <Input name="contactPerson" maxLength={200} />
          </label>
          <label className="block text-sm">
            Contact email
            <Input name="contactEmail" type="email" maxLength={254} />
          </label>
          <label className="block text-sm">
            Purpose
            <textarea
              name="purpose"
              required
              maxLength={500}
              className="mt-1 w-full rounded-lg border p-2"
            />
          </label>
          <label className="block text-sm">
            Additional notes
            <textarea
              name="additionalNotes"
              maxLength={2000}
              className="mt-1 w-full rounded-lg border p-2"
            />
          </label>
          {mutation.isError && (
            <p role="alert" className="text-sm text-red-700">
              {mutation.error.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={
              mutation.isPending || !guardianId || !children.children.length
            }
          >
            {mutation.isPending ? "Saving…" : "Submit request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
