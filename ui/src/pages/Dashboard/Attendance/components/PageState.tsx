import type { ReactNode } from "react"
import { CalendarDays } from "lucide-react"

export default function PageState({
  message,
  children,
}: {
  message: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <CalendarDays className="mb-3 size-12 text-gray-300" />
      <p className="text-sm text-gray-500">{message}</p>
      {children}
    </div>
  )
}
