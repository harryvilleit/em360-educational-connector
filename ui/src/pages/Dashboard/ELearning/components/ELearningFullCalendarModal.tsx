import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ELearningActivityCalendar from "./ELearningActivityCalendar"
import type { ELearningCalendarActivity } from "../liveClasses.utils"

interface ELearningFullCalendarModalProps {
  open: boolean
  onClose: () => void
  activities: ELearningCalendarActivity[]
  selectedDate?: string
  onDateSelect: (dateISO: string | undefined) => void
  minDate?: string
  maxDate?: string
}

export default function ELearningFullCalendarModal({
  open,
  onClose,
  activities,
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
}: ELearningFullCalendarModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[calc(100vw-2rem)]">
        <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-4">
          <DialogTitle className="text-lg font-semibold">
            E-Learning Calendar
          </DialogTitle>
          <DialogDescription>
            Live classes, assignments, and materials across your selected filters.
            Click a day to filter the class list.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <ELearningActivityCalendar
            variant="full"
            activities={activities}
            selectedDate={selectedDate}
            onDateSelect={onDateSelect}
            minDate={minDate}
            maxDate={maxDate}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
