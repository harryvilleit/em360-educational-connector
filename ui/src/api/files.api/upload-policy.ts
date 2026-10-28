import type { FileUploadPolicyI } from "./types"

const IMAGE_EXTENSION = /\.(jpg|jpeg|png|gif|webp)$/i

function validLimitMB(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined
}

export function getFileUploadLimit(
  file: Pick<File, "name">,
  policy: FileUploadPolicyI | undefined
) {
  if (!policy) return undefined

  const maxSizeMB = validLimitMB(
    IMAGE_EXTENSION.test(file.name)
      ? policy.maxImageSizeMB
      : policy.maxDocumentSizeMB
  )

  if (!maxSizeMB) return undefined

  return {
    maxSizeMB,
    maxSizeBytes: maxSizeMB * 1024 * 1024,
    label: `${maxSizeMB} MB`,
  }
}

export function getMaterialUploadLimitLabel(
  policy: FileUploadPolicyI | undefined
) {
  const imageLimit = validLimitMB(policy?.maxImageSizeMB)
  const documentLimit = validLimitMB(policy?.maxDocumentSizeMB)

  if (!imageLimit || !documentLimit) return "set by the server"
  if (imageLimit === documentLimit) return `${documentLimit} MB per file`

  return `${imageLimit} MB for images and ${documentLimit} MB for documents`
}

export function isExtensionAllowedByUploadPolicy(
  extension: string,
  policy: FileUploadPolicyI | undefined
) {
  if (!policy?.allowedExtensions?.length) return true

  const normalizedExtension = extension.startsWith(".")
    ? extension.toLowerCase()
    : `.${extension.toLowerCase()}`

  return policy.allowedExtensions.some(
    (allowed) => allowed.toLowerCase() === normalizedExtension
  )
}
