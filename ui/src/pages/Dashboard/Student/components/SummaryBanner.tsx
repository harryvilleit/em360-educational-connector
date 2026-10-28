import { FileText, CheckCircle2, XCircle } from "lucide-react"

export function SummaryBanner({
  valid,
  invalid,
}: {
  valid: number
  invalid: number
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
          <FileText className="size-4 text-gray-500" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Total Rows</p>
          <p className="text-lg font-bold text-gray-900">{valid + invalid}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
          <CheckCircle2 className="size-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Valid</p>
          <p className="text-lg font-bold text-emerald-700">{valid}</p>
        </div>
      </div>
      <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 p-4 shadow-sm sm:col-span-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100">
          <XCircle className="size-4 text-red-500" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Invalid</p>
          <p className="text-lg font-bold text-red-600">{invalid}</p>
        </div>
      </div>
    </div>
  )
}
