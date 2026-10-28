// ─── SchoolPaymentItem ───────────────────────────────────────────────────────

export interface SchoolPaymentItemInputI {
  name: string
}

export interface CreateSchoolPaymentItemsPayloadI {
  schoolId: string
  items: SchoolPaymentItemInputI[]
}

export interface CreateSchoolPaymentItemsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface SchoolPaymentItemI {
  id: string
  schoolId: string
  name: string
}

export interface GetSchoolPaymentItemsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolPaymentItemI[]
}

export interface GetSchoolPaymentItemDetailsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolPaymentItemI
}

export interface UpdateSchoolPaymentItemPayloadI {
  id: string
  name: string
}

export interface UpdateSchoolPaymentItemResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface DeleteSchoolPaymentItemResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

// ─── SchoolPaymentMethod ─────────────────────────────────────────────────────

export interface SchoolPaymentMethodInputI {
  accountNumber: string
  name: string
  details: string
  currencyCode: string
}

export interface CreateSchoolPaymentMethodsPayloadI {
  schoolId: string
  items: SchoolPaymentMethodInputI[]
}

export interface CreateSchoolPaymentMethodsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface SchoolPaymentMethodI {
  id: string
  schoolId: string
  accountNumber: string
  name: string
  details: string
  currencyCode: string
  status: number
}

export interface GetSchoolPaymentMethodsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolPaymentMethodI[]
}

export interface GetSchoolPaymentMethodDetailsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolPaymentMethodI
}

export interface UpdateSchoolPaymentMethodPayloadI {
  id: string
  accountNumber: string
  name: string
  details: string
  currencyCode: string
  status: number
}

export interface UpdateSchoolPaymentMethodResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface DeleteSchoolPaymentMethodResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

// ─── SchoolPaymentStructure ──────────────────────────────────────────────────

// Numbering isn't confirmed against the live API — Swagger's example always
// shows enum fields as 1 regardless of meaning. Assumed Mandatory = 1 to
// match the "mandatory is the common case" default used in the create/add
// forms; verify live before relying on this ordering elsewhere.
export const PaymentRequirement = {
  Mandatory: 1,
  Optional: 2,
} as const
export type PaymentRequirement =
  (typeof PaymentRequirement)[keyof typeof PaymentRequirement]

export interface SchoolPaymentStructureItemInputI {
  schoolPaymentItemId: string
  amount: number
  notes?: string
  paymentRequirement: PaymentRequirement
  isApplicableToFutureStudents: boolean
  // ISO date-time; only meaningful when paymentRequirement is Optional.
  subscriptionDueDate?: string
}

export interface CreateSchoolPaymentStructurePayloadI {
  schoolId: string
  schoolSessionId: string
  schoolSessionTermId: string
  schoolClassId: string
  notes?: string
  items: SchoolPaymentStructureItemInputI[]
}

export interface CreateSchoolPaymentStructureResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

// The list endpoint's items don't follow the documented Swagger contract —
// verified against the live response, it returns these shorter field names
// instead of the schoolXxx-prefixed ones the details/create endpoints use.
export interface SchoolPaymentStructureI {
  id: string
  classId: string
  className: string
  sessionId: string
  sessionName: string
  termId: string
  termName: string
  totalAmount: number
  totalItems: number
  notes: string
  status: string
  dateCreated: string
}

export interface PaginatedSchoolPaymentStructuresValueI {
  items: SchoolPaymentStructureI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetSchoolPaymentStructuresResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedSchoolPaymentStructuresValueI
}

export interface GetAllSchoolPaymentStructuresParamsI {
  pageNumber?: number
  pageSize?: number
  keyword?: string
  schoolId?: string
  schoolSessionId?: string
  schoolSessionTermId?: string
  schoolClassId?: string
  status?: string
}

export interface SchoolPaymentStructureFeeItemI {
  schoolPaymentStructureItemId: string
  paymentItemId: string
  paymentItemName: string
  amount: number
  notes: string
  isApplicableToFutureStudents?: boolean
  subscriptionDueDate?: string
}

export interface SchoolPaymentStructureDetailsI {
  id: string
  schoolId: string
  schoolClassId: string
  schoolClassName: string
  schoolSessionId: string
  schoolSessionName: string
  schoolSessionTermId: string
  schoolSessionTermName: string
  notes: string
  status: string
  dateCreated: string
  dateModified: string
  grandTotal: number
  canDeleteItems: boolean
  compulsoryFees: SchoolPaymentStructureFeeItemI[]
  optionalFees: SchoolPaymentStructureFeeItemI[]
}

export interface GetSchoolPaymentStructureDetailsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolPaymentStructureDetailsI
}

