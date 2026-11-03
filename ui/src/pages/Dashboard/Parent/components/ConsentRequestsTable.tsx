import { useNavigate, useParams } from "react-router"
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DashboardRoutes } from "@/routes"
import type { ConsentRequestI } from "@/api/consent.api/types"
import {
  getConsentCategoryMeta,
  getConsentTargetLabel,
  isConsentClosed,
} from "@/utils/consent"
import { formatDate } from "@/utils"
import Pagination from "@/components/ui/pagination"

interface ConsentRequestsTableProps {
  requests: ConsentRequestI[]
  page: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function ConsentRequestsTable({
  requests,
  page,
  totalItems,
  pageSize,
  onPageChange,
}: ConsentRequestsTableProps) {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-white/10 dark:bg-white/3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/60 dark:border-white/5 dark:bg-white/2">
            <tr>
              {["Request", "Due Date", "Responses", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/5">
            {requests.map((req) => {
              const isPastDue = isConsentClosed(req.responseDue)
              const { label, badge } = getConsentCategoryMeta(req.category)

              return (
                <tr
                  key={req.id}
                  className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/2"
                >
                  {/* Request */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-start gap-3">
                     
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {req.title}
                          </p>
                          {req.isUrgent && !isPastDue && (
                            <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                              <AlertTriangle size={9} /> Urgent
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                          <span
                            className={`mr-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badge}`}
                          >
                            {label}
                          </span>
                          By {req.sentBy} ·{" "}
                          {getConsentTargetLabel(req.targetType)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Due date */}
                  <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(req.responseDue, "short")}
                  </td>

                  {/* Responses */}
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle2 size={12} /> {req.approved}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                        <XCircle size={12} /> {req.rejected}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <Clock size={12} /> {req.pending} pending
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    {isPastDue ? (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
                        Closed
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        Open
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="rounded-lg">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl">
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 rounded-lg text-xs"
                          onClick={() =>
                            navigate(
                              DashboardRoutes.toParentConsentDetail(
                                productId ?? "",
                                req.id
                              ),
                              { state: { request: req } }
                            )
                          }
                        >
                          <Eye className="size-3.5 text-gray-500" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {totalItems > pageSize && (
        <Pagination
          page={page}
          total={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
