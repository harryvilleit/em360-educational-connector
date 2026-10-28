export type CustomerType = "parent" | "customer"

interface InvoiceBase {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  term: string
  session: string
  status: "Paid" | "Partial" | "Unpaid"
  amountPaid: number
  balance: number
  createdAt: string
  studentName: string
  studentId: string
  studentClass: string
  paymentInstructions?: string
}

export interface PaymentTypeInvoiceRecord extends InvoiceBase {
  kind: "payment-type"
  paymentTypeId: string
  paymentMethod: "Cash" | "Bank Transfer" | "POS" | "Online"
  department?: string
  coreFees: { label: string; amount: number }[]
  selectedAddOns: { label: string; amount: number }[]
  subtotal: number
  discount: number
  discountReason?: string
  lateFeeAmount: number
  totalAmount: number
  notes?: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  type: CustomerType
  students?: string[]
}

export type PaymentTypeRecord = {
  id: string
  name: string
  amount: number
  date: string
  term: string
  class: string
  session: string
  description?: string
  category?: string
  applicableClasses: string[]
  applicableToAllStudents: boolean
  applicableStudentIds: string[]
  coreFees: { label: string; amount: string; mandatory: boolean }[]
  addOns: { label: string; amount: string; mandatory: boolean }[]
  totalAmount: number
  totalCoreFees: number
  totalAddOns: number
  createdAt: string
}

export interface FeeState {
  customers: Customer[]
}
