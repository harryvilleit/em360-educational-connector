import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  CreateSchoolPaymentItemsPayloadI,
  CreateSchoolPaymentItemsResponseI,
  GetSchoolPaymentItemsResponseI,
  GetSchoolPaymentItemDetailsResponseI,
  UpdateSchoolPaymentItemPayloadI,
  UpdateSchoolPaymentItemResponseI,
  DeleteSchoolPaymentItemResponseI,
  CreateSchoolPaymentMethodsPayloadI,
  CreateSchoolPaymentMethodsResponseI,
  GetSchoolPaymentMethodsResponseI,
  GetSchoolPaymentMethodDetailsResponseI,
  UpdateSchoolPaymentMethodPayloadI,
  UpdateSchoolPaymentMethodResponseI,
  DeleteSchoolPaymentMethodResponseI,
  CreateSchoolPaymentStructurePayloadI,
  CreateSchoolPaymentStructureResponseI,
  GetSchoolPaymentStructuresResponseI,
  GetAllSchoolPaymentStructuresParamsI,
  GetSchoolPaymentStructureDetailsResponseI,
  UpdateSchoolPaymentStructurePayloadI,
  UpdateSchoolPaymentStructureResponseI,
  DeleteSchoolPaymentStructureResponseI,
  AddSchoolPaymentItemsPayloadI,
  AddSchoolPaymentItemsResponseI,
  GetEligibleStudentsResponseI,
  GetPaymentRemindersParamsI,
  GetPaymentRemindersResponseI,
  GetPaymentReminderDetailsResponseI,
  CreateSchoolTransactionPayloadI,
  CreateSchoolTransactionResponseI,
  ApplyTransactionVatPayloadI,
  ApplyTransactionVatResponseI,
  ApplyTransactionDiscountPayloadI,
  ApplyTransactionDiscountResponseI,
  AllocateTransactionPayloadI,
  AllocateTransactionResponseI,
  GetSchoolTransactionsParamsI,
  GetSchoolTransactionsResponseI,
  GetSchoolTransactionDetailsResponseI,
  GetInvoiceBillItemsParamsI,
  GetInvoiceBillItemsResponseI,
  GenerateInvoicePayloadI,
  GenerateInvoiceResponseI,
  GetInvoicesParamsI,
  GetInvoicesResponseI,
  GetInvoiceDetailsResponseI,
  UpdateInvoiceStatusPayloadI,
  UpdateInvoiceStatusResponseI,
  DeleteInvoiceResponseI,
  CreateSchoolTransactionTypePayloadI,
  CreateSchoolTransactionTypeResponseI,
  UpdateSchoolTransactionTypePayloadI,
  UpdateSchoolTransactionTypeResponseI,
  ToggleSchoolTransactionTypeStatusPayloadI,
  ToggleSchoolTransactionTypeStatusResponseI,
  GetSchoolTransactionTypesParamsI,
  GetSchoolTransactionTypesResponseI,
  GetSchoolTransactionTypeDetailsParamsI,
  GetSchoolTransactionTypeDetailsResponseI,
  GetStudentFeesByClassParamsI,
  GetStudentFeesByClassResponseI,
  PaySchoolFeeFromWalletPayloadI,
  PaySchoolFeeFromWalletResponseI,
  CustomPaySchoolFeeFromWalletPayloadI,
  CustomPaySchoolFeeFromWalletResponseI,
  BulkPayClassSchoolFeesFromWalletPayloadI,
  BulkPayClassSchoolFeesFromWalletResponseI,
  BulkCustomPayClassSchoolFeesFromWalletPayloadI,
  BulkCustomPayClassSchoolFeesFromWalletResponseI,
  CreateSchoolBillPayloadI,
  CreateSchoolBillResponseI,
  GetSchoolBillsParamsI,
  GetSchoolBillsResponseI,
  GetSchoolBillDetailsResponseI,
  UpdateSchoolBillStatusPayloadI,
  UpdateSchoolBillStatusResponseI,
  DeleteSchoolBillResponseI,
  GetFeeManagementOverviewParamsI,
  GetFeeManagementOverviewResponseI,
} from "./types"
export const createSchoolPaymentItemsApi = async (
  payload: CreateSchoolPaymentItemsPayloadI
): Promise<CreateSchoolPaymentItemsResponseI> => {
  const res = await apiClient.post(
    "/SchoolPaymentItem/CreateSchoolPaymentItems",
    payload
  )
  return normalizeResponse<CreateSchoolPaymentItemsResponseI>(res)
}

