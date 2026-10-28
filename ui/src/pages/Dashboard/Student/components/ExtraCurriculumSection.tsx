import { GraduationCap } from "lucide-react"
import { SectionCard } from "@/components/general/ProfileSections"

export function ExtracurricularsSection({
  activities,
}: {
  activities: string[]
}) {
  if (activities.length === 0) return null

  return (
    <SectionCard title="Extracurricular Activities" icon={GraduationCap}>
      <div className="flex flex-wrap gap-2">
        {activities.map((activity) => (
          <span
            key={activity}
            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
          >
            {activity}
          </span>
        ))}
      </div>
    </SectionCard>
  )
}
