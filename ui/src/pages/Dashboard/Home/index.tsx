import { useState } from "react"
import AttendanceChart from "./components/AttendanceChart"
import EnrollmentChart from "./components/EnrollmentChart"
import RecentActivity from "./components/RecentActivity"
import StatsCards from "./components/StatsCards"
import UpcomingEvents from "./components/UpcomingEvents"
import { PageHeader } from "@/components/general/PageHeader"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useSchoolOverview } from "@/hooks/useSchoolOverview"
import type { SchoolOverviewFilters } from "@/api/schoolOverview.api"
import type { OverviewSessionFilter } from "@/types/schoolOverview"

export default function DashboardHome() {
  const schoolId = useSchoolId()
  return <SchoolOverview key={schoolId} schoolId={schoolId} />
}

function SchoolOverview({ schoolId }: { schoolId: string }) {
  const [filters, setFilters] = useState<SchoolOverviewFilters>({})
  const [filterOptions, setFilterOptions] = useState<OverviewSessionFilter[]>(
    []
  )
  const query = useSchoolOverview(schoolId, filters)
  const overview = query.data
  const sessions = overview?.availableSessions ?? filterOptions
  const sessionId = filters.sessionId ?? overview?.selectedSessionId
  const termId = filters.sessionId ? filters.termId : overview?.selectedTermId
  const session = sessions.find((item) => item.id === sessionId)

  return (
    <div className="min-h-screen space-y-8 bg-muted/50">
      <PageHeader
        title="School Overview"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={sessionId ?? ""}
              disabled={!sessions.length}
              onValueChange={(id) => {
                const next = sessions.find((item) => item.id === id)
                const term =
                  next?.terms.find((item) => item.isCurrent) ?? next?.terms[0]
                setFilterOptions(sessions)
                setFilters({ sessionId: id, termId: term?.id })
              }}
            >
              <SelectTrigger
                aria-label="Academic session"
                className="rounded-full bg-blue-50 text-blue-700"
              >
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.sessionName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={termId ?? ""}
              disabled={!session?.terms.length}
              onValueChange={(id) => {
                setFilterOptions(sessions)
                setFilters({ sessionId, termId: id })
              }}
            >
              <SelectTrigger
                aria-label="Academic term"
                className="rounded-full bg-white"
              >
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {session?.terms.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.termName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />
      {query.isFetching && !query.isPending && (
        <span role="status" className="text-sm text-muted-foreground">
          Updating overview?
        </span>
      )}
      {query.isError ? (
        <div role="alert" className="rounded-2xl border bg-white p-6">
          <p>
            {query.error instanceof Error
              ? query.error.message
              : "Unable to load the school overview."}
          </p>
          <Button className="mt-4" onClick={() => void query.refetch()}>
            Try again
          </Button>
        </div>
      ) : query.isPending ? (
        <div
          role="status"
          aria-label="Loading school overview"
          className="space-y-6"
        >
          <span className="sr-only">Loading school overview</span>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : overview ? (
        <>
          <StatsCards kpis={overview.kpis} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
            <AttendanceChart attendance={overview.weeklyAttendance} />
            <EnrollmentChart enrollment={overview.enrollmentBreakdown} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentActivity activities={overview.recentActivities} />
            <UpcomingEvents events={overview.upcomingEvents} />
          </div>
        </>
      ) : null}
    </div>
  )
}
