import { useState } from "react"
import { Plus, ScrollText } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Textarea } from "@/components/ui/textarea"
import { LeaveFilterSelect as FilterSelect } from "./LeaveFilterSelect"
import { useStaffDirectory } from "@/hooks/staff"
import {
  useAdjustLeaveBalance,
  useLeaveAuditLedger,
  useLeaveTypes,
} from "@/hooks/leaveManagement"
import {
  LeaveTransactionType,
  type StaffLeaveBalanceTransactionDto,
} from "@/api/leaveManagement.api/types"
import { ErrorNote } from "./MyLeaveTab"
import { TRANSACTION_LABEL } from "./utils"

const PAGE_SIZE = 15

const TYPE_OPTIONS = [
  { value: "", label: "All transaction types" },
  ...Object.values(LeaveTransactionType).map((value) => ({
    value: String(value),
    label: TRANSACTION_LABEL[value],
  })),
]

function formatLedgerDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function LedgerTab({ schoolId }: { schoolId: string }) {
  const [staffId, setStaffId] = useState("")
  const [leaveTypeId, setLeaveTypeId] = useState("")
  const [transactionType, setTransactionType] = useState("")
  const [page, setPage] = useState(1)
  const [adjusting, setAdjusting] = useState(false)

  const { directory } = useStaffDirectory({ schoolId, pageSize: 200 })
  const { data: leaveTypes = [] } = useLeaveTypes(schoolId, true, true)

  const ledger = useLeaveAuditLedger({
    schoolId,
    staffId: staffId || undefined,
    leaveTypeId: leaveTypeId || undefined,
    transactionType:
      transactionType === ""
        ? undefined
        : (Number(transactionType) as LeaveTransactionType),
    pageNumber: page,
    pageSize: PAGE_SIZE,
  })

  const staffOptions = (directory?.staff.items ?? []).map((s) => ({
    value: s.subUserId,
    label: s.fullName,
  }))

  const columns: DataTableColumn<StaffLeaveBalanceTransactionDto>[] = [
    {
      key: "date",
      header: "Date & time",
      render: (t) => formatLedgerDate(t.dateCreated),
    },
    {
      key: "staff",
      header: "Staff member",
      render: (t) => (
        <span className="font-medium text-gray-900">{t.staffName}</span>
      ),
    },
    { key: "type", header: "Leave type", render: (t) => t.leaveTypeName },
    {
      key: "transaction",
      header: "Transaction",
      render: (t) => TRANSACTION_LABEL[t.transactionType] ?? "—",
    },
    {
      key: "days",
      header: "Days",
      render: (t) => (
        <span
          className={
            t.days < 0
              ? "font-medium text-red-600"
              : "font-medium text-emerald-600"
          }
        >
          {t.days > 0 ? `+${t.days}` : t.days}
        </span>
      ),
    },
    {
      key: "balance",
      header: "Balance",
      render: (t) => `${t.balanceBefore} → ${t.balanceAfter}`,
    },
    {
      key: "reason",
      header: "Reason",
      render: (t) => (
        <span className="line-clamp-2 max-w-64" title={t.reason}>
          {t.reason}
        </span>
      ),
    },
  ]

  const resetPage = () => setPage(1)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          value={staffId}
          onChange={(v) => {
            setStaffId(v)
            resetPage()
          }}
          options={[{ value: "", label: "All staff" }, ...staffOptions]}
          placeholder="All staff"
        />
        <FilterSelect
          value={leaveTypeId}
          onChange={(v) => {
            setLeaveTypeId(v)
            resetPage()
          }}
          options={[
            { value: "", label: "All leave types" },
            ...leaveTypes.map((t) => ({ value: t.id, label: t.name })),
          ]}
          placeholder="All leave types"
        />
        <FilterSelect
          value={transactionType}
          onChange={(v) => {
            setTransactionType(v)
            resetPage()
          }}
          options={TYPE_OPTIONS}
          placeholder="All transaction types"
          className="w-56"
        />
        <Button className="ml-auto" onClick={() => setAdjusting(true)}>
          <Plus className="size-4" />
          Manual adjustment
        </Button>
      </div>
      {ledger.isError ? (
        <ErrorNote
          message="Could not load the balance ledger."
          onRetry={() => ledger.refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={ledger.data?.items ?? []}
          getRowKey={(t) => t.id}
          isLoading={ledger.isPending}
          emptyState={
            <EmptyState
              icon={ScrollText}
              title="No ledger entries"
              description="Balance changes will be recorded here."
              size="sm"
            />
          }
          pagination={{
            page,
            total: ledger.data?.totalItems ?? 0,
            pageSize: PAGE_SIZE,
            onPageChange: setPage,
          }}
        />
      )}
      {adjusting && (
        <AdjustmentModal
          schoolId={schoolId}
          staffOptions={staffOptions}
          onClose={() => setAdjusting(false)}
        />
      )}
    </div>
  )
}

function AdjustmentModal({
  schoolId,
  staffOptions,
  onClose,
}: {
  schoolId: string
  staffOptions: { value: string; label: string }[]
  onClose: () => void
}) {
  const adjust = useAdjustLeaveBalance(schoolId)
  const { data: leaveTypes = [] } = useLeaveTypes(schoolId)
  const [staffId, setStaffId] = useState("")
  const [leaveTypeId, setLeaveTypeId] = useState("")
  const [days, setDays] = useState("")
  const [reason, setReason] = useState("")

  const amount = Number(days)
  const valid =
    staffId &&
    leaveTypeId &&
    Number.isFinite(amount) &&
    amount !== 0 &&
    reason.trim()

  const handleSave = async () => {
    try {
      await adjust.mutateAsync({
        schoolId,
        staffId,
        leaveTypeId,
        adjustmentDays: amount,
        reason: reason.trim(),
      })
      toast.success("Balance adjusted.")
      onClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not adjust the balance."
      )
    }
  }

  return (
    <Modal
      title="Manual balance adjustment"
      size="md"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!valid || adjust.isPending}>
            {adjust.isPending ? "Saving..." : "Apply adjustment"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700">
            Staff member
          </span>
          <FilterSelect
            value={staffId}
            onChange={setStaffId}
            options={staffOptions}
            placeholder="Select staff"
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700">Leave type</span>
          <FilterSelect
            value={leaveTypeId}
            onChange={setLeaveTypeId}
            options={leaveTypes.map((t) => ({ value: t.id, label: t.name }))}
            placeholder="Select leave type"
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700">
            Days (negative to deduct)
          </span>
          <Input
            type="number"
            step="0.5"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700">
            Reason (recorded in the audit ledger)
          </span>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </Modal>
  )
}
