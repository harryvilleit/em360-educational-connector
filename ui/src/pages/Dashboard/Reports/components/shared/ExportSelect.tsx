import { useState } from "react"
import { Download } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FilterSelect } from "@/components/ui/filter-select"
import type { ReportFormat } from "@/lib/reportDownload"

const FORMATS: { value: ReportFormat; label: string; file: string }[] = [
  { value: "pdf", label: "PDF document", file: "PDF (.pdf)" },
  { value: "excel", label: "Excel spreadsheet", file: "Excel (.xls)" },
  { value: "csv", label: "CSV file", file: "CSV (.csv)" },
  { value: "json", label: "JSON data", file: "JSON (.json)" },
]

// Looks like the session and term selects; choosing a format asks for confirmation first
// and the control keeps showing its "Export PDF" default.
export function ExportSelect({
  reportName,
  onExport,
}: {
  reportName: string
  onExport: (format: ReportFormat) => void
}) {
  const [pending, setPending] = useState<ReportFormat | null>(null)
  const format = FORMATS.find((f) => f.value === pending)

  return (
    <>
      <FilterSelect
        value=""
        onChange={(v) => setPending(v as ReportFormat)}
        options={FORMATS}
        placeholder="Export PDF"
      />

      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <AlertDialogContent className="rounded-2xl border-none" size="sm">
          <AlertDialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Download className="size-6 text-blue-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Export report
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You are about to export the {reportName} as a {format?.file} file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 sm:justify-center">
            <AlertDialogCancel className="rounded-full px-6">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full px-6"
              onClick={() => {
                if (pending) onExport(pending)
                setPending(null)
              }}
            >
              Export
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
