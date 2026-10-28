import { ConsentCategory } from "@/api/consent.api/types"

export const CONSENT_CATEGORY_OPTIONS = [
  { value: ConsentCategory.Medical, label: "Medical" },
  { value: ConsentCategory.Academic, label: "Academic" },
  { value: ConsentCategory.FieldTrip, label: "Field Trip" },
  { value: ConsentCategory.Sports, label: "Sports" },
  { value: ConsentCategory.Administrative, label: "Administrative" },
  { value: ConsentCategory.Other, label: "General / Other" },
]

interface ConsentCategoryMeta {
  label: string
  badge: string
  icon: string
  iconBg: string
  glyph: string
}

const CATEGORY_META: Record<string, ConsentCategoryMeta> = {
  medical: {
    label: "Medical",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: "text-red-600",
    iconBg: "bg-red-50",
    glyph: "💉",
  },
  fieldtrip: {
    label: "Field Trip",
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: "text-purple-600",
    iconBg: "bg-purple-50",
    glyph: "🚌",
  },
  academic: {
    label: "Academic",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: "text-blue-600",
    iconBg: "bg-blue-50",
    glyph: "🎭",
  },
  sports: {
    label: "Sports",
    badge:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: "text-yellow-600",
    iconBg: "bg-yellow-50",
    glyph: "📷",
  },
  administrative: {label:"Administrative",badge:"bg-slate-100 text-slate-700",icon:"text-slate-600",iconBg:"bg-slate-50",glyph:"📋"},
  other: {
    label: "General / Other",
    badge: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
    icon: "text-gray-500",
    iconBg: "bg-gray-50",
    glyph: "📋",
  },
}

const DEFAULT_CATEGORY_META = CATEGORY_META.other

// Per the backend-enum-serialization gotcha, `category` likely comes back
// as its string name (e.g. "Medical") rather than the numeric value Swagger
// shows — normalize case-insensitively and fall back gracefully for any
// value we don't recognize instead of throwing.
export function getConsentCategoryMeta(category: string): ConsentCategoryMeta {
  return CATEGORY_META[category?.toLowerCase()] ?? DEFAULT_CATEGORY_META
}

// Same gotcha applies to targetType — normalize case-insensitively.
export function isAllStudentsTarget(targetType: string): boolean {
  const normalized = targetType?.toLowerCase() ?? ""
  return normalized.includes("all")
}

export function getConsentTargetLabel(targetType: string): string {
  return isAllStudentsTarget(targetType) ? "All Students" : "Specific Classes"
}

export function isConsentClosed(responseDue: string): boolean {
  return new Date(responseDue).getTime() < Date.now()
}
