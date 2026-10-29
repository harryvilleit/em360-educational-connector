import api from "../api"
import { toCamelCase } from "@/utils/caseConversion"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSchoolId } from "@/contexts/SchoolContext"
import { toast } from "sonner"
export type Row = Record<string, any>
export async function request<T = any>(
  path: string,
  method = "GET",
  body?: unknown,
  params: Row = {}
): Promise<T> {
  const result: any = toCamelCase(
    await api.request({ url: path, method, data: body, params })
  )
  if (result?.isSuccess === false || result?.isFailure === true)
    throw new Error(result.message || result.error || "The request failed.")
  return result && "value" in result ? result.value : result
}
export function useRead<T = any>(
  path: string,
  params: Row = {},
  enabled = true
) {
  const school = useSchoolId()
  return useQuery<T>({
    queryKey: ["wp-rebuilt", school, path, params],
    queryFn: () => request<T>(path, "GET", undefined, params),
    enabled: enabled && !!school,
    retry: false,
  })
}
export function useSave() {
  const cache = useQueryClient()
  return useMutation({
    mutationFn: ({
      path,
      method = "POST",
      body,
    }: {
      path: string
      method?: string
      body?: unknown
    }) => request(path, method, body),
    onSuccess: async () => {
      await cache.invalidateQueries({
        predicate: (q) => q.queryKey[0] !== "wp-rebuilt-context",
      })
      toast.success("Changes saved")
    },
  })
}
export async function downloadPrivate(path: string) {
  const value = await request(path)
  if (!value.base64 || !value.fileName)
    throw new Error("The document could not be downloaded.")
  const bytes = Uint8Array.from(atob(value.base64), (c) => c.charCodeAt(0))
  const url = URL.createObjectURL(
    new Blob([bytes], { type: value.contentType || "application/octet-stream" })
  )
  const link = document.createElement("a")
  link.href = url
  link.download = value.fileName
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
