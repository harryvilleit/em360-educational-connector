import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRevokeSafeguardingAccess } from "@/hooks/safeguarding"
import type { SafeguardingAccessGrantI } from "@/api/safeguarding.api"

type RevokeAccessDialogProps = {
  schoolId: string
  grant: SafeguardingAccessGrantI | undefined
  onClose: () => void
}

export default function RevokeAccessDialog({
  schoolId,
  grant,
  onClose,
}: RevokeAccessDialogProps) {
  const revokeMutation = useRevokeSafeguardingAccess()

  return (
    <Dialog
      open={!!grant}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke safeguarding access?</DialogTitle>
          <DialogDescription>
            {grant?.userName} will immediately lose explicit access to
            confidential cases. Any qualifying safeguarding-lead job-role access remains in
            effect.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={revokeMutation.isPending}
            onClick={() =>
              grant &&
              revokeMutation.mutate(
                { schoolId, accessGrantId: grant.id },
                { onSuccess: () => onClose() }
              )
            }
          >
            {revokeMutation.isPending ? "Revoking…" : "Revoke access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
