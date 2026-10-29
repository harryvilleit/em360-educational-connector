import {
  BookOpen,
  Users,
  FolderTree,
  Building2,
  ArrowUpCircle,
  BookUser,
  Settings,
  ClipboardList,
  Eye,
  MessageSquare,
  Award,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Table2,
} from "lucide-react"
import { useNavigate, useParams } from "react-router"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type {
  ExamRecordsOverviewDto,
  ExamRecordsOverviewParamsI,
} from "@/api/examAndRecords.api/types"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetExamRecordsOverview } from "@/hooks/examAndRecords"
import { QuickActionsSection } from "./components/QuickActionsSection"
import { MainNavigationCards } from "./components/MainNavigationCards"
import { GradeDistributionChartCard } from "./components/GradeDistributionChartCard"
import { ClassPerformanceChartCard } from "./components/ClassPerformanceChartCard"
import { SubjectPerformanceChartCard } from "./components/SubjectPerformanceChartCard"
import { RecentExamSessionsCard } from "./components/RecentExamSessionsCard"
import { ExamAnalyticsGrid } from "./components/ExamAnalyticsGrid"

function formatSignedChange(
  value: number | null | undefined,
  suffix = ""
): string {
  if (value == null) return ""
  return `${value >= 0 ? "+" : ""}${value}${suffix}`
}

export default function ExamsAndRecordsPage() {
  const schoolId = useSchoolId()
  return <ExamRecordsOverview key={schoolId} schoolId={schoolId} />
}

