import { PageHeader } from "@/components/general/PageHeader"
import { MyStaffAvailability } from "@/components/timetable/StaffAvailability"

export default function MyAvailabilityPage() {
  return (
    <div className="space-y-5">
      <PageHeader title="My Availability" description="Share your available hours for each school week." />
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <MyStaffAvailability />
      </div>
    </div>
  )
}
