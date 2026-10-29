import { AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"

interface FieldWrapperProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

export function FieldWrapper({
  label,
  required = false,
  error,
  children,
  className,
}: FieldWrapperProps) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
      {error && (
        <p role="alert" className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}
