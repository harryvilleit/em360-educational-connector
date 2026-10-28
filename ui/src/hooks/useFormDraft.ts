import { useCallback, useEffect, useRef, useState } from "react"
import { useAuthStore } from "@/store/auth.store"
import {
  clearFormDraft,
  readFormDraft,
  writeFormDraft,
} from "@/utils/formDraftStorage"

const SAVE_DELAY_MS = 600

interface UseFormDraftOptions<T> {
  formKey: string
  values: T
  enabled?: boolean
}

export function useFormDraft<T>({
  formKey,
  values,
  enabled = true,
}: UseFormDraftOptions<T>) {
  const userId = useAuthStore((s) => s.user?.id)
  const baselineRef = useRef<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [draft, setDraft] = useState<{ values: T; savedAt: number } | null>(
    null
  )
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    baselineRef.current = JSON.stringify(values)
    setDismissed(false)
    if (!enabled || !userId) {
      setDraft(null)
      return
    }
    setDraft(readFormDraft<T>(userId, formKey))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, formKey, userId])

  useEffect(() => {
    if (!enabled || !userId || baselineRef.current === null) return
    const serialized = JSON.stringify(values)
    if (serialized === baselineRef.current) return

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      writeFormDraft(userId, formKey, values)
    }, SAVE_DELAY_MS)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [values, enabled, userId, formKey])

  const acknowledgeDraft = useCallback(() => {
    setDismissed(true)
  }, [])

  const discardDraft = useCallback(() => {
    if (userId) clearFormDraft(userId, formKey)
    setDraft(null)
    setDismissed(true)
  }, [userId, formKey])

  const clearDraft = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (userId) clearFormDraft(userId, formKey)
    setDraft(null)
    baselineRef.current = JSON.stringify(values)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, formKey])

  return {
    hasDraft: Boolean(draft) && !dismissed,
    draftValues: draft?.values ?? null,
    draftSavedAt: draft?.savedAt ?? null,
    acknowledgeDraft,
    discardDraft,
    clearDraft,
  }
}
