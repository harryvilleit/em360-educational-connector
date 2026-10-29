import { useMemo, useState, type FormEvent } from "react"
import { History, Search, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TabsContent } from "@/components/ui/tabs"
import { useGetAutomatedScoreContributions } from "@/hooks/examAndRecords"

interface AcademicTermOption {
  id: string
  name: string
  isCurrent?: boolean
}

interface AcademicSessionOption {
  id: string
  name: string
  isCurrent?: boolean
  terms: AcademicTermOption[]
}

interface AutomatedContributionsTabProps {
  schoolId: string
  sessions: AcademicSessionOption[]
}

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

export function AutomatedContributionsTab({
  schoolId,
  sessions,
}: AutomatedContributionsTabProps) {
  const [sessionFilter, setSessionFilter] = useState<string | null>(null)
  const [termFilter, setTermFilter] = useState<string | null>(null)
  const [searchText, setSearchText] = useState("")
  const [search, setSearch] = useState("")
  const [includeInactive, setIncludeInactive] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)

  const defaultSession =
    sessions.find((item) => item.isCurrent) ?? sessions[0]
  const selectedSessionId =
    sessionFilter === null ? defaultSession?.id ?? "" : sessionFilter

  const selectedSession = useMemo(
    () => sessions.find((item) => item.id === selectedSessionId),
    [selectedSessionId, sessions]
  )
  const defaultTerm =
    selectedSession?.terms.find((item) => item.isCurrent) ??
    selectedSession?.terms[0]
  const selectedTermId =
    termFilter === null ? defaultTerm?.id ?? "" : termFilter

  const { audit, isLoading, isFetching, isError, error, refetch } =
    useGetAutomatedScoreContributions({
      schoolId,
      schoolSessionId: selectedSessionId || undefined,
      schoolSessionTermId: selectedTermId || undefined,
      search: search || undefined,
      includeInactive,
      pageNumber,
      pageSize: 25,
    })

  function handleSessionChange(value: string) {
    const sessionId = value === "all" ? "" : value
    const session = sessions.find((item) => item.id === sessionId)
    const term =
      session?.terms.find((item) => item.isCurrent) ?? session?.terms[0]
    setSessionFilter(sessionId)
    setTermFilter(term?.id ?? "")
    setPageNumber(1)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearch(searchText.trim())
    setPageNumber(1)
  }

  return (
    <TabsContent value="audit" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <History className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Audit records</p>
              <p className="text-2xl font-semibold">
                {formatNumber(audit?.totalItems ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">
                Active automated points
              </p>
              <p className="text-2xl font-semibold">
                {formatNumber(audit?.activeContributionTotal ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automated Contribution Audit</CardTitle>
          <CardDescription>
            Every teacher-approved assignment score that contributes to the
            dynamic gradebook. Superseded rows remain available when history is
            enabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 lg:grid-cols-[220px_220px_1fr_auto] lg:items-end">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Session</label>
              <Select
                value={selectedSessionId || "all"}
                onValueChange={handleSessionChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sessions</SelectItem>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Term</label>
              <Select
                value={selectedTermId || "all"}
                onValueChange={(value) => {
                  setTermFilter(value === "all" ? "" : value)
                  setPageNumber(1)
                }}
                disabled={!selectedSessionId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All terms</SelectItem>
                  {(selectedSession?.terms ?? []).map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search student or assignment"
                aria-label="Search contribution audit"
              />
              <Button type="submit" variant="outline" className="gap-2">
                <Search className="size-4" /> Search
              </Button>
            </form>

            <label className="flex h-10 items-center gap-2 whitespace-nowrap text-sm">
              <Checkbox
                checked={includeInactive}
                onCheckedChange={(checked) => {
                  setIncludeInactive(checked === true)
                  setPageNumber(1)
                }}
              />
              Include superseded
            </label>
          </div>

          {isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
              <p className="font-semibold">Unable to load the audit trail.</p>
              <p className="mt-1">{error?.message}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => void refetch()}
              >
                Try again
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="size-6" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student / Assignment</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Class / Subject</TableHead>
                    <TableHead className="text-right">Mark</TableHead>
                    <TableHead className="text-right">Contribution</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(audit?.items ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-14 text-center text-sm text-muted-foreground"
                      >
                        No approved automated contributions match these filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    audit?.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium">{item.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.assignmentTitle} · Attempt {item.attemptNumber}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {item.assessmentComponentName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.sessionName || "Session unavailable"} ·{" "}
                            {item.termName || "Term unavailable"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p>{item.className || "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.subjectName || "—"}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-medium">
                            {formatNumber(item.percentageScore)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(item.rawPoints)}/
                            {formatNumber(item.availablePoints)} pts
                          </p>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-blue-700">
                          {formatNumber(item.contributionPoints)} pts
                        </TableCell>
                        <TableCell>
                          <p className="max-w-40 truncate text-sm">
                            {item.approvedBy || "Unknown user"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(item.approvedAtUtc)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              item.isActive
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-gray-200 bg-gray-50 text-gray-600"
                            }
                          >
                            {item.isActive ? "Active" : "Superseded"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {(audit?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Page {audit?.pageNumber} of {audit?.totalPages}
                {isFetching ? " · Updating…" : ""}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageNumber <= 1 || isFetching}
                  onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    pageNumber >= (audit?.totalPages ?? 0) || isFetching
                  }
                  onClick={() => setPageNumber((page) => page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  )
}
