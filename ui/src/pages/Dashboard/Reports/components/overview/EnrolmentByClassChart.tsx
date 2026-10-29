import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartCard, ChartEmpty } from "@/components/charts/ChartCard"
import {
  AXIS,
  CURSOR,
  GRID,
  PRIMARY,
  SECONDARY,
} from "@/components/charts/chartTheme"
import type { ReportData } from "../../useReportData"
import { useReportPath } from "../../useReportPath"

export function EnrolmentByClassChart({ data }: { data: ReportData }) {
  const to = useReportPath()
  const enrol = data.enrolment.data

  return (
    <ChartCard
      title="Enrolment by Class"
      subtitle="Boys and girls per class"
      to={to("enrolment")}
      className="xl:col-span-2"
    >
      {!enrol || enrol.byClass.length === 0 ? (
        <ChartEmpty text="No pupils on roll yet" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={enrol.byClass} barSize={26}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis dataKey="className" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip cursor={CURSOR} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />
            <Bar dataKey="boys" name="Boys" stackId="a" fill={PRIMARY} />
            <Bar
              dataKey="girls"
              name="Girls"
              stackId="a"
              fill={SECONDARY}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
