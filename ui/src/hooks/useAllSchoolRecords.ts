import { useQuery } from "@tanstack/react-query"
import { getSchoolStudentsApi } from "@/api/studentPortal.api"
import { getStaffDirectoryApi } from "@/api/staff.api"
import type { SchoolStudentItemI } from "@/api/studentPortal.api/types"
import type { StaffDirectoryValueI } from "@/api/staff.api/types"
import { fetchAllPages } from "@/lib/fetchAllPages"
import { queryKeys } from "@/utils/queryKeys"

const EMPTY_STUDENTS: SchoolStudentItemI[] = []

/** Every student in the school, paged within the API's page-size limit. */
export function useAllSchoolStudents(schoolId: string) {
  const query = useQuery({
    queryKey: [queryKeys.schoolStudents, "all", schoolId],
    queryFn: () =>
      fetchAllPages(async (pageNumber, pageSize) => {
        const res = await getSchoolStudentsApi({ schoolId, pageNumber, pageSize })
        return { items: res.value?.items ?? [], totalPages: res.value?.totalPages ?? 1 }
      }),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
  return {
    students: query.data ?? EMPTY_STUDENTS,
    isLoading: query.isPending,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}

/** The staff directory with every staff member, paged within the API's limit. */
export function useAllStaffDirectory(schoolId: string) {
  const query = useQuery<StaffDirectoryValueI>({
    queryKey: [queryKeys.staffDirectory, "all", schoolId],
    queryFn: async () => {
      let summary: StaffDirectoryValueI | undefined
      const items = await fetchAllPages(async (pageNumber, pageSize) => {
        const res = await getStaffDirectoryApi({ schoolId, pageNumber, pageSize })
        summary ??= res.value
        return {
          items: res.value?.staff?.items ?? [],
          totalPages: res.value?.staff?.totalPages ?? 1,
        }
      })
      return {
        ...summary!,
        staff: { ...summary!.staff, items, pageNumber: 1, pageSize: items.length, totalPages: 1 },
      }
    },
    enabled: !!schoolId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
  return { directory: query.data, isError: query.isError, isPending: query.isPending }
}
