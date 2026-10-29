export function today() {
  return new Date().toISOString().split("T")[0]
}

export function dueIn14() {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toISOString().split("T")[0]
}

export interface BillItemDraft {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export function emptyBillItem(): BillItemDraft {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: 1,
    unitPrice: 0,
  }
}