export const getSchoolPaymentItemsApi = async (
  schoolId: string
): Promise<GetSchoolPaymentItemsResponseI> => {
  const res = await apiClient.get(
    `/SchoolPaymentItem/GetSchoolPaymentItems/${schoolId}`
  )
  return normalizeResponse<GetSchoolPaymentItemsResponseI>(res)
}

export const getSchoolPaymentItemDetailsApi = async (
  id: string
): Promise<GetSchoolPaymentItemDetailsResponseI> => {
  const res = await apiClient.get(
    `/SchoolPaymentItem/GetSchoolPaymentItemDetails/${id}`
  )
  return normalizeResponse<GetSchoolPaymentItemDetailsResponseI>(res)
}

export const updateSchoolPaymentItemApi = async (
  payload: UpdateSchoolPaymentItemPayloadI
): Promise<UpdateSchoolPaymentItemResponseI> => {
  const res = await apiClient.put(
    "/SchoolPaymentItem/UpdateSchoolPaymentItem",
    payload
  )
  return normalizeResponse<UpdateSchoolPaymentItemResponseI>(res)
}

export const deleteSchoolPaymentItemApi = async (
  id: string
): Promise<DeleteSchoolPaymentItemResponseI> => {
  const res = await apiClient.delete(
    `/SchoolPaymentItem/DeleteSchoolPaymentItem/${id}`
  )
  return normalizeResponse<DeleteSchoolPaymentItemResponseI>(res)
}


export const createSchoolPaymentMethodsApi = async (
  payload: CreateSchoolPaymentMethodsPayloadI
): Promise<CreateSchoolPaymentMethodsResponseI> => {
  const res = await apiClient.post(
    "/SchoolPaymentMethod/CreateSchoolPaymentMethods",
    payload
  )
  return normalizeResponse<CreateSchoolPaymentMethodsResponseI>(res)
}

export const getSchoolPaymentMethodsApi = async (
  schoolId: string
): Promise<GetSchoolPaymentMethodsResponseI> => {
  const res = await apiClient.get(
    `/SchoolPaymentMethod/GetSchoolPaymentMethods/${schoolId}`
  )
  return normalizeResponse<GetSchoolPaymentMethodsResponseI>(res)
}

export const getSchoolPaymentMethodDetailsApi = async (
  id: string
): Promise<GetSchoolPaymentMethodDetailsResponseI> => {
  const res = await apiClient.get(
    `/SchoolPaymentMethod/GetSchoolPaymentMethodDetails/${id}`
  )
  return normalizeResponse<GetSchoolPaymentMethodDetailsResponseI>(res)
}

export const updateSchoolPaymentMethodApi = async (
  payload: UpdateSchoolPaymentMethodPayloadI
): Promise<UpdateSchoolPaymentMethodResponseI> => {
  const res = await apiClient.put(
    "/SchoolPaymentMethod/UpdateSchoolPaymentMethod",
    payload
  )
  return normalizeResponse<UpdateSchoolPaymentMethodResponseI>(res)
}

export const deleteSchoolPaymentMethodApi = async (
  id: string
): Promise<DeleteSchoolPaymentMethodResponseI> => {
  const res = await apiClient.delete(
    `/SchoolPaymentMethod/DeleteSchoolPaymentMethod/${id}`
  )
  return normalizeResponse<DeleteSchoolPaymentMethodResponseI>(res)
}

export const createSchoolPaymentStructureApi = async (
  payload: CreateSchoolPaymentStructurePayloadI
): Promise<CreateSchoolPaymentStructureResponseI> => {
  const res = await apiClient.post(
    "/SchoolPaymentStructure/CreateSchoolPaymentStructure",
    payload
  )
  return normalizeResponse<CreateSchoolPaymentStructureResponseI>(res)
}

export const getSchoolPaymentStructuresApi = async (
  schoolId: string
): Promise<GetSchoolPaymentStructuresResponseI> => {
  const res = await apiClient.get(
    `/SchoolPaymentStructure/GetSchoolPaymentStructures/${schoolId}`
  )
  return normalizeResponse<GetSchoolPaymentStructuresResponseI>(res)
}

