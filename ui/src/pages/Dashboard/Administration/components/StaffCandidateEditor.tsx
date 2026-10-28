import { useId, useState } from "react"
import { Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useSearchElectionCandidates } from "@/hooks/voting"
import type { CandidateStudentSearchResultDto } from "@/api/voting.api/types"
import type { CandidateDraft } from "@/lib/electionDraft"
import { AvatarInitials } from "../../Student/components/VotingComponent"

export default function StaffCandidateEditor({
  cand,
  index,
  canRemove,
  excludeStaffIds,
  onRemove,
  onChange,
  errors,
}: {
  cand: CandidateDraft
  index: number
  canRemove: boolean
  excludeStaffIds: string[]
  onRemove: () => void
  onChange: (patch: Partial<CandidateDraft>) => void
  errors: Record<string, string>
}) {
  const id = useId()
  const schoolId = useSchoolId()
  const [search, setSearch] = useState("")
  const term = search.trim()
  const keyword = useDebouncedValue(term, 300)
  const { results, isLoading, isError, refetch } = useSearchElectionCandidates(
    schoolId,
    keyword,
    8,
    "Staff"
  )
  const options = results.filter(
    (item) => item.staffId && !excludeStaffIds.includes(item.staffId)
  )
  const pending = isLoading || keyword !== term

  function select(person: CandidateStudentSearchResultDto) {
    onChange({
      staffId: person.staffId ?? undefined,
      firstName: person.fullName,
      lastName: "",
      roleName: person.roleName ?? undefined,
      class: "",
    })
    setSearch("")
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">
          Candidate {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            aria-label={"Remove candidate " + (index + 1)}
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
      <div className="space-y-2 rounded-lg border bg-white p-3">
        <Label htmlFor={id + "-search"}>
          Find staff member{" "}
          <span className="text-red-600" aria-hidden="true">
            *
          </span>
        </Label>
        <Input
          id={id + "-search"}
          autoComplete="off"
          value={search}
          placeholder="Search by name, role or email"
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              if (options[0]) select(options[0])
            } else if (event.key === "Escape") setSearch("")
          }}
        />
        {term.length >= 2 &&
          (pending ? (
            <p role="status" className="text-sm text-muted-foreground">
              Loading staff...
            </p>
          ) : isError ? (
            <p role="alert" className="text-sm text-red-600">
              Could not load staff.{" "}
              <button
                type="button"
                className="underline"
                onClick={() => void refetch()}
              >
                Retry
              </button>
            </p>
          ) : options.length === 0 ? (
            <p role="status" className="text-sm text-muted-foreground">
              No matching staff.
            </p>
          ) : (
            <ul className="max-h-48 divide-y overflow-y-auto rounded-lg border">
              {options.map((person) => (
                <li key={person.staffId}>
                  <button
                    type="button"
                    className="w-full p-2 text-left text-sm hover:bg-chart-2/10"
                    onClick={() => select(person)}
                  >
                    <span className="block font-medium">{person.fullName}</span>
                    <span className="block text-xs text-muted-foreground">
                      {person.roleName || person.email || "Staff"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ))}
      </div>
      {errors["cand-" + cand.key + "-student"] && (
        <p role="alert" className="text-xs text-red-600">
          {errors["cand-" + cand.key + "-student"]}
        </p>
      )}
      {cand.staffId && (
        <div
          className="flex items-center gap-3 rounded-lg border bg-white p-3"
          aria-label="Selected staff details"
          aria-live="polite"
        >
          <AvatarInitials
            name={cand.firstName + " " + cand.lastName}
            size="lg"
          />
          <div>
            <p className="text-sm font-medium">
              {cand.firstName} {cand.lastName}
            </p>
            {cand.roleName && (
              <p className="text-xs text-muted-foreground">{cand.roleName}</p>
            )}
          </div>
        </div>
      )}
      <div className="space-y-1">
        <Label
          htmlFor={"candidate-" + cand.key + "-manifesto"}
          className="text-xs font-medium text-gray-600"
        >
          Manifesto <span className="text-gray-400">(optional)</span>
        </Label>
        <Textarea
          id={"candidate-" + cand.key + "-manifesto"}
          value={cand.manifesto}
          onChange={(event) => onChange({ manifesto: event.target.value })}
          placeholder="Brief statement or goals..."
          rows={2}
          className="resize-none rounded-md border-gray-200 text-sm"
        />
      </div>
    </div>
  )
}
