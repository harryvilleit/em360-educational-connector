import { User } from "lucide-react"
import { SectionCard, ProfileField } from "@/components/general/ProfileSections"
import { useGetClassTeachers } from "@/hooks/examAndRecords"

export default function StudentClassTeachersSection({
  schoolId,
  classId,
  className,
}: {
  schoolId: string
  classId: string
  className: string
}) {
  const { classTeachers, isLoading, isError } = useGetClassTeachers({
    schoolId,
    classId,
  })

  return (
    <SectionCard title="Class Teachers" icon={User}>
      {isLoading ? (
        <p className="text-xs text-gray-400">Loading class teachers...</p>
      ) : isError ? (
        <p role="alert" className="text-xs text-red-600">
          Class teachers could not be loaded. Please try again.
        </p>
      ) : classTeachers.length === 0 ? (
        <p className="text-xs text-gray-400">
          No teachers assigned to this class.
        </p>
      ) : (
        <div className="space-y-4">
          {classTeachers.map((teacher) => (
            <div key={teacher.id} className="grid grid-cols-2 gap-4">
              <ProfileField label="Name" value={teacher.subUserName} />
              <ProfileField label="Class" value={className} />
              <ProfileField label="Email" value={teacher.subUserEmail} />
              <ProfileField label="Status" value={teacher.statusName} />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}
