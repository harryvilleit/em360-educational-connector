import type { ElementType } from "react"

export function EmptyPlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      <p className="mt-1 max-w-48 text-xs text-gray-500">{description}</p>
    </div>
  )
}
