import type { LucideIcon } from "lucide-react"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router"

type MainNavItem = {
  id: string
  count?: number | null
  icon: LucideIcon
  title: string
  description: string
  href: string
}

type MainNavigationCardsProps = {
  items: MainNavItem[]
  unavailable: boolean
}

export function MainNavigationCards({
  items,
  unavailable,
}: MainNavigationCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {items.map((card) => (
        <Link
          key={card.id}
          to={card.href}
          className="group rounded-2xl border border-gray-100 bg-white transition-all hover:border-gray-300 hover:shadow-sm"
        >
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <card.icon className="size-5" />
              <p className="font-semibold text-gray-900">
                {card.title} ({unavailable ? "0" : (card.count ?? 0)})
              </p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm font-medium text-blue-600">
              {card.title.includes("Categories")
                ? "View All Categories"
                : card.title.includes("Subjects")
                  ? "View All Subjects"
                  : card.title.includes("Departments")
                    ? "View All Departments"
                    : "View All Classes"}
              <ArrowRight className="ml-2 inline size-4" />
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
