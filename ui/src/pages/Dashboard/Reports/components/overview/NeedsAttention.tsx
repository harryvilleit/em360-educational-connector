import { Link } from "react-router"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { ChartCard } from "@/components/charts/ChartCard"
import type { ReportData } from "../../useReportData"
import { buildAttention, type Attention } from "../../overviewAttention"
import { useReportPath } from "../../useReportPath"

const TONE: Record<Attention["tone"], string> = {
  red: "bg-red-500",
  amber: "bg-amber-500",
  blue: "bg-blue-400",
}

export function NeedsAttention({ data }: { data: ReportData }) {
  const to = useReportPath()
  const items = buildAttention(data)

  return (
    <ChartCard
      title="Needs Attention"
      subtitle="Items across the school that need follow-up"
    >
      {items.length === 0 ? (
        <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
          <CheckCircle2 className="size-4 text-green-600" />
          Nothing needs attention right now.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item.text}>
              <Link
                to={to(item.domain)}
                className="flex items-center justify-between gap-3 py-3 text-sm text-gray-700 hover:text-blue-600"
              >
                <span className="flex items-center gap-3">
                  <span className={`size-2 rounded-full ${TONE[item.tone]}`} />
                  {item.text}
                </span>
                <ArrowRight className="size-4 text-gray-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  )
}
