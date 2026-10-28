import { Check } from "lucide-react"

export interface StepTabItem {
  key: "basic" | "standard" | "advanced"
  title: string
  subtitle: string
}

interface StepTabsProps {
  steps: StepTabItem[]
  activeStep: StepTabItem["key"]
  isStepComplete: (key: StepTabItem["key"]) => boolean
  isStepEnabled: (key: StepTabItem["key"]) => boolean
  onStepChange: (key: StepTabItem["key"]) => void
}

export function StepTabs({
  steps,
  activeStep,
  isStepComplete,
  isStepEnabled,
  onStepChange,
}: StepTabsProps) {
  return (
    <div className="border-b border-gray-100 px-4 sm:px-6">
      <div className="flex gap-1 overflow-x-auto sm:gap-2">
        {steps.map((step, index) => {
          const completed = isStepComplete(step.key)
          const enabled = isStepEnabled(step.key)
          const active = activeStep === step.key

          return (
            <button
              key={step.key}
              type="button"
              disabled={!enabled}
              onClick={() => onStepChange(step.key)}
              aria-current={active ? "step" : undefined}
              className={`flex min-w-0 flex-1 items-center gap-3 border-b-2 px-2 py-4 text-left transition-colors sm:flex-initial sm:px-3 ${
                active
                  ? "border-blue-600"
                  : "border-transparent hover:border-gray-200"
              } ${!enabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  completed
                    ? "bg-emerald-100 text-emerald-700"
                    : active
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                {completed ? <Check className="size-4" /> : index + 1}
              </span>
              <span className="min-w-0">
                <p
                  className={`truncate text-sm font-semibold ${
                    active ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
                <p className="hidden truncate text-xs text-gray-400 sm:block">
                  {step.subtitle}
                </p>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
