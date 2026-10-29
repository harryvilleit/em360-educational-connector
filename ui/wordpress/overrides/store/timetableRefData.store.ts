// WordPress version: sessions, terms and classes for the timetable builder come from a
// normal query (so failures show an error with retry), not a process-wide cache.
import { useQuery } from "@tanstack/react-query"
import { getAllSchoolSessionsApi } from "@/api/userMgt.api"
import { getAllClassesApi } from "@/api/examAndRecords.api"
import type { GetAllSchoolSessionsResponseI } from "@/api/userMgt.api/types"
import type { GetAllClassesResponseI } from "@/api/examAndRecords.api/types"

export function useTimetableRefData(schoolId: string) {
  const query = useQuery({
    queryKey: ["wordpress-timetable-reference", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const [sessions, classes] = await Promise.all([
        getAllSchoolSessionsApi({ schoolId, pageSize: 200 }) as Promise<GetAllSchoolSessionsResponseI>,
        getAllClassesApi({ schoolId, pageSize: 200 }) as Promise<GetAllClassesResponseI>,
      ])
      return { sessions: sessions.Value.Items, classes: classes.Value.Items }
    },
  })
  return {
    sessions: query.data?.sessions ?? [],
    classes: query.data?.classes ?? [],
    isLoading: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  }
}
