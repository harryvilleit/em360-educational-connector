// WordPress version: Edit saves the teacher's qualification and employment type to the school record.
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Mail, Phone } from "lucide-react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { format } from "date-fns"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetTeacherDetails,
  useGetTeacherSubjects,
  useGetTeacherDepartments,
} from "@/hooks/examAndRecords"
import { PageHeader } from "@/components/general/PageHeader"
import {
  ProfileHero,
  ProfileSkeleton,
  ProfileNotFound,
} from "@/components/general/ProfileSections"
import EditTeacherProfileDialog from "../../../../exams/EditTeacherProfileDialog"
import DeleteTeacherConfirmationModal from "@/pages/Dashboard/ExamsAndRecords/components/DeleteTeacherConfirmationModal"

import { AssignedSubjectsCard } from "@/pages/Dashboard/ExamsAndRecords/components/AssignedSubjectsCard"
import { AssignedClassesCard } from "@/pages/Dashboard/ExamsAndRecords/components/AssignedClassesCard"
import { AssignedDepartmentsCard } from "@/pages/Dashboard/ExamsAndRecords/components/AssignedDepartmentsCard"

import { TeacherContactInfoCard } from "@/pages/Dashboard/ExamsAndRecords/components/TeacherContactInfoCard"

export default function ManageTeacherDetailPage() {
  const navigate = useNavigate()
  const { productId, teacherId } = useParams<{
    productId: string
    teacherId: string
  }>()
  const schoolId = useSchoolId()
  const [searchParams, setSearchParams] = useSearchParams()

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const { teacher, isLoading } = useGetTeacherDetails({
    subUserId: teacherId ?? "",
    schoolId,
  })

  const { teacherSubjects, isLoading: isLoadingSubjects } =
    useGetTeacherSubjects(teacher?.productUserSubUserId ?? "")

  const { teacherDepartments, isLoading: isLoadingDepartments } =
    useGetTeacherDepartments(teacher?.productUserSubUserId ?? "")

  useEffect(() => {
    if (teacher && searchParams.get("edit") === "1") {
      setIsEditModalOpen(true)
      searchParams.delete("edit")
      setSearchParams(searchParams, { replace: true })
    }
  }, [teacher, searchParams, setSearchParams])

  const fullName = teacher
    ? `${teacher.firstName} ${teacher.lastName}`.trim()
    : "—"

  const handleDeleteTeacher = () => {
    navigate(`/dashboard/${productId}/exams_and_records/manage-teachers`)
  }

  if (isLoading) return <ProfileSkeleton />

  if (!teacher) {
    return (
      <ProfileNotFound
        title="Teacher Not Found"
        message="This teacher doesn't exist or has been removed."
        backLabel="Back to Teachers"
        onBack={() =>
          navigate(`/dashboard/${productId}/exams_and_records/manage-teachers`)
        }
      />
    )
  }

  const initials =
    teacher.firstName && teacher.lastName
      ? `${teacher.firstName[0]}${teacher.lastName[0]}`.toUpperCase()
      : "—"

  return (
    <div className="space-y-6">
      <PageHeader
        title={fullName}
        onBack={() =>
          navigate(`/dashboard/${productId}/exams_and_records/manage-teachers`)
        }
        backLabel="Teachers"
      />

      <ProfileHero
        avatarInitials={initials}
        name={fullName}
        badge={
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              teacher.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {teacher.status || "Pending"}
          </span>
        }
        subtitle={teacher.employmentType}
        meta={
          <>
            {teacher.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-gray-400" />
                {teacher.email}
              </span>
            )}
            {teacher.phoneNumber && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-gray-400" />
                {teacher.phoneNumber}
              </span>
            )}
            {teacher.dateCreated && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                Joined {format(new Date(teacher.dateCreated), "MMM d, yyyy")}
              </span>
            )}
          </>
        }
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="cursor-pointer gap-2 border-gray-300"
              onClick={() =>
                navigate(
                  `/dashboard/${productId}/exams_and_records/manage-teachers/${teacherId}/timetable`
                )
              }
            >
              <Calendar className="h-4 w-4" />
              View Timetable
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer gap-2 border-gray-300"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          </div>
        }
      />

      <TeacherContactInfoCard teacher={teacher} />

      <div className="grid gap-6 md:grid-cols-3">
        <AssignedSubjectsCard
          teacherSubjects={teacherSubjects}
          isLoadingSubjects={isLoadingSubjects}
        />

        <AssignedClassesCard assignedClasses={teacher.assignedClasses} />

        <AssignedDepartmentsCard
          teacherDepartments={teacherDepartments}
          isLoadingDepartments={isLoadingDepartments}
        />
      </div>

      <EditTeacherProfileDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        teacher={teacher}
        schoolId={schoolId}
      />

      <DeleteTeacherConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        teacherName={fullName}
        onConfirm={handleDeleteTeacher}
      />
    </div>
  )
}
