import { useMemo } from "react"
import { useCurrentStudentId } from "./useCurrentStudentId"
import { useGetStudentPortalLaunch } from "./studentPortal"
import { useStudentPortalSelection } from "./useStudentPortalSelection"
import type { SelectedStudentClassI } from "@/store/studentPortalFilter.store"
import type {
  StudentPortalLaunchClassI,
  StudentPortalLaunchDataI,
  StudentPortalLaunchSessionI,
  StudentPortalLaunchTermI,
} from "@/api/studentPortal.api/types"

function toSelectedClass(c: StudentPortalLaunchClassI): SelectedStudentClassI {
  return {
    enrollmentId: c.enrollmentId,
    schoolClassId: c.schoolClassId,
    className: c.className,
    schoolArmId: c.schoolArmId,
    armName: c.armName,
    isPrimaryClass: c.isPrimaryClass,
    classType: c.classType,
    isCurrent: c.isCurrent,
  }
}

function currentClassForLaunch(
  launch: StudentPortalLaunchDataI | undefined,
  classes: StudentPortalLaunchClassI[]
): StudentPortalLaunchClassI | undefined {
  if (!launch) return undefined
  if (launch.currentSchoolClassId) {
    return (
      classes.find((c) => c.schoolClassId === launch.currentSchoolClassId) ?? {
        enrollmentId: "",
        schoolClassId: launch.currentSchoolClassId,
        className: launch.currentClassName ?? "",
        schoolArmId: launch.currentSchoolArmId ?? null,
        armName: launch.currentSchoolArmName ?? null,
        isPrimaryClass: false,
        classType: "",
        isCurrent: true,
      }
    )
  }
  return classes.find((c) => c.isCurrent)
}
export interface UseStudentPortalResult {
  studentId: string
  schoolId: string
  isLinked: boolean
  launch: StudentPortalLaunchDataI | undefined
  isLoading: boolean
  isError: boolean
  refetch: () => void
  sessions: StudentPortalLaunchSessionI[]
  selectedSession: StudentPortalLaunchSessionI | undefined
  selectedTerm: StudentPortalLaunchTermI | undefined
  selectedClass: SelectedStudentClassI | null
  selectSession: (id: string) => void
  selectTerm: (id: string) => void
  selectClass: (cls: SelectedStudentClassI | null) => void
}

/**
 * Bootstraps the Student Portal from a single `StudentPortal/LaunchSchool`
 * call — every session/term/class-aware page reads its selection from here
 * instead of independently fetching sessions, terms, or enrolled classes.
 * React Query caches the launch payload by studentId+schoolId, so calling
 * this from several pages during navigation reuses the same cached result.
 */
export function useStudentPortal(schoolId: string): UseStudentPortalResult {
  const {
    studentId,
    isLinked,
    isLoading: idLoading,
    isError: idError,
    refetch: refetchIdentity,
  } = useCurrentStudentId(schoolId)

  const {
    launch,
    isLoading: launchLoading,
    isError,
    refetch: refetchLaunch,
  } = useGetStudentPortalLaunch(
    isLinked ? studentId : undefined,
    isLinked ? schoolId : undefined
  )

  const {
    selectedSessionId,
    selectedTermId,
    selectedClass: storedClass,
    selectSession,
    selectTerm,
    selectClass,
  } = useStudentPortalSelection(studentId)

  const sessions = useMemo(() => launch?.sessions ?? [], [launch])

  const defaultSession = useMemo(
    () =>
      sessions.find((s) =>
        launch?.currentSessionId
          ? s.sessionId === launch.currentSessionId
          : s.isCurrentSession
      ),
    [launch, sessions]
  )
  const selectedSession =
    sessions.find((s) => s.sessionId === selectedSessionId) ?? defaultSession

  const terms = useMemo(() => selectedSession?.terms ?? [], [selectedSession])
  const defaultTerm = useMemo(
    () =>
      terms.find((t) =>
        launch?.currentTermId
          ? t.schoolSessionTermId === launch.currentTermId
          : t.isCurrentTerm
      ),
    [launch, terms]
  )
  const selectedTerm =
    terms.find((t) => t.schoolSessionTermId === selectedTermId) ?? defaultTerm

  const termClasses = useMemo(() => selectedTerm?.classes ?? [], [selectedTerm])
  const defaultClass = useMemo(() => {
    const current = currentClassForLaunch(launch, termClasses)
    return current ? toSelectedClass(current) : null
  }, [launch, termClasses])

  const isStoredClassValid =
    !!storedClass &&
    termClasses.some((c) => c.enrollmentId === storedClass.enrollmentId)
  const selectedClass = isStoredClassValid ? storedClass : defaultClass

  return {
    studentId,
    schoolId,
    isLinked,
    launch,
    isLoading: idLoading || (isLinked && launchLoading),
    isError: idError || isError,
    refetch: () => {
      if (idError) void refetchIdentity()
      else if (isLinked) void refetchLaunch()
    },
    sessions,
    selectedSession,
    selectedTerm,
    selectedClass,
    selectSession,
    selectTerm,
    selectClass,
  }
}
