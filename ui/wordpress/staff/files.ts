import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { request } from "../rebuilt/service"
export function useUploadFile(
  options: {
    onSuccess?: (url: string, file: File) => void
    onError?: (error: Error) => void
    silent?: boolean
  } = {}
) {
  const result = useMutation<string, Error, File>({
    mutationFn: async (file) => {
      if (
        file.size > 5242880 ||
        !["application/pdf", "image/png", "image/jpeg"].includes(file.type)
      )
        throw Error("Choose a PDF, PNG or JPEG up to 5 MB.")
      const body = new FormData()
      body.append("file", file)
      const result = await request(
        "/WordPressStaff/LeaveAttachments",
        "POST",
        body
      )
      if (!/^em360-staff-document:[\da-f-]{36}$/i.test(result.reference || ""))
        throw Error("The document could not be attached.")
      return result.reference
    },
    onSuccess: (reference, file) => {
      if (!options.silent) toast.success("Attachment uploaded")
      options.onSuccess?.(reference, file)
    },
    onError: (error) => {
      if (!options.silent) toast.error(error.message)
      options.onError?.(error)
    },
  })
  return {
    ...result,
    uploadFile: result.mutate,
    uploadFileAsync: result.mutateAsync,
  }
}
