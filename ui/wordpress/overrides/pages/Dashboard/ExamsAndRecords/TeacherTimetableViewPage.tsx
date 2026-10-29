// WordPress version: assignments are read by the teacher's product user ID.
import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useQueries } from "@tanstack/react-query"
import { BookOpen, ClipboardCheck, Clock, Loader2, MapPin } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { PageHeader } from "@/components/general/PageHeader"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import {
  useGetTeacherClasses,
  useGetTeacherDetails,
  useGetTeacherSubjects,
} from "@/hooks/examAndRecords"
import { getTimetableByWeekApi, getAllTimetablesApi } from "@/api/timetable.api"
import { queryKeys } from "@/utils/queryKeys"
import {
  TIMETABLE_TYPE,
  currentWeekMonday,
  normalizeTimetableType,
  resolveDayName,
} from "@/pages/Dashboard/Timetable/timetable.utils"
import { WeekStrip } from "@/pages/Dashboard/Timetable/components/WeekStrip"
import type { DayName } from "@/types/timetable"
import type { TimetableSlotI } from "@/api/timetable.api/types"

const DAYS: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

type Tab = "schedule" | "assessment"

export default function TeacherTimetableViewPage() {
  const navigate = useNavigate()
  const { productId, teacherId } = useParams<{ productId: string; teacherId: string }>()
  const schoolId = useSchoolId()

  const [activeTab, setActiveTab] = useState<Tab>("schedule")
  const [activeDay, setActiveDay] = useState<DayName>("Monday")
  const [weekStart, setWeekStart] = useState(() => currentWeekMonday())

  const { teacher, isLoading } = useGetTeacherDetails({
    subUserId: teacherId ?? "",
    schoolId,
  })
  const fullName = teacher ? `${teacher.firstName} ${teacher.lastName}`.trim() : ""

  // "My schedule" is approximated from real assignment data — the class +
  // subject combinations this teacher is assigned to — since timetable
  // slots no longer carry a teacherId/teacherName to filter on directly.
  // Class and subject assignments are keyed by the staff member's product user ID,
  // not the sub-user ID in the address.
  const assignmentId = teacher?.productUserSubUserId ?? ""
  const { teacherClasses } = useGetTeacherClasses(assignmentId)
  const { teacherSubjects } = useGetTeacherSubjects(assignmentId)
  const taughtSubjectIds = useMemo(
    () => new Set(teacherSubjects.map((s) => s.subjectId)),
    [teacherSubjects]
  )

  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 100 })
  const currentSession =
    sessions.find((s) => s.IsCurrent || s.Status === "Active") ?? sessions[0]
  const currentTerm =
    currentSession?.Terms.find((t) => t.IsCurrent) ?? currentSession?.Terms[0]

  const isReady =
    !!(schoolId && currentSession && currentTerm) && teacherClasses.length > 0

  const scheduleQueries = useQueries({
    queries: teacherClasses.map((c) => {
      const params = {
        schoolId,
        sessionId: currentSession?.Id,
        termId: currentTerm?.Id,
        classId: c.classId,
        weekStartDate: weekStart,
      }
      return {
        queryKey: [queryKeys.timetable, "by-week", params],
        queryFn: () => getTimetableByWeekApi(params),
        enabled: isReady,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      }
    }),
  })

  function upcomingQueriesFor(type: number) {
    return teacherClasses.map((c) => {
      const params = {
        schoolId,
        sessionId: currentSession?.Id,
        termId: currentTerm?.Id,
        classId: c.classId,
        timetableType: type,
        dateFrom: new Date().toISOString().split("T")[0],
        pageSize: 200,
      }
      return {
        queryKey: [queryKeys.timetable, "all", params],
        queryFn: () => getAllTimetablesApi(params),
        enabled: isReady,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      }
    })
  }

  const assessmentQueries = useQueries({
    queries: upcomingQueriesFor(TIMETABLE_TYPE.Assessment),
  })

  const timetablesLoading =
    scheduleQueries.some((q) => q.isLoading) ||
    assessmentQueries.some((q) => q.isLoading)

  const scheduleByDay = useMemo(() => {
    const schedule: Record<DayName, { className: string; slot: TimetableSlotI }[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    }

    scheduleQueries.forEach((q, i) => {
      const value = q.data?.value
      if (!value) return
      value.slots.forEach((slot) => {
        if (normalizeTimetableType(slot.timetableType) !== TIMETABLE_TYPE.Class) return
        if (!slot.subjectId || !taughtSubjectIds.has(slot.subjectId)) return
        const dayName = slot.dayOfWeekName as DayName
        if (!DAYS.includes(dayName)) return
        schedule[dayName].push({ className: teacherClasses[i]?.className ?? "", slot })
      })
    })

    Object.values(schedule).forEach((entries) =>
      entries.sort((a, b) => a.slot.startTime.localeCompare(b.slot.startTime))
    )

    return schedule
  }, [scheduleQueries, teacherClasses, taughtSubjectIds])

  const myAssessments = useMemo(
    () =>
      assessmentQueries
        .flatMap((q, i) =>
          (q.data?.value?.items ?? [])
            .filter((s) => s.subjectId && taughtSubjectIds.has(s.subjectId))
            .map((s) => ({ ...s, className: teacherClasses[i]?.className ?? "" }))
        )
        .sort((a, b) => a.date.localeCompare(b.date)),
    [assessmentQueries, teacherClasses, taughtSubjectIds]
  )

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading teacher timetable…</span>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">Teacher not found.</div>
    )
  }

  return (
    <div>
      <PageHeader
        title="My Timetable"
        description={fullName}
        onBack={() =>
          navigate(`/dashboard/${productId}/exams_and_records/manage-teachers/${teacherId}`)
        }
        className="mb-7"
      />

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1">
        {(
          [
            { key: "schedule", label: "Teaching Schedule", icon: BookOpen },
            { key: "assessment", label: "Assessments (My Classes)", icon: ClipboardCheck },
          ] as { key: Tab; label: string; icon: typeof BookOpen }[]
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              activeTab === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {timetablesLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {activeTab === "schedule" && (
            <>
              <WeekStrip
                weekStart={weekStart}
                onChange={setWeekStart}
                termStart={currentTerm?.StartDate?.slice(0, 10)}
                termEnd={currentTerm?.EndDate?.slice(0, 10)}
              />

              <div className="mb-4 mt-4 flex gap-2 overflow-x-auto pb-1">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`shrink-0 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                      activeDay === day
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                  <p className="text-sm font-semibold text-gray-900">{activeDay}</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {scheduleByDay[activeDay].length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                      No classes scheduled for {activeDay}.
                    </p>
                  ) : (
                    scheduleByDay[activeDay].map(({ className, slot }, i) => (
                      <div key={i} className="flex items-center gap-4 px-5 py-3">
                        <div className="w-24 shrink-0 text-xs text-gray-400">
                          <p>{slot.startTime}</p>
                          <p>{slot.endTime}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{slot.subjectName}</p>
                          <p className="text-xs text-gray-400">{className}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "assessment" && (
            <ScheduleList
              entries={myAssessments.map((e) => ({
                date: e.date.slice(0, 10),
                day: resolveDayName(e) ?? "",
                subject: e.subjectName,
                time: e.endTime ? `${e.startTime} – ${e.endTime}` : e.startTime,
                venue: e.venue,
                assessmentType: e.assessmentType,
                studentClass: e.className,
              }))}
              emptyLabel="No assessments scheduled for your classes"
            />
          )}
        </>
      )}
    </div>
  )
}

function ScheduleList({
  entries,
  emptyLabel,
}: {
  entries: {
    date: string
    day: string
    subject: string
    time: string
    venue?: string
    assessmentType?: string
    studentClass: string
  }[]
  emptyLabel: string
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-center">
        <p className="text-sm font-medium text-gray-500">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="divide-y divide-gray-100">
        {entries.map((entry, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-20 shrink-0">
                <p className="text-sm font-semibold text-gray-800">{entry.date}</p>
                <p className="text-xs text-gray-400">{entry.day}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{entry.subject}</p>
                <p className="text-xs text-gray-400">{entry.studentClass}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {entry.time}
              </span>
              {entry.venue && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {entry.venue}
                </span>
              )}
              {entry.assessmentType && (
                <span className="flex items-center gap-1">{entry.assessmentType}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
