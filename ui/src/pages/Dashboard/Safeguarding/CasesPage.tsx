import { useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Search, ShieldAlert, ShieldCheck } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useSafeguardingCases } from "@/hooks/safeguarding"
import { DashboardRoutes } from "@/routes"
import type {
  SafeguardingCaseStatus,
  SafeguardingRiskLevel,
} from "@/api/safeguarding.api"
import {
  ConfidentialBanner,
  EmptySafeguarding,
  RiskBadge,
  SafeguardingAccessGate,
  StatusBadge,
} from "./components"
import { formatDateTime, inputClass, labelFromCode } from "./utils"

type Mode = "cases" | "referrals" | "safety-plans"

function CasesList({ mode }: { mode: Mode }) {
  const schoolId = useSchoolId()
  const { productId = "" } = useParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<SafeguardingCaseStatus | "">(
    mode === "referrals" ? "ReferredExternally" : ""
  )
  const [risk, setRisk] = useState<SafeguardingRiskLevel | "">("")
  const [page, setPage] = useState(1)
  const { cases, pagination, isPending } = useSafeguardingCases({
    schoolId,
    search: search || undefined,
    status: status || undefined,
    riskLevel: risk || undefined,
    pageNumber: page,
    pageSize: 20,
  })
  const heading =
    mode === "referrals"
      ? "External referrals"
      : mode === "safety-plans"
        ? "Safety plans"
        : "Safeguarding cases"
  const description =
    mode === "referrals"
      ? "Cases referred to external agencies and services."
      : mode === "safety-plans"
        ? "Open a case to create, review or supersede its safety plan."
        : "Restricted case register, triage status, risk and next-action deadlines."

  return (
    <div className="space-y-6">
      <PageHeader
        title={heading}
        description={description}
        icon={
          mode === "safety-plans" ? (
            <ShieldCheck className="size-5 text-red-700" />
          ) : (
            <ShieldAlert className="size-5 text-red-700" />
          )
        }
        iconBg="bg-red-50"
        actions={
          <Button
            variant="primary"
            onClick={() =>
              navigate(DashboardRoutes.toSafeguardingReport(productId))
            }
          >
            Report a concern
          </Button>
        }
      />
      <ConfidentialBanner />
      <Card>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_200px_180px]">
            <label className="relative">
              <Search className="absolute top-3 left-3 size-4 text-muted-foreground" />
              <input
                className={`${inputClass} pl-9`}
                placeholder="Search learner, case number or summary"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </label>
            <select
              className={inputClass}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as SafeguardingCaseStatus | "")
                setPage(1)
              }}
            >
              <option value="">All statuses</option>
              {[
                "Submitted",
                "AwaitingTriage",
                "Open",
                "Monitoring",
                "ReferredExternally",
                "Closed",
              ].map((x) => (
                <option key={x} value={x}>
                  {labelFromCode(x)}
                </option>
              ))}
            </select>
            <select
              className={inputClass}
              value={risk}
              onChange={(e) => {
                setRisk(e.target.value as SafeguardingRiskLevel | "")
                setPage(1)
              }}
            >
              <option value="">All risk levels</option>
              {["NotAssessed", "Low", "Medium", "High", "Critical"].map((x) => (
                <option key={x} value={x}>
                  {labelFromCode(x)}
                </option>
              ))}
            </select>
          </div>
          {isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((x) => (
                <Skeleton key={x} className="h-16 w-full" />
              ))}
            </div>
          ) : !cases.length ? (
            <EmptySafeguarding>No cases match these filters.</EmptySafeguarding>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Learner</th>
                    <th className="px-4 py-3">Case / concern</th>
                    <th className="px-4 py-3">Risk</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Reported</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cases.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.className || item.studentGivenId}
                        </p>
                      </td>
                      <td className="max-w-sm px-4 py-3">
                        <p className="font-mono text-xs">{item.caseNumber}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {item.concernSummary}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge risk={item.riskLevel} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">
                        {formatDateTime(item.reportedAtUtc)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              DashboardRoutes.toSafeguardingCase(
                                productId,
                                item.id
                              )
                            )
                          }
                        >
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(pagination?.totalPages ?? 1) > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {pagination?.pageNumber} of {pagination?.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((x) => x - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= (pagination?.totalPages ?? 1)}
                  onClick={() => setPage((x) => x + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function SafeguardingCasesPage({
  mode = "cases",
}: {
  mode?: Mode
}) {
  return (
    <SafeguardingAccessGate require="view">
      <CasesList mode={mode} />
    </SafeguardingAccessGate>
  )
}
