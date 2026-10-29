import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetSchoolBills, useDeleteSchoolBill } from "@/hooks/feeManagement"
import type { SchoolBillSummaryI } from "@/api/feeManagement.api/types"
import { BillsTable } from "./components/BillsTable"
import { BillFormModal } from "./components/BillFormModal"
import { EditBillModal } from "./components/EditBillModal"
import { ViewBillModal } from "./components/ViewBillModal"

const PAGE_SIZE = 10

export default function BillsPage() {
  const schoolId = useSchoolId()
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBill, setEditingBill] = useState<SchoolBillSummaryI | null>(null)
  const [viewingBillId, setViewingBillId] = useState<string | null>(null)

  const { bills, totalItems, isLoading } = useGetSchoolBills({
    schoolId,
    pageNumber: page,
    pageSize: PAGE_SIZE,
  })
  const { deleteSchoolBillAsync } = useDeleteSchoolBill()

  const handleDelete = async (bill: SchoolBillSummaryI) => {
    if (!window.confirm(`Delete bill ${bill.billNumber}? This cannot be undone.`))
      return
    await deleteSchoolBillAsync(bill.id)
  }

  return (
    <div className="space-y-5 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Bills</h1>
          <p className="text-sm text-muted-foreground">
            Create and track bills with auto-generated bill numbers
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="size-4" />
          New bill
        </Button>
      </div>

      <BillsTable
        bills={bills}
        isLoading={isLoading}
        onView={(b) => setViewingBillId(b.id)}
        onEdit={(b) => setEditingBill(b)}
        onDelete={handleDelete}
        page={page}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <BillFormModal
        open={showCreateModal}
        schoolId={schoolId}
        onClose={() => setShowCreateModal(false)}
      />

      <EditBillModal
        open={!!editingBill}
        bill={editingBill}
        onClose={() => setEditingBill(null)}
      />

      <ViewBillModal
        open={!!viewingBillId}
        billId={viewingBillId}
        onClose={() => setViewingBillId(null)}
      />
    </div>
  )
}
