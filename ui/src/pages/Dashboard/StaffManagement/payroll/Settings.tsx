import { useState } from "react"
import { Button } from "@/components/ui/button"
import { usePayrollSave, today, type Row } from "./service"
import {
  Editor,
  Fields,
  StaffSelection,
  Table,
  input,
  options,
  frequencies,
} from "./shared"
export function ItemEditor({
  row = {},
  setup,
  close,
}: {
  row?: Row
  setup: Row
  close: () => void
}) {
  const [v, set] = useState<Row>({
      id: null,
      version: 0,
      code: "",
      name: "",
      category: "Earning",
      calculation: "Fixed",
      basis: "BASIC",
      defaultValue: 0,
      statutory: false,
      recurring: true,
      active: true,
      settlement: "Remit",
      transactionTypeId: "",
      ...row,
    }),
    save = usePayrollSave()
  return (
    <Editor
      title={v.id ? "Edit pay item" : "Create pay item"}
      description="Each school defines its own allowances, deductions and employer costs. Saved payslips retain their original definitions."
      onClose={close}
      onSave={() => save.mutateAsync({ path: "Items", body: v })}
    >
      <Fields
        values={v}
        setValues={set}
        fields={[
          {
            name: "code",
            label: "Permanent code",
            help: "Example: TRANSPORT, TAX or PENSION. Codes cannot be renamed.",
          },
          { name: "name", label: "Payslip label" },
          {
            name: "category",
            label: "Category",
            options: options([
              "Earning",
              "Deduction",
              "Employer",
              "Reimbursement",
            ]),
          },
          {
            name: "calculation",
            label: "Calculation",
            options: options(
              v.statutory
                ? ["Manual"]
                : ["Fixed", "Percentage", "Quantity", "Manual"]
            ),
          },
          {
            name: "defaultValue",
            label:
              v.calculation === "Percentage"
                ? "Default percentage"
                : v.calculation === "Quantity"
                  ? "Rate per unit"
                  : "Default amount",
            type: "number",
          },
          ...(v.calculation === "Percentage"
            ? [
                {
                  name: "basis",
                  label: "Percentage basis",
                  help: "BASIC or comma-separated earning codes, e.g. BASIC,HOUSING. No arbitrary formulas.",
                },
              ]
            : []),
          {
            name: "transactionTypeId",
            label: "Bookkeeping category",
            required: false,
            options: [
              { value: "", label: "Use the run's payroll category" },
              ...setup.categories.map((r: Row) => ({
                value: r.id,
                label: r.name,
              })),
            ],
          },
          ...(v.category === "Deduction"
            ? [
                {
                  name: "settlement",
                  label: "Deduction treatment",
                  options: [
                    { value: "Remit", label: "Payable to a third party" },
                    {
                      value: "Recovery",
                      label: "Recovery retained by the school",
                    },
                  ],
                },
              ]
            : []),
          {
            name: "recurring",
            label: "Available for recurring staff assignments",
            type: "checkbox",
          },
          {
            name: "active",
            label: "Active for new pay runs",
            type: "checkbox",
          },
        ]}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={v.statutory}
          onChange={(e) =>
            set({
              ...v,
              statutory: e.target.checked,
              ...(e.target.checked
                ? { calculation: "Manual", defaultValue: 0 }
                : {}),
            })
          }
        />
        Statutory item — enter and confirm an externally calculated amount every
        run
      </label>
    </Editor>
  )
}
export function AssignmentEditor({
  setup,
  row = {},
  close,
}: {
  setup: Row
  row?: Row
  close: () => void
}) {
  const [v, set] = useState<Row>({
      basicSalary: row.basicSalary || 0,
      effectiveDate: "",
      payFrequency: row.payFrequency || "monthly",
    }),
    [staff, setStaff] = useState<Row>(
      row.staffId ? { [row.staffId]: row.staffName } : {}
    ),
    [items, setItems] = useState<Row[]>(JSON.parse(row.payItemsJson || "[]")),
    [add, setAdd] = useState(""),
    save = usePayrollSave()
  return (
    <Editor
      title="Assign employee pay"
      description="Create an effective-dated salary version for one employee or a selected group. Amounts are per pay cycle. This replaces the package from that date; previous payslips stay unchanged."
      onClose={close}
      onSave={() =>
        save.mutateAsync({
          path: "Salaries",
          body: { ...v, staffIds: Object.keys(staff), items },
        })
      }
    >
      <StaffSelection selected={staff} setSelected={setStaff} />
      <Fields
        values={v}
        setValues={set}
        fields={[
          {
            name: "basicSalary",
            label: `Basic pay (${setup.currency})`,
            type: "number",
          },
          {
            name: "payFrequency",
            label: "Pay frequency",
            options: frequencies,
          },
          { name: "effectiveDate", label: "Effective from", type: "date" },
        ]}
      />
      {row.legacyAllowances + row.legacyDeductions > 0 && (
        <p className="text-sm text-amber-800">
          The previous version has fixed allowances or deductions. Add their
          equivalent pay items below; they are not copied automatically into
          this new package.
        </p>
      )}
      <div className="flex items-end gap-3">
        <label className="flex-1 text-sm">
          Recurring pay item
          <select
            className={input}
            value={add}
            onChange={(e) => setAdd(e.target.value)}
          >
            <option value="">Choose an item</option>
            {setup.items
              .filter(
                (r: Row) =>
                  r.active &&
                  r.recurring &&
                  !items.some((i) => i.itemId === r.id)
              )
              .map((r: Row) => (
                <option key={r.id} value={r.id}>
                  {r.code} · {r.name}
                </option>
              ))}
          </select>
        </label>
        <Button
          type="button"
          variant="outline"
          disabled={!add}
          onClick={() => {
            setItems([
              ...items,
              {
                itemId: add,
                value: setup.items.find((r: Row) => r.id === add).defaultValue,
                quantity: 1,
                startsOn: null,
                endsOn: null,
              },
            ])
            setAdd("")
          }}
        >
          Add item
        </Button>
      </div>
      {items.map((a, index) => {
        const definition = setup.items.find((r: Row) => r.id === a.itemId)
        return (
          <div key={a.itemId} className="rounded-lg border p-3">
            <div className="mb-2 flex justify-between">
              <strong className="text-sm">
                {definition?.name || "Archived item"}
              </strong>
              <Button
                type="button"
                variant="outline"
                onClick={() => setItems(items.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            </div>
            <Fields
              values={a}
              setValues={(next) =>
                setItems(
                  items.map((old, i) =>
                    i === index
                      ? {
                          ...next,
                          startsOn: next.startsOn || null,
                          endsOn: next.endsOn || null,
                        }
                      : old
                  )
                )
              }
              fields={[
                {
                  name: "value",
                  label:
                    definition?.calculation === "Percentage"
                      ? "Percentage"
                      : "Amount / unit rate",
                  type: "number",
                },
                ...(definition?.calculation === "Quantity"
                  ? [
                      {
                        name: "quantity",
                        label: "Default units (review every run)",
                        type: "number",
                        step: "0.0001",
                      },
                    ]
                  : []),
                {
                  name: "startsOn",
                  label: "Starts on (optional)",
                  type: "date",
                  required: false,
                },
                {
                  name: "endsOn",
                  label: "Ends on (optional)",
                  type: "date",
                  required: false,
                },
              ]}
            />
          </div>
        )
      })}
      <p className="text-xs text-slate-500">
        Assignments apply when active at the period start. Mid-period changes
        require a reviewed adjustment. For loans, review the outstanding balance
        and end the assignment when recovered.
      </p>
    </Editor>
  )
}
export function RunEditor({
  setup,
  close,
  created,
}: {
  setup: Row
  close: () => void
  created: (id: string) => void
}) {
  const [v, set] = useState<Row>({
      periodStart: today().slice(0, 7) + "-01",
      payDate: today(),
      payFrequency: "monthly",
      country: "GB",
      salaryTransactionTypeId: "",
      all: true,
    }),
    [staff, setStaff] = useState<Row>({}),
    save = usePayrollSave()
  return (
    <Editor
      title="Create a draft pay run"
      description="Capture effective staff pay and current item definitions. Review external statutory figures, attendance adjustments and proration before submitting."
      onClose={close}
      submit="Create draft"
      onSave={async () => {
        const result = await save.mutateAsync({
          path: "Runs",
          body: { ...v, staffIds: v.all ? null : Object.keys(staff) },
        })
        created(result.id)
      }}
    >
      <Fields
        values={v}
        setValues={set}
        fields={[
          { name: "periodStart", label: "Period start", type: "date" },
          { name: "payDate", label: "Planned pay date", type: "date" },
          {
            name: "payFrequency",
            label: "Pay frequency",
            options: frequencies,
          },
          {
            name: "country",
            label: "Payroll country code",
            help: "For example GB, NG or GH. This does not enable automatic tax calculations.",
          },
          {
            name: "salaryTransactionTypeId",
            label: "Payroll cash-book category",
            options: [
              { value: "", label: "Select an existing category" },
              ...setup.categories.map((r: Row) => ({
                value: r.id,
                label: r.name,
              })),
            ],
          },
          {
            name: "all",
            label: "Include all eligible employees",
            type: "checkbox",
          },
        ]}
      />
      {!setup.categories.length && (
        <p role="alert">
          Create a bookkeeping transaction category in Fee Management first.
        </p>
      )}
      {!v.all && <StaffSelection selected={staff} setSelected={setStaff} />}
    </Editor>
  )
}
export function ItemTable({
  setup,
  edit,
}: {
  setup: Row
  edit: (r: Row) => void
}) {
  return (
    <Table
      rows={setup.items}
      columns={[
        ["Code", "code"],
        ["Name", "name"],
        ["Category", "category"],
        [
          "Calculation",
          (r) =>
            `${r.calculation}${r.calculation === "Percentage" ? " of " + r.basis : ""}`,
        ],
        ["Applies", (r) => (r.recurring ? "Recurring / one-off" : "One-off")],
        ["Status", (r) => (r.active ? "Active" : "Archived")],
      ]}
      actions={
        setup.canUpdate
          ? (r) => (
              <Button variant="outline" onClick={() => edit(r)}>
                Edit item
              </Button>
            )
          : undefined
      }
    />
  )
}
