import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  usePayrollData,
  usePayrollSave,
  csvDownload,
  parseAdjustments,
  today,
  date,
  money,
  type Row,
} from "./service"
import { State, Table, Editor, Fields, input, card } from "./shared"
import { PayslipDetail, EditPayslip } from "./Payslips"
function Action({
  action,
  run,
  close,
}: {
  action: string
  run: Row
  close: () => void
}) {
  const [v, set] = useState<Row>({ note: "", externalFiguresChecked: false }),
    save = usePayrollSave()
  return (
    <Editor
      title={`${action} pay run`}
      description={
        action === "Approve"
          ? "Approval freezes all amounts. The school owner may self-approve with a recorded review reason. Correct approved figures through a later adjustment run."
          : action === "Publish"
            ? "Make these approved payslips available to their employees. Publication does not send emails or make bank payments."
            : action === "Cancel"
              ? "Cancel this unapproved draft. Its audit remains, and a replacement run can be created for the period."
              : "Record the reason for this workflow change."
      }
      onClose={close}
      submit={action}
      onSave={() =>
        save.mutateAsync({
          path: `Runs/${run.id}/${action}`,
          body: { ...v, version: run.version },
        })
      }
    >
      <Fields
        values={v}
        setValues={set}
        fields={[
          { name: "note", label: "Review note / reason" },
          ...(action === "Approve"
            ? [
                {
                  name: "externalFiguresChecked",
                  label:
                    "I checked statutory figures, deduction authority, employee eligibility and any proration externally",
                  type: "checkbox",
                },
              ]
            : []),
        ]}
      />
    </Editor>
  )
}
function Payment({
  slip,
  data,
  close,
}: {
  slip: Row
  data: Row
  close: () => void
}) {
  const components = [
      { code: "NET", name: "Employee net pay", amount: slip.netPay },
      ...slip.lines.filter(
        (l: Row) =>
          l.category === "Employer" ||
          (l.category === "Deduction" && l.settlement === "Remit")
      ),
    ],
    [v, set] = useState<Row>({
      component: "NET",
      amount: 0,
      paymentDate: today(),
      bankReference: "",
      note: "",
      operationId: crypto.randomUUID(),
    }),
    save = usePayrollSave()
  const due = components.find((c) => c.code === v.component)?.amount || 0,
    paid = data.payments
      .filter(
        (p: Row) =>
          p.payrollPayslipId === slip.id && p.payrollComponent === v.component
      )
      .reduce((n: number, p: Row) => n + p.amount, 0)
  return (
    <Editor
      title={`Record payment · ${slip.staffName}`}
      description="Record a completed bank transfer or remittance. This records cash movement in Fee Management; it does not transfer funds. A contribution remittance settles the payable without adding another payroll cost."
      onClose={close}
      submit="Record actual payment"
      onSave={() =>
        save.mutateAsync({
          path: "Payments",
          body: { ...v, payslipId: slip.id },
        })
      }
    >
      <Fields
        values={v}
        setValues={set}
        fields={[
          {
            name: "component",
            label: "Payee / component",
            options: components.map((c) => ({ value: c.code, label: c.name })),
          },
          {
            name: "amount",
            label: `Actual amount (${slip.currency})`,
            type: "number",
          },
          { name: "paymentDate", label: "Payment date", type: "date" },
          { name: "bankReference", label: "Bank / cash voucher reference" },
          { name: "note", label: "Payment note or evidence reference" },
        ]}
      />
      <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
        Amount due: {money(due, slip.currency)} · Already recorded:{" "}
        {money(paid, slip.currency)} · Remaining:{" "}
        <strong>{money(due - paid, slip.currency)}</strong>
      </p>
    </Editor>
  )
}
function Reverse({ row, close }: { row: Row; close: () => void }) {
  const [v, set] = useState<Row>({
      operationId: crypto.randomUUID(),
      reason: "",
      reversalDate: today(),
    }),
    save = usePayrollSave()
  return (
    <Editor
      title="Reverse payment record"
      description="Use for an incorrect entry or an actual returned payment. The original remains visible and a linked reversing cash entry restores the amount due. This does not reverse a bank transfer."
      onClose={close}
      submit="Record reversal"
      onSave={() =>
        save.mutateAsync({ path: `Payments/${row.id}/Reverse`, body: v })
      }
    >
      <Fields
        values={v}
        setValues={set}
        fields={[
          { name: "reason", label: "Reason / evidence reference" },
          { name: "reversalDate", label: "Reversal date", type: "date" },
        ]}
      />
    </Editor>
  )
}
function Import({
  run,
  slips,
  close,
}: {
  run: Row
  slips: Row[]
  close: () => void
}) {
  const [rows, setRows] = useState<Row[]>([]),
    [error, setError] = useState(""),
    [v, set] = useState<Row>({ note: "" }),
    save = usePayrollSave()
  return (
    <Editor
      title="Import reviewed amounts"
      description="Download the run template, enter amounts from your checked payroll worksheet, then upload the CSV. Nothing is saved until you submit. Any invalid row rejects the whole import."
      onClose={close}
      submit="Apply all reviewed rows"
      onSave={() => {
        if (!rows.length || error) throw new Error("Choose a valid CSV first")
        return save.mutateAsync({
          path: `Runs/${run.id}`,
          method: "PUT",
          body: { version: run.version, note: v.note, adjustments: rows },
        })
      }}
    >
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          csvDownload(
            [
              ["payslipId", "code", "value", "quantity"],
              ...slips.flatMap((s) =>
                s.lines.map((l: Row) => [s.id, l.code, l.value, l.quantity])
              ),
            ],
            `payroll-${run.id}-template.csv`
          )
        }
      >
        Download CSV template
      </Button>
      <label className="block text-sm">
        Reviewed CSV
        <input
          type="file"
          accept=".csv,text/csv"
          className={input}
          onChange={async (e) => {
            setRows([])
            setError("")
            try {
              const f = e.target.files?.[0]
              if (!f) return
              if (f.size > 2_000_000) throw new Error("CSV must be under 2 MB")
              const parsed = parseAdjustments(await f.text())
              if (parsed.some((p) => !slips.some((s) => s.id === p.payslipId)))
                throw new Error("The CSV contains an employee outside this run")
              setRows(parsed)
            } catch (e: any) {
              setError(e.message)
            }
          }}
        />
      </label>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {rows.length > 0 && (
        <>
          <p className="text-sm">
            {rows.length} employees ·{" "}
            {rows.reduce((n, r) => n + r.lines.length, 0)} pay item updates.
            Review before applying.
          </p>
          <div className="max-h-64 overflow-auto">
            <Table
              rows={rows.flatMap((r) =>
                r.lines.map((l: Row) => ({
                  ...l,
                  id: r.payslipId + l.code,
                  staff: slips.find((s) => s.id === r.payslipId)?.staffName,
                }))
              )}
              columns={[
                ["Employee", "staff"],
                ["Code", "code"],
                ["Value / rate", "value"],
                ["Units", "quantity"],
              ]}
            />
          </div>
        </>
      )}
      <Fields
        values={v}
        setValues={set}
        fields={[{ name: "note", label: "Import source / review note" }]}
      />
    </Editor>
  )
}
export default function RunDetail({
  id,
  setup,
  back,
}: {
  id: string
  setup: Row
  back: () => void
}) {
  const q = usePayrollData(`Runs/${id}`),
    [action, setAction] = useState(""),
    [detail, setDetail] = useState<Row | null>(null),
    [edit, setEdit] = useState<Row | null>(null),
    [pay, setPay] = useState<Row | null>(null),
    [reverse, setReverse] = useState<Row | null>(null),
    [importing, setImporting] = useState(false)
  const data = q.data,
    run = data?.run,
    t = data?.totals
  return (
    <State query={q}>
      {run && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" onClick={back}>
              ← Pay runs
            </Button>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
              {run.status} · Version {run.version}
              {run.publishedAtUtc && " · Payslips published"}
            </span>
          </div>
          <div className={card}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {date(run.periodStart)} – {date(run.periodEnd)}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {run.payFrequency} · Pay date {date(run.payDate)} ·{" "}
                  {run.country} · {run.currency} · {data.payslips.length}{" "}
                  employees
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {run.status === "Draft" && setup.canUpdate && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setImporting(true)}
                    >
                      Import CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setAction("Cancel")}
                    >
                      Cancel draft
                    </Button>
                    <Button onClick={() => setAction("Submit")}>
                      Submit for review
                    </Button>
                  </>
                )}
                {run.status === "Submitted" && setup.canUpdate && (
                  <Button variant="outline" onClick={() => setAction("Return")}>
                    Return to draft
                  </Button>
                )}
                {run.status === "Submitted" && setup.owner && (
                  <Button onClick={() => setAction("Approve")}>
                    Approve payroll
                  </Button>
                )}
                {run.status === "Approved" &&
                  !run.publishedAtUtc &&
                  setup.owner && (
                    <Button onClick={() => setAction("Publish")}>
                      Publish payslips
                    </Button>
                  )}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Payroll cost", t.cost],
              ["Employee net pay", t.net],
              ["Employee pay outstanding", t.net - t.paid],
              ["Remittances outstanding", t.remittable - t.remitted],
            ].map(([label, value]) => (
              <div key={label} className={card}>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {money(value, run.currency)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500">
            Payroll cost = gross earnings + employer contributions +
            reimbursements. Deductions reduce net pay. Remitting a deduction
            settles a payable; it does not add to payroll cost.
            {run.status !== "Approved" && " Draft figures are provisional."}
          </p>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() =>
                csvDownload(
                  [
                    [
                      "Staff",
                      "Staff ID",
                      "Period",
                      "Currency",
                      "Gross",
                      "Deductions",
                      "Reimbursements",
                      "Employer contributions",
                      "Net pay",
                      "Status",
                    ],
                    ...data.payslips.map((s: Row) => [
                      s.staffName,
                      s.staffId,
                      run.periodStart,
                      s.currency,
                      s.grossPay,
                      s.totalDeductions,
                      s.reimbursements,
                      s.employerContributions,
                      s.netPay,
                      s.status,
                    ]),
                  ],
                  `payroll-${id}.csv`
                )
              }
            >
              Export payroll register
            </Button>
          </div>
          <Table
            rows={data.payslips}
            columns={[
              ["Employee", "staffName"],
              ["Gross", (r) => money(r.grossPay, r.currency)],
              ["Deductions", (r) => money(r.totalDeductions, r.currency)],
              ["Net pay", (r) => money(r.netPay, r.currency)],
              [
                "Status",
                (r) =>
                  r.lines.some((l: Row) => !l.confirmed)
                    ? "Needs review"
                    : r.status,
              ],
            ]}
            actions={(r) => (
              <>
                <Button variant="outline" onClick={() => setDetail(r)}>
                  View
                </Button>
                {run.status === "Draft" && setup.canUpdate && (
                  <Button variant="outline" onClick={() => setEdit(r)}>
                    Review amounts
                  </Button>
                )}
                {run.status === "Approved" && setup.owner && (
                  <Button variant="outline" onClick={() => setPay(r)}>
                    Record payment
                  </Button>
                )}
              </>
            )}
          />
          <section className="space-y-3">
            <h3 className="text-lg font-semibold">Payments and remittances</h3>
            <Table
              rows={data.payments}
              columns={[
                [
                  "Employee",
                  (r) =>
                    data.payslips.find((s: Row) => s.id === r.payrollPayslipId)
                      ?.staffName,
                ],
                ["Component", "payrollComponent"],
                ["Date", (r) => date(r.transactionDate)],
                ["Amount", (r) => money(r.amount, run.currency)],
                ["Reference", "payrollBankReference"],
                [
                  "Entry",
                  (r) =>
                    r.payrollReversesId
                      ? "Reversal"
                      : data.payments.some(
                            (p: Row) => p.payrollReversesId === r.id
                          )
                        ? "Reversed"
                        : "Payment",
                ],
              ]}
              actions={
                setup.owner
                  ? (r) =>
                      !r.payrollReversesId &&
                      !data.payments.some(
                        (p: Row) => p.payrollReversesId === r.id
                      ) && (
                        <Button variant="outline" onClick={() => setReverse(r)}>
                          Reverse record
                        </Button>
                      )
                  : undefined
              }
            />
          </section>
          <details className={card}>
            <summary className="cursor-pointer font-semibold">
              Audit history
            </summary>
            <ol className="mt-4 space-y-3">
              {JSON.parse(run.auditJson || "[]").map((a: Row, i: number) => (
                <li key={i} className="border-b pb-3 text-sm">
                  <strong>{a.action}</strong> ·{" "}
                  {new Date(a.atUtc).toLocaleString()}
                  <p>{a.note}</p>
                  <p className="text-xs text-slate-500">
                    Recorded by {a.userId}
                  </p>
                </li>
              ))}
            </ol>
          </details>
          {action && (
            <Action action={action} run={run} close={() => setAction("")} />
          )}
          {detail && (
            <PayslipDetail row={detail} onClose={() => setDetail(null)} />
          )}
          {edit && (
            <EditPayslip
              slip={edit}
              run={run}
              setup={setup}
              close={() => setEdit(null)}
            />
          )}
          {pay && <Payment slip={pay} data={data} close={() => setPay(null)} />}
          {reverse && <Reverse row={reverse} close={() => setReverse(null)} />}
          {importing && (
            <Import
              run={run}
              slips={data.payslips}
              close={() => setImporting(false)}
            />
          )}
        </div>
      )}
    </State>
  )
}