function ExamRecordsOverview({ schoolId }: { schoolId: string }) {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const [filters, setFilters] = useState<
    Omit<ExamRecordsOverviewParamsI, "schoolId">
  >({})
  const [filterOptions, setFilterOptions] = useState<
    ExamRecordsOverviewDto["availableSessions"]
  >([])
  const {
    overview: response,
    isLoading: isLoadingOverview,
    isFetching,
    isError,
    errorUpdatedAt,
    refetch,
  } = useGetExamRecordsOverview({ schoolId, ...filters })
  useEffect(() => {
    if (!isError) return
    toast.error("Unable to load Exams & Records overview. Please try again.", {
      id: `exam-records-overview-${schoolId}`,
      action: {
        label: "Try again",
        onClick: () => {
          void refetch()
        },
      },
    })
  }, [isError, errorUpdatedAt, schoolId, refetch])

  const overview = isLoadingOverview || isError ? undefined : response
  const sessions = response?.availableSessions ?? filterOptions
  const selectedSessionId = filters.sessionId ?? response?.currentSessionId
  const selectedTermId = filters.sessionId
    ? filters.termId
    : response?.currentTermId
  const selectedSession = sessions.find(
    (session) => session.id === selectedSessionId
  )
  const gradeDistribution = overview?.gradeDistribution ?? []
  const classPerformance = overview?.performanceByClass ?? []
  const subjectPerformance = overview?.performanceBySubject ?? []
  const recentActivity = overview?.recentActivities ?? []
  const unavailable = isLoadingOverview || isError

  const examAnalytics = [
    {
      label: "Exams Conducted",
      value: unavailable ? "0" : (overview?.examsConducted ?? 0),
      subtitle: overview?.currentTermName ? overview.currentTermName : "This term",
      icon: Award,
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      border: "border-indigo-100",
      trend: overview ? `${overview.examsConductedChange >= 0 ? "+" : ""}${overview.examsConductedChange}` : "",
      trendUp: (overview?.examsConductedChange ?? 0) >= 0,
    },
    {
      label: "Overall Pass Rate",
      value: unavailable ? "0%" : `${overview?.overallPassRate ?? 0}%`,
      subtitle: "School average",
      icon: CheckCircle,
      bg: "bg-green-50",
      iconColor: "text-green-600",
      border: "border-green-100",
      trend: overview ? `${overview.overallPassRateChange >= 0 ? "+" : ""}${overview.overallPassRateChange}%` : "",
      trendUp: (overview?.overallPassRateChange ?? 0) >= 0,
    },
    {
      label: "Students Passed",
      value: unavailable ? "0" : (overview?.studentsPassed ?? 0),
      subtitle: overview ? `Out of ${overview.studentsPassedTotal} students` : "",
      icon: TrendingUp,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      border: "border-emerald-100",
      trend: formatSignedChange(overview?.studentsPassedChange),
      trendUp: (overview?.studentsPassedChange ?? 0) >= 0,
    },
    {
      label: "At Risk Students",
      value: unavailable ? "0" : (overview?.atRiskStudents ?? 0),
      subtitle: "Below passing grade",
      icon: AlertCircle,
      bg: "bg-orange-50",
      iconColor: "text-orange-600",
      border: "border-orange-100",
      trend: overview ? `${overview.atRiskStudentsChange >= 0 ? "+" : ""}${overview.atRiskStudentsChange}` : "",
      trendUp: (overview?.atRiskStudentsChange ?? 0) <= 0,
    },
  ]

  const quickActions = [
    {
      title: "Create Class",
      description: "Add a new class to your system",
      icon: Users,
      href: `/dashboard/${productId}/exams_and_records/classes`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverBgColor: "bg-blue-100",
      borderColor: "border-blue-100",
    },
    {
      title: "Create Category",
      description: "Organize classes by department",
      icon: FolderTree,
      href: `/dashboard/${productId}/exams_and_records/categories`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      hoverBgColor: "bg-purple-100",
      borderColor: "border-purple-100",
    },
    {
      title: "Create Subject",
      description: "Add new subjects or courses",
      icon: BookOpen,
      href: `/dashboard/${productId}/exams_and_records/subjects`,
      color: "text-green-600",
      bgColor: "bg-green-50",
      hoverBgColor: "bg-green-100",
      borderColor: "border-green-100",
    },
    {
      title: "Manage Departments",
      description: "Create and manage school departments",
      icon: Building2,
      href: `/dashboard/${productId}/exams_and_records/departments`,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      hoverBgColor: "bg-cyan-100",
      borderColor: "border-cyan-100",
    },
    {
      title: "Manage Teachers",
      description: "Assign courses or subject to teachers",
      icon: BookUser,
      href: `/dashboard/${productId}/exams_and_records/manage-teachers`,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      hoverBgColor: "bg-amber-100",
      borderColor: "border-amber-100",
    },
    {
      title: "Gradebook Settings",
      description: "Configure assessment, grading scales & teacher assignments",
      icon: Settings,
      href: `/dashboard/${productId}/exams_and_records/grade-book-settings`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      hoverBgColor: "bg-indigo-100",
      borderColor: "border-indigo-100",
    },
    {
      title: "Grade Entry",
      description: "Input and manage student scores",
      icon: ClipboardList,
      href: `/dashboard/${productId}/exams_and_records/grade-entry`,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      hoverBgColor: "bg-rose-100",
      borderColor: "border-rose-100",
    },
    {
      title: "View Results",
      description: "View published results and track performance",
      icon: Eye,
      href: `/dashboard/${productId}/exams_and_records/view-results`,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      hoverBgColor: "bg-teal-100",
      borderColor: "border-teal-100",
    },
    {
      title: "Manage Class Results",
      description: "Collect, review, and publish class results with remarks",
      icon: MessageSquare,
      href: `/dashboard/${productId}/exams_and_records/manage-class-results`,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      hoverBgColor: "bg-pink-100",
      borderColor: "border-pink-100",
    },
    {
      title: "Promote Students",
      description:
        "Move a student, or all students in a class, into a new class",
      icon: ArrowUpCircle,
      href: `/dashboard/${productId}/exams_and_records/promote-students`,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      hoverBgColor: "bg-indigo-100",
      borderColor: "border-indigo-100",
    },
    {
      title: "Broadsheet",
      description: "Class and subject performance broadsheets",
      icon: Table2,
      href: `/dashboard/${productId}/exams_and_records/broadsheet`,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      hoverBgColor: "bg-cyan-100",
      borderColor: "border-cyan-100",
    },
  ]

  const mainNav = [
    {
      id: "classes",
      count: overview?.totalClasses,
      icon: Users,
      title: "Classes Management",
      description: "View and manage all classes",
      href: `/dashboard/${productId}/exams_and_records/classes`,
    },
    {
      id: "categories",
      count: overview?.totalCategories,
      icon: FolderTree,
      title: "Categories Management",
      description: "Organize classes by department",
      href: `/dashboard/${productId}/exams_and_records/categories`,
    },
    {
      id: "subjects",
      count: overview?.totalSubjects,
      icon: BookOpen,
      title: "Subjects & Courses",
      description: "Manage subjects and courses",
      href: `/dashboard/${productId}/exams_and_records/subjects`,
    },
    {
      id: "departments",
      count: overview?.totalDepartments,
      icon: Building2,
      title: "Departments",
      description: "Manage school departments",
      href: `/dashboard/${productId}/exams_and_records/departments`,
    },
  ]

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Exams & Records"
          description="School-wide exam performance & result analytics"
          actions={
            <div className="flex items-center gap-2">
              <Select
                value={selectedSessionId ?? ""}
                disabled={!sessions.length}
                onValueChange={(sessionId) => {
                  const session = sessions.find(
                    (item) => item.id === sessionId
                  )
                  const term =
                    session?.terms.find((item) => item.isCurrent) ??
                    session?.terms[0]
                  setFilterOptions(sessions)
                  setFilters({ sessionId, termId: term?.id })
                }}
              >
                <SelectTrigger aria-label="Academic session">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem
                      key={session.id}
                      value={session.id}
                    >
                      {session.sessionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedTermId ?? ""}
                disabled={!selectedSession?.terms.length}
                onValueChange={(termId) => {
                  setFilterOptions(sessions)
                  setFilters({ sessionId: selectedSessionId, termId })
                }}
              >
                <SelectTrigger aria-label="Academic term">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSession?.terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.termName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
        {isFetching && !isLoadingOverview && (
          <span role="status" className="text-sm text-muted-foreground">
            Updating overview...
          </span>
        )}
        {isLoadingOverview && (
          <span role="status" className="sr-only">
            Loading exam records overview
          </span>
        )}
        <ExamAnalyticsGrid metrics={examAnalytics} />

        <QuickActionsSection
          actions={quickActions}
          onActionClick={(href) => navigate(href)}
        />

        <MainNavigationCards items={mainNav} unavailable={unavailable} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GradeDistributionChartCard
            isLoadingOverview={isLoadingOverview}
            isError={isError}
            gradeDistribution={gradeDistribution}
            onRetry={() => void refetch()}
          />

          <ClassPerformanceChartCard
            isLoadingOverview={isLoadingOverview}
            isError={isError}
            classPerformance={classPerformance}
            onRetry={() => void refetch()}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SubjectPerformanceChartCard
            isLoadingOverview={isLoadingOverview}
            isError={isError}
            subjectPerformance={subjectPerformance}
            onRetry={() => void refetch()}
          />

          <RecentExamSessionsCard
            isLoadingOverview={isLoadingOverview}
            isError={isError}
            recentActivity={recentActivity}
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    </>
  )
}

