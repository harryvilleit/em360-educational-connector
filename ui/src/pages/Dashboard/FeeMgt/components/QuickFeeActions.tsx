import {
  Bell,
  FilePlus2,
  FileSpreadsheet,
  RefreshCw,
  CreditCard,
  Settings,
  Wallet,
} from "lucide-react"
import { ShortcutCard } from "@/components/general/ShortcutCard"

interface QuickFeeActionsProps {
  onRecordPayment: () => void
  onGenerateInvoice: () => void
  onSendReminders: () => void
  onFeeStructure: () => void
  onReconcile: () => void
  onOnlinePayments: () => void
  onPaymentSetup: () => void
}

export default function QuickFeeActions({
  onRecordPayment,
  onGenerateInvoice,
  onSendReminders,
  onFeeStructure,
  onReconcile,
  onOnlinePayments,
  onPaymentSetup,
}: QuickFeeActionsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <ShortcutCard
        onClick={onOnlinePayments}
        iconBg="bg-emerald-50 group-hover:bg-emerald-100"
        icon={<CreditCard className="size-6 text-emerald-600" />}
        borderColor="border-emerald-100"
        title="Online Payments"
        description="View provider transactions and refunds"
      />
      <ShortcutCard
        onClick={onPaymentSetup}
        iconBg="bg-slate-50 group-hover:bg-slate-100"
        icon={<Settings className="size-6 text-slate-600" />}
        borderColor="border-slate-100"
        title="Payment Setup"
        description="Connect providers and settlement accounts"
      />
      <ShortcutCard
        onClick={onRecordPayment}
        iconBg="bg-blue-50 group-hover:bg-blue-100"
        icon={<Wallet className="size-6 text-blue-600" />}
        borderColor="border-blue-100"
        title="Fund Wallet"
        description="Credit a student's wallet"
      />
      <ShortcutCard
        onClick={onGenerateInvoice}
        iconBg="bg-indigo-50 group-hover:bg-indigo-100"
        icon={<FilePlus2 className="size-6 text-indigo-600" />}
        borderColor="border-indigo-100"
        title="Generate Invoice"
        description="Issue a fee invoice"
      />
      <ShortcutCard
        onClick={onSendReminders}
        iconBg="bg-amber-50 group-hover:bg-amber-100"
        icon={<Bell className="size-6 text-amber-600" />}
        borderColor="border-amber-100"
        title="Send Reminders"
        description="Notify defaulting students"
      />
      <ShortcutCard
        onClick={onFeeStructure}
        iconBg="bg-purple-50 group-hover:bg-purple-100"
        icon={<FileSpreadsheet className="size-6 text-purple-600" />}
        borderColor="border-purple-100"
        title="Fee Structure"
        description="Edit term fee amounts"
      />
      <ShortcutCard
        onClick={onReconcile}
        iconBg="bg-cyan-50 group-hover:bg-cyan-100"
        icon={<RefreshCw className="size-6 text-cyan-600" />}
        borderColor="border-cyan-100"
        title="Reconcile"
        description="Match provider settlements to EM360 records"
      />
    </div>
  )
}
