import { Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import CandidateProfile from "./CandidateProfile"
import { AvatarInitials } from "../../Student/components/VotingComponent"
import type { CandidateDraft } from "@/lib/electionDraft"

export default function ElectionCandidateEditor({
  cand,
  index,
  canRemove,
  onRemove,
  onChange,
  errors,
}: {
  cand: CandidateDraft
  index: number
  canRemove: boolean
  onRemove: () => void
  onChange: (patch: Partial<CandidateDraft>) => void
  errors: Record<string, string>
}) {
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
      <CandidateProfile
        onBusyChange={(profileLoading) => onChange({ profileLoading })}
        onStudent={(student) =>
          onChange({
            studentId: student.studentId,
            firstName: student.firstname,
            lastName: student.lastname,
            class: student.schoolClassName || "",
            profilePicture: student.profilePicture || "",
          })
        }
      />
      {errors["cand-" + cand.key + "-student"] && (
        <p role="alert" className="text-xs text-red-600">
          {errors["cand-" + cand.key + "-student"]}
        </p>
      )}
      {cand.studentId && (
        <div
          className="flex items-start gap-3 rounded-lg border bg-white p-3"
          aria-label="Selected student details"
          aria-live="polite"
        >
          <AvatarInitials
            name={cand.firstName + " " + cand.lastName}
            photo={cand.profilePicture}
            size="lg"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <dl className="grid gap-2 sm:grid-cols-3">
              {(
                [
                  ["First name", cand.firstName],
                  ["Last name", cand.lastName],
                  ["Class", cand.class],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-medium break-words">
                    {value || "Not recorded"}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground">
              To change these details, update the student registration record,
              then select the student again.
            </p>
            {!cand.profilePicture && (
              <p className="text-xs text-muted-foreground">
                No registered profile picture.
              </p>
            )}
            {[
              "cand-" + cand.key + "-firstName",
              "cand-" + cand.key + "-lastName",
              "cand-" + cand.key,
            ].map((key) =>
              errors[key] ? (
                <p key={key} role="alert" className="text-xs text-red-600">
                  {errors[key]}
                </p>
              ) : null
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
