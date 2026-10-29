import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { X, Plus, Trash2 } from "lucide-react"
import { useCreateSchoolBill } from "@/hooks/feeManagement"
import { useCurrentAcademicStore } from "@/store/currentAcademic.store"
import {
  dueIn14,
  emptyBillItem,
  today,
  type BillItemDraft,
} from "@/utils/bills"
import SessionTermClassSelect from "./SessionTermClassSelect"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface BillFormModalProps {
  open: boolean
  schoolId: string
  onClose: () => void
}

interface FormErrors {
  customerName?: string
  session?: string
  term?: string
  issueDate?: string
  dueDate?: string
}

export function BillFormModal({ open, schoolId, onClose }: BillFormModalProps) {
  const { currencyCode, formatMoney } = useSchoolMoney()
  const currentSessionId = useCurrentAcademicStore((s) => s.currentSessionId)
  const currentTermId = useCurrentAcademicStore((s) => s.currentTermId)

  const [customerName, setCustomerName] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [termId, setTermId] = useState("")
  const [issueDate, setIssueDate] = useState(today())
  const [dueDate, setDueDate] = useState(dueIn14())
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<BillItemDraft[]>([emptyBillItem()])
  const [errors, setErrors] = useState<FormErrors>({})

  const resolvedSessionId = sessionId || currentSessionId || ""
  const resolvedTermId = termId || currentTermId || ""

  const { createSchoolBillAsync, isPending } = useCreateSchoolBill({
    onSuccess: () => {
      handleClose()
    },
  })

  const grandTotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0)

  const updateItem = (
    id: string,
    field: keyof Omit<BillItemDraft, "id">,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    )
  }

  const removeItem = (id: string) => {
    if (items.length > 1) setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const handleSave = async () => {
    const nextErrors: FormErrors = {}
    if (!customerName.trim())
      nextErrors.customerName = "Customer name is required"
    if (!resolvedSessionId) nextErrors.session = "Please select a session"
    if (!resolvedTermId) nextErrors.term = "Please select a term"
    if (!issueDate) nextErrors.issueDate = "Issue date is required"
    if (!dueDate) nextErrors.dueDate = "Due date is required"
    else if (issueDate && dueDate < issueDate)
      nextErrors.dueDate = "Due date cannot be before issue date"

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    await createSchoolBillAsync({
      schoolId,
      schoolSessionId: resolvedSessionId,
      schoolSessionTermId: resolvedTermId,
      customerName: customerName.trim(),
      issueDate,
      dueDate,
      notes: notes.trim() || undefined,
      items: items.map(({ description, quantity, unitPrice }) => ({
        description,
        quantity,
        unitPrice,
      })),
    })
  }

  const handleClose = () => {
    setCustomerName("")
    setSessionId(currentSessionId ?? "")
    setTermId(currentTermId ?? "")
    setIssueDate(today())
    setDueDate(dueIn14())
    setNotes("")
    setItems([emptyBillItem()])
    setErrors({})
    onClose()
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create bill"
      tabIndex={-1}
      onKeyDown={(event) => event.key === "Escape" && handleClose()}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      {/* Modal panel */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-gray-100 bg-white">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">New bill</h2>
            <p className="text-xs text-muted-foreground">
              Bill number will be auto-generated on save
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="space-y-4 p-6">
          {/* Customer + session/term */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <div className="border-b border-gray-50 px-5 py-3">
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Bill details
              </p>
            </div>

            <div className="space-y-3 p-5">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Customer name</label>
                <Input
                  value={customerName}
                  placeholder="Who is this bill for?"
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                {errors.customerName && (
                  <p className="text-xs text-red-500">{errors.customerName}</p>
                )}
              </div>

              <SessionTermClassSelect
                schoolId={schoolId}
                sessionId={resolvedSessionId}
                onSessionChange={setSessionId}
                termId={resolvedTermId}
                onTermChange={setTermId}
                sessionError={errors.session}
                termError={errors.term}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Issue date</label>
                  <Input
                    type="date"
                    className="h-9 rounded-xl text-sm"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                  {errors.issueDate && (
                    <p className="text-xs text-red-500">{errors.issueDate}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">Due date</label>
                  <Input
                    type="date"
                    className="h-9 rounded-xl text-sm"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                  {errors.dueDate && (
                    <p className="text-xs text-red-500">{errors.dueDate}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">
                  Notes (optional)
                </label>
                <Textarea
                  rows={2}
                  value={notes}
                  placeholder="Anything the customer should know about this bill"
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <div className="border-b border-gray-50 px-5 py-3">
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Items
              </p>
            </div>
            <div className="p-5">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableHead className="px-0 py-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                      Description
                    </TableHead>
                    <TableHead className="w-24 px-2 py-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                      Qty
                    </TableHead>
                    <TableHead className="w-32 px-2 py-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                      Price ({currencyCode})
                    </TableHead>
                    <TableHead className="w-28 px-2 py-2 text-right text-xs font-semibold tracking-widest text-gray-400 uppercase">
                      Net ({currencyCode})
                    </TableHead>
                    <TableHead className="w-8 px-0 py-2" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-gray-50 hover:bg-transparent"
                    >
                      <TableCell className="px-0 py-2">
                        <Input
                          className="h-8 rounded-lg text-sm"
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <Input
                          type="number"
                          min={1}
                          className="h-8 rounded-lg text-sm"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "quantity",
                              Math.max(1, Number(e.target.value))
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <Input
                          type="number"
                          min={0}
                          className="h-8 rounded-lg text-sm"
                          placeholder="0"
                          value={item.unitPrice || ""}
                          onChange={(e) =>
                            updateItem(
                              item.id,
                              "unitPrice",
                              Number(e.target.value)
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="px-2 py-2 text-right text-sm font-semibold text-gray-900">
                        {formatMoney(item.quantity * item.unitPrice)}
                      </TableCell>
                      <TableCell className="px-0 py-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setItems((p) => [...p, emptyBillItem()])}
                className="mt-3 h-8 rounded-xl border-dashed text-xs text-gray-500"
              >
                <Plus className="mr-1 size-3.5" />
                Add another item
              </Button>

              <div className="mt-4 flex flex-col items-end gap-2 border-t border-gray-100 pt-4">
                <div className="flex gap-6 text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatMoney(grandTotal)}
                  </span>
                </div>
                <div className="flex gap-6 text-base">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="font-semibold text-gray-900">
                    {formatMoney(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex w-full justify-end gap-3 px-6 py-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-1/2 rounded-xl border-gray-200 py-5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="w-1/2 rounded-xl bg-blue-600 py-5 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Confirm & save"}
          </Button>
        </div>
      </div>
    </div>
  )
}
