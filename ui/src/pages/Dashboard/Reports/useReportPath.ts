import { useParams } from "react-router"
import type { ReportDomain } from "./metrics"

export function useReportPath() {
  const { productId = "" } = useParams<{ productId: string }>()
  return (domain: ReportDomain) => `/dashboard/${productId}/reports/${domain}`
}