export interface UpdateSchoolPaymentStructurePayloadI {
  id: string
  notes?: string
  items: SchoolPaymentStructureItemInputI[]
}

export interface UpdateSchoolPaymentStructureResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface DeleteSchoolPaymentStructureResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

// applyTo enum: AllStudentsInClass = 1, SpecificStudents = 2
export interface AddSchoolPaymentItemsPayloadI {
  schoolPaymentStructureId: string
  applyTo: number
  studentEnrollmentIds?: string[]
  paymentItems: SchoolPaymentStructureItemInputI[]
  schoolId: string
}

export interface AddSchoolPaymentItemsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface EligibleStudentI {
  studentEnrollmentId: string
  studentId: string
  admissionNumber: string
  fullName: string
  className: string
  armName: string
}

export interface GetEligibleStudentsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: EligibleStudentI[]
}

// ─── Payment Reminder ────────────────────────────────────────────────────────

export interface GetPaymentRemindersParamsI {
  schoolId: string
  sessionId: string
  termId: string
  classId: string
  search?: string
  status?: string
  minBalance?: number
  maxBalance?: number
  pageNumber?: number
  pageSize?: number
}

export interface PaymentReminderBillI {
  studentBillId: string
  studentId: string
  studentName: string
  className: string
  sessionName: string
  termName: string
  totalBill: number
  amountPaid: number
  outstandingBalance: number
  paymentStatus: number
  dueDate: string
}

export interface PaginatedPaymentRemindersValueI {
  items: PaymentReminderBillI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetPaymentRemindersResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedPaymentRemindersValueI
}

export interface PaymentReminderBillItemI {
  id: string
  name: string
  amount: number
  notes: string
  isCustom: boolean
  // Swagger's example shows a number (matching PaymentRequirement's numeric
  // enum), but sibling bill-item endpoints serialize this enum as its string
  // name (see InvoiceBillItemI.paymentRequirement) — verify live before
  // trusting either shape.
  paymentRequirement: string | number
  isSelected: boolean
}

export interface PaymentReminderBillDetailsI {
  studentBillId: string
  totalBill: number
  amountPaid: number
  outstandingBalance: number
  paymentStatus: string
  notes: string
  dateCreated: string
  dateModified: string
  studentId: string
  studentName: string
  className: string
  armName: string
  sessionName: string
  termName: string
  dueDate: string
  items: PaymentReminderBillItemI[]
}

export interface GetPaymentReminderDetailsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaymentReminderBillDetailsI
}

// ─── FeeManagement: class fee list + wallet payments ──────────────────────────
// Powers the Bursar's "pay outstanding fees from an already-funded student
// wallet" flow — distinct from SchoolTransaction/Allocate, which funds a
// wallet in the first place.

export interface GetStudentFeesByClassParamsI {
  schoolId?: string
  sessionId?: string
  termId?: string
  classId?: string
  armId?: string
  search?: string
  pageNumber?: number
  pageSize?: number
}

export interface StudentFeeByClassI {
  studentId: string
  studentSchoolId: string
  studentEnrollmentId: string
  studentName: string
  admissionNumber: string
  profileImageUrl: string
  schoolClassId: string
  className: string
  schoolArmId: string
  armName: string
  walletBalance: number
  schoolStudentBillId: string
  totalBilled: number
  totalPaid: number
  outstandingAmount: number
  paymentStatus: number
}

export interface PaginatedStudentFeesByClassValueI {
  items: StudentFeeByClassI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetStudentFeesByClassResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedStudentFeesByClassValueI
}

export interface PaySchoolFeeFromWalletPayloadI {
  schoolId: string
  studentId: string
  schoolStudentBillId: string
  recordedByUserId: string
  idempotencyKey: string
}

// Shared by all four wallet-payment endpoints below (single/custom/bulk all
// return this same shape, per Swagger — bulk's plural result is separate,
// see BulkWalletFeePaymentResultI).
export interface WalletFeePaymentResultI {
  schoolStudentBillId: string
  studentId: string
  paidAmount: number
  remainingWalletBalance: number
  totalBilled: number
  totalPaid: number
  remainingOutstandingAmount: number
  paymentStatus: number
  paymentReference: string
  paymentDate: string
}

export interface PaySchoolFeeFromWalletResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: WalletFeePaymentResultI
}

export interface CustomPaySchoolFeeFromWalletPayloadI {
  schoolId: string
  studentId: string
  schoolStudentBillId: string
  amountToDeduct: number
  recordedByUserId: string
  idempotencyKey: string
}

export interface CustomPaySchoolFeeFromWalletResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: WalletFeePaymentResultI
}

