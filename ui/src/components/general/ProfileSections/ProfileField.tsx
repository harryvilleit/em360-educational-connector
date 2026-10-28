export function ProfileField({
  label,
  value,
  className,
}: {
  label: string
  value?: string | null
  className?: string
}) {
  return (
    <div className={className}>
      <p className="mb-0.5 text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium wrap-break-word text-gray-800">{value || "—"}</p>
    </div>
  )
}
