// Exams and Records data the WordPress gateway serves through its own school-bound operations.
import { useMemo } from "react"
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/api/api"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { normalizeResponse } from "@/utils/apiResponse"
import type { ManageTeacherItemI } from "@/api/userMgt.api/types"
import type { CommentData } from "@/pages/Dashboard/ExamsAndRecords/components/ManageResult/types"

interface Result<T> {
  isSuccess: boolean
  message?: string
  value: T
}
interface Page<T> {
  items: T[]
  totalItems: number
  totalPages: number
  pageNumber: number
  pageSize: number
}
export type ExamTeacher = ManageTeacherItemI

/** Teachers for Manage Teachers, searched and paged on the server (the gateway allows at most 200 per page). */
export function useExamTeachers(schoolId: string, search: string, pageNumber: number, pageSize: number) {
  const term = useDebouncedValue(search, 300)
  const query = useQuery({
    queryKey: ["wordpress-exam-teachers", schoolId, term, pageNumber, pageSize],
    queryFn: async () =>
      normalizeResponse<Result<Page<ExamTeacher>>>(
        await apiClient.get("/SubUser/ManageTeachers", {
          params: { schoolId, search: term, pageNumber, pageSize },
        }),
      ),
    enabled: !!schoolId,
  })
  return {
    teachers: query.data?.value?.items ?? [],
    pagination: query.data?.value,
    isLoading: query.isPending,
    error: query.error,
  }
}

export type ResultRemark = CommentData

/** Remarks on a class result, saved to the school's records. */
export function useResultRemarks(schoolId: string, resultId: string | undefined) {
  const client = useQueryClient()
  const key = ["wordpress-result-remarks", schoolId, resultId]
  const remarks = useQuery({
    queryKey: key,
    enabled: !!resultId,
    queryFn: async () =>
      normalizeResponse<Result<ResultRemark[]>>(
        await apiClient.get(`/WordPressExams/Results/${resultId}/Remarks`),
      ).value.map((r) => ({ ...r, timestamp: new Date(r.timestamp).toLocaleString() })),
  })
  const save = useMutation({
    mutationFn: async (remark: string) => {
      const result = normalizeResponse<Result<unknown>>(
        await apiClient.post(`/WordPressExams/Results/${resultId}/Remarks`, { remark }),
      )
      if (!result.isSuccess) throw new Error(result.message || "Unable to save remark")
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: key })
    },
  })
  return {
    comments: remarks.data ?? [],
    error: remarks.error,
    saving: save.isPending,
    saveRemark: save.mutateAsync,
  }
}

/**
 * Names of the staff who wrote worksheets, read only for the given user IDs
 * (instead of loading the whole staff list), 200 at a time.
 */
export function useWorksheetAuthors(schoolId: string, userIds: string[]) {
  const ids = [...new Set(userIds)].sort().join(",")
  const batches = useMemo(() => {
    const all = ids ? ids.split(",") : []
    const out: string[][] = []
    for (let i = 0; i < all.length; i += 200) out.push(all.slice(i, i + 200))
    return out
  }, [ids])
  return useQueries({
    queries: batches.map((batch) => ({
      queryKey: ["wordpress-worksheet-authors", schoolId, batch],
      queryFn: async () =>
        normalizeResponse<Result<{ id: string; firstName: string; lastName: string; email?: string }[]>>(
          await apiClient.post("/WordPressExams/StaffNames", { userIds: batch }),
        ).value.map((s) => ({
          SubUserId: s.id,
          FirstName: s.firstName,
          LastName: s.lastName,
          Email: s.email,
        })),
    })),
  }).flatMap((q) => q.data ?? [])
}
