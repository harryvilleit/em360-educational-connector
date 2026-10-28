import type { ReactNode } from "react"
import { Check, HardDrive, School, Users } from "lucide-react"
import type { SubscriptionPlanI } from "@/api/subscriptions.api/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/utils/currency"

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlanI
  action: ReactNode
  className?: string
  current?: boolean
  pending?: boolean
  compact?: boolean
}

export default function SubscriptionPlanCard({
  plan,
  action,
  className,
  current,
  pending,
  compact,
}: SubscriptionPlanCardProps) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition-transform",
        plan.isRecommended
          ? "border-blue-600 shadow-blue-100/80 lg:-translate-y-2"
          : "border-gray-200",
        compact && "rounded-2xl p-5 lg:translate-y-0",
        className
      )}
    >
      <div className="mb-4 flex min-h-6 items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {plan.isRecommended && (
            <Badge className="border-0 bg-blue-600 text-white">
              Most popular
            </Badge>
          )}
          {current && (
            <Badge className="border-0 bg-emerald-100 text-emerald-700">
              Current plan
            </Badge>
          )}
          {pending && !current && (
            <Badge className="border-0 bg-amber-100 text-amber-700">
              Pending payment
            </Badge>
          )}
        </div>
        <School className="size-5 shrink-0 text-gray-400" />
      </div>

      <h2 className="text-xl font-bold text-gray-950">{plan.name}</h2>
      <p className="mt-2 min-h-10 text-sm leading-6 text-gray-600">
        {plan.description}
      </p>

      <div className="mt-6">
        <p className="text-4xl font-bold tracking-tight text-gray-950">
          {formatCurrency(plan.pricePerUserPerMonth, plan.currency, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="mt-1 text-sm font-medium text-gray-600">
          per student per month
        </p>
        <p className="mt-1 text-xs text-gray-500">
          billed monthly for each active student; staff are included
        </p>
      </div>

      <div className="my-5 grid grid-cols-3 gap-2 rounded-2xl bg-gray-50 p-3 text-center">
        <div>
          <Users className="mx-auto mb-1 size-4 text-blue-600" />
          <p className="text-xs font-semibold text-gray-900">
            {plan.maxStudents?.toLocaleString() ?? "Unlimited"}
          </p>
          <p className="text-[11px] text-gray-500">students</p>
        </div>
        <div className="border-x border-gray-200">
          <Users className="mx-auto mb-1 size-4 text-indigo-600" />
          <p className="text-xs font-semibold text-gray-900">
            {plan.maxStaff?.toLocaleString() ?? "Unlimited"}
          </p>
          <p className="text-[11px] text-gray-500">staff</p>
        </div>
        <div>
          <HardDrive className="mx-auto mb-1 size-4 text-violet-600" />
          <p className="text-xs font-semibold text-gray-900">
            {plan.storageLimitGb.toLocaleString()} GB
          </p>
          <p className="text-[11px] text-gray-500">file storage</p>
        </div>
      </div>

      <ul className="mb-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature.code} className="flex gap-2.5 text-sm text-gray-700">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <Check className="size-3.5 text-blue-600" strokeWidth={3} />
            </span>
            <span>{feature.name}</span>
          </li>
        ))}
      </ul>

      {action}
    </article>
  )
}