export const getAllSchoolPaymentStructuresApi = async (
  params: GetAllSchoolPaymentStructuresParamsI
): Promise<GetSchoolPaymentStructuresResponseI> => {
  const res = await apiClient.get("/SchoolPaymentStructure/GetAll", {
    params,
  })
  return normalizeResponse<GetSchoolPaymentStructuresResponseI>(res)
}

export const getSchoolPaymentStructureDetailsApi = async (
  id: string
): Promise<GetSchoolPaymentStructureDetailsResponseI> => {
  const res = await apiClient.get(`/SchoolPaymentStructure/GetDetails/${id}`)
  return normalizeResponse<GetSchoolPaymentStructureDetailsResponseI>(res)
}

export const updateSchoolPaymentStructureApi = async (
  payload: UpdateSchoolPaymentStructurePayloadI
): Promise<UpdateSchoolPaymentStructureResponseI> => {
  const res = await apiClient.put("/SchoolPaymentStructure/Update", payload)
  return normalizeResponse<UpdateSchoolPaymentStructureResponseI>(res)
}

export const deleteSchoolPaymentStructureApi = async (
  id: string
): Promise<DeleteSchoolPaymentStructureResponseI> => {
  const res = await apiClient.delete(
    `/SchoolPaymentStructure/DeleteSchoolPaymentStructure/${id}`
  )
  return normalizeResponse<DeleteSchoolPaymentStructureResponseI>(res)
}

export const addSchoolPaymentItemsApi = async (
  payload: AddSchoolPaymentItemsPayloadI
): Promise<AddSchoolPaymentItemsResponseI> => {
  const res = await apiClient.post(
    "/SchoolPaymentStructure/AddPaymentItems",
    payload,
    { params: { schoolId: payload.schoolId } }
  )
  return normalizeResponse<AddSchoolPaymentItemsResponseI>(res)
}

export const getEligibleStudentsApi = async (
  paymentStructureId: string
): Promise<GetEligibleStudentsResponseI> => {
  const res = await apiClient.get(
    `/SchoolPaymentStructure/GetEligibleStudents/${paymentStructureId}`
  )
  return normalizeResponse<GetEligibleStudentsResponseI>(res)
}

export const getPaymentRemindersApi = async (
  params: GetPaymentRemindersParamsI
): Promise<GetPaymentRemindersResponseI> => {
  const res = await apiClient.get("/FeeManagement/payment-reminder", {
    params,
  })
  return normalizeResponse<GetPaymentRemindersResponseI>(res)
}

export const getPaymentReminderDetailsApi = async (
  studentBillId: string
): Promise<GetPaymentReminderDetailsResponseI> => {
  const res = await apiClient.get(
    `/FeeManagement/payment-reminder/${studentBillId}`
  )
  return normalizeResponse<GetPaymentReminderDetailsResponseI>(res)
}

export const getStudentFeesByClassApi = async (
  params: GetStudentFeesByClassParamsI
): Promise<GetStudentFeesByClassResponseI> => {
  const res = await apiClient.get("/FeeManagement/GetStudentFeesByClass", {
    params,
  })
  return normalizeResponse<GetStudentFeesByClassResponseI>(res)
}

export const paySchoolFeeFromWalletApi = async (
  payload: PaySchoolFeeFromWalletPayloadI
): Promise<PaySchoolFeeFromWalletResponseI> => {
  const res = await apiClient.post(
    "/FeeManagement/PaySchoolFeeFromWallet",
    payload
  )
  return normalizeResponse<PaySchoolFeeFromWalletResponseI>(res)
}

export const customPaySchoolFeeFromWalletApi = async (
  payload: CustomPaySchoolFeeFromWalletPayloadI
): Promise<CustomPaySchoolFeeFromWalletResponseI> => {
  const res = await apiClient.post(
    "/FeeManagement/CustomPaySchoolFeeFromWallet",
    payload
  )
  return normalizeResponse<CustomPaySchoolFeeFromWalletResponseI>(res)
}

