// WordPress version: the two timetable types the school's timetable actually supports.
// The main site's editable list lives only in browser storage, so it is not offered here.
import { Lock } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"

const TYPES = [
  ["Class Timetable", "Weekly lessons, breaks and other class periods."],
  ["Assessment Timetable", "Dated tests, examinations and continuous assessments."],
] as const

export default function TimetableTypesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Timetable Types" description="The timetable types available for your school." />
      <div className="divide-y rounded-2xl border border-gray-100 bg-white">
        {TYPES.map(([name, description]) => (
          <div key={name} className="flex items-center justify-between gap-4 p-6">
            <div>
              <h2 className="font-semibold">{name}</h2>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
            <span className="flex items-center gap-2 text-xs text-gray-500">
              <Lock size={14} />
              Predefined
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
