import {
  getInvoiceBillItemsApi,
  getInvoicesApi,
  generateInvoiceApi,
} from "@/api/feeManagement.api"
import { getGuardianFeeManagementApi } from "@/api/guardian.api"

interface AutoGenerateEnrollmentInvoiceParams {
  schoolId: string
  studentId: string
  guardianId?: string
  schoolSessionId: string
  schoolSessionTermId: string
  schoolClassId: string
  dueDate: string
}

export type AutoInvoiceResult =
  | "created"
  | "skipped-no-guardian"
  | "skipped-existing-invoice"
  | "skipped-no-payment-type"
  | "failed"


export async function autoGenerateEnrollmentInvoice({
  schoolId,
  studentId,
  guardianId,
  schoolSessionId,
  schoolSessionTermId,
  schoolClassId,
  dueDate,
}: AutoGenerateEnrollmentInvoiceParams): Promise<AutoInvoiceResult> {
  if (!guardianId) return "skipped-no-guardian"

  try {
    const existing = await getInvoicesApi({
      schoolId,
      studentId,
      schoolSessionId,
      schoolSessionTermId,
      schoolClassId,
      pageSize: 1,
    })
    if ((existing.value?.invoices?.items?.length ?? 0) > 0) {
      return "skipped-existing-invoice"
    }

    const billItemsRes = await getInvoiceBillItemsApi({
      schoolId,
      studentId,
      schoolSessionId,
      schoolSessionTermId,
      schoolClassId,
    })
    const billItems = billItemsRes.value?.items ?? []
    if (billItems.length === 0) return "skipped-no-payment-type"

    const feeManagementRes = await getGuardianFeeManagementApi({
      guardianId,
      schoolId,
      studentId,
      schoolSessionId,
    })
    const studentEnrollmentId =
      feeManagementRes.value?.student?.studentEnrollmentId
    if (!studentEnrollmentId) return "failed"

    await generateInvoiceApi({
      schoolId,
      guardianId,
      studentId,
      studentEnrollmentId,
      schoolSessionId,
      schoolSessionTermId,
      schoolClassId,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: dueDate.split("T")[0],
      notes: "Auto-generated on enrollment",
    })
    return "created"
  } catch (err) {
    console.error("autoGenerateEnrollmentInvoice failed", err)
    return "failed"
  }
}
