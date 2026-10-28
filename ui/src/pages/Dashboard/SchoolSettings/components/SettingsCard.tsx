interface SettingsCardProps {
  title: string
  description: string
  children: React.ReactNode
  danger?: boolean
}

export default function SettingsCard({
  title,
  description,
  children,
  danger,
}: SettingsCardProps) {
  return (
    <div
      className={`rounded-2xl border bg-white p-6 ${danger ? "border-red-200" : "border-gray-100"}`}
    >
      <div
        className={`mb-6 border-b pb-4 ${danger ? "border-red-100" : "border-gray-100"}`}
      >
        <h2
          className={`text-base font-bold ${danger ? "text-red-600" : "text-gray-900"}`}
        >
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}
