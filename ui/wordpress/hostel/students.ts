import { useRead, type Row } from "../rebuilt/service"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
export function useGetSchoolStudents(params: {
  schoolId?: string
  search?: string
  pageNumber?: number
  pageSize?: number
}) {
  const q = useRead("/WordPressHostel/Students", {
    search: useDebouncedValue(params.search || "", 250),
    page: params.pageNumber || 1,
  })
  return {
    ...q,
    isLoading: q.isPending,
    students: (q.data?.items || []).map((s: Row) => ({
      ...s,
      studentId: s.id,
      firstname: s.firstName,
      lastname: s.lastName,
    })),
    pagination: {
      pageNumber: q.data?.pageNumber || 1,
      pageSize: 50,
      totalItems: q.data?.totalItems,
      totalPages: q.data?.totalPages || 1,
    },
  }
}
