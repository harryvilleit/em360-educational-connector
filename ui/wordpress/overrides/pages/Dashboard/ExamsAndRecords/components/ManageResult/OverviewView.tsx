// WordPress version: per-class Download/Print and counts for the current page of results.
import { useMemo } from "react"
import { Download, Eye, MoreVertical, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ClassResult } from "@/pages/Dashboard/ExamsAndRecords/components/ManageResult/types"
import { PageHeader } from "@/components/general/PageHeader"

interface FilterOption {
  value: string
  label: string
}

interface OverviewViewProps {
  onExport: (resultId: string, print?: boolean) => void
  exporting: boolean
  classResults: ClassResult[]
  classOptions: FilterOption[]
  sessionOptions: FilterOption[]
  termOptions: FilterOption[]
  selectedClass: string
  selectedTerm: string
  selectedSession: string
  onClassChange: (value: string) => void
  onTermChange: (value: string) => void
  onSessionChange: (value: string) => void
  onViewClassResults: (resultId: string) => void
}

export function OverviewView({
  onExport,
  exporting,
  classResults,
  classOptions,
  sessionOptions,
  termOptions,
  selectedClass,
  selectedTerm,
  selectedSession,
  onClassChange,
  onTermChange,
  onSessionChange,
  onViewClassResults,
}: OverviewViewProps) {
  const statusCounts = useMemo(() => {
    let published = 0
    let pending = 0
    let approved = 0
    for (const r of classResults) {
      if (r.status === "published") published++
      else if (r.status === "draft" || r.status === "submitted") pending++
      else if (r.status === "approved") approved++
    }
    return { published, pending, approved }
  }, [classResults])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Class Results"
        description="Collect, review, and publish student results for classes"
      />

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="class-filter" className="mb-2 block">
            Class
          </Label>
          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger id="class-filter" className="w-full">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classOptions.map((cls) => (
                <SelectItem key={cls.value} value={cls.value}>
                  {cls.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="term-filter" className="mb-2 block">
            Term
          </Label>
          <Select value={selectedTerm} onValueChange={onTermChange}>
            <SelectTrigger id="term-filter" className="w-full">
              <SelectValue placeholder="Select a term" />
            </SelectTrigger>
            <SelectContent>
              {termOptions.map((term) => (
                <SelectItem key={term.value} value={term.value}>
                  {term.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="session-filter" className="mb-2 block">
            Session
          </Label>
          <Select value={selectedSession} onValueChange={onSessionChange}>
            <SelectTrigger id="session-filter" className="w-full">
              <SelectValue placeholder="Select a session" />
            </SelectTrigger>
            <SelectContent>
              {sessionOptions.map((session) => (
                <SelectItem key={session.value} value={session.value}>
                  {session.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Total Classes",
            value: classResults.length,
            sub: "Classes on this page",
          },
          {
            label: "Published",
            value: statusCounts.published,
            sub: "Published on this page",
          },
          {
            label: "Pending",
            value: statusCounts.pending,
            sub: "On this page",
          },
          {
            label: "Approved",
            value: statusCounts.approved,
            sub: "Approved on this page",
          },
        ].map(({ label, value, sub }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Class Results Status</CardTitle>
          <CardDescription>
            View and manage results for all classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-6 text-center">
                      <p className="text-muted-foreground">No results found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  classResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">
                        {result.className}
                      </TableCell>
                      <TableCell>Term {result.term}</TableCell>
                      <TableCell>{result.session}</TableCell>
                      <TableCell>
                        <StatusBadge status={result.status} />
                      </TableCell>
                      <TableCell>
                        {result.publishedDate ? (
                          <div className="text-xs text-muted-foreground">
                            {result.publishedDate}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Not published
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onViewClassResults(result.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={exporting}
                              onClick={() => onExport(result.id)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={exporting}
                              onClick={() => onExport(result.id, true)}
                            >
                              <Printer className="mr-2 h-4 w-4" />
                              Print
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const STATUS_CONFIG = {
  draft: { color: "bg-yellow-500", label: "Draft" },
  submitted: { color: "bg-blue-500", label: "Submitted" },
  approved: { color: "bg-green-500", label: "Approved" },
  published: { color: "bg-emerald-600", label: "Published" },
}

function StatusBadge({ status }: { status: ClassResult["status"] }) {
  const { color, label } = STATUS_CONFIG[status]
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}
