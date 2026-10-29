import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router"
import { getVideoStorage } from "@/api/tutorVideoStorage.api"
import { useLmsUserKey } from "@/lib/lms-user-key"
import { LMS_PRODUCT_SLUG } from "@/lib/launch-lms"
import { DashboardRoutes } from "@/routes"

export default function TutorVideoStorageNotice() {
  const userKey = useLmsUserKey()
  const query = useQuery({ queryKey: ["tutor-video-storage", userKey], queryFn: getVideoStorage, refetchInterval: 30000 })
  return <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
    <p>{query.data ? <><strong>{query.data.availableMinutes.toLocaleString(undefined, { maximumFractionDigits: 2 })} minutes available</strong> for Cloudflare uploads.{query.data.freeCapacityMinutes > 0 && <> Your allowance includes {query.data.freeCapacityMinutes.toLocaleString()} complimentary minutes.</>}</> : "Cloudflare uploads use your active LMS video storage allowance."}</p>
    <p className="mt-1 text-xs">YouTube links are free and work with zero storage minutes. Uploads reserve space until their duration is confirmed.</p>
    <Link className="mt-2 inline-block font-medium underline underline-offset-2" to={`${DashboardRoutes.toLmsSettings(LMS_PRODUCT_SLUG)}#video-storage`}>Buy or manage video minutes</Link>
  </div>
}
