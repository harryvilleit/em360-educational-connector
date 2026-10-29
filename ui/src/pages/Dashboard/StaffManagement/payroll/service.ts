import api from "@/api/api"
import { queryKeys } from "@/utils/queryKeys"
import { toCamelCase } from "@/utils/caseConversion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSchoolId } from "@/contexts/SchoolContext"
import { toast } from "sonner"
export type Row = Record<string, any>
export async function payrollRequest(
  schoolId: string,
  path: string,
  method = "GET",
  body?: unknown,
  params: Row = {}
) {
  const data: any = toCamelCase(
    await api.request({
      url: "/SchoolPayroll/" + path,
      method,
      params: { ...params, schoolId },
      data: body,
    })
  )
  if (data?.isSuccess === false)
    throw new Error(data.message || data.error || "Payroll request failed")
  return data && "value" in data ? data.value : data
}
export function usePayrollData(path: string, params: Row = {}, enabled = true) {
  const schoolId = useSchoolId()
  return useQuery({
    queryKey: ["shared-payroll", schoolId, path, params],
    enabled: enabled && !!schoolId,
    retry: false,
    queryFn: () => payrollRequest(schoolId, path, "GET", undefined, params),
  })
}
export function usePayrollSave() {
  const schoolId = useSchoolId(),
    cache = useQueryClient()
  return useMutation({
    mutationFn: ({
      path,
      body,
      method = "POST",
    }: {
      path: string
      body: unknown
      method?: string
    }) => payrollRequest(schoolId, path, method, body),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: ["shared-payroll", schoolId] })
      await cache.invalidateQueries({
        predicate: (q) =>
          [
            queryKeys.schoolTransactions,
            queryKeys.schoolTransactionDetails,
            "staff-portal",
          ].includes(String(q.queryKey[0])),
      })
      toast.success("Payroll saved")
    },
  })
}
export const money = (value: number, currency = "GBP") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "GBP",
  }).format(value || 0)
export const date = (v: string) => v?.slice(0, 10) || "—"
export const today = () => new Date().toISOString().slice(0, 10)
export function csvDownload(rows: unknown[][], name: string) {
  const safe = (v: unknown) => {
    let s = String(v ?? "")
    if (/^\s*[=+@-]/.test(s)) s = "'" + s
    return '"' + s.replaceAll('"', '""') + '"'
  }
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + rows.map((r) => r.map(safe).join(",")).join("\r\n")], {
      type: "text/csv;charset=utf-8",
    })
  )
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
/** Restricted CSV contract: UUID, item code, decimal value, decimal quantity. No free-text fields. */
export function parseAdjustments(text: string) {
  const rows = text
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/)
    .map((r) =>
      r.split(",").map((c) => c.trim().replace(/^"([^"\n]*)"$/, "$1"))
    )
  if (rows.shift()?.join(",") !== "payslipId,code,value,quantity")
    throw new Error("Use the template headers: payslipId,code,value,quantity")
  if (!rows.length || rows.length > 10000)
    throw new Error("Import between 1 and 10,000 rows")
  const grouped = new Map<string, Row[]>(),
    seen = new Set<string>()
  rows.forEach((r, index) => {
    if (
      r.length !== 4 ||
      !/^[\da-f-]{36}$/i.test(r[0]) ||
      !/^[A-Z][A-Z0-9_]{1,39}$/.test(r[1]) ||
      !/^\d+(\.\d{1,2})?$/.test(r[2]) ||
      !/^\d+(\.\d{1,4})?$/.test(r[3])
    )
      throw new Error(`Row ${index + 2}: invalid ID, code, amount or quantity`)
    const key = r[0] + ":" + r[1]
    if (seen.has(key))
      throw new Error(`Row ${index + 2}: duplicate employee and pay item`)
    seen.add(key)
    const list = grouped.get(r[0]) || []
    list.push({ code: r[1], value: Number(r[2]), quantity: Number(r[3]) })
    grouped.set(r[0], list)
  })
  return [...grouped].map(([payslipId, lines]) => ({ payslipId, lines }))
}
