import { useSearchParams } from "react-router"
import PerformanceApp from "./performance/PerformanceApp"
import { usePerformanceRequest } from "./performance/service"
export default function PerformancePage() {
  const request = usePerformanceRequest()
  const [params] = useSearchParams()
  return (
    <PerformanceApp
      key={params.get("staffId") || "all"}
      request={request}
      initialStaffId={params.get("staffId") || undefined}
    />
  )
}
