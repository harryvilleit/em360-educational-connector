import { useState, type FormEvent } from "react"
import { KeyRound, ShieldCheck, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGrantSafeguardingAccess,
  useSafeguardingAccessAudit,
  useSafeguardingAccessGrants,
  useSafeguardingEligibleUsers,
} from "@/hooks/safeguarding"
import { useStudentSupportSettings } from "@/hooks/studentSupportSettings"
import type {
  SafeguardingAccessGrantI,
  SafeguardingAccessRole,
} from "@/api/safeguarding.api"
import {
  EmptySafeguarding,
  FormField,
} from "./components"
import RevokeAccessDialog from "./RevokeAccessDialog"
import { formatDateTime, inputClass, labelFromCode } from "./utils"

export default function AccessManagement() {
  const schoolId = useSchoolId()
  const { grants, isPending } = useSafeguardingAccessGrants(schoolId)
  const { users } = useSafeguardingEligibleUsers(schoolId)
  const { audit } = useSafeguardingAccessAudit(schoolId)
  const grantMutation = useGrantSafeguardingAccess()
  const { settings } = useStudentSupportSettings(schoolId)
  const accessRoleLabel = (value?: SafeguardingAccessRole) =>
    value === "Dsl"
      ? settings?.safeguardingLeadTitle ?? "Safeguarding lead"
      : value === "DeputyDsl"
        ? settings?.deputySafeguardingLeadTitle ?? "Deputy safeguarding lead"
        : value
          ? labelFromCode(value)
          : ""
  const [userId, setUserId] = useState("")
  const [role, setRole] = useState<SafeguardingAccessRole>("CaseReviewer")
  const [selected, setSelected] = useState<SafeguardingAccessGrantI>()
  const activeGrants = grants.filter((grant) => grant.isActive)

  function submit(event: FormEvent) {
    event.preventDefault()
    grantMutation.mutate(
      { schoolId, userId, role },
      { onSuccess: () => setUserId("") }
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Safeguarding access & audit"
        description="Appoint the small group permitted to view or manage confidential records."
        icon={<KeyRound className="size-5 text-red-700" />}
        iconBg="bg-red-50"
      />
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
        <strong>SuperAdmin separation:</strong> SuperAdmins can configure this
        list and submit concerns, but cannot read cases unless they are
        explicitly appointed below. All case access and access changes are
        audited.
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Appoint safeguarding access</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end"
            onSubmit={submit}
          >
            <FormField label="School staff member">
              <select
                className={inputClass}
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                <option value="">Select a staff member</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.name}
                    {user.roles ? ` · ${user.roles}` : ""}
                    {user.currentAccessRole
                      ? ` · ${accessRoleLabel(user.currentAccessRole)}`
                      : ""}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Access role">
              <select
                className={inputClass}
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as SafeguardingAccessRole)
                }
              >
                <option value="Dsl">{settings?.safeguardingLeadTitle ?? "Safeguarding lead"} · manage cases</option>
                <option value="DeputyDsl">{settings?.deputySafeguardingLeadTitle ?? "Deputy safeguarding lead"} · manage cases</option>
                <option value="CaseReviewer">Case reviewer · read only</option>
              </select>
            </FormField>
            <Button
              type="submit"
              variant="primary"
              disabled={!userId || grantMutation.isPending}
            >
              {grantMutation.isPending ? "Saving…" : "Grant access"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Current appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="space-y-3">
              {[1, 2].map((x) => (
                <Skeleton key={x} className="h-14 w-full" />
              ))}
            </div>
          ) : !activeGrants.length ? (
            <EmptySafeguarding>
              No explicit safeguarding appointments have been recorded.
            </EmptySafeguarding>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Person</th>
                    <th className="px-4 py-3">Access</th>
                    <th className="px-4 py-3">Updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activeGrants.map((grant) => (
                    <tr key={grant.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium">{grant.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {grant.email}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <ShieldCheck className="size-4 text-emerald-700" />
                          {accessRoleLabel(grant.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {formatDateTime(grant.dateModified)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setSelected(grant)}
                        >
                          <Trash2 />
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Access audit</CardTitle>
        </CardHeader>
        <CardContent>
          {!audit.length ? (
            <EmptySafeguarding>
              No safeguarding access changes have been recorded.
            </EmptySafeguarding>
          ) : (
            <ol className="relative ml-2 border-l border-gray-200">
              {audit.map((entry) => (
                <li key={entry.id} className="ml-5 pb-5 last:pb-0">
                  <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full border-2 border-white bg-blue-500" />
                  <p className="font-medium">{labelFromCode(entry.action)}</p>
                  <p className="text-sm text-gray-700">{entry.summary}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(entry.dateCreated)} ·{" "}
                    {entry.actorName || "System"}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
      <RevokeAccessDialog
        schoolId={schoolId}
        grant={selected}
        onClose={() => setSelected(undefined)}
      />
    </div>
  )
}
