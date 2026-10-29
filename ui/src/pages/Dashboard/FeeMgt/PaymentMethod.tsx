import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { Pencil, Trash2, Plus, CreditCard, Loader2 } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetSchoolPaymentMethods } from "@/hooks/feeManagement"
import type { SchoolPaymentMethodI } from "@/api/feeManagement.api/types"
import PaymentMethodFormModal from "./components/PaymentMethodFormModal"
import DeletePaymentMethodModal from "./components/DeletePaymentMethodModal"

export default function PaymentMethodsPage() {
  const schoolId = useSchoolId()
  const { paymentMethods, isLoading } = useGetSchoolPaymentMethods(schoolId)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SchoolPaymentMethodI | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SchoolPaymentMethodI | null>(
    null
  )

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (method: SchoolPaymentMethodI) => {
    setEditing(method)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offline Payment Methods"
        description="Define cash, POS and bank-transfer instructions shown on invoices. Online providers are managed separately."
        actions={
          <Button
            variant="primary"
            onClick={openCreate}
            className="w-full justify-center sm:w-auto"
          >
            <Plus className="size-4" />
            Add Method
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white py-16">
          <Loader2 className="size-5 animate-spin text-gray-400" />
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <CreditCard className="size-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">
            No payment methods yet
          </p>
          <p className="max-w-xs text-xs text-gray-400">
            Add methods like GTBank Transfer or Cash so they appear as options
            when generating invoices.
          </p>
          <Button
            onClick={openCreate}
            variant="outline"
            className="mt-1 rounded-xl"
          >
            Add your first method
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <CreditCard className="size-4 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-900">{method.name}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEdit(method)}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(method)}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                <p>
                  Account: <span className="font-medium text-gray-700">{method.accountNumber}</span>
                </p>
                <p>
                  Currency: <span className="font-medium text-gray-700">{method.currencyCode}</span>
                </p>
              </div>
              <p className="text-xs leading-relaxed whitespace-pre-line text-gray-500">
                {method.details}
              </p>
            </div>
          ))}
        </div>
      )}

      <PaymentMethodFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        schoolId={schoolId}
      />

      <DeletePaymentMethodModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
