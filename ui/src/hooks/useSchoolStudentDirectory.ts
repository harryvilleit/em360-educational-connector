import { useQuery } from "@tanstack/react-query"
import { fetchSchoolStudentDirectory } from "@/lib/schoolStudentDirectory"

/** Every student in the school, with photos, for bulk ID cards and QR scan lookups. */
export function useSchoolStudentDirectory(schoolId: string, enabled = true) {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["schoolStudentDirectory", schoolId],
    queryFn: () => fetchSchoolStudentDirectory(schoolId),
    enabled: enabled && !!schoolId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return {
    students: data ?? [],
    isLoading: isPending,
    isFetching,
    isError,
    error,
    refetch,
  }
}
