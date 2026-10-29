import { useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetSchoolPaymentStructures } from "@/hooks/feeManagement"
import CreatePaymentTypeModal from "./components/CreatePaymentTypeModal"
import EditPaymentTypeModal from "./components/EditPaymentModal"
import AddPaymentItemModal from "./components/AddPaymentItemModal"
import SendPaymentTypeToGuardiansModal from "./components/SendPaymentTypeToGuardiansModal"
import { usePaymentTypeModals } from "@/hooks/usePaymentTypeModal"
import PaymentTypeTable from "./components/PaymentTypeTable"
import { DashboardRoutes } from "@/routes"

export default function PaymentTypesPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const schoolId = useSchoolId()
  const { paymentStructures, isLoading } =
    useGetSchoolPaymentStructures(schoolId)

  const modals = usePaymentTypeModals()
  
  const [searchParams] = useSearchParams()
  const prefillSessionId = searchParams.get("sessionId") ?? undefined
  const prefillTermId = searchParams.get("termId") ?? undefined
  const prefillClassId = searchParams.get("classId") ?? undefined

  useEffect(() => {
    if (prefillSessionId || prefillTermId || prefillClassId) {
      modals.openCreate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillSessionId, prefillTermId, prefillClassId])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Types"
        description="Manage fee payments assigned to students."
        actions={
          <Button variant="primary" onClick={modals.openCreate}>
            <Plus className="size-4" />
            Create Payment Type
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white py-16">
          <Loader2 className="size-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <PaymentTypeTable
          paymentTypes={paymentStructures}
          onView={(pt) =>
            navigate(
              DashboardRoutes.toViewPaymentType(productId ?? "", pt.id)
            )
          }
          onEdit={modals.openEdit}
          onDelete={modals.openDelete}
          onAddItem={modals.openAddItem}
          onSend={modals.openSend}
        />
      )}

      <CreatePaymentTypeModal
        open={modals.createOpen}
        onClose={modals.closeCreate}
        defaultSessionId={prefillSessionId}
        defaultTermId={prefillTermId}
        defaultClassId={prefillClassId}
      />
      <EditPaymentTypeModal
        open={!!modals.editTarget}
        onClose={modals.closeEdit}
        paymentType={modals.editTarget}
      />
      <AddPaymentItemModal
        open={!!modals.addItemTarget}
        onClose={modals.closeAddItem}
        paymentType={modals.addItemTarget}
      />
      {modals.sendTarget && (
        <SendPaymentTypeToGuardiansModal
          paymentType={modals.sendTarget}
          onClose={modals.closeSend}
        />
      )}
    </div>
  )
}
