import type { SafeguardingCaseDetailI } from "@/api/safeguarding.api"

export type DialogProps = {
  open: boolean
  onClose: () => void
  schoolId: string
  item: SafeguardingCaseDetailI
}
