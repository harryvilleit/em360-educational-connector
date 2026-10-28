import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateAction {
  label: string
  onClick: () => void
  icon?: LucideIcon
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction
  size?: "sm" | "md" | "lg"
  iconContainerClassName?: string
  iconClassName?: string
  className?: string
}

const SIZE_STYLES = {
  sm: {
    wrapper: "py-12",
    iconContainer: "h-12 w-12 rounded-2xl",
    icon: "h-6 w-6",
    title: "text-sm",
    description: "text-xs",
  },
  md: {
    wrapper: "py-16",
    iconContainer: "h-14 w-14 rounded-full",
    icon: "h-7 w-7",
    title: "text-base",
    description: "text-sm",
  },
  lg: {
    wrapper: "py-12",
    iconContainer: "h-20 w-20 rounded-full",
    icon: "h-10 w-10",
    title: "text-xl",
    description: "text-sm",
  },
} as const

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
  iconContainerClassName,
  iconClassName,
  className,
}: EmptyStateProps) {
  const styles = SIZE_STYLES[size]

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        styles.wrapper,
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100",
          styles.iconContainer,
          iconContainerClassName
        )}
      >
        <Icon className={cn(styles.icon, "text-gray-400", iconClassName)} />
      </div>
      <h3 className={cn("mt-4 font-semibold text-gray-900", styles.title)}>
        {title}
      </h3>
      {description && (
        <p className={cn("mt-1.5 max-w-xs text-gray-500", styles.description)}>
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-5 bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          {action.icon && <action.icon className="mr-1.5 h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}