export const bulkPayClassSchoolFeesFromWalletApi = async (
  payload: BulkPayClassSchoolFeesFromWalletPayloadI
): Promise<BulkPayClassSchoolFeesFromWalletResponseI> => {
  const res = await apiClient.post(
    "/FeeManagement/BulkPayClassSchoolFeesFromWallet",
    payload
  )
  return normalizeResponse<BulkPayClassSchoolFeesFromWalletResponseI>(res)
}

export const bulkCustomPayClassSchoolFeesFromWalletApi = async (
  payload: BulkCustomPayClassSchoolFeesFromWalletPayloadI
): Promise<BulkCustomPayClassSchoolFeesFromWalletResponseI> => {
  const res = await apiClient.post(
    "/FeeManagement/BulkCustomPayClassSchoolFeesFromWallet",
    payload
  )
  return normalizeResponse<BulkCustomPayClassSchoolFeesFromWalletResponseI>(
    res
  )
}


export const createSchoolTransactionApi = async (
  payload: CreateSchoolTransactionPayloadI
): Promise<CreateSchoolTransactionResponseI> => {
  const res = await apiClient.post("/SchoolTransaction/Create", payload)
  return normalizeResponse<CreateSchoolTransactionResponseI>(res)
}

export const applyTransactionVatApi = async (
  payload: ApplyTransactionVatPayloadI
): Promise<ApplyTransactionVatResponseI> => {
  const res = await apiClient.post("/SchoolTransaction/ApplyVat", payload)
  return normalizeResponse<ApplyTransactionVatResponseI>(res)
}

export const applyTransactionDiscountApi = async (
  payload: ApplyTransactionDiscountPayloadI
): Promise<ApplyTransactionDiscountResponseI> => {
  const res = await apiClient.post("/SchoolTransaction/ApplyDiscount", payload)
  return normalizeResponse<ApplyTransactionDiscountResponseI>(res)
}

export const allocateTransactionApi = async (
  payload: AllocateTransactionPayloadI
): Promise<AllocateTransactionResponseI> => {
  const res = await apiClient.post("/SchoolTransaction/Allocate", payload)
  return normalizeResponse<AllocateTransactionResponseI>(res)
}

export const getSchoolTransactionsApi = async (
  params: GetSchoolTransactionsParamsI
): Promise<GetSchoolTransactionsResponseI> => {
  const res = await apiClient.get("/SchoolTransaction/GetAll", { params })
  return normalizeResponse<GetSchoolTransactionsResponseI>(res)
}

export const getSchoolTransactionDetailsApi = async (
  id: string
): Promise<GetSchoolTransactionDetailsResponseI> => {
  const res = await apiClient.get(`/SchoolTransaction/GetDetails/${id}`)
  return normalizeResponse<GetSchoolTransactionDetailsResponseI>(res)
}


export const createSchoolTransactionTypeApi = async (
  payload: CreateSchoolTransactionTypePayloadI
): Promise<CreateSchoolTransactionTypeResponseI> => {
  const res = await apiClient.post("/SchoolTransactionType/Create", payload)
  return normalizeResponse<CreateSchoolTransactionTypeResponseI>(res)
}

export const updateSchoolTransactionTypeApi = async (
  payload: UpdateSchoolTransactionTypePayloadI
): Promise<UpdateSchoolTransactionTypeResponseI> => {
  const res = await apiClient.put("/SchoolTransactionType/Update", payload)
  return normalizeResponse<UpdateSchoolTransactionTypeResponseI>(res)
}

export const toggleSchoolTransactionTypeStatusApi = async ({
  id,
  schoolId,
}: ToggleSchoolTransactionTypeStatusPayloadI): Promise<ToggleSchoolTransactionTypeStatusResponseI> => {
  const res = await apiClient.patch(
    `/SchoolTransactionType/ToggleStatus/${id}`,
    null,
    { params: { schoolId } }
  )
  return normalizeResponse<ToggleSchoolTransactionTypeStatusResponseI>(res)
}

export const getSchoolTransactionTypesApi = async (
  params: GetSchoolTransactionTypesParamsI
): Promise<GetSchoolTransactionTypesResponseI> => {
  const res = await apiClient.get("/SchoolTransactionType/GetAll", { params })
  return normalizeResponse<GetSchoolTransactionTypesResponseI>(res)
}

