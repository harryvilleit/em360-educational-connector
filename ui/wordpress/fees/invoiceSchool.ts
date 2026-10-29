// The connected school's name, contact details and logo for printed invoices
// (the main site's invoice screens still use sample school details).
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGeUserAssignedDashboard } from "@/hooks/products"
import type { SchoolInfo } from "@/data"

export function useInvoiceSchool(): SchoolInfo {
  const schoolId = useSchoolId()
  const { userDashboard } = useGeUserAssignedDashboard(schoolId)
  const school = userDashboard?.Value?.School
  return {
    name: school?.Name ?? "",
    address: school?.Address ?? "",
    phone: school?.PhoneNumber ?? "",
    email: school?.Email ?? "",
    logoUrl: school?.LogoUrl ?? null,
    website: "",
    registrationNumber: "",
  } as SchoolInfo
}
