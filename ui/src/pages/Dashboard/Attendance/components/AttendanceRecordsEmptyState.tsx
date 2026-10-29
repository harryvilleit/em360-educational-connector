import { CalendarDays } from "lucide-react"

export default function AttendanceRecordsEmptyState({
  message,
  alert = false,
}: {
  message: string
  alert?: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-20 text-center">
      <CalendarDays className="mb-2 size-10 text-gray-300" />
      <p
        role={alert ? "alert" : undefined}
        className={alert ? "text-sm text-red-600" : "text-sm text-gray-500"}
      >
        {message}
      </p>
    </div>
  )
}
