import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { BarChart3, HeartHandshake, Search } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Pagination from "@/components/ui/pagination"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useLearnerSupportCases } from "@/hooks/learnerSupport"
import { useStudentSupportSettings } from "@/hooks/studentSupportSettings"
import { DashboardRoutes } from "@/routes"
import type { LearnerSupportCaseStatus } from "@/api/learnerSupport.api"
import NewReferralDialog from "./NewReferralDialog"
import { EmptySupport, StatusBadge } from "./components"
import {
  formatDate,
  inputClass,
  labelFromCode,
  learnerSupportLabel,
} from "./utils"

export type LearnerSupportListMode =
  | "referrals"
  | "register"
  | "plans"
  | "provision"
  | "reviews"
  | "adjustments"
  | "reports"

const pageModes: Record<
  LearnerSupportListMode,
  {
    title: string
    description: string
    status?: LearnerSupportCaseStatus
    register?: boolean
  }
> = {
  referrals: {
    title: "Referrals & triage",
    description:
      "Review submitted concerns, assign ownership and decide the next graduated-response step.",
    status: "Submitted",
  },
  register: {
    title: "Support register",
    description:
      "The live list of learners receiving monitored or planned support.",
    register: true,
  },
  plans: {
    title: "Plans & outcomes",
    description:
      "Open a learner record to create, publish or review a versioned support plan.",
    register: true,
  },
  provision: {
    title: "Provision delivery",
    description:
      "See learners with active support, then record delivery against their plan.",
    register: true,
  },
  reviews: {
    title: "Reviews",
    description:
      "Track review dates, evidence progress and record the agreed decision.",
    register: true,
  },
  adjustments: {
    title: "Reasonable adjustments",
    description:
      "Manage active classroom, assessment and e-learning adjustments.",
    register: true,
  },
  reports: {
    title: "Learner-support reports",
    description:
      "Operational register data for oversight, cost and compliance reporting.",
    register: true,
  },
}

export default function LearnerSupportCasesPage({
  mode,
}: {
  mode: LearnerSupportListMode
}) {
  const schoolId = useSchoolId()
  const { productId = "" } = useParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>(pageModes[mode].status ?? "")
  const [page, setPage] = useState(1)
  const config = pageModes[mode]
  const { settings } = useStudentSupportSettings(schoolId)
  const params = useMemo(
    () => ({
      schoolId,
      search: search || undefined,
      status: (status || undefined) as LearnerSupportCaseStatus | undefined,
      isOnRegister: config.register,
      pageNumber: page,
      pageSize: 15,
    }),
    [schoolId, search, status, config.register, page]
  )
  const { cases, pagination, isPending } = useLearnerSupportCases(params)

  function exportCsv() {
    const rows = [
      [
        "Case",
        "Learner",
        "Student ID",
        "Class",
        "Status",
        "Owner",
        "Next review",
      ],
      ...cases.map((item) => [
        item.caseNumber,
        item.studentName,
        item.studentGivenId ?? "",
        item.className ?? "",
        labelFromCode(item.status),
        item.caseOwnerName ?? "",
        item.nextReviewDate ?? "",
      ]),
    ]
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n")
    const link = document.createElement("a")
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    link.download = `learner-support-${mode}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        icon={
          mode === "reports" ? (
            <BarChart3 className="size-5 text-blue-700" />
          ) : (
            <HeartHandshake className="size-5 text-blue-700" />
          )
        }
        actions={
          <div className="flex gap-2">
            {mode === "reports" && (
              <Button
                variant="outline"
                onClick={exportCsv}
                disabled={!cases.length}
              >
                Export current view
              </Button>
            )}
            <NewReferralDialog schoolId={schoolId} />
          </div>
        }
      />
      <Card>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
            <label className="relative">
              <Search className="absolute top-3 left-3 size-4 text-muted-foreground" />
              <input
                className={`${inputClass} pl-9`}
                placeholder="Search learner or case number"
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
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All statuses</option>
              {(
                [
                  "Draft",
                  "Submitted",
                  "UnderTriage",
                  "Assessing",
                  "SupportPlanActive",
                  "ReviewDue",
                  "StatutoryAssessment",
                  "StatutoryPlanActive",
                  "Monitoring",
                  "Closed",
                ] as LearnerSupportCaseStatus[]
              ).map((item) => (
                <option key={item} value={item}>
                  {learnerSupportLabel(item, settings)}
                </option>
              ))}
            </select>
          </div>
          {isPending ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Loading learner-support cases…
            </p>
          ) : !cases.length ? (
            <EmptySupport>No cases match this view.</EmptySupport>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">Learner</th>
                    <th className="px-4 py-3">Case</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Next review</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cases.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.className ||
                            item.studentGivenId ||
                            "No current class"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs">
                          {item.caseNumber}
                        </span>
                        {item.immediateSafetyConcern && (
                          <p className="text-xs font-medium text-red-700">
                            Safety concern
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">
                        {item.caseOwnerName || "Unassigned"}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(item.nextReviewDate)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              DashboardRoutes.toLearnerSupportCase(
                                productId,
                                item.id
                              )
                            )
                          }
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {(pagination?.totalItems ?? 0) > 15 && (
          <Pagination
            page={page}
            pageSize={15}
            total={pagination?.totalItems ?? 0}
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  )
}
