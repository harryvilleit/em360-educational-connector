import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { getErrorMessage } from "@/utils"

type ConfirmModalVariant = "deactivate" | "activate" | "delete" | "resend-email"

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  variant: ConfirmModalVariant
  userName: string
  title?: string
  description?: React.ReactNode
}

const config = {
  deactivate: {
    title: "Deactivate User",
    description: (name: string) => (
      <>
        You are about to deactivate{" "}
        <span className="font-semibold">{name}</span>'s account. They will lose
        access to this school immediately until reactivated.
      </>
    ),
    confirmLabel: "Deactivate",
    confirmClass: "bg-orange-500 hover:bg-orange-600 text-white",
  },

  activate: {
    title: "Activate User",
    description: (name: string) => (
      <>
        You are about to activate <span className="font-semibold">{name}</span>
        's account. They will regain full access to their assigned modules and
        can log in immediately.
      </>
    ),
    confirmLabel: "Activate",
    confirmClass: "bg-green-600 hover:bg-green-700 text-white",
  },

  delete: {
    title: "Delete User",
    description: (name: string) => (
      <>
        You are about to remove{" "}
        <span className="font-semibold text-red-600">{name}</span> from this
        school. Their school access and role assignments will be removed.
        Historical staff records and their account at other schools are
        retained.
      </>
    ),
    confirmLabel: "Delete User",
    confirmClass: "bg-red-600 hover:bg-red-700 text-white",
  },

  "resend-email": {
    title: "Resend Registration Email",
    description: (name: string) => (
      <>
        Send a fresh account activation link to{" "}
        <span className="font-semibold">{name}</span>. Their previous activation
        link will no longer work.
      </>
    ),
    confirmLabel: "Resend Email",
    confirmClass: "bg-blue-600 hover:bg-blue-700 text-white",
  },
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  variant,
  userName,
  title: titleOverride,
  description: descriptionOverride,
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState("")
  const {
    title: configTitle,
    description: configDescription,
    confirmLabel,
    confirmClass,
  } = config[variant]
  const title = titleOverride ?? configTitle
  const description = descriptionOverride ?? configDescription(userName)

  const handleConfirm = async () => {
    try {
      setError("")
      setIsLoading(true)
      await onConfirm()
      onClose()
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "The action could not be completed. Please try again.",
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            {title}
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-200 py-5 shadow-none ring-0 focus:ring-0 focus-visible:border-gray-200 focus-visible:ring-0"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isLoading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-5 ${confirmClass}`}
            onClick={handleConfirm}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
