import { Briefcase } from "lucide-react"
import { format } from "date-fns"
import type { TeacherDetailsValueI } from "@/api/examAndRecords.api/types"
import { SectionCard, ProfileField } from "@/components/general/ProfileSections"

interface TeacherContactInfoCardProps {
  teacher: TeacherDetailsValueI
}

export function TeacherContactInfoCard({
  teacher,
}: TeacherContactInfoCardProps) {
  return (
    <SectionCard title="Contact & Professional Info" icon={Briefcase}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <ProfileField label="Email Address" value={teacher.email} />
        <ProfileField label="Phone Number" value={teacher.phoneNumber} />
        <ProfileField label="Status" value={teacher.status || "Pending"} />
        <ProfileField label="Employment Type" value={teacher.employmentType} />
        <ProfileField label="Qualification" value={teacher.qualification} />
        <ProfileField
          label="Date Joined"
          value={
            teacher.dateCreated
              ? format(new Date(teacher.dateCreated), "MMM d, yyyy")
              : undefined
          }
        />
      </div>
    </SectionCard>
  )
}
