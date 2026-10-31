import { useLaunchSchoolPortal } from "@/hooks/guardian"
import { useGetUserSubProducts } from "@/hooks/products"

export function useCurrentGuardianId(schoolId: string) {
  const { userProducts, isLoading: isProfileLoading } = useGetUserSubProducts()
  const isMember = (userProducts?.value?.parentSchools ?? []).some(
    (school) => school.id === schoolId
  )
  const profileGuardianId = isMember
    ? (userProducts?.value?.guardianId ?? "")
    : ""
  const { portal, isLoading: isPortalLoading } = useLaunchSchoolPortal(
    schoolId,
    profileGuardianId
  )

  return {
    guardianId: portal?.guardianId ?? profileGuardianId,
    isLinked: !!profileGuardianId,
    isLoading: isProfileLoading || (!!profileGuardianId && isPortalLoading),
    portal,
  }
}
