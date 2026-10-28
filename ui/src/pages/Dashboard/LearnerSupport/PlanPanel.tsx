import { useState, type FormEvent } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  useLogLearnerSupportProvision,
  useSaveLearnerSupportPlan,
} from "@/hooks/learnerSupport"
import type {
  LearnerSupportCaseDetailI,
  ProvisionDeliveryStatus,
  ProvisionInputI,
} from "@/api/learnerSupport.api"
import { EmptySupport, FormField } from "./components"
import {
  formatDate,
  inputClass,
  labelFromCode,
  textareaClass,
  today,
} from "./utils"

export default function PlanPanel({
  item,
  schoolId,
}: {
  item: LearnerSupportCaseDetailI
  schoolId: string
}) {
  const mutation = useSaveLearnerSupportPlan()
  const logMutation = useLogLearnerSupportProvision()
  const [provisions, setProvisions] = useState<ProvisionInputI[]>([
    { title: "", frequency: "Weekly", durationMinutes: 30, estimatedCost: 0 },
  ])
  function updateProvision(index: number, patch: Partial<ProvisionInputI>) {
    setProvisions((current) =>
      current.map((value, i) => (i === index ? { ...value, ...patch } : value))
    )
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    mutation.mutate({
      schoolId,
      caseId: item.id,
      title: String(data.get("title")),
      needs: String(data.get("needs")),
      outcomes: String(data.get("outcomes")),
      parentAndLearnerViews: String(data.get("views") || ""),
      successCriteria: String(data.get("successCriteria") || ""),
      startDate: String(data.get("startDate")),
      endDate: String(data.get("endDate") || "") || undefined,
      reviewDate: String(data.get("reviewDate")),
      publish: data.get("publish") === "on",
      provisions: provisions.filter((p) => p.title.trim()),
    })
  }
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
      { onSuccess: () => form.reset() }
    )
  }
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Create a new plan version</CardTitle>
          <p className="text-sm text-muted-foreground">
            Publishing supersedes the previous published plan while preserving
            its history.
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            <FormField label="Plan title">
              <input
                name="title"
                required
                className={inputClass}
                placeholder="Graduated support plan"
              />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Identified needs">
                <textarea name="needs" required className={textareaClass} />
              </FormField>
              <FormField label="Intended outcomes">
                <textarea name="outcomes" required className={textareaClass} />
              </FormField>
              <FormField label="Learner and family views">
                <textarea name="views" className={textareaClass} />
              </FormField>
              <FormField label="Success criteria">
                <textarea name="successCriteria" className={textareaClass} />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Start date">
                <input
                  name="startDate"
                  type="date"
                  required
                  defaultValue={today()}
                  className={inputClass}
                />
              </FormField>
              <FormField label="End date">
                <input name="endDate" type="date" className={inputClass} />
              </FormField>
              <FormField label="Review date">
                <input
                  name="reviewDate"
                  type="date"
                  required
                  className={inputClass}
                />
              </FormField>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Provision</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setProvisions((current) => [
                      ...current,
                      {
                        title: "",
                        frequency: "Weekly",
                        durationMinutes: 30,
                        estimatedCost: 0,
                      },
                    ])
                  }
                >
                  <Plus className="size-4" /> Add provision
                </Button>
              </div>
              {provisions.map((provision, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-xl border bg-gray-50 p-3 md:grid-cols-2 xl:grid-cols-4"
                >
                  <FormField label="Provision">
                    <input
                      required
                      className={inputClass}
                      value={provision.title}
                      onChange={(e) =>
                        updateProvision(index, { title: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Frequency">
                    <input
                      required
                      className={inputClass}
                      value={provision.frequency}
                      onChange={(e) =>
                        updateProvision(index, { frequency: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Minutes">
                    <input
                      type="number"
                      min="1"
                      className={inputClass}
                      value={provision.durationMinutes}
                      onChange={(e) =>
                        updateProvision(index, {
                          durationMinutes: Number(e.target.value),
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Estimated cost">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputClass}
                      value={provision.estimatedCost}
                      onChange={(e) =>
                        updateProvision(index, {
                          estimatedCost: Number(e.target.value),
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Assigned staff">
                    <input
                      className={inputClass}
                      value={provision.assignedUserName ?? ""}
                      onChange={(e) =>
                        updateProvision(index, {
                          assignedUserName: e.target.value,
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Delivery type">
                    <input
                      className={inputClass}
                      value={provision.deliveryType ?? ""}
                      onChange={(e) =>
                        updateProvision(index, { deliveryType: e.target.value })
                      }
                    />
                  </FormField>
                  <FormField label="Success measure">
                    <input
                      className={inputClass}
                      value={provision.successMeasure ?? ""}
                      onChange={(e) =>
                        updateProvision(index, {
                          successMeasure: e.target.value,
                        })
                      }
                    />
                  </FormField>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-red-700"
                      disabled={provisions.length === 1}
                      onClick={() =>
                        setProvisions((current) =>
                          current.filter((_, i) => i !== index)
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input name="publish" type="checkbox" /> Publish now and share the
              family-safe plan view
            </label>
            <div>
              <Button
                type="submit"
                variant="primary"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving…" : "Save plan version"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Plan history and delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!item.plans.length ? (
            <EmptySupport>No plan has been created.</EmptySupport>
          ) : (
            item.plans.map((plan) => (
              <div key={plan.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {plan.title} · v{plan.version}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {labelFromCode(plan.status)} · review{" "}
                      {formatDate(plan.reviewDate)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  {plan.provisions.map((provision) => (
                    <details
                      key={provision.id}
                      className="rounded-lg bg-gray-50 p-3"
                    >
                      <summary className="cursor-pointer font-medium">
                        {provision.title} · {provision.frequency} ·{" "}
                        {provision.deliveryLogs.length} logs
                      </summary>
                      <form
                        className="mt-3 grid gap-3 md:grid-cols-3"
                        onSubmit={(e) => log(e, provision.id)}
                      >
                        <FormField label="Delivery date">
                          <input
                            name="deliveryDate"
                            type="date"
                            required
                            defaultValue={today()}
                            className={inputClass}
                          />
                        </FormField>
                        <FormField label="Status">
                          <select name="status" className={inputClass}>
                            <option value="Delivered">Delivered</option>
                            <option value="Missed">Missed</option>
                            <option value="Rescheduled">Rescheduled</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </FormField>
                        <FormField label="Actual minutes">
                          <input
                            name="actualDurationMinutes"
                            type="number"
                            min="0"
                            defaultValue={provision.durationMinutes}
                            className={inputClass}
                          />
                        </FormField>
                        <FormField label="Outcome rating (1–5)">
                          <input
                            name="outcomeRating"
                            type="number"
                            min="1"
                            max="5"
                            className={inputClass}
                          />
                        </FormField>
                        <FormField label="Notes">
                          <input name="notes" className={inputClass} />
                        </FormField>
                        <div className="flex items-end">
                          <Button
                            type="submit"
                            size="sm"
                            variant="primary"
                            disabled={logMutation.isPending}
                          >
                            Log delivery
                          </Button>
                        </div>
                      </form>
                      {provision.deliveryLogs.length > 0 && (
                        <ul className="mt-3 divide-y text-xs">
                          {provision.deliveryLogs.slice(0, 5).map((entry) => (
                            <li
                              key={entry.id}
                              className="flex justify-between py-2"
                            >
                              <span>
                                {formatDate(entry.deliveryDate)} ·{" "}
                                {labelFromCode(entry.status)} ·{" "}
                                {entry.actualDurationMinutes} min
                              </span>
                              <span>{entry.deliveredByName}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </details>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
