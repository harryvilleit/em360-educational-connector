export function useFormDraft<T>(_options: {
  formKey: string
  values: T
  enabled?: boolean
}) {
  return {
    hasDraft: false,
    draftValues: null as T | null,
    draftSavedAt: null as number | null,
    acknowledgeDraft: () => {},
    discardDraft: () => {},
    clearDraft: () => {},
  }
}
