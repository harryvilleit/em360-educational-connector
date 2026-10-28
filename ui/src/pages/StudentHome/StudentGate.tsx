import type { ReactNode } from "react"
import { DemoDataBanner } from "@/components/general/DemoDataBanner"
import { QueryErrorPanel } from "@/components/general/QueryErrorPanel"
import { StudentNotLinked } from "@/components/general/StudentNotLinked"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useCurrentStudentId } from "@/hooks/useCurrentStudentId"
import {
  useResolvedStudent,
  type ResolvedStudent,
} from "@/hooks/useResolvedStudent"
import { useStudentPortal } from "@/hooks/useStudentPortal"
import type { SelectedStudentClassI } from "@/store/studentPortalFilter.store"
import type {
  StudentPortalLaunchDataI,
  StudentPortalLaunchSessionI,
  StudentPortalLaunchTermI,
} from "@/api/studentPortal.api/types"

export interface StudentGateContext {
  studentId: string
  schoolId: string
  isLinked: boolean
  student: ResolvedStudent
  mockContentId: string
  launch: StudentPortalLaunchDataI | undefined
  isLaunchLoading: boolean
  sessions: StudentPortalLaunchSessionI[]
  selectedSession: StudentPortalLaunchSessionI | undefined
  selectedTerm: StudentPortalLaunchTermI | undefined
  selectedClass: SelectedStudentClassI | null
  selectSession: (id: string) => void
  selectTerm: (id: string) => void
  selectClass: (cls: SelectedStudentClassI | null) => void
}

interface StudentGateProps {
  children: (ctx: StudentGateContext) => ReactNode
}

export function StudentGate({ children }: StudentGateProps) {
  const schoolId = useSchoolId()
  const {
    studentId,
    isLinked,
    isLoading: idLoading,
    isError: idError,
    refetch: refetchIdentity,
  } = useCurrentStudentId(schoolId)
  const {
    student,
    mockContentId,
    isLoading: studentLoading,
    isError: studentError,
    refetch: refetchStudent,
  } = useResolvedStudent(studentId, schoolId)
  const {
    launch,
    isLoading: isLaunchLoading,
    isError: launchError,
    refetch: refetchLaunch,
    sessions,
    selectedSession,
    selectedTerm,
    selectedClass,
    selectSession,
    selectTerm,
    selectClass,
  } = useStudentPortal(schoolId)

  if (idLoading || studentLoading) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
    )
  }

  if (!isLinked) return <StudentNotLinked />

  if (!student || !mockContentId) {
    if (idError || studentError || launchError) {
      return (
        <QueryErrorPanel
          title="Unable to load your student record"
          message="Your school information could not be retrieved. Please try again."
          onRetry={() => {
            if (idError) void refetchIdentity()
            if (studentError) refetchStudent()
            if (launchError) refetchLaunch()
          }}
        />
      )
    }
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        Your account is not linked to a student record at this school. Please
        contact your school administrator.
      </div>
    )
  }

  if (launchError) {
    return (
      <QueryErrorPanel
        title="Unable to load your school information"
        message="Your classes and subjects could not be retrieved. Please try again."
        onRetry={refetchLaunch}
      />
    )
  }

  return (
    <>
      {children({
        studentId,
        schoolId,
        isLinked,
        student,
        mockContentId,
        launch,
        isLaunchLoading,
        sessions,
        selectedSession,
        selectedTerm,
        selectedClass,
        selectSession,
        selectTerm,
        selectClass,
      })}
    </>
  )
}
