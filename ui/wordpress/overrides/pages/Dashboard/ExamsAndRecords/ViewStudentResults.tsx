// WordPress version: Download and Print produce the actual result report.
import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router"
import {
  Download,
  Printer,
  ArrowLeft,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  Search,
  Hash,
  GraduationCap,
  Loader2,
  AlertCircle,
  FileSearch,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { toast } from "sonner"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllClasses } from "@/hooks/examAndRecords"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useLookupStudentResult } from "@/hooks/examAndRecords"
import { getGradeColor } from "@/utils"
import { exportStudentResult } from "../../../../exams/reports"

interface LookupForm {
  studentNumber: string
  schoolClassId: string
  schoolSessionId: string
  schoolSessionTermId: string
}

const CHART_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6366f1", "#ec4899"]

export default function ViewStudentResultsPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const schoolId = useSchoolId()

  const [searchOpen, setSearchOpen] = useState(false)
  const [lookupForm, setLookupForm] = useState<LookupForm>({
    studentNumber: "",
    schoolClassId: "",
    schoolSessionId: "",
    schoolSessionTermId: "",
  })

  const { classes, isLoading: loadingClasses } = useGetAllClasses({
    schoolId,
    pageSize: 200,
  })

  const { sessions, isLoading: loadingSessions } = useGetAllSchoolSessions({
    schoolId,
    pageSize: 100,
  })

  const { lookupStudentResultAsync, result, isPending, isError, error, reset } =
    useLookupStudentResult()

  // Terms come from the selected session — no extra API call needed
  const selectedSession = useMemo(
    () => sessions.find((s) => s.Id === lookupForm.schoolSessionId),
    [sessions, lookupForm.schoolSessionId]
  )
  const availableTerms = selectedSession?.Terms ?? []

  const isFormValid =
    lookupForm.studentNumber.trim() !== "" &&
    lookupForm.schoolClassId !== "" &&
    lookupForm.schoolSessionId !== "" &&
    lookupForm.schoolSessionTermId !== ""

  const handleLookup = async () => {
    if (!isFormValid) return
    try {
      const res = await lookupStudentResultAsync({
        studentNumber: lookupForm.studentNumber.trim(),
        schoolClassId: lookupForm.schoolClassId,
        schoolSessionId: lookupForm.schoolSessionId,
        schoolSessionTermId: lookupForm.schoolSessionTermId,
      })
      if (!res.isSuccess) {
        toast.error(res.error || "Result not found. Please check the details and try again.")
        return
      }
      toast.success("Results loaded successfully!")
      setSearchOpen(false)
    } catch {
      // error toast handled by the hook
    }
  }

  const handleReset = () => {
    reset()
    setLookupForm({
      studentNumber: "",
      schoolClassId: "",
      schoolSessionId: "",
      schoolSessionTermId: "",
    })
  }

  // ── Derived chart data ──────────────────────────────────────────────────────

  const assessmentColumns = useMemo(() => {
    if (!result) return []
    const names = new Set<string>()
    result.subjectBreakdown.forEach((s) =>
      s.assessments.forEach((a) => names.add(a.assessmentName))
    )
    return Array.from(names)
  }, [result])

  const subjectChartData = useMemo(
    () =>
      result?.subjectBreakdown.map((s) => ({
        name: s.subjectName.length > 12 ? s.subjectName.slice(0, 12) + "…" : s.subjectName,
        Total: s.totalScore,
        ...Object.fromEntries(s.assessments.map((a) => [a.assessmentName, a.score])),
      })) ?? [],
    [result]
  )

  const gradeDistributionData = useMemo(() => {
    if (!result) return []
    return Object.entries(result.analysisSummary.gradeDistribution).map(
      ([grade, count]) => ({ name: grade, value: count })
    )
  }, [result])

  const trendChartData = useMemo(
    () =>
      result?.trendData.map((t) => ({
        label: `${t.term.split(" ")[0]} ${t.session.split("/")[0]}`,
        gpa: t.gpa,
        avgScore: t.averageScore,
        position: t.position,
      })) ?? [],
    [result]
  )

  const subjectRows = useMemo(
    () =>
      result?.subjectBreakdown.map((subject) => ({
        subject,
        scoreMap: Object.fromEntries(
          subject.assessments.map((a) => [a.assessmentName, a.score])
        ),
      })) ?? [],
    [result]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="View Academic Results"
        description="Look up published student academic results by term and session"
        actions={
          result && (
            <>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Clear Results
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
                New Search
              </Button>
            </>
          )
        }
      />

      {/* ── Empty state ── */}
      {!result && (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={FileSearch}
              size="lg"
              title="No student result loaded"
              description="Search for a student by their admission number, class, session and term to view their published academic results."
              action={{
                label: "Search Student Result",
                onClick: () => setSearchOpen(true),
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* ── Lookup modal ── */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Student Result Lookup
            </DialogTitle>
            <DialogDescription>
              Enter the student's details to retrieve their published academic results.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Admission Number */}
            <div className="space-y-1.5">
              <Label htmlFor="studentNumber" className="flex items-center gap-1.5 text-sm font-medium">
                <Hash className="h-4 w-4 text-gray-400" />
                Admission Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="studentNumber"
                placeholder="e.g. CST/2024/001"
                value={lookupForm.studentNumber}
                onChange={(e) =>
                  setLookupForm((f) => ({ ...f, studentNumber: e.target.value }))
                }
              />
            </div>

            {/* Class */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <GraduationCap className="h-4 w-4 text-gray-400" />
                Class <span className="text-red-500">*</span>
              </Label>
              <Select
                value={lookupForm.schoolClassId}
                onValueChange={(v) =>
                  setLookupForm((f) => ({ ...f, schoolClassId: v }))
                }
                disabled={loadingClasses}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingClasses ? "Loading classes…" : "Select class"} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.Id} value={cls.Id}>
                      {cls.ClsName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Session & Term */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Session <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={lookupForm.schoolSessionId}
                  onValueChange={(v) =>
                    setLookupForm((f) => ({
                      ...f,
                      schoolSessionId: v,
                      schoolSessionTermId: "",
                    }))
                  }
                  disabled={loadingSessions}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingSessions ? "Loading…" : "Select session"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s.Id} value={s.Id}>
                        {s.SessionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Term <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={lookupForm.schoolSessionTermId}
                  onValueChange={(v) =>
                    setLookupForm((f) => ({ ...f, schoolSessionTermId: v }))
                  }
                  disabled={!lookupForm.schoolSessionId || availableTerms.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !lookupForm.schoolSessionId
                          ? "Select session first"
                          : "Select term"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTerms.map((t) => (
                      <SelectItem key={t.Id} value={t.Id}>
                        {t.TermName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {(error as unknown as string) || "An error occurred. Please try again."}
                </span>
              </div>
            )}

            <Button
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleLookup}
              disabled={!isFormValid || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Results…
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Load Results
                </>
              )}
            </Button>
            <p className="text-center text-xs text-gray-400">
              All fields marked <span className="text-red-500">*</span> are required.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Results ── */}
      {result && (
        <>
          {/* Student identity card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {result.studentInfo.studentName}
                  </CardTitle>
                  <CardDescription className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Admission No: <strong>{result.studentInfo.admissionNumber}</strong></span>
                    <span>Class: <strong>{result.studentInfo.className}</strong></span>
                    <span>Term: <strong>{result.studentInfo.termName}</strong></span>
                    <span>Session: <strong>{result.studentInfo.sessionName}</strong></span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Overall GPA</p>
                  <p className="text-4xl font-bold text-indigo-600">
                    {result.academicSummary.gpa.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Academic summary cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {[
              { label: "Total Score", value: result.academicSummary.totalScore, color: "text-gray-900" },
              { label: "Average Score", value: `${result.academicSummary.averageScore.toFixed(1)}%`, color: "text-indigo-600" },
              { label: "Position", value: result.academicSummary.position, color: "text-blue-600" },
              { label: "Subjects", value: result.academicSummary.subjectCount, color: "text-gray-900" },
              { label: "Pass Rate", value: `${result.analysisSummary.passedSubjects}/${result.analysisSummary.totalSubjects}`, color: "text-green-600" },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-gray-500">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="subjects" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="trend">Trend</TabsTrigger>
            </TabsList>

            {/* ── Subjects tab ── */}
            <TabsContent value="subjects">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subject Breakdown
                  </CardTitle>
                  <CardDescription>
                    Detailed scores for all subjects in {result.studentInfo.termName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="pl-6">Subject</TableHead>
                          {assessmentColumns.map((col) => (
                            <TableHead key={col} className="text-center">{col}</TableHead>
                          ))}
                          <TableHead className="text-center font-semibold">Total</TableHead>
                          <TableHead className="pr-6 text-center">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjectRows.map(({ subject, scoreMap }) => {
                          return (
                            <TableRow key={subject.subjectName} className="hover:bg-gray-50">
                              <TableCell className="pl-6 font-medium">
                                {subject.subjectName}
                              </TableCell>
                              {assessmentColumns.map((col) => (
                                <TableCell key={col} className="text-center text-sm text-gray-600">
                                  {scoreMap[col] ?? "—"}
                                </TableCell>
                              ))}
                              <TableCell className="text-center font-bold">
                                {subject.totalScore}
                              </TableCell>
                              <TableCell className="pr-6 text-center">
                                <Badge className={getGradeColor(subject.grade)}>
                                  {subject.grade}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Performance tab ── */}
            <TabsContent value="performance" className="space-y-4">
              {/* Summary highlights */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "Best Subject", value: result.performanceSummary.highestSubject, color: "text-green-600" },
                  { label: "Weakest Subject", value: result.performanceSummary.lowestSubject, color: "text-orange-500" },
                  { label: "Best Grade", value: result.performanceSummary.bestGrade, color: "text-indigo-600" },
                  { label: "Pass Rate", value: `${result.performanceSummary.passRate.toFixed(0)}%`, color: "text-blue-600" },
                ].map(({ label, value, color }) => (
                  <Card key={label}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-medium text-gray-500">{label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-lg font-bold ${color}`}>{value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Bar chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Subject Score Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={subjectChartData} margin={{ bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-35} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {assessmentColumns.length > 0
                        ? assessmentColumns.map((col, i) => (
                            <Bar key={col} dataKey={col} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))
                        : <Bar dataKey="Total" fill="#6366f1" />}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Analysis tab ── */}
            <TabsContent value="analysis">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Grade Distribution
                  </CardTitle>
                  <CardDescription>
                    {result.analysisSummary.passedSubjects} passed ·{" "}
                    {result.analysisSummary.failedSubjects} failed ·{" "}
                    {result.analysisSummary.totalSubjects} total subjects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-8 md:flex-row">
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={gradeDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(e) => (e.value > 0 ? `${e.name}: ${e.value}` : "")}
                            outerRadius={90}
                            dataKey="value"
                          >
                            {gradeDistributionData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-1 flex-col justify-center gap-3">
                      {gradeDistributionData.map(({ name, value }, i) => (
                        <div key={name} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                            <span className="text-sm font-medium text-gray-700">Grade {name}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            {value} subject{value !== 1 ? "s" : ""}
                          </span>
                        </div>
                      ))}
                      <div className="mt-2 flex items-center gap-4 border-t pt-3">
                        <div className="flex items-center gap-1.5 text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{result.analysisSummary.passedSubjects} passed</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-red-500">
                          <XCircle className="h-4 w-4" />
                          <span>{result.analysisSummary.failedSubjects} failed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Trend tab ── */}
            <TabsContent value="trend">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Trend
                  </CardTitle>
                  <CardDescription>Academic performance across all terms</CardDescription>
                </CardHeader>
                <CardContent>
                  {trendChartData.length < 2 ? (
                    <p className="py-12 text-center text-sm text-gray-400">
                      Not enough data to show a trend — at least two terms are needed.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={380}>
                      <LineChart data={trendChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis yAxisId="left" label={{ value: "GPA / Score", angle: -90, position: "insideLeft", offset: 10 }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: "Position", angle: 90, position: "insideRight", offset: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="gpa" stroke="#6366f1" name="GPA" dot={{ r: 4 }} />
                        <Line yAxisId="left" type="monotone" dataKey="avgScore" stroke="#10b981" name="Avg Score %" dot={{ r: 4 }} />
                        <Line yAxisId="right" type="monotone" dataKey="position" stroke="#ef4444" name="Position" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Report actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Report Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button
                onClick={() => {
                  if (result)
                    exportStudentResult(result).catch(() => toast.error("Unable to download this report."))
                }}
                className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Download Report Card
              </Button>
              <Button
                onClick={() => {
                  if (result)
                    exportStudentResult(result, true).catch(() => toast.error("Unable to print this report."))
                }}
                variant="outline"
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Report Card
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
