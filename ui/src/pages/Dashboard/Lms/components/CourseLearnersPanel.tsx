import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { dashboardCardSurface } from "@/components/general/StatCard"
import { useCourseLearners } from "@/hooks/courseEnrollment/useCourseLearners"
import type { CourseLearnerI } from "@/api/courseEnrollment.api"
import { queryKeys } from "@/utils/queryKeys"

const columns: DataTableColumn<CourseLearnerI>[] = [
  { key: "name", header: "Learner", render: (row) => row.learnerName },
  { key: "email", header: "Email", render: (row) => row.email || "—" },
  { key: "date", header: "Enrolled", render: (row) => new Date(row.dateEnrolledUtc).toLocaleDateString() },
  { key: "progress", header: "Progress", render: (row) => `${row.progressPercent}%` },
  { key: "lessons", header: "Lessons", render: (row) => `${row.completedLessons}/${row.totalLessons}` },
  { key: "status", header: "Status", render: (row) => row.status },
]

export default function CourseLearnersPanel({ courseId, isTutor }: { courseId: string; isTutor: boolean }) {
  const [selection, setSelection] = useState({ courseId, page: 1 })
  const page = selection.courseId === courseId ? selection.page : 1
  const query = useCourseLearners(courseId, page, isTutor)
  const client = useQueryClient()
  if (!isTutor) return <p className="p-5 text-sm text-muted-foreground">The learner list is available to the course owner.</p>
  const result = query.data?.value
  const refresh = () => {
    void query.refetch()
    void client.invalidateQueries({ queryKey: [queryKeys.tutorCourses] })
    void client.invalidateQueries({ queryKey: [queryKeys.courseById, courseId] })
  }

  return (
    <div className={dashboardCardSurface}>
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h3 className="font-semibold">Enrollments & progress</h3>
          <p className="text-xs text-muted-foreground">
            {result && !query.isError ? `${result.totalItems} active enrolment${result.totalItems === 1 ? "" : "s"}` : "Enrolled learners and their lesson progress"}
          </p>
        </div>
        <Button variant="outline" disabled={query.isFetching} onClick={refresh}>Refresh enrolments</Button>
      </div>
      {query.isError ? (
        <div role="alert" className="space-y-2 p-5 text-sm text-red-700">
          <p>Unable to load enrolments. {query.error.message}</p>
          <Button variant="outline" onClick={refresh} disabled={query.isFetching}>Try again</Button>
        </div>
      ) : (
        <DataTable columns={columns} data={result?.items ?? []} getRowKey={(row) => row.id}
          isLoading={query.isPending}
          emptyState={<p className="py-12 text-center text-sm text-muted-foreground">No active enrolments found for this course.</p>}
        />
      )}
      {result && !query.isError && (result.totalItems > result.pageSize || page > 1) && (
        <div className="flex items-center justify-end gap-3 border-t p-4">
          <Button variant="outline" disabled={page <= 1 || query.isFetching}
            onClick={() => setSelection({ courseId, page: page - 1 })}>Previous page</Button>
          <span className="text-sm">Page {page}</span>
          <Button variant="outline" disabled={page * result.pageSize >= result.totalItems || query.isFetching}
            onClick={() => setSelection({ courseId, page: page + 1 })}>Next page</Button>
        </div>
      )}
    </div>
  )
}
