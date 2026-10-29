// WordPress version: shows sending state and limits the email title and message length.
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Send } from "lucide-react"
import type { PaymentReminderBillI } from "@/api/feeManagement.api/types"

interface Props {
  open: boolean
  onClose: () => void
  students: PaymentReminderBillI[]
  onSend: (data: { title: string; message: string }) => void
  isPending?: boolean
}

function describeRecipients(students: PaymentReminderBillI[]): string {
  const names = students.map((s) => s.studentName)
  if (names.length <= 2) return names.join(" and ")
  return `${names.slice(0, 2).join(", ")} and ${names.length - 2} other${names.length - 2 === 1 ? "" : "s"}`
}

export default function SendReminderModal({
  open,
  onClose,
  students,
  onSend,
  isPending = false,
}: Props) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")

  // Reset the form each time the dialog opens for a new set of students —
  // done during render (React's documented pattern for adjusting state from
  // a prop change) rather than in an effect, so it doesn't cause an extra
  // commit.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setTitle("")
      setMessage("")
    }
  }

  const canSend = !isPending && title.trim().length > 0 && message.trim().length > 0

  const handleSend = () => {
    if (!canSend) return
    onSend({ title: title.trim(), message: message.trim() })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Send Reminder
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {students.length === 0
              ? "No students selected."
              : `Emailing linked guardians of ${describeRecipients(students)} (${students.length} student${students.length === 1 ? "" : "s"}).`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500">Title</label>
            <Input
              className="h-9 rounded-xl text-sm"
              placeholder="e.g. Outstanding fee reminder – 2nd Term"
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500">Description</label>
            <Textarea
              className="min-h-[100px] rounded-xl text-sm"
              placeholder="Dear parent, please be informed that your ward has an outstanding balance..."
              maxLength={4000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSend}
            disabled={!canSend || students.length === 0}
          >
            <Send className="size-4" />
            {isPending ? "Sending…" : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
