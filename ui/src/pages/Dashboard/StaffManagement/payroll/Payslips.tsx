import { useState } from "react"
import jsPDF from "jspdf"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  usePayrollData,
  usePayrollSave,
  money,
  date,
  type Row,
} from "./service"
import { Editor, Fields, Table, State, Pager, input, card } from "./shared"
function detailLines(row: Row): Row[] {
  if (row.lines?.length) return row.lines
  return [
    ["Basic pay", row.basicSalary, "Earning"],
    ["Housing", row.housingAllowance, "Earning"],
    ["Transport", row.transportAllowance, "Earning"],
    ["Other allowance", row.otherAllowance, "Earning"],
    ["Bonus", row.bonus, "Earning"],
    ["Tax", row.taxDeduction, "Deduction"],
    ["Pension", row.pensionDeduction, "Deduction"],
    ["Other deduction", row.otherDeduction, "Deduction"],
  ].map(([name, amount, category]) => ({ name, amount, category, code: name }))
}
export function PayslipDetail({
  row,
  onClose,
}: {
  row: Row
  onClose: () => void
}) {
  const lines = detailLines(row)
  const pdf = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text("Staff payslip", 18, 23)
    doc.setFontSize(10)
    let y = 35
    const entries = [
      ["Employee", row.staffName],
      ["Period", `${date(row.periodStart)} to ${date(row.periodEnd)}`],
      ["Status", row.status],
      ["Currency", row.currency],
      ...lines.map((l) => [
        `${l.name} (${l.category})`,
        money(l.amount, row.currency),
      ]),
      ["Gross earnings", money(row.grossPay, row.currency)],
      ["Employee deductions", money(row.totalDeductions, row.currency)],
      ["Reimbursements", money(row.reimbursements, row.currency)],
      ["Net pay", money(row.netPay, row.currency)],
      [
        "Employer contributions",
        money(row.employerContributions, row.currency),
      ],
    ]
    entries.forEach(([label, value]) => {
      const text = doc.splitTextToSize(`${label}: ${value}`, 174)
      if (y + text.length * 6 > 278) {
        doc.addPage()
        y = 20
      }
      doc.text(text, 18, y)
      y += text.length * 6 + 2
    })
    doc.save(`payslip-${row.id}.pdf`)
  }
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Payslip · {row.staffName}</DialogTitle>
          <DialogDescription>
            {date(row.periodStart)} – {date(row.periodEnd)} · {row.status} ·{" "}
            {row.currency}
          </DialogDescription>
        </DialogHeader>
        <Table
          rows={lines}
          columns={[
            ["Item", "name"],
            ["Type", "category"],
            ["Amount", (l) => money(l.amount, row.currency)],
          ]}
        />
        <dl className="grid grid-cols-2 gap-4">
          {[
            ["Gross earnings", row.grossPay],
            ["Deductions", row.totalDeductions],
            ["Reimbursements", row.reimbursements],
            ["Net pay", row.netPay],
            ["Employer contributions", row.employerContributions],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="text-lg font-semibold">
                {money(Number(value), row.currency)}
              </dd>
            </div>
          ))}
        </dl>
        <Button onClick={pdf}>Download payslip PDF</Button>
      </DialogContent>
    </Dialog>
  )
}
export function EditPayslip({
  slip,
  run,
  setup,
  close,
}: {
  slip: Row
  run: Row
  setup: Row
  close: () => void
}) {
  const [lines, setLines] = useState<Row[]>(
      slip.lines.map((l: Row) => ({ ...l }))
    ),
    [add, setAdd] = useState(""),
    [v, set] = useState<Row>({ note: "" }),
    save = usePayrollSave()
  return (
    <Editor
      title={`Review pay · ${slip.staffName}`}
      description="Enter externally checked amounts and units. Saving confirms every listed manual item, including zero. Percentage lines use the saved earning bases. The server recalculates all totals."
      onClose={close}
      submit="Save reviewed amounts"
      onSave={() =>
        save.mutateAsync({
          path: `Runs/${run.id}`,
          method: "PUT",
          body: {
            version: run.version,
            note: v.note,
            adjustments: [
              {
                payslipId: slip.id,
                lines: lines.map((l) => ({
                  code: l.code,
                  value: l.value,
                  quantity: l.quantity,
                })),
                removeCodes: slip.lines
                  .filter((l: Row) => !lines.some((x) => x.code === l.code))
                  .map((l: Row) => l.code),
              },
            ],
          },
        })
      }
    >
      <div className="space-y-3">
        {lines.map((line, index) => (
          <div className="rounded-lg border p-3" key={line.code}>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <strong className="text-sm">{line.name}</strong>
                <p className="text-xs text-slate-500">
                  {line.code} · {line.category} · {line.calculation}
                  {line.calculation === "Percentage" && ` of ${line.basis}`}
                  {!line.confirmed && " · Confirmation required"}
                </p>
              </div>
              {line.code !== "BASIC" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLines(lines.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              )}
            </div>
            <Fields
              values={line}
              setValues={(v) =>
                setLines(lines.map((l, i) => (i === index ? v : l)))
              }
              fields={[
                {
                  name: "value",
                  label:
                    line.calculation === "Percentage"
                      ? "Percentage"
                      : line.calculation === "Quantity"
                        ? "Rate"
                        : `Amount (${slip.currency})`,
                  type: "number",
                },
                ...(line.calculation === "Quantity"
                  ? [
                      {
                        name: "quantity",
                        label: "Units",
                        type: "number",
                        step: "0.0001",
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        ))}
      </div>
      <div className="flex items-end gap-3">
        <label className="flex-1 text-sm">
          Add a one-off adjustment
          <select
            className={input}
            value={add}
            onChange={(e) => setAdd(e.target.value)}
          >
            <option value="">Select pay item</option>
            {setup.items
              .filter(
                (i: Row) => i.active && !lines.some((l) => l.code === i.code)
              )
              .map((i: Row) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
          </select>
        </label>
        <Button
          type="button"
          variant="outline"
          disabled={!add}
          onClick={() => {
            const item = setup.items.find((i: Row) => i.id === add)
            setLines([
              ...lines,
              { ...item, value: item.defaultValue, quantity: 1 },
            ])
            setAdd("")
          }}
        >
          Add
        </Button>
      </div>
      <Fields
        values={v}
        setValues={set}
        fields={[{ name: "note", label: "Reason / source of adjustment" }]}
      />
    </Editor>
  )
}
export function MyPayslips() {
  const [page, setPage] = useState(1),
    [detail, setDetail] = useState<Row | null>(null),
    q = usePayrollData("MyPayslips", { page })
  return (
    <section className={card + " space-y-4"}>
      <h2 className="text-lg font-semibold">My payslips</h2>
      <p className="text-sm text-slate-500">
        Approved payslips published by your school.
      </p>
      <State query={q}>
        <Table
          rows={q.data?.items || []}
          columns={[
            ["Period", (r) => `${date(r.periodStart)} – ${date(r.periodEnd)}`],
            ["Net pay", (r) => money(r.netPay, r.currency)],
            ["Payment status", "status"],
          ]}
          actions={(r) => (
            <Button variant="outline" onClick={() => setDetail(r)}>
              View payslip
            </Button>
          )}
        />
        <Pager data={q.data} page={page} setPage={setPage} />
      </State>
      {detail && <PayslipDetail row={detail} onClose={() => setDetail(null)} />}
    </section>
  )
}