export const getSchoolTransactionTypeDetailsApi = async ({
  id,
  schoolId,
}: GetSchoolTransactionTypeDetailsParamsI): Promise<GetSchoolTransactionTypeDetailsResponseI> => {
  const res = await apiClient.get(`/SchoolTransactionType/GetById/${id}`, {
    params: { schoolId },
  })
  return normalizeResponse<GetSchoolTransactionTypeDetailsResponseI>(res)
}

export const getInvoiceBillItemsApi = async (
  params: GetInvoiceBillItemsParamsI
): Promise<GetInvoiceBillItemsResponseI> => {
  const res = await apiClient.get("/StudentInvoice/GetInvoiceBillItems", {
    params,
  })
  return normalizeResponse<GetInvoiceBillItemsResponseI>(res)
}

export const generateInvoiceApi = async (
  payload: GenerateInvoicePayloadI
): Promise<GenerateInvoiceResponseI> => {
  const res = await apiClient.post("/StudentInvoice/Generate", payload)
  return normalizeResponse<GenerateInvoiceResponseI>(res)
}

export const getInvoicesApi = async (
  params: GetInvoicesParamsI
): Promise<GetInvoicesResponseI> => {
  const res = await apiClient.get("/StudentInvoice/GetInvoices", { params })
  return normalizeResponse<GetInvoicesResponseI>(res)
}

export const getInvoiceDetailsApi = async (
  invoiceId: string
): Promise<GetInvoiceDetailsResponseI> => {
  const res = await apiClient.get("/StudentInvoice/GetDetails", {
    params: { invoiceId },
  })
  return normalizeResponse<GetInvoiceDetailsResponseI>(res)
}

export const updateInvoiceStatusApi = async (
  payload: UpdateInvoiceStatusPayloadI
): Promise<UpdateInvoiceStatusResponseI> => {
  const res = await apiClient.put("/StudentInvoice/UpdateStatus", payload)
  return normalizeResponse<UpdateInvoiceStatusResponseI>(res)
}

export const deleteInvoiceApi = async (
  invoiceId: string
): Promise<DeleteInvoiceResponseI> => {
  const res = await apiClient.delete("/StudentInvoice/Delete", {
    data: { invoiceId },
  })
  return normalizeResponse<DeleteInvoiceResponseI>(res)
}


export const createSchoolBillApi = async (
  payload: CreateSchoolBillPayloadI
): Promise<CreateSchoolBillResponseI> => {
  const res = await apiClient.post("/SchoolBill/Create", payload)
  return normalizeResponse<CreateSchoolBillResponseI>(res)
}

export const getSchoolBillsApi = async (
  params: GetSchoolBillsParamsI
): Promise<GetSchoolBillsResponseI> => {
  const res = await apiClient.get("/SchoolBill/GetBills", { params })
  return normalizeResponse<GetSchoolBillsResponseI>(res)
}

export const getSchoolBillDetailsApi = async (
  billId: string
): Promise<GetSchoolBillDetailsResponseI> => {
  const res = await apiClient.get("/SchoolBill/GetDetails", {
    params: { billId },
  })
  return normalizeResponse<GetSchoolBillDetailsResponseI>(res)
}

export const updateSchoolBillStatusApi = async (
  payload: UpdateSchoolBillStatusPayloadI
): Promise<UpdateSchoolBillStatusResponseI> => {
  const res = await apiClient.put("/SchoolBill/UpdateStatus", payload)
  return normalizeResponse<UpdateSchoolBillStatusResponseI>(res)
}

export const deleteSchoolBillApi = async (
  billId: string
): Promise<DeleteSchoolBillResponseI> => {
  const res = await apiClient.delete("/SchoolBill/Delete", {
    data: { billId },
  })
  return normalizeResponse<DeleteSchoolBillResponseI>(res)
}


export const getFeeManagementOverviewApi = async (
  params: GetFeeManagementOverviewParamsI,
  signal?: AbortSignal
): Promise<GetFeeManagementOverviewResponseI> => {
  const res = await apiClient.get("/FeeManagement/GetFeeManagementOverview", {
    params: {
      schoolId: params.schoolId,
      sessionId: params.sessionId || undefined,
      termId: params.termId || undefined,
    },
    signal,
  })
  return normalizeResponse<GetFeeManagementOverviewResponseI>(res)
}
