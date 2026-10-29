import { useRef, useState } from "react"
import { FileText, Printer } from "lucide-react"
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
import { useSchoolId } from "@/contexts/SchoolContext"
import { useSchoolCardBranding } from "@/hooks/useSchoolCardBranding"
import { idCardIssuedDate } from "@/lib/idCards"
import { printReportCard } from "@/lib/printReportCard"
import { useReportCardConfig } from "@/store/reportCardConfig.store"
import ReportCard from "./ReportCard"
import type { ReportCardData } from "./types"

type ReportCardResult = Omit<ReportCardData, "school" | "issuedOn">

export default function ReportCardButton({
  result,
}: {
  result: ReportCardResult
}) {
  const schoolId = useSchoolId()
  const [open, setOpen] = useState(false)
  const [printing, setPrinting] = useState(false)
  const preview = useRef<HTMLDivElement>(null)
  const config = useReportCardConfig(schoolId)
  const { branding, isLoading, contactLoading, refetch } =
    useSchoolCardBranding(schoolId, { enabled: open, contactEnabled: open })

  const data: ReportCardData | null = branding
    ? {
        ...result,
        school: {
          name: branding.schoolName,
          logo: branding.schoolLogo,
          phone: branding.schoolPhone,
          email: branding.schoolEmail,
          address: branding.schoolAddress,
        },
        issuedOn: idCardIssuedDate(),
      }
    : null

  async function print() {
    if (!preview.current) return
    setPrinting(true)
    try {
      await printReportCard(preview.current)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to print this report card."
      )
    } finally {
      setPrinting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Report Card
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Report card</DialogTitle>
          <DialogDescription>
            Preview and print the report card for {result.student.name}. Print
            on A4 with headers and footers turned off.
          </DialogDescription>
        </DialogHeader>
        {isLoading || contactLoading ? (
          <p role="status" className="text-sm text-muted-foreground">
            Loading school details...
          </p>
        ) : data ? (
          <>
            <div className="overflow-auto rounded-lg border bg-gray-100 p-3">
              <div ref={preview} className="mx-auto w-fit shadow-sm">
                <ReportCard data={data} config={config} />
              </div>
            </div>
            <Button onClick={() => void print()} disabled={printing}>
              <Printer className="mr-2 size-4" />
              {printing ? "Preparing print..." : "Print report card"}
            </Button>
          </>
        ) : (
          <div role="alert" className="space-y-3">
            <p className="text-sm text-red-600">
              School details could not be loaded.
            </p>
            <Button variant="outline" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
