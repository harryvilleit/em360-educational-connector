import { Building2, MapPin } from "lucide-react"
import type { SchoolProfile } from "../../types"

export function SchoolProfileCard({ profile }: { profile: SchoolProfile }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6">
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50">
          <Building2 className="size-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {profile.name || "School"}
          </h2>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            {profile.registrationNumber && (
              <span>Reg. No: {profile.registrationNumber}</span>
            )}
            {(profile.lga || profile.state) && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {[profile.lga, profile.state].filter(Boolean).join(", ")}
              </span>
            )}
            {profile.address && <span>{profile.address}</span>}
          </p>
        </div>
      </div>
      {profile.status && (
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
          {profile.status}
        </span>
      )}
    </section>
  )
}