export interface BulkPayClassSchoolFeesFromWalletPayloadI {
  schoolId: string
  sessionId: string
  termId: string
  classId: string
  armId?: string
  recordedByUserId: string
  idempotencyKey: string
}

export interface BulkWalletFeePaymentResultI {
  totalStudentsProcessed: number
  studentsPaidCount: number
  studentsSkippedCount: number
  totalAmountDeducted: number
}

export interface BulkPayClassSchoolFeesFromWalletResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: BulkWalletFeePaymentResultI
}

export interface BulkCustomPayClassSchoolFeesFromWalletPayloadI {
  schoolId: string
  sessionId: string
  termId: string
  classId: string
  armId?: string
  amountToDeduct: number
  recordedByUserId: string
  idempotencyKey: string
}

export interface BulkCustomPayClassSchoolFeesFromWalletResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: BulkWalletFeePaymentResultI
}

// ─── SchoolTransaction ───────────────────────────────────────────────────────

export const TransactionCategory = {
  Income: 1,
  Expense: 2,
} as const
export type TransactionCategory =
  (typeof TransactionCategory)[keyof typeof TransactionCategory]

export const TransactionMode = {
  Cash: 1,
  Transfer: 2,
  Online: 3,
} as const
export type TransactionMode =
  (typeof TransactionMode)[keyof typeof TransactionMode]

export const TransactionSource = {
  Manual: 1,
  Flutterwave: 2,
  Paystack: 3,
  Monnify: 4,
  System: 5,
} as const
export type TransactionSource =
  (typeof TransactionSource)[keyof typeof TransactionSource]

export interface CreateSchoolTransactionPayloadI {
  schoolId: string
  guardianId: string
  sessionId: string
  termId: string
  transactionCategory: TransactionCategory
  // References a school-defined SchoolTransactionType record (see
  // schoolTransactionType section below) — replaces the old fixed
  // transactionType enum.
  schoolTransactionTypeId: string
  transactionMode: TransactionMode
  transactionSource: TransactionSource
  amount: number
  description: string
}

// The Create payload takes the numeric enum values below, but the API
// serializes them back out as their string names (e.g. "Income", "Cash") —
// confirmed against the live GetAll response, contrary to what the Swagger
// schema's numeric example values suggest. schoolTransactionTypeId/Name
// replace the old fixed transactionType enum field.
export interface SchoolTransactionI {
  payrollPayslipId?: string
  payrollComponent?: string
  payrollReversesId?: string
  id: string
  schoolId: string
  guardianId: string
  sessionId: string
  termId: string
  transactionCategory: string
  schoolTransactionTypeId: string
  schoolTransactionTypeName: string
  transactionMode: string
  transactionSource: string
  amount: number
  discountAmount: number
  vatPercentage: number
  vatAmount: number
  netAmount: number
  description: string
  reference: string
  paymentStatus: string
  status: string
  transactionDate: string
  dateCreated: string
}

export interface CreateSchoolTransactionResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolTransactionI
}

export interface ApplyTransactionVatPayloadI {
  transactionId: string
  vatPercentage: number
}

export interface ApplyTransactionVatResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface ApplyTransactionDiscountPayloadI {
  transactionId: string
  discountAmount: number
}

export interface ApplyTransactionDiscountResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface TransactionAllocationInputI {
  studentId: string
  amount: number
}

export interface AllocateTransactionPayloadI {
  transactionId: string
  allocations: TransactionAllocationInputI[]
}

export interface AllocateTransactionResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface GetSchoolTransactionsParamsI {
  search?: string
  direction?: string
  schoolId?: string
  guardianId?: string
  sessionId?: string
  termId?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  pageNumber?: number
  pageSize?: number
}

export interface PaginatedSchoolTransactionsValueI {
  cashSummary?: { currency: string; moneyIn: number; moneyOut: number; partiallyPaidCount: number }[]
  items: SchoolTransactionI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetSchoolTransactionsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedSchoolTransactionsValueI
}

export interface TransactionAllocationI {
  id: string
  studentId: string
  studentName: string
  amount: number
}

// A parent's per-child wallet is credited via a transaction allocation; this
// is the ledger entry produced against that child's wallet balance.
export interface WalletTransactionI {
  id: string
  walletId: string
  studentId: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  transactionType: number
  description: string
  transactionDate: string
}

