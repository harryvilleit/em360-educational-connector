//  Payroll Types

import type { Staff } from "."

export type PayFrequency = "monthly" | "biweekly" | "weekly"

export type PayslipStatus = "draft" | "processed" | "paid"

//  Core Entities

export interface SalaryStructure {
  id: string
  staffId: string
  basicSalary: number
  housingAllowance: number
  transportAllowance: number
  otherAllowance: number
  taxDeduction: number
  pensionDeduction: number
  otherDeduction: number
  payFrequency: PayFrequency
  effectiveDate: string
  updatedAt: string
}

export interface Payslip {
  id: string
  staffId: string
  staff: Staff
  period: string // "YYYY-MM"
  basicSalary: number
  housingAllowance: number
  transportAllowance: number
  otherAllowance: number
  bonus: number
  bonusReason?: string
  taxDeduction: number
  pensionDeduction: number
  otherDeduction: number
  grossPay: number
  totalDeductions: number
  netPay: number
  status: PayslipStatus
  generatedAt: string
  paidAt?: string
}

//  Form Types

export interface SalaryStructureFormData {
  basicSalary: number
  housingAllowance: number
  transportAllowance: number
  otherAllowance: number
  taxDeduction: number
  pensionDeduction: number
  otherDeduction: number
  payFrequency: PayFrequency
  effectiveDate: string
}

export interface GeneratePayslipFormData {
  staffId: string
  period: string
  bonus?: number
  bonusReason?: string
}

//  API / Query Types

export interface PayslipFilters {
  staffId?: string
  period?: string
  status?: PayslipStatus
}
