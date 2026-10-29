export type PaymentReminderStatus = "owing" | "partial" | "paid"

type StatusMeta = { label: string; bg: string; textColor: string }

const STATUS_META: { [K in PaymentReminderStatus]: StatusMeta } = {
  owing: { label: "Owing", bg: "bg-red-50", textColor: "text-red-700" },
  partial: {
    label: "Part Payment",
    bg: "bg-amber-50",
    textColor: "text-amber-700",
  },
  paid: {
    label: "Paid",
    bg: "bg-green-50",
    textColor: "text-green-700",
  },
}

export function StatusBadge({ status }: { status: PaymentReminderStatus }) {
  const { label, bg, textColor } = STATUS_META[status]
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${bg} ${textColor}`}
    >
      {label}
    </span>
  )
}
