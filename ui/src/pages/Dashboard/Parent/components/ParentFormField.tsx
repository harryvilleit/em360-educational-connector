import React from "react"

export function inputClass(hasError: boolean) {
  return `w-full px-3 py-2 text-sm bg-white dark:bg-white/3 border rounded-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors ${
    hasError
      ? "border-red-400 focus:border-red-400"
      : "border-gray-200 dark:border-white/10 focus:border-blue-400"
  }`
}

export function ParentFormField({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
