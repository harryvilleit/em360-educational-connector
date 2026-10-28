import { useMemo } from "react"
import { useGetStudentById } from "@/hooks/studentPortal"

import { genderFromApi } from "@/utils/studentEnums"
import { initialsOfName } from "@/utils/guardianAdapter"

export interface ResolvedStudentGuardian {
  id: string
  name: string
  relationship?: string
  phone?: string
  email?: string
}

export interface ResolvedStudent {
  id: string
  name: string
  studentGivenId?: string
  class: string
  schoolClassName?: string
  schoolClassId?: string
  avatarInitials: string
  email?: string
  phone?: string
  address?: string
  isDefaultEmail?: boolean
  dob?: string
  gender?: string
  bloodGroup?: string
  genotype?: string
  guardians: ResolvedStudentGuardian[]
}

export function useResolvedStudent(
  studentId: string | undefined,
  schoolId: string
): {
  student: ResolvedStudent | undefined
  mockContentId: string | undefined
  isLoading: boolean
  isError: boolean
  refetch: () => void
} {
  const {
    student: realStudent,
    isLoading,
    isError,
    refetch,
  } = useGetStudentById({
    studentId: studentId ?? "",
    schoolId,
  })

  const student = useMemo<ResolvedStudent | undefined>(() => {
    if (!realStudent) return undefined

    const name = `${realStudent.firstname} ${realStudent.lastname}`
    return {
      id: realStudent.studentId,
      name,
      studentGivenId: realStudent.studentGivenId,
      class: [realStudent.schoolClassName, realStudent.schoolArmName]
        .filter(Boolean)
        .join(" "),
      schoolClassId: realStudent.schoolClassId,
      schoolClassName: realStudent.schoolClassName,
      avatarInitials: initialsOfName(name),
      email: realStudent.email,
      isDefaultEmail: realStudent.isDefaultEmail,
      phone: realStudent.phoneNumber,
      address: realStudent.homeAddress,
      dob: realStudent.dateofBirth,
      gender: genderFromApi(realStudent.gender),
      bloodGroup: realStudent.bloodGroup,
      genotype: realStudent.genotype,
      guardians: realStudent.guardians.map((g) => ({
        id: g.id,
        name: `${g.firstName} ${g.lastName}`,
        relationship: g.relationship,
        phone: g.phone,
        email: g.email,
      })),
    }
  }, [realStudent])

  // Legacy consumers use this key; never map a real student to a demo identity.
  return {
    student,
    mockContentId: student?.id,
    isLoading: !!studentId && !!schoolId && isLoading,
    isError,
    refetch: () => {
      void refetch()
    },
  }
}
