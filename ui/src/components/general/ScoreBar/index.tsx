import { barColor } from "@/utils/resultFormatting"

export function ScoreBar({ score }: { score: number }) {
  return (
    <div className="hidden h-1.5 w-full overflow-hidden rounded-full bg-gray-100 sm:block dark:bg-white/10">
      <div
        className={`h-full rounded-full transition-all ${barColor(score)}`}
        style={{ width: `${score}%` }}
      />
    </div>
  )
}
