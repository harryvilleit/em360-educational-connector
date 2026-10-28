import api from "./api"
import { value } from "./visitation-api"
export const chatImageAccept = "image/png,image/jpeg,image/webp"
export const chatFileAccept = "application/pdf,.pdf"
export const chatAttachmentHint = "Images and PDF documents, up to 5 MB each."
export async function uploadChatAttachment(file: File, schoolId: string) {
  if (
    !/\.(png|jpe?g|webp|pdf)$/i.test(file.name) ||
    file.size > 5 * 1024 * 1024
  )
    throw new Error(
      "Upload a PNG, JPEG, WebP image or PDF document up to 5 MB.",
    )
  const form = new FormData()
  form.append("file", file)
  return value<string>(
    api.post("/Chat/Attachments", form, { params: { schoolId } }),
  )
}
