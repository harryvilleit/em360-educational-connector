import { useState } from "react"
import { useSearchParams } from "react-router"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { usePayrollData, money, date, type Row } from "./payroll/service"
import { Table, State, Pager, card } from "./payroll/shared"
import {
  ItemEditor,
  AssignmentEditor,
  RunEditor,
  ItemTable,
} from "./payroll/Settings"
import { PayslipDetail } from "./payroll/Payslips"
import RunDetail from "./payroll/RunDetail"
export default function PayrollPage() {
  const [params, setParams] = useSearchParams(),
    runId = params.get("run"),
    [tab, setTab] = useState("Runs"),
    [page, setPage] = useState(1),
    [item, setItem] = useState<Row | null>(null),
    [salary, setSalary] = useState<Row | null>(null),
    [create, setCreate] = useState(false),
    [detail, setDetail] = useState<Row | null>(null),
    setup = usePayrollData("Setup"),
    q = usePayrollData(
      tab,
      {
        page,
        ...(tab === "Salaries" && params.get("staffId")
          ? { staffId: params.get("staffId") }
          : {}),
      },
      tab !== "Items" && !runId
    )
  const openRun = (id: string) => {
    const next = new URLSearchParams(params)
    next.set("run", id)
    setParams(next)
  }
  const closeRun = () => {
    const next = new URLSearchParams(params)
    next.delete("run")
    setParams(next)
  }
  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Payroll"
        description="Configure employee pay, review pay runs and record completed payments."
      />
      <State query={setup}>
        {setup.data && (
          <>
            {runId ? (
              <RunDetail id={runId} setup={setup.data} back={closeRun} />
            ) : (
              <>
                <div className={card + " border-blue-100 bg-blue-50/50"}>
                  <p className="text-sm text-slate-700">
                    <strong>Manual payroll</strong> · Configure pay items →
                    Assign staff pay → Create and review a draft → Approve →
                    Publish payslips → Record payments.
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Statutory figures come from your accountant or payroll
                    software. Attendance deductions, loan balances and proration
                    require review. Xero and statutory submissions are not
                    connected.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2" role="tablist">
                    {[
                      ["Runs", "Pay runs"],
                      ["Items", "Pay items"],
                      ["Salaries", "Staff pay"],
                      ["History", "Historical payslips"],
                    ].map(([key, label]) => (
                      <Button
                        key={key}
                        role="tab"
                        aria-selected={tab === key}
                        variant={tab === key ? "primary" : "outline"}
                        onClick={() => {
                          setTab(key)
                          setPage(1)
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tab === "Items" && setup.data.canUpdate && (
                      <Button onClick={() => setItem({})}>
                        Create pay item
                      </Button>
                    )}
                    {tab === "Salaries" && setup.data.canUpdate && (
                      <Button onClick={() => setSalary({})}>
                        Assign staff pay
                      </Button>
                    )}
                    {tab === "Runs" && setup.data.canCreate && (
                      <Button onClick={() => setCreate(true)}>
                        Create pay run
                      </Button>
                    )}
                  </div>
                </div>
                {tab === "Items" ? (
                  <ItemTable setup={setup.data} edit={setItem} />
                ) : (
                  <State query={q}>
                    {tab === "Runs" && (
                      <Table
                        rows={q.data?.items || []}
                        columns={[
                          [
                            "Period",
                            (r) =>
                              `${date(r.periodStart)} – ${date(r.periodEnd)}`,
                          ],
                          ["Pay date", (r) => date(r.payDate)],
                          ["Frequency", "payFrequency"],
                          ["Currency", "currency"],
                          ["Status", "status"],
                        ]}
                        actions={(r) => (
                          <Button
                            variant="outline"
                            onClick={() => openRun(r.id)}
                          >
                            Open run
                          </Button>
                        )}
                      />
                    )}
                    {tab === "Salaries" && (
                      <Table
                        rows={q.data?.items || []}
                        columns={[
                          ["Employee", "staffName"],
                          ["Effective from", (r) => date(r.effectiveDate)],
                          [
                            "Basic pay",
                            (r) => money(r.basicSalary, r.currency),
                          ],
                          ["Frequency", "payFrequency"],
                          [
                            "Assigned items",
                            (r) => JSON.parse(r.payItemsJson || "[]").length,
                          ],
                        ]}
                        actions={
                          setup.data.canUpdate
                            ? (r) => (
                                <Button
                                  variant="outline"
                                  onClick={() => setSalary(r)}
                                >
                                  New salary version
                                </Button>
                              )
                            : undefined
                        }
                      />
                    )}
                    {tab === "History" && (
                      <>
                        <p className="mb-3 text-sm text-slate-500">
                          Existing payslips are preserved. Historical payment
                          acknowledgements have not been posted again to the
                          cash book.
                        </p>
                        <Table
                          rows={q.data?.items || []}
                          columns={[
                            ["Employee", "staffName"],
                            ["Period", (r) => date(r.periodStart)],
                            ["Net pay", (r) => money(r.netPay, r.currency)],
                            ["Status", "status"],
                          ]}
                          actions={(r) => (
                            <Button
                              variant="outline"
                              onClick={() => setDetail(r)}
                            >
                              View payslip
                            </Button>
                          )}
                        />
                      </>
                    )}
                    <Pager data={q.data} page={page} setPage={setPage} />
                  </State>
                )}
              </>
            )}
            {item && (
              <ItemEditor
                setup={setup.data}
                row={item}
                close={() => setItem(null)}
              />
            )}
            {salary && (
              <AssignmentEditor
                setup={setup.data}
                row={salary}
                close={() => setSalary(null)}
              />
            )}
            {create && (
              <RunEditor
                setup={setup.data}
                close={() => setCreate(false)}
                created={openRun}
              />
            )}
            {detail && (
              <PayslipDetail row={detail} onClose={() => setDetail(null)} />
            )}
          </>
        )}
      </State>
    </div>
  )
}
