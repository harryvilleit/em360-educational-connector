import { AlertTriangle } from "lucide-react"
import type { WelfareRecord } from "@/types/student"
import { SectionCard } from "@/components/general/ProfileSections"

export function WelfareSection({ records }: { records: WelfareRecord[] }) {
  if (records.length === 0) return null

  return (
    <SectionCard title="Welfare Records" icon={AlertTriangle}>
      <div className="space-y-3">
        {records.map((rec, i) => (
          <div
            key={i}
            className={`rounded-xl border p-3 ${
              rec.resolved
                ? "border-emerald-100 bg-emerald-50/60"
                : "border-orange-100 bg-orange-50/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">
                {rec.type}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  rec.resolved
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {rec.resolved ? "Resolved" : "Open"}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-600">{rec.description}</p>
            <p className="mt-1 text-xs text-gray-400">
              {rec.date}
              {rec.reportedBy ? ` · ${rec.reportedBy}` : ""}
            </p>
            {rec.resolved && rec.resolution && (
              <p className="mt-1 text-xs text-emerald-700">
                Resolution: {rec.resolution}
              </p>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
