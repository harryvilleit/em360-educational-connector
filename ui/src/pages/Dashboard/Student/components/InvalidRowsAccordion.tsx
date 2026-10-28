import { useState } from "react"
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import type { InvalidRow } from "./importStudent.types"

export function InvalidRowsAccordion({ rows }: { rows: InvalidRow[] }) {
  const [open, setOpen] = useState(false)
  if (rows.length === 0) return null

  return (
    <div className="overflow-hidden rounded-2xl border border-red-100 bg-red-50/40">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-red-500" />
          <span className="text-sm font-semibold text-red-700">
            {rows.length} row{rows.length > 1 ? "s" : ""} will be skipped
          </span>
        </div>
        {open ? (
          <ChevronUp className="size-4 text-red-400" />
        ) : (
          <ChevronDown className="size-4 text-red-400" />
        )}
      </button>

      {open && (
        <div className="divide-y divide-red-100 border-t border-red-100">
          {rows.map((row) => (
            <div key={row.rowNumber} className="px-5 py-3">
              <p className="mb-1 text-xs font-semibold text-red-600">
                Row {row.rowNumber}
              </p>
              <ul className="space-y-0.5">
                {row.errors.map((err, i) => (
                  <li key={i} className="text-xs text-red-500">
                    · {err}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
