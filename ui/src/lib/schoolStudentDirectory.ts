import { getAllClassesApi } from "@/api/examAndRecords.api"
import { fetchAllPages } from "@/lib/fetchAllPages"
import type { GetAllClassesResponseI } from "@/api/examAndRecords.api/types"
import { getClassAttendanceRosterApi } from "@/api/studentAttendance.api"
import { formatDate } from "@/utils"

export type DirectoryStudent = {
  studentId: string
  studentGivenId: string
  fullName: string
  profilePicture: string | null
  classId: string
  className: string
}

/** One class's roster, with photos — the only student endpoint that has both. */
export async function fetchClassStudentDirectory(
  schoolId: string,
  classId: string,
  className: string
): Promise<DirectoryStudent[]> {
  const res = await getClassAttendanceRosterApi({
    schoolClassId: classId,
    schoolId,
    attendanceDate: formatDate(new Date(), "YYYY-MM-DD"),
  })
  return res.value.students.map((student) => ({
    studentId: student.studentId,
    studentGivenId: student.studentGivenId,
    fullName: student.fullName,
    profilePicture: student.profilePicture,
    classId,
    className: res.value.schoolClassName || className,
  }))
}

/**
 * Every student in the school, with photos, built by fetching each class's
 * roster — no single "all students" endpoint returns a photo today.
 */
export async function fetchSchoolStudentDirectory(
  schoolId: string
): Promise<DirectoryStudent[]> {
  const classes = await fetchAllPages(async (pageNumber, pageSize) => {
    const res = (await getAllClassesApi({
      schoolId,
      pageNumber,
      pageSize,
    })) as GetAllClassesResponseI
    return {
      items: res.Value?.Items ?? [],
      totalPages: res.Value?.TotalPages ?? 1,
    }
  })
  const rosters = await Promise.all(
    classes.map((cls) =>
      fetchClassStudentDirectory(schoolId, cls.Id, cls.ClsName)
    )
  )
  return rosters.flat()
}
