import { useCallback } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import apiClient from "@/api/api"
import { usePermissions } from "@/hooks/usePermissions"
import { menuPermissionNames, toCanonicalMenuPath } from "@/lib/permissions"
import { useSchoolId } from "@/contexts/SchoolContext"
import HealthApp from "./HealthApp"
import { camel, HealthHttpError, type Request } from "./shared"
export const reactHealthRequest: Request = async (
  path,
  method = "GET",
  body,
  query = {}
) => {
  try {
    const raw = await apiClient.request({
      url: path,
      method,
      data: body,
      params: query,
    })
    const data = camel(raw)
    if (data?.isSuccess === false || data?.isFailure === true)
      throw new HealthHttpError(
        data.message || "Unable to complete the health request.",
        data.statusCode || 400
      )
    return data && "value" in data ? data.value : data
  } catch (error: any) {
    if (error instanceof HealthHttpError) throw error
    throw new HealthHttpError(
      error.response?.data?.message ||
        error.response?.data?.Message ||
        error.message ||
        "The server could not be reached. Please retry.",
      error.status ?? error.response?.status ?? 0
    )
  }
}
export default function ReactHealthPage() {
  const schoolId = useSchoolId(),
    { productId } = useParams(),
    location = useLocation(),
    navigate = useNavigate()
  const { modules } = usePermissions()
  const allowedMenuPaths = modules.flatMap((module) =>
    (module.Menus ?? [])
      .filter((menu) => menuPermissionNames(menu).has("view"))
      .map((menu) =>
        toCanonicalMenuPath(menu.MenuUrl, productId ?? "").replace(
          `/dashboard/${productId}`,
          "/dashboard"
        )
      )
  )
  const go = useCallback(
    (path: string) =>
      navigate(`/dashboard/${productId}${path.slice("/dashboard".length)}`),
    [navigate, productId]
  )
  const index = location.pathname.indexOf("/health")
  return (
    <HealthApp
      key={schoolId}
      request={reactHealthRequest}
      allowedMenuPaths={allowedMenuPaths}
      schoolId={schoolId}
      initialPath={"/dashboard" + location.pathname.slice(index)}
      navigate={go}
    />
  )
}
