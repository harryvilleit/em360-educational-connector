interface InfoItemProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function InfoItem({ label, children, className }: InfoItemProps) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-gray-700">
        {children}
      </div>
    </div>
  )
}
