import { useState } from "react"
import { Button } from "@/components/ui/button"
import { usePayrollData, date, money, type Row } from "../payroll/service"
import { State, Table } from "../payroll/shared"
import { PayslipDetail } from "../payroll/Payslips"
export function PayrollSummary({ staffId }: { staffId: string }) {
  const q = usePayrollData("StaffPayslips", { staffId }),
    [detail, setDetail] = useState<Row | null>(null)
  return (
    <State query={q}>
      <Table
        rows={q.data?.items || []}
        columns={[
          ["Period", (r) => date(r.periodStart)],
          ["Net pay", (r) => money(r.netPay, r.currency)],
          ["Status", "status"],
        ]}
        actions={(r) => (
          <Button variant="outline" onClick={() => setDetail(r)}>
            View
          </Button>
        )}
      />
      {detail && <PayslipDetail row={detail} onClose={() => setDetail(null)} />}
    </State>
  )
}
