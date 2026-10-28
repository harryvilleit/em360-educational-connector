import { useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router"
import { CalendarClock } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useCompleteSafeguardingAction,
  useSafeguardingAccess,
  useSafeguardingActions,
} from "@/hooks/safeguarding"
import type { SafeguardingActionQueueItemI } from "@/api/safeguarding.api"
import { DashboardRoutes } from "@/routes"
import {
  ConfidentialBanner,
  EmptySafeguarding,
  FormField,
  RiskBadge,
  SafeguardingAccessGate,
} from "./components"
import {
  formatDateTime,
  inputClass,
  labelFromCode,
  textareaClass,
} from "./utils"

function CompleteActionDialog({
  item,
  schoolId,
  onClose,
}: {
  item?: SafeguardingActionQueueItemI
  schoolId: string
  onClose: () => void
}) {
  const mutation = useCompleteSafeguardingAction()
  const [outcome, setOutcome] = useState("")
  const [status, setStatus] = useState<"Completed" | "Cancelled">("Completed")
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!item) return
    mutation.mutate(
      { schoolId, actionId: item.action.id, status, outcome },
      { onSuccess: onClose }
    )
  }
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update action</DialogTitle>
          <DialogDescription>
            {item?.action.title} · {item?.caseNumber}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <FormField label="Decision">
            <select
              className={inputClass}
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "Completed" | "Cancelled")
              }
            >
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </FormField>
          <FormField label="Outcome or cancellation rationale">
            <textarea
              className={textareaClass}
              required
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving…" : "Save action"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ActionQueue() {
  const schoolId = useSchoolId()
  const { productId = "" } = useParams()
  const navigate = useNavigate()
  const { access } = useSafeguardingAccess(schoolId)
  const [includeCompleted, setIncludeCompleted] = useState(false)
  const [selected, setSelected] = useState<SafeguardingActionQueueItemI>()
  const { actions, isPending } = useSafeguardingActions(
    schoolId,
    includeCompleted
  )
  return (
    <div className="space-y-6">
      <PageHeader
        title="Actions & deadlines"
        description="One queue for safeguarding follow-up, ownership and overdue work."
        icon={<CalendarClock className="size-5 text-red-700" />}
        iconBg="bg-red-50"
      />
      <ConfidentialBanner />
      <Card>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={includeCompleted}
              onCheckedChange={(v) => setIncludeCompleted(v === true)}
            />
            Include completed and cancelled actions
          </label>
          {isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((x) => (
                <Skeleton key={x} className="h-16 w-full" />
              ))}
            </div>
          ) : !actions.length ? (
            <EmptySafeguarding>No actions are in this queue.</EmptySafeguarding>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Learner / case</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {actions.map((item) => (
                    <tr key={item.action.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span
                          className={
                            item.action.dueAtUtc &&
                            new Date(item.action.dueAtUtc) < new Date() &&
                            item.action.status === "Open"
                              ? "font-semibold text-red-700"
                              : ""
                          }
                        >
                          {formatDateTime(item.action.dueAtUtc)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.studentName}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="font-mono text-xs text-muted-foreground">
                            {item.caseNumber}
                          </p>
                          <RiskBadge risk={item.riskLevel} />
                        </div>
                      </td>
                      <td className="max-w-sm px-4 py-3">
                        <p className="font-medium">{item.action.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {labelFromCode(item.action.type)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {item.action.assignedToName || "Unassigned"}
                      </td>
                      <td className="px-4 py-3">
                        {labelFromCode(item.action.status)}
                      </td>
                      <td className="space-x-2 px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              DashboardRoutes.toSafeguardingCase(
                                productId,
                                item.caseId
                              )
                            )
                          }
                        >
                          Open case
                        </Button>
                        {access?.canManageCases &&
                          item.action.status === "Open" && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => setSelected(item)}
                            >
                              Complete
                            </Button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <CompleteActionDialog
        item={selected}
        schoolId={schoolId}
        onClose={() => setSelected(undefined)}
      />
    </div>
  )
}

export default function SafeguardingActionQueuePage() {
  return (
    <SafeguardingAccessGate require="view">
      <ActionQueue />
    </SafeguardingAccessGate>
  )
}
