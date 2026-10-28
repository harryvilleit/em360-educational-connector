import { BookOpen } from "lucide-react"
import type { AcademicRecord } from "@/types/student"
import { SectionCard } from "@/components/general/ProfileSections"

export function AcademicHistorySection({
  records,
}: {
  records: AcademicRecord[]
}) {
  if (records.length === 0) return null

  return (
    <SectionCard title="Academic History" icon={BookOpen}>
      <div className="space-y-3">
        {records.map((rec, i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-100 bg-gray-50/60 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {rec.session} · {rec.term}
              </p>
              {rec.average !== undefined && (
                <span className="text-sm font-bold text-blue-600">
                  {rec.average}%
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-gray-500">Class: {rec.class}</p>
            {rec.remarks && (
              <p className="mt-1 text-xs text-gray-500">{rec.remarks}</p>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
