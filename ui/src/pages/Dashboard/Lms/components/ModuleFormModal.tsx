import { useEffect, useState } from "react"
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

type ModuleFormModalProps = {
  open: boolean
  onClose: () => void
  onSubmit: (title: string) => void | Promise<void>
  
  initialTitle?: string
  mode?: "create" | "edit"
  isPending?: boolean
}

export default function ModuleFormModal({
  open,
  onClose,
  onSubmit,
  initialTitle = "",
  mode = "create",
  isPending = false,
}: ModuleFormModalProps) {
  const [title, setTitle] = useState(initialTitle)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setTitle(initialTitle)
  }, [open, initialTitle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || saving || isPending) return
    setSaving(true)
    try {
      await onSubmit(title.trim())
      setTitle("")
      onClose()
    } catch {

    } finally {
      setSaving(false)
    }
  }

  const busy = saving || isPending
  const isEdit = mode === "edit"

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !busy && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit curriculum section" : "Add curriculum section"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section-title">Section title</Label>
            <Input
              id="section-title"
              className="h-9 rounded-md"
              placeholder="e.g. JavaScript Fundamentals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-md"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-9 rounded-md" disabled={busy}>
              {busy ? "Saving…" : isEdit ? "Save section" : "Add section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
