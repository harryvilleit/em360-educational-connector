import type { ElementType, ReactNode } from "react"

type StepRowProps = {
  index: number
  isLast?: boolean
  accent: "slate" | "blue"
  icon: ElementType
  title: string
  subtitle?: string
  children: ReactNode
}

export function StepRow({
  index,
  isLast,
  accent,
  icon: Icon,
  title,
  subtitle,
  children,
}: StepRowProps) {
  return (
    <>
      <div className="flex flex-col items-center">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
            accent === "blue" ? "bg-blue-600" : "bg-gray-900"
          }`}
        >
          {index}
        </div>
        {!isLast && <div className="my-1 w-px flex-1 bg-gray-200" />}
      </div>
      <div className={isLast ? "" : "pb-8"}>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2.5">
            <Icon
              className={`size-4 shrink-0 ${accent === "blue" ? "text-blue-600" : "text-gray-400"}`}
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
            </div>
          </div>
          {children}
        </div>
      </div>
    </>
  )
}
