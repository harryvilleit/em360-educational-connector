import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditPeriodTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialName: string
  isSaving?: boolean
  onSave: (name: string) => void
}

export function EditPeriodTypeDialog({
  open,
  onOpenChange,
  initialName,
  isSaving,
  onSave,
}: EditPeriodTypeDialogProps) {
  const [name, setName] = useState(initialName)
  const trimmed = name.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Period Type</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5 py-2">
          <Label className="text-sm font-medium text-gray-700">Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && trimmed) onSave(trimmed)
            }}
            autoFocus
            className="rounded-xl border-gray-200"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            disabled={!trimmed || isSaving}
            onClick={() => onSave(trimmed)}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
