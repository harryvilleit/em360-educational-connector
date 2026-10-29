import { useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetSchoolTransactionTypes,
  useToggleSchoolTransactionTypeStatus,
} from "@/hooks/feeManagement"
import type { SchoolTransactionTypeI } from "@/api/feeManagement.api/types"
import TransactionTypeTable from "./components/TransactionTypeTable"
import TransactionTypeModal from "./components/TransactionTypeModal"

export default function TransactionTypesPage() {
  const schoolId = useSchoolId()
  const { transactionTypes, isLoading } = useGetSchoolTransactionTypes({
    schoolId,
  })
  const { toggleSchoolTransactionTypeStatus, isPending: isToggling } =
    useToggleSchoolTransactionTypeStatus()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SchoolTransactionTypeI | null>(null)

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (t: SchoolTransactionTypeI) => {
    setEditing(t)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditing(null)
  }

  const handleToggleStatus = (t: SchoolTransactionTypeI) => {
    toggleSchoolTransactionTypeStatus({ id: t.id, schoolId })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Types"
        description="Define the transaction types shown when adding a transaction."
        actions={
          <Button
            variant="primary"
            onClick={openCreate}
            className="w-full justify-center sm:w-auto"
          >
            <Plus className="size-4" />
            Add Transaction Type
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white py-16">
          <Loader2 className="size-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <TransactionTypeTable
          transactionTypes={transactionTypes}
          onEdit={openEdit}
          onAdd={openCreate}
          onToggleStatus={handleToggleStatus}
          isToggling={isToggling}
        />
      )}

      <TransactionTypeModal
        open={modalOpen}
        onClose={handleClose}
        editing={editing}
        schoolId={schoolId}
      />
    </div>
  )
}
