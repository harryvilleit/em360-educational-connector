const PREFIX = "em360-form-draft"
const MAX_AGE_MS = 8 * 60 * 60 * 1000

export interface StoredFormDraft<T> {
  values: T
  savedAt: number
}

function draftKey(userId: string, formKey: string) {
  return `${PREFIX}:${userId}:${formKey}`
}

// sessionStorage keeps drafts out of long-lived shared-device storage. Access
// is wrapped in try/catch throughout — private browsing,
// storage quota, or a disabled API must never break the form itself, only
// draft-saving is best-effort.

export function readFormDraft<T>(
  userId: string,
  formKey: string
): StoredFormDraft<T> | null {
  try {
    const raw = sessionStorage.getItem(draftKey(userId, formKey))
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredFormDraft<T>
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(draftKey(userId, formKey))
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function writeFormDraft<T>(
  userId: string,
  formKey: string,
  values: T
): void {
  try {
    const entry: StoredFormDraft<T> = { values, savedAt: Date.now() }
    sessionStorage.setItem(draftKey(userId, formKey), JSON.stringify(entry))
  } catch {
    // ignore — best-effort persistence only
  }
}

export function clearFormDraft(userId: string, formKey: string): void {
  try {
    sessionStorage.removeItem(draftKey(userId, formKey))
  } catch {
    // ignore
  }
}

export function clearAllFormDrafts(): void {
  for (const storage of [sessionStorage, localStorage]) {
    try {
      const keys = Array.from({ length: storage.length }, (_, index) =>
        storage.key(index)
      ).filter((key): key is string => !!key && key.startsWith(`${PREFIX}:`))
      keys.forEach((key) => storage.removeItem(key))
    } catch {
      // ignore — clearing drafts is best effort
    }
  }
}

// Remove drafts created by older builds that persisted form data for 14 days.
try {
  const legacyKeys = Array.from({ length: localStorage.length }, (_, index) =>
    localStorage.key(index)
  ).filter((key): key is string => !!key && key.startsWith(`${PREFIX}:`))
  legacyKeys.forEach((key) => localStorage.removeItem(key))
} catch {
  // ignore — storage may be unavailable
}
