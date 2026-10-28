import { useGetUserSubProducts } from "@/hooks/products"

export function useCurrentStudentId(schoolId: string) {
  const { userProducts, isLoading, isError, refetch } = useGetUserSubProducts()
  const isMember = (userProducts?.value?.studentSchools ?? []).some(
    (school) => school.id === schoolId
  )
  const studentId = isMember ? (userProducts?.value?.studentId ?? "") : ""

  return {
    studentId,
    isLinked: !!studentId,
    isLoading,
    isError,
    refetch,
  }
}
