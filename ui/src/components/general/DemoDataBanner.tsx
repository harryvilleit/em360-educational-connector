import { Sparkles } from "lucide-react"

export function DemoDataBanner({
  message = "Showing demo data — your account isn't linked to a record at this school yet.",
}: {
  message?: string
}) {
  return (
    <div className="mb-5 flex items-center gap-2 rounded-xl border border-dashed border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
      <Sparkles className="size-3.5 shrink-0" />
      {message}
    </div>
  )
}
