import { useRef, useState } from "react"
import { IdCard, Printer } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { idCardIssuedDate, type SchoolIdCard } from "@/lib/idCards"
import { printIdCards } from "@/lib/printIdCards"
import { useSchoolCardBranding } from "@/hooks/useSchoolCardBranding"
import IdCardPreview from "./IdCardPreview"

type PersonCard = Omit<SchoolIdCard, "schoolName" | "schoolLogo">

/** Admin-only entry point; reuse the profile's existing authorized record. */
export default function IdCardButton({ card }: { card: PersonCard }) {
  const [open, setOpen] = useState(false)
  const [printing, setPrinting] = useState(false)
  const preview = useRef<HTMLDivElement>(null)
  const {
    branding,
    isLoading,
    contactLoading,
    contactError,
    refetch,
    refetchContact,
  } = useSchoolCardBranding(card.schoolId, {
    enabled: open,
    contactEnabled: open && card.kind === "student",
  })
  const printable = branding
    ? {
        ...card,
        ...branding,
        issuedOn: idCardIssuedDate(),
      }
    : null

  async function print() {
    if (!preview.current || !printable) return
    setPrinting(true)
    try {
      await printIdCards(preview.current)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to print this ID card."
      )
    } finally {
      setPrinting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <IdCard className="mr-1.5 size-4" />
          ID Card
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {card.kind === "student" ? "Student" : "Staff"} ID card
          </DialogTitle>
          <DialogDescription>
            Preview and print the card using the registered profile picture. The
            QR code contains basic identification details.
          </DialogDescription>
        </DialogHeader>
        {isLoading || contactLoading ? (
          <p role="status">Loading school details...</p>
        ) : printable ? (
          <>
            {card.kind === "student" && contactError && (
              <p role="alert" className="text-sm text-red-600">
                School contact details could not be loaded.{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => void refetchContact()}
                >
                  Retry
                </button>
              </p>
            )}
            {card.kind === "student" &&
              !contactError &&
              !printable.schoolPhone &&
              !printable.schoolEmail &&
              !printable.schoolAddress && (
                <p className="text-xs text-muted-foreground">
                  Add a school phone, email or address in School Settings to
                  include it on the back of the card.
                </p>
              )}
            <div ref={preview} className="overflow-x-auto py-2">
              <IdCardPreview card={printable} />
            </div>
            <p className="text-xs text-muted-foreground">
              Print at 100% scale (actual size). Card size: 85.6 Ã— 53.98 mm.
            </p>
            {card.kind === "student" && (
              <p className="text-xs text-muted-foreground">
                Front and back print on separate pages. For two-sided printing,
                use portrait paper and flip on the long edge.
              </p>
            )}
            <Button
              onClick={print}
              disabled={printing || (card.kind === "student" && contactError)}
            >
              <Printer className="mr-2 size-4" />
              {printing ? "Preparing print..." : "Print ID card"}
            </Button>
          </>
        ) : (
          <div role="alert" className="space-y-3">
            <p>School details could not be loaded.</p>
            <Button variant="outline" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
