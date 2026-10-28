import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LearnerSupportCaseDetailI } from "@/api/learnerSupport.api"
import { EmptySupport } from "./components"
import { formatDate, labelFromCode } from "./utils"

export default function AuditPanel({ item }: { item: LearnerSupportCaseDetailI }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Append-only audit history</CardTitle>
      </CardHeader>
      <CardContent>
        {!item.auditHistory.length ? (
          <EmptySupport>No audit events recorded.</EmptySupport>
        ) : (
          <ol className="relative space-y-4 border-l pl-5">
            {item.auditHistory.map((entry) => (
              <li key={entry.id}>
                <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full bg-blue-600" />
                <p className="font-medium">{labelFromCode(entry.action)}</p>
                <p className="text-sm">{entry.summary}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.actorName || "System"} ·{" "}
                  {formatDate(entry.dateCreated)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
