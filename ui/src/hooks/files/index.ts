import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { getFileUploadPolicyApi, uploadFileAndGetUrl } from "@/api/files.api"

const fileUploadPolicyQueryKey = ["lms", "files", "upload-policy"] as const

export const useFileUploadPolicy = ({
  enabled = true,
}: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: fileUploadPolicyQueryKey,
    queryFn: getFileUploadPolicyApi,
    staleTime: 15 * 60 * 1000,
    enabled,
  })

type UseUploadFileOptions = {
  onSuccess?: (url: string, file: File) => void
  onError?: (error: Error) => void
  silent?: boolean
}

export const useUploadFile = ({
  onSuccess,
  onError,
  silent = false,
}: UseUploadFileOptions = {}) => {
  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<string, Error, File>({
      // React Query supplies its mutation context as the second argument.
      // Wrap the upload helper so that context is never mistaken for our
      // optional upload-progress/cancellation settings.
      mutationFn: (file) => uploadFileAndGetUrl(file),
      onSuccess: (url, file) => {
        if (!silent) toast.success(`${file.name} uploaded`)
        onSuccess?.(url, file)
      },
      onError: (err) => {
        if (!silent) toast.error(err?.message ?? "Failed to upload file")
        onError?.(err)
      },
    })

  return {
    uploadFile: mutate,
    uploadFileAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export async function uploadDocuments(
  files: { key: string; file: File | null | undefined }[]
): Promise<Record<string, string>> {
  const entries = files.filter(
    (item): item is { key: string; file: File } => item.file instanceof File
  )

  const results = await Promise.all(
    entries.map(async ({ key, file }) => {
      const url = await uploadFileAndGetUrl(file)
      return [key, url] as const
    })
  )

  return Object.fromEntries(results)
}
