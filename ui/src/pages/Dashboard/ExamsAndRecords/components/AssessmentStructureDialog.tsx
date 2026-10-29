import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus, X } from "lucide-react"

interface AssessmentRow {
  id: string
  name: string
  weight: string
}

interface SessionOption {
  id: string
  name: string
}

interface AssessmentStructureDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  structureName: string
  onStructureNameChange: (name: string) => void
  session: string
  onSessionChange: (session: string) => void
  sessions: SessionOption[]
  assessmentRows: AssessmentRow[]
  onRowChange: (id: string, field: "name" | "weight", value: string) => void
  onAddRow: () => void
  onRemoveRow: (id: string) => void
  onAddAssessment: () => void
  onResetForm: () => void
  totalEntered: number
  remaining: number
  isPending?: boolean
}

export function AssessmentStructureDialog({
  isOpen,
  onOpenChange,
  structureName,
  onStructureNameChange,
  session,
  onSessionChange,
  sessions,
  assessmentRows,
  onRowChange,
  onAddRow,
  onRemoveRow,
  onAddAssessment,
  onResetForm,
  totalEntered,
  remaining,
  isPending = false,
}: AssessmentStructureDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onResetForm()
        onOpenChange(open)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="primary">
          <Plus className="size-4" />
          Add Assessment
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Assessment Structure</DialogTitle>
          <DialogDescription>
            Name each component and assign its weight. Total must equal 100%.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Structure name and Session */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="structure-name">Structure Name</Label>
              <Input
                id="structure-name"
                placeholder="e.g., Term 1 Assessment"
                value={structureName}
                onChange={(e) => onStructureNameChange(e.target.value)}
                className="border-chart-2 py-6"
              />
            </div>
            <div className="space-y-2">
              <Label>Session</Label>
              {sessions.length === 0 ? (
                <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-muted-foreground">
                  No sessions yet — create them in Academic Sessions.
                </p>
              ) : (
                <Select value={session || "_none"} onValueChange={(v) => onSessionChange(v === "_none" ? "" : v)}>
                  <SelectTrigger className="border-chart-2 py-6 w-full">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Select session</SelectItem>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Dynamic rows */}
          <div className="space-y-3">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_90px_32px] gap-2 px-0.5">
              <Label className="text-xs text-muted-foreground">
                Assessment Name
              </Label>
              <Label className="text-xs text-muted-foreground">Weight %</Label>
              <span />
            </div>

            {assessmentRows.map((row, idx) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_90px_32px] items-center gap-2"
              >
                <Input
                  placeholder={`e.g., ${idx === 0 ? "CA" : idx === 1 ? "Exam" : "Other"}`}
                  value={row.name}
                  onChange={(e) => onRowChange(row.id, "name", e.target.value)}
                  className="border-chart-2 py-5 text-sm"
                />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={row.weight}
                  onChange={(e) =>
                    onRowChange(row.id, "weight", e.target.value)
                  }
                  className="border-chart-2 py-5 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={assessmentRows.length === 1}
                  onClick={() => onRemoveRow(row.id)}
                  className="h-8 w-8 p-0 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* total */}
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Total</span>
              <span
                className={`font-semibold ${
                  Math.round(totalEntered) === 100
                    ? "text-green-600"
                    : totalEntered > 100
                      ? "text-red-600"
                      : "text-gray-900"
                }`}
              >
                {totalEntered}%
                {Math.round(totalEntered) !== 100 && (
                  <span className="ml-1 font-normal text-muted-foreground">
                    (
                    {remaining > 0
                      ? `${remaining}% remaining`
                      : `${Math.abs(remaining)}% over`}
                    )
                  </span>
                )}
              </span>
            </div>

            {/* Add more */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddRow}
              className="w-full gap-1.5 border-dashed"
            >
              <Plus className="h-3.5 w-3.5" />
              Add More
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onResetForm()
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={onAddAssessment}
            disabled={isPending || Math.round(totalEntered) !== 100}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Saving…" : "Add Assessment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
