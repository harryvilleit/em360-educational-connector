import { useQuery } from "@tanstack/react-query"
import {
  getSchoolOverview,
  type SchoolOverviewFilters,
} from "@/api/schoolOverview.api"
import { useAuthStore } from "@/store/auth.store"

export function useSchoolOverview(
  schoolId: string,
  filters: SchoolOverviewFilters
) {
  const userId = useAuthStore((state) => state.user?.id)
  return useQuery({
    queryKey: ["school-overview", userId, schoolId, filters],
    queryFn: ({ signal }) => getSchoolOverview(schoolId, filters, signal),
    enabled: Boolean(schoolId && userId),
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === userId &&
      previousQuery?.queryKey[2] === schoolId
        ? previous
        : undefined,
    staleTime: 60_000,
  })
}
