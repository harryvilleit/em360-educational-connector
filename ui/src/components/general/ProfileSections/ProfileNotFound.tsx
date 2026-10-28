import { UserX } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProfileNotFound({
  title,
  message,
  backLabel,
  onBack,
}: {
  title: string
  message: string
  backLabel: string
  onBack: () => void
}) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
          <UserX className="h-12 w-12 text-gray-400" strokeWidth={1.5} />
        </div>
      </div>

      <div className="max-w-md text-center">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">{title}</h2>
        <p className="mb-8 leading-relaxed text-gray-500">{message}</p>
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2 rounded-full px-6"
        >
          {backLabel}
        </Button>
      </div>
    </div>
  )
}
