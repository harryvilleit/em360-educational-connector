import { ArrowRight, ArrowUpCircle } from "lucide-react"
import { Can } from "@/components/general/Can"
import { Button } from "@/components/ui/button"
import { DashboardRoutes } from "@/routes"

type PromotionActionBarProps = {
  selectedIdsSize: number
  sourceClassName?: string
  sourceArmName?: string
  targetClassName?: string
  targetArmName?: string
  productId?: string
  isPending: boolean
  canPromote: boolean
  onPromote: () => void
}

export function PromotionActionBar({
  selectedIdsSize,
  sourceClassName,
  sourceArmName,
  targetClassName,
  targetArmName,
  productId,
  isPending,
  canPromote,
  onPromote,
}: PromotionActionBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
        {selectedIdsSize === 0 ? (
          "Select students above to get started"
        ) : (
          <>
            <span className="font-semibold text-gray-900">{selectedIdsSize}</span>
            <span>student{selectedIdsSize === 1 ? "" : "s"} ready</span>
            {sourceClassName && targetClassName && (
              <>
                <span className="text-gray-300">·</span>
                <span>
                  {sourceClassName}
                  {sourceArmName ? ` ${sourceArmName}` : ""}
                </span>
                <ArrowRight className="size-3.5 shrink-0 text-blue-500" />
                <span className="font-medium text-gray-900">
                  {targetClassName}
                  {targetArmName ? ` ${targetArmName}` : ""}
                </span>
              </>
            )}
          </>
        )}
      </div>
      <Can
        menuUrl={DashboardRoutes.toPromoteStudents(productId ?? "")}
        action="Create"
      >
        <Button
          onClick={onPromote}
          disabled={isPending || !canPromote}
          className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          <ArrowUpCircle className="size-4" />
          Promote Students
        </Button>
      </Can>
    </div>
  )
}
