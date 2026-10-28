import type { CafeteriaSummary, LibrarySummary } from "./useReportData"

export interface ServiceRow {
  area: "Library" | "Cafeteria"
  measure: string
  value: number
}

export function serviceRows(
  lib: LibrarySummary | undefined,
  caf: CafeteriaSummary | undefined
): ServiceRow[] {
  return [
    ...(lib
      ? [
          { area: "Library", measure: "Titles in catalogue", value: lib.titles },
          { area: "Library", measure: "Total copies", value: lib.totalCopies },
          { area: "Library", measure: "Active loans", value: lib.activeLoans },
          { area: "Library", measure: "Overdue loans", value: lib.overdueLoans },
        ]
      : []),
    ...(caf
      ? [
          { area: "Cafeteria", measure: "Meals served", value: caf.mealsServed },
          { area: "Cafeteria", measure: "Active subscriptions", value: caf.activeSubscriptions },
          { area: "Cafeteria", measure: "Open welfare requests", value: caf.openWelfareRequests },
          { area: "Cafeteria", measure: "Low-stock items", value: caf.lowStockItems },
        ]
      : []),
  ] as ServiceRow[]
}
