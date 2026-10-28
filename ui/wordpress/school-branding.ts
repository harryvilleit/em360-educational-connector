import { useGeUserAssignedDashboard } from "@/hooks/products"
export function useSchoolCardBranding(
  schoolId: string,
  options?: { enabled?: boolean; contactEnabled?: boolean },
) {
  const query = useGeUserAssignedDashboard(
    options?.enabled === false ? "" : schoolId,
  )
  const school = query.userDashboard?.Value?.School
  return {
    branding: school
      ? {
          schoolName: school.Name,
          schoolLogo: school.LogoUrl,
          schoolPhone: school.PhoneNumber || "",
          schoolEmail: school.Email || "",
          schoolAddress: school.Address || "",
        }
      : null,
    isLoading: query.isLoading,
    contactLoading: query.isLoading,
    isError: query.isError,
    contactError: query.isError,
    refetch: query.refetch,
    refetchContact: query.refetch,
  }
}
