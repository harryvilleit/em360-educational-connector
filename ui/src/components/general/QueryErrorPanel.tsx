import { Button } from "@/components/ui/button"

export function QueryErrorPanel({
  title,
  message,
  onRetry,
}: {
  title: string
  message: string
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-6"
    >
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-700">{message}</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
