import { PageHeader } from "@/components/general/PageHeader"
import { StudentGate } from "./StudentGate"

export default function StudentCafeteriaPage() {
  return (
    <StudentGate>
      {({ student }) => (
        <div>
          <PageHeader
            title="My Cafeteria"
            description={`${student.name} — ${student.class}`}
            className="mb-7"
          />
          <p
            role="status"
            className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-muted-foreground"
          >
            Cafeteria details for students aren't available yet.
          </p>
        </div>
      )}
    </StudentGate>
  )
}
