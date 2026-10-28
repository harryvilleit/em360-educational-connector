import { UserX } from "lucide-react"

export function StudentNotLinked({
  message = "Your account isn't linked to a student record at this school yet. Please ask the school to link your login to your student profile.",
}: {
  message?: string
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center"
    >
      <UserX className="mb-3 size-8 text-gray-300" />
      <p className="text-sm font-medium text-gray-600">
        Student account not linked
      </p>
      <p className="mt-1 max-w-md text-xs text-gray-400">{message}</p>
    </div>
  )
}
