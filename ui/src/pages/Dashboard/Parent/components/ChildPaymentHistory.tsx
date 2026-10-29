import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, ReceiptText } from "lucide-react"
import { getChildPaymentHistoryApi } from "@/api/guardian.api"
import { formatCurrency } from "@/utils/currency"
import { Button } from "@/components/ui/button"

export function ChildPaymentHistory({ schoolId, studentId, sessionId, currencyCode }: {
  schoolId: string
  studentId: string
  sessionId?: string
  currencyCode: string
}) {
  const [page, setPage] = useState(1)
  useEffect(() => setPage(1), [schoolId, studentId, sessionId])
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["parent-child-fee-history", schoolId, studentId, sessionId, page],
    queryFn: () => getChildPaymentHistoryApi({ schoolId, studentId, sessionId, pageNumber: page }),
    enabled: !!schoolId && !!studentId,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  })

  return (
    <section className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3" aria-labelledby="child-payment-history-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-5 dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20"><ReceiptText size={20} /></span>
          <div><h2 id="child-payment-history-title" className="font-semibold text-gray-900 dark:text-gray-100">Payment history</h2>
            <p className="text-xs text-gray-500">Recorded school fee payments for this child{sessionId ? " in the selected session" : ""}.</p></div>
        </div>
        {data && <span className="text-xs text-gray-500">{data.totalItems} payment{data.totalItems === 1 ? "" : "s"}</span>}
      </div>
      {isLoading ? <p className="px-5 py-8 text-sm text-gray-500">Loading payments…</p> : isError ? (
        <div className="flex items-center gap-3 px-5 py-8 text-sm text-gray-600 dark:text-gray-300">Could not load payments.
          <Button variant="outline" onClick={() => void refetch()}>Try again</Button></div>
      ) : !data?.items.length ? <p className="px-5 py-8 text-sm text-gray-500">No payments recorded for this child yet.</p> : (
        <div className={isFetching ? "opacity-60" : ""}>
          <ul className="divide-y divide-gray-100 dark:divide-white/10">
            {data.items.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div><p className="font-medium text-gray-900 dark:text-gray-100">{item.termName || "School fee"}</p>
                <p className="mt-1 text-xs text-gray-500">{new Date(item.paymentDate).toLocaleString()} {item.paymentMethod ? `· ${item.paymentMethod}` : ""}</p>
                {item.paymentReference && <p className="mt-1 break-all text-xs text-gray-500">Reference: {item.paymentReference}</p>}
              </div>
              <span className="font-semibold text-green-700 dark:text-green-400">{formatCurrency(item.amountPaid, currencyCode)}</span>
            </li>)}
          </ul>
          {data.totalPages > 1 && <nav className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/10" aria-label="Payment history pages">
            <Button variant="outline" disabled={page <= 1 || isFetching} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /> Previous</Button>
            <span className="text-xs text-gray-500">Page {data.pageNumber} of {data.totalPages}</span>
            <Button variant="outline" disabled={page >= data.totalPages || isFetching} onClick={() => setPage(p => p + 1)}>Next <ChevronRight size={16} /></Button>
          </nav>}
        </div>
      )}
    </section>
  )
}
