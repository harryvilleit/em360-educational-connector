import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const SIZE_CLASS = {
  md: "sm:max-w-xl",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
} as const

interface ModalProps {
  size?: keyof typeof SIZE_CLASS
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({
  title,
  onClose,
  children,
  footer,
  size,
}: ModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
          "flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl p-0",
          size && SIZE_CLASS[size]
        )}>
        <DialogHeader className="border-b border-gray-100 px-6 py-4 pr-12">
          <DialogTitle className="text-base font-semibold text-gray-900">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="border-t border-gray-100 px-6 py-4">{footer}</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
