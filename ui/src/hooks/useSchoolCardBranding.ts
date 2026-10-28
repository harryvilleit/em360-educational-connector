import {
  useGetUserSubProducts,
  useGeUserAssignedDashboard,
} from "@/hooks/products"

function schoolContact(value: unknown, ...keys: string[]): string {
  if (!value || typeof value !== "object") return ""
  const record = value as Record<string, unknown>
  for (const key of keys) {
    if (typeof record[key] === "string" && record[key].trim())
      return record[key].trim()
  }
  return ""
}

/** School name/logo/contact details for an ID card, shared by single and bulk generation. */
export function useSchoolCardBranding(
  schoolId: string,
  options?: { enabled?: boolean; contactEnabled?: boolean }
) {
  const enabled = options?.enabled ?? true
  const contactEnabled = options?.contactEnabled ?? enabled

  const { userProducts, isLoading, isError, refetch } = useGetUserSubProducts({
    enabled,
  })
  const school = userProducts?.value?.products
    ?.flatMap((product) => product.schools ?? [])
    .find((item) => item.schoolId === schoolId)

  const {
    userDashboard,
    isLoading: contactLoading,
    isError: contactError,
    refetch: refetchContact,
  } = useGeUserAssignedDashboard(contactEnabled ? schoolId : "")
  const dashboardValue: unknown =
    userDashboard && typeof userDashboard === "object"
      ? (userDashboard as Record<string, unknown>).Value
      : undefined
  const schoolData: unknown =
    dashboardValue && typeof dashboardValue === "object"
      ? (dashboardValue as Record<string, unknown>).School
      : undefined

  const branding =
    school?.name && !isError
      ? {
          schoolName: school.name,
          schoolLogo: school.logoUrl,
          schoolPhone: schoolContact(
            schoolData,
            "PhoneNumber",
            "phoneNumber",
            "Phone",
            "phone"
          ),
          schoolEmail: schoolContact(schoolData, "Email", "email"),
          schoolAddress: schoolContact(schoolData, "Address", "address"),
        }
      : null

  return {
    branding,
    isLoading,
    contactLoading,
    isError,
    contactError,
    refetch,
    refetchContact,
  }
}
