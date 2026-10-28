import { BellRing, Info } from "lucide-react"
import SettingsCard from "./SettingsCard"

export default function NotificationSettings() {
  return (
    <SettingsCard
      title="School Notifications"
      description="Email, SMS and background alerts for school activity."
    >
      <div className="flex gap-4 rounded-xl border border-blue-100 bg-blue-50/60 p-5">
        <BellRing className="size-6 shrink-0 text-blue-600" />
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Notification preferences are coming soon
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Calendar events are already visible to administrators, students and
            parents. Delivery preferences will be enabled when the background
            notification service and audited subscription API are connected.
          </p>
          <p className="mt-3 flex gap-1.5 text-xs text-blue-700">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            No preference is shown as saved until the server can persist it.
          </p>
        </div>
      </div>
    </SettingsCard>
  )
}
