import { CheckCircle2 } from "lucide-react"
import type { ValidRow } from "./importStudent.types"

export function ValidRowsTable({ rows }: { rows: ValidRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
        <CheckCircle2 className="size-4 text-emerald-500" />
        <p className="text-sm font-semibold text-gray-900">
          {rows.length} student{rows.length > 1 ? "s" : ""} ready to import
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Row", "ID", "Name", "Gender", "Class", "Guardian", "Phone"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left font-semibold whitespace-nowrap text-gray-400"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr
                key={row.rowNumber}
                className="transition-colors hover:bg-emerald-50/30"
              >
                <td className="px-4 py-2.5 text-gray-400">{row.rowNumber}</td>
                <td className="px-4 py-2.5 font-mono text-gray-600">
                  {row.studentId}
                </td>
                <td className="px-4 py-2.5 font-medium whitespace-nowrap text-gray-800">
                  {row.firstName} {row.lastName}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{row.gender}</td>
                <td className="px-4 py-2.5 whitespace-nowrap text-gray-600">
                  {row.class}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-gray-600">
                  {row.guardianName}
                </td>
                <td className="px-4 py-2.5 text-gray-600">
                  {row.guardianPhone}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
