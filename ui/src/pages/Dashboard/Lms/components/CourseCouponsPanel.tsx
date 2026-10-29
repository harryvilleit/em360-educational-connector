import { useState, type FormEvent } from "react"
import { Pencil, Plus, RefreshCw, Sparkles, Ticket, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { CourseCouponI, SaveCourseCouponI } from "@/api/courseCoupon.api"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCourseCouponActions, useCourseCoupons } from "@/hooks/courseCoupon"
import type { LmsCourse } from "@/types/elearning"

function displayDate(value?: string | null) {
  if (!value) return "Immediately"
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

function defaultExpiry() {
  const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  return toDateTimeLocal(date.toISOString())
}

function statusClass(status: CourseCouponI["status"]) {
  if (status === "Active") return "bg-emerald-50 text-emerald-700"
  if (status === "Scheduled") return "bg-blue-50 text-blue-700"
  if (status === "Expired") return "bg-red-50 text-red-700"
  return "bg-slate-100 text-slate-600"
}

function randomCode(courseTitle: string) {
  const prefix =
    courseTitle
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8) || "COURSE"
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  const suffix = Array.from(bytes, (value) => value.toString(36).toUpperCase())
    .join("")
    .slice(0, 6)
  return `${prefix}-${suffix}`
}

export default function CourseCouponsPanel({ course }: { course: LmsCourse }) {
  const query = useCourseCoupons(course.id)
  const actions = useCourseCouponActions(course.id)
  const [editing, setEditing] = useState<CourseCouponI | null | undefined>()
  const busy =
    actions.create.isPending ||
    actions.update.isPending ||
    actions.remove.isPending

  const columns: DataTableColumn<CourseCouponI>[] = [
    {
      key: "code",
      header: "Code",
      render: (row) => (
        <div>
          <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-800">
            {row.code}
          </span>
          <p className="mt-1 text-xs text-muted-foreground">
            {row.redemptionCount} paid redemption
            {row.redemptionCount === 1 ? "" : "s"}
          </p>
        </div>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      render: (row) => (
        <span className="font-semibold">{row.discountPercent}%</span>
      ),
    },
    {
      key: "starts",
      header: "Starts",
      render: (row) => displayDate(row.startsAtUtc),
    },
    {
      key: "expires",
      header: "Expires",
      render: (row) => displayDate(row.expiresAtUtc),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => setEditing(row)}
          >
            <Pencil className="size-3.5" /> Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700"
            disabled={busy}
            onClick={() => {
              if (
                window.confirm(
                  `Delete coupon ${row.code}? It will stop working immediately.`
                )
              )
                actions.remove.mutate(row.id)
            }}
          >
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
            <Ticket className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-950">Course coupons</h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Create a unique code for this course, choose a percentage and
              expiry date, then share it with learners. Coupons do not stack
              with a course promotion; checkout uses the better discount.
            </p>
          </div>
        </div>
        <Button className="shrink-0" onClick={() => setEditing(null)}>
          <Plus className="size-4" /> Create coupon
        </Button>
      </div>

      {query.isError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>
            {(query.error as Error).message || "Coupons could not be loaded."}
          </span>
          <Button size="sm" variant="outline" onClick={() => query.refetch()}>
            <RefreshCw className="size-3.5" /> Retry
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={query.coupons}
        getRowKey={(row) => row.id}
        isLoading={query.isPending}
        emptyState={
          <div className="py-12 text-center text-sm text-muted-foreground">
            No coupon codes have been created for this course.
          </div>
        }
      />

      {editing !== undefined && (
        <CouponDialog
          key={editing?.id ?? "new"}
          courseTitle={course.title}
          coupon={editing}
          busy={busy}
          onClose={() => setEditing(undefined)}
          onSave={async (coupon) => {
            if (editing)
              await actions.update.mutateAsync({ id: editing.id, coupon })
            else
              await actions.create.mutateAsync({ courseId: course.id, coupon })
            setEditing(undefined)
          }}
        />
      )}
    </div>
  )
}

function CouponDialog({
  courseTitle,
  coupon,
  busy,
  onClose,
  onSave,
}: {
  courseTitle: string
  coupon: CourseCouponI | null
  busy: boolean
  onClose: () => void
  onSave: (coupon: SaveCourseCouponI) => Promise<void>
}) {
  const [code, setCode] = useState(coupon?.code ?? "")
  const [discountPercent, setDiscountPercent] = useState(
    coupon?.discountPercent ?? 10
  )
  const [startsAt, setStartsAt] = useState(toDateTimeLocal(coupon?.startsAtUtc))
  const [expiresAt, setExpiresAt] = useState(
    toDateTimeLocal(coupon?.expiresAtUtc) || defaultExpiry()
  )
  const [isActive, setIsActive] = useState(coupon?.isActive ?? true)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const normalized = code.trim().toUpperCase()
    if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(normalized)) {
      toast.error(
        "Use 3–32 letters, numbers, hyphens, or underscores for the code."
      )
      return
    }
    if (discountPercent <= 0 || discountPercent > 100) {
      toast.error("Discount must be greater than 0% and no more than 100%.")
      return
    }
    if (!expiresAt || (startsAt && new Date(startsAt) >= new Date(expiresAt))) {
      toast.error("Choose an expiry later than the optional start date.")
      return
    }
    await onSave({
      code: normalized,
      discountPercent,
      startsAtUtc: startsAt ? new Date(startsAt).toISOString() : null,
      expiresAtUtc: new Date(expiresAt).toISOString(),
      isActive,
    })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>
              {coupon ? "Edit coupon" : "Create course coupon"}
            </DialogTitle>
            <DialogDescription>
              This code discounts only “{courseTitle}”. Paid orders keep a
              snapshot even if you edit or delete the coupon later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="coupon-code">Coupon code</Label>
            <div className="flex gap-2">
              <Input
                id="coupon-code"
                value={code}
                maxLength={32}
                placeholder="SUMMER25"
                className="font-mono uppercase"
                onChange={(event) =>
                  setCode(
                    event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "")
                  )
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setCode(randomCode(courseTitle))}
              >
                <Sparkles className="size-4" /> Generate
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="coupon-percent">Discount percentage</Label>
              <Input
                id="coupon-percent"
                type="number"
                min={0.01}
                max={100}
                step={0.01}
                value={discountPercent}
                onChange={(event) =>
                  setDiscountPercent(Number(event.target.value))
                }
              />
            </div>
            <label className="flex items-center gap-3 self-end rounded-lg border px-3 py-2.5">
              <Checkbox
                checked={isActive}
                onCheckedChange={(value) => setIsActive(value === true)}
              />
              <span className="text-sm font-medium">Coupon is active</span>
            </label>
            <div className="space-y-2">
              <Label htmlFor="coupon-start">Starts (optional)</Label>
              <Input
                id="coupon-start"
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-expiry">Expires</Label>
              <Input
                id="coupon-expiry"
                type="datetime-local"
                required
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : coupon ? "Save changes" : "Create coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
