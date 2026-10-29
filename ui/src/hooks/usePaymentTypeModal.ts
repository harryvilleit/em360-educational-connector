import { useState } from "react"
import type { SchoolPaymentStructureI } from "@/api/feeManagement.api/types"

export function usePaymentTypeModals() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SchoolPaymentStructureI | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] =
    useState<SchoolPaymentStructureI | null>(null)
  const [addItemTarget, setAddItemTarget] =
    useState<SchoolPaymentStructureI | null>(null)
  const [sendTarget, setSendTarget] =
    useState<SchoolPaymentStructureI | null>(null)

  return {
    createOpen,
    openCreate: () => setCreateOpen(true),
    closeCreate: () => setCreateOpen(false),

    editTarget,
    openEdit: (pt: SchoolPaymentStructureI) => setEditTarget(pt),
    closeEdit: () => setEditTarget(null),

    deleteTarget,
    openDelete: (pt: SchoolPaymentStructureI) => setDeleteTarget(pt),
    closeDelete: () => setDeleteTarget(null),

    addItemTarget,
    openAddItem: (pt: SchoolPaymentStructureI) => setAddItemTarget(pt),
    closeAddItem: () => setAddItemTarget(null),

    sendTarget,
    openSend: (pt: SchoolPaymentStructureI) => setSendTarget(pt),
    closeSend: () => setSendTarget(null),
  }
}
