import { type FormEvent } from "react"
import { HeartHandshake, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionCard } from "@/components/general/ProfileSections"
import {
  useLearnerSupportTeacherSummary,
  useLogLearnerSupportProvision,
} from "@/hooks/learnerSupport"
import type { ProvisionDeliveryStatus } from "@/api/learnerSupport.api"

export default function TeacherSupportSummary({
  schoolId,
  studentId,
  allowLogging = true,
}: {
  schoolId: string
  studentId: string
  allowLogging?: boolean
}) {
  const { summary, isPending, isError } = useLearnerSupportTeacherSummary(
    schoolId,
    studentId,
  )
  const logMutation = useLogLearnerSupportProvision()
  if (isPending)
    return (
      <div className="col-span-full rounded-xl border p-5 text-sm text-muted-foreground">
        Checking learner-support guidance…
      </div>
    )
  if (isError || !summary) return null
  function log(event: FormEvent<HTMLFormElement>, provisionId: string) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    logMutation.mutate(
      {
        schoolId,
        provisionId,
        deliveryDate: String(data.get("deliveryDate")),
        status: data.get("status") as ProvisionDeliveryStatus,
        actualDurationMinutes: Number(data.get("actualDurationMinutes")),
        outcomeRating: Number(data.get("outcomeRating")) || undefined,
        notes: String(data.get("notes") || "") || undefined,
      },
      { onSuccess: () => form.reset() },
    )
  }
  return (
    <div className="col-span-full">
      <SectionCard
        title="Teacher learner-support summary"
        icon={HeartHandshake}
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3 text-sm">
            <section>
              <p className="font-medium">At-a-glance support</p>
              <p className="text-gray-600">
                {summary.supportSummary || "No summary published."}
              </p>
            </section>
            <section>
              <p className="font-medium">Communication</p>
              <p className="text-gray-600">
                {summary.communicationPreferences ||
                  "No specific preference recorded."}
              </p>
            </section>
            <section>
              <p className="font-medium">Effective strategies</p>
              <p className="text-gray-600">
                {summary.effectiveStrategies || "No strategies recorded."}
              </p>
            </section>
          </div>
          <div>
            <p className="mb-2 font-medium">Active adjustments</p>
            <div className="space-y-2">
              {summary.adjustments.length === 0 ? (
                <p className="text-sm text-gray-500">No active adjustments.</p>
              ) : (
                summary.adjustments.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-emerald-100 bg-emerald-50 p-3"
                  >
                    <div className="flex gap-2">
                      <ShieldCheck className="size-4 text-emerald-700" />
                      <p className="text-sm font-semibold text-emerald-900">
                        {item.title}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-emerald-800">
                      {item.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        {allowLogging && summary.assignedProvisions.length > 0 && (
          <div className="mt-5 border-t pt-4">
            <p className="mb-2 font-medium">My assigned provision</p>
            <div className="space-y-2">
              {summary.assignedProvisions.map((provision) => (
                <details key={provision.id} className="rounded-lg border p-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    {provision.title} · {provision.frequency}
                  </summary>
                  <form
                    className="mt-3 grid gap-2 sm:grid-cols-5"
                    onSubmit={(event) => log(event, provision.id)}
                  >
                    <input
                      name="deliveryDate"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      className="h-9 rounded-lg border px-2 text-sm"
                    />
                    <select
                      name="status"
                      className="h-9 rounded-lg border px-2 text-sm"
                    >
                      <option value="Delivered">Delivered</option>
                      <option value="Missed">Missed</option>
                      <option value="Rescheduled">Rescheduled</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <input
                      name="actualDurationMinutes"
                      type="number"
                      min="0"
                      defaultValue={provision.durationMinutes}
                      className="h-9 rounded-lg border px-2 text-sm"
                      aria-label="Actual minutes"
                    />
                    <input
                      name="outcomeRating"
                      type="number"
                      min="1"
                      max="5"
                      className="h-9 rounded-lg border px-2 text-sm"
                      placeholder="Outcome 1–5"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant="primary"
                      disabled={logMutation.isPending}
                    >
                      Log delivery
                    </Button>
                    <input
                      name="notes"
                      className="h-9 rounded-lg border px-2 text-sm sm:col-span-5"
                      placeholder="Optional delivery notes"
                    />
                  </form>
                </details>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