export interface SchoolTransactionDetailsI {
  id: string
  schoolId: string
  guardianId: string
  guardianName: string
  sessionId: string
  sessionName: string
  termId: string
  termName: string
  transactionCategory: string
  schoolTransactionTypeId: string
  schoolTransactionTypeName: string
  transactionMode: string
  transactionSource: string
  amount: number
  discountAmount: number
  vatPercentage: number
  vatAmount: number
  netAmount: number
  description: string
  reference: string
  paymentStatus: string
  status: string
  transactionDate: string
  dateCreated: string
  allocations: TransactionAllocationI[]
  walletTransactions: WalletTransactionI[]
}

export interface GetSchoolTransactionDetailsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolTransactionDetailsI
}

// ─── SchoolTransactionType ───────────────────────────────────────────────────

export interface CreateSchoolTransactionTypePayloadI {
  schoolId: string
  name: string
  description: string
}

// Per the backend-enum-serialization gotcha seen elsewhere in this API
// (e.g. SchoolTransactionI.transactionCategory), status fields tend to
// serialize as their string name rather than the numeric value Swagger's
// example shows — verify live before trusting either shape.
export interface SchoolTransactionTypeI {
  id: string
  schoolId: string
  name: string
  description: string
  status: string | number
  dateCreated: string
  dateModified: string
}

export interface CreateSchoolTransactionTypeResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolTransactionTypeI
}

export interface UpdateSchoolTransactionTypePayloadI {
  id: string
  schoolId: string
  name: string
  description: string
}

export interface UpdateSchoolTransactionTypeResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolTransactionTypeI
}

export interface ToggleSchoolTransactionTypeStatusPayloadI {
  id: string
  schoolId: string
}

export interface ToggleSchoolTransactionTypeStatusResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolTransactionTypeI
}

export interface GetSchoolTransactionTypesParamsI {
  schoolId?: string
  status?: string
}

export interface GetSchoolTransactionTypesResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolTransactionTypeI[]
}

export interface GetSchoolTransactionTypeDetailsParamsI {
  id: string
  schoolId?: string
}

export interface GetSchoolTransactionTypeDetailsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolTransactionTypeI
}

// ─── StudentInvoice ──────────────────────────────────────────────────────────

// Swagger documents these query params as PascalCase (SchoolId, StudentId, ...);
// ASP.NET Core query-string binding is case-insensitive, so the camelCase
// names used elsewhere in this file work the same way here.
export interface GetInvoiceBillItemsParamsI {
  schoolId?: string
  studentId?: string
  schoolSessionId?: string
  schoolSessionTermId?: string
  schoolClassId?: string
}

export interface InvoiceBillItemI {
  schoolStudentBillItemId: string
  description: string
  amount: number
  notes: string
  isCustom: boolean
  paymentRequirement: string
  netAmount: number
}

export interface InvoiceBillItemsValueI {
  billId: string
  items: InvoiceBillItemI[]
}

export interface GetInvoiceBillItemsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: InvoiceBillItemsValueI
}

export interface GenerateInvoicePayloadI {
  schoolId: string
  guardianId: string
  studentId: string
  studentEnrollmentId: string
  schoolSessionId: string
  schoolSessionTermId: string
  schoolClassId: string
  issueDate: string
  dueDate: string
  notes?: string
}

export interface StudentInvoiceLineItemI {
  description: string
  amount: number
  discount: number
  netAmount: number
  notes: string
}

export interface StudentInvoiceI {
  id: string
  invoiceNumber: string
  studentName: string
  parentName: string
  session: string
  term: string
  class: string
  issueDate: string
  dueDate: string
  notes: string
  paymentStatus: string
  subTotal: number
  totalDiscount: number
  grandTotal: number
  amountPaid: number
  outstandingAmount: number
  dateCreated: string
  dateModified: string
  items: StudentInvoiceLineItemI[]
}

export interface GenerateInvoiceResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentInvoiceI
}

// PaymentStatus filter: 1 = Unpaid, 2 = Partial, 3 = Paid, 4 = Overdue (per
// Swagger's enum picklist; the API does not label these).
export interface GetInvoicesParamsI {
  schoolId?: string
  schoolSessionId?: string
  schoolSessionTermId?: string
  schoolClassId?: string
  studentId?: string
  guardianId?: string
  paymentStatus?: number
  invoiceNumber?: string
  search?: string
  pageNumber?: number
  pageSize?: number
}

export interface StudentInvoiceSummaryI {
  id: string
  invoiceNumber: string
  studentName: string
  parentName: string
  session: string
  term: string
  class: string
  issueDate: string
  dueDate: string
  grandTotal: number
  amountPaid: number
  outstandingAmount: number
  paymentStatus: string
  dateCreated: string
}

