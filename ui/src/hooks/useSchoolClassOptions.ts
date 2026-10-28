import { useQuery } from "@tanstack/react-query"
import { getAllClassesApi } from "@/api/examAndRecords.api"
import { queryKeys } from "@/utils/queryKeys"
import type {
  ClassItem,
  GetAllClassesResponseI,
} from "@/api/examAndRecords.api/types"

export function useSchoolClassOptions(schoolId: string) {
  const query = useQuery({
    queryKey: [queryKeys.schoolClasses, "options", schoolId],
    enabled: !!schoolId,
    staleTime: 60_000,
    queryFn: async () => {
      const classes: ClassItem[] = []
      let pageNumber = 1
      let totalPages = 1
      do {
        const response: GetAllClassesResponseI = await getAllClassesApi({
          schoolId,
          pageNumber,
          pageSize: 100,
        })
        if (response.IsFailure || !response.Value) {
          throw new Error(response.Error || "Classes could not be loaded.")
        }
        classes.push(...response.Value.Items)
        totalPages = response.Value.TotalPages
        pageNumber += 1
      } while (pageNumber <= totalPages)
      return classes
    },
  })

  return {
    classes: query.data ?? [],
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  }
}
