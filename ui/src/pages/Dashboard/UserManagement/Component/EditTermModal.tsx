import { useState } from "react"
import { BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUpdateSchoolTerm } from "@/hooks/userMgt"

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"

interface EditTermModalProps {
  open: boolean
  onClose: () => void
  schoolId: string
  term: { id: string; name: string }
}

export default function EditTermModal({
  open,
  onClose,
  schoolId,
  term,
}: EditTermModalProps) {
  const { updateSchoolTermAsync, isLoading } = useUpdateSchoolTerm()

  const [name, setName] = useState(term.name)
  const [error, setError] = useState("")

  function handleClose() {
    setError("")
    onClose()
  }

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Term name is required")
      return
    }
    try {
      await updateSchoolTermAsync({ id: term.id, termName: trimmed, schoolId })
      handleClose()
    } catch {
      // hook handles toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <BookOpen className="size-4 text-purple-600" />
            Edit Term
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label className="mb-1 block text-xs font-medium text-gray-500">
              Term Name *
            </Label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError("")
              }}
              placeholder="e.g. Term 1"
              autoFocus
              className={`${inputCls} ${error ? "border-red-400" : ""}`}
            />
            {error && <p className="mt-0.5 text-[11px] text-red-500">{error}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <BookOpen className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
