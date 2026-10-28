import { uploadFileAndGetUrl } from "@/api/files.api"
export const chatImageAccept = "image/*"
export const chatFileAccept =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,application/pdf"
export const chatAttachmentHint = ""
export function uploadChatAttachment(file: File, _schoolId: string) {
  return uploadFileAndGetUrl(file)
}