export interface PaginatedStudentInvoicesValueI {
  items: StudentInvoiceSummaryI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetInvoicesValueI {
  invoices: PaginatedStudentInvoicesValueI
  totalInvoiced: number
  totalCollected: number
  outstandingBalance: number
  fullyPaidCount: number
}

export interface GetInvoicesResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: GetInvoicesValueI
}

export interface GetInvoiceDetailsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentInvoiceI
}

export interface UpdateInvoiceStatusPayloadI {
  invoiceId: string
  amountPaid: number
  dueDate?: string
}

export interface UpdateInvoiceStatusResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentInvoiceI
}

export interface DeleteInvoiceResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

// ─── SchoolBill ────────────────────────────────────────────────────────────────

// PaymentStatus: 1 = Unpaid, 2 = Partial, 3 = Paid, 4 = Overdue — same picklist
// as StudentInvoice's PaymentStatus above; the response field itself comes
// back as a label string (e.g. "Unpaid"), not the number.
export const BillPaymentStatus = {
  Unpaid: 1,
  Partial: 2,
  Paid: 3,
  Overdue: 4,
} as const
export type BillPaymentStatus =
  (typeof BillPaymentStatus)[keyof typeof BillPaymentStatus]

export interface CreateSchoolBillItemInputI {
  description: string
  quantity: number
  unitPrice: number
}

export interface CreateSchoolBillPayloadI {
  schoolId: string
  schoolSessionId: string
  schoolSessionTermId: string
  customerName: string
  issueDate: string
  dueDate: string
  notes?: string
  items: CreateSchoolBillItemInputI[]
}

export interface SchoolBillLineItemI {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface SchoolBillI {
  id: string
  billNumber: string
  customerName: string
  session: string
  term: string
  issueDate: string
  dueDate: string
  notes: string
  paymentStatus: string
  totalAmount: number
  amountPaid: number
  outstandingAmount: number
  dateCreated: string
  dateModified: string
  items: SchoolBillLineItemI[]
}

export interface CreateSchoolBillResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolBillI
}

export interface GetSchoolBillsParamsI {
  schoolId?: string
  schoolSessionId?: string
  schoolSessionTermId?: string
  paymentStatus?: number
  customerName?: string
  billNumber?: string
  issueDateFrom?: string
  issueDateTo?: string
  dueDateFrom?: string
  dueDateTo?: string
  search?: string
  pageNumber?: number
  pageSize?: number
}

export interface SchoolBillSummaryI {
  id: string
  billNumber: string
  customerName: string
  session: string
  term: string
  issueDate: string
  dueDate: string
  totalAmount: number
  amountPaid: number
  outstandingAmount: number
  paymentStatus: string
  dateCreated: string
}

export interface PaginatedSchoolBillsValueI {
  items: SchoolBillSummaryI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetSchoolBillsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedSchoolBillsValueI
}

export interface GetSchoolBillDetailsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolBillI
}

export interface UpdateSchoolBillStatusPayloadI {
  billId: string
  paymentStatus: number
  amountPaid: number
  dueDate?: string
}

export interface UpdateSchoolBillStatusResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SchoolBillI
}

export interface DeleteSchoolBillResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface GetFeeManagementOverviewParamsI {
  schoolId: string
  sessionId?: string
  termId?: string
}

export interface FeeOverviewRecentPaymentI {
  studentId: string
  studentName: string
  classTerm: string
  amount: number
  paymentMethod: string
  paymentDate: string
}

export interface FeeOverviewOutstandingFeeI {
  studentId: string
  studentName: string
  className: string
  outstandingBalance: number
  daysOverdue: number
  dueDate: string | null
}

export interface FeeOverviewCollectionTrendPointI {
  month: string
  collected: number
  outstanding: number
}

export interface FeeOverviewLevelBreakdownI {
  level: string
  totalExpected: number
  totalCollected: number
  collectionRatePercent: number
}

export interface FeeManagementOverviewI {
  sessionId: string
  termId: string
  sessionName: string
  termName: string
  totalExpected: number
  totalCollected: number
  outstanding: number
  collectionRatePercent: number
  unpaidRatePercent: number
  thisTermCollected: number
  thisTermVsLastTermPercent: number | null
  paymentsTodayAmount: number
  paymentsTodayCount: number
  defaulterCount: number
  recentPayments: FeeOverviewRecentPaymentI[]
  outstandingFees: FeeOverviewOutstandingFeeI[]
  collectionTrend: FeeOverviewCollectionTrendPointI[]
  byLevel: FeeOverviewLevelBreakdownI[]
}

export interface GetFeeManagementOverviewResponseI {
  isSuccess: boolean
  message: string
  error?: string
  isFailure?: boolean
  statusCode: number
  value: FeeManagementOverviewI
}
