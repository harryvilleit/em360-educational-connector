import { useQuery } from "@tanstack/react-query"
import { getAllSchoolSessionsApi } from "@/api/userMgt.api"
import type {
  GetAllSchoolSessionsResponseI,
  SchoolSessionItem,
} from "@/api/userMgt.api/types"
import { queryKeys } from "@/utils/queryKeys"

export function useSchoolSessionOptions(schoolId: string) {
  const query = useQuery({
    queryKey: [queryKeys.schoolSessions, "options", schoolId],
    enabled: !!schoolId,
    staleTime: 60_000,
    queryFn: async () => {
      const sessions: SchoolSessionItem[] = []
      let pageNumber = 1
      let totalPages = 1
      do {
        const response: GetAllSchoolSessionsResponseI =
          await getAllSchoolSessionsApi({ schoolId, pageNumber, pageSize: 100 })
        if (
          response.IsFailure ||
          response.IsSuccess === false ||
          !response.Value
        )
          throw new Error(
            response.Error || "Academic sessions could not be loaded."
          )
        sessions.push(...response.Value.Items)
        totalPages = response.Value.TotalPages
        pageNumber++
      } while (pageNumber <= totalPages)
      return sessions
    },
  })
  return {
    sessions: query.data ?? [],
    isLoading: query.isPending,
    isError: query.isError,
    isFetching: query.isFetching,
    refetch: query.refetch,
  }
}
