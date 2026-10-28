import {
  AlertTriangle,
  Bell,
  BookOpen,
  CreditCard,
  FileText,
  Newspaper,
  PanelTop,
  School,
  ShieldCheck,
} from "lucide-react"

export type SettingsTab =
  | "profile"
  | "publicPage"
  | "academic"
  | "reportCard"
  | "blog"
  | "notifications"
  | "security"
  | "billing"
  | "danger"

type TabItem = {
  key: SettingsTab
  label: string
  description: string
  icon: React.ElementType
  danger?: boolean
}

const tabs: TabItem[] = [
  {
    key: "profile",
    label: "School Profile",
    description: "Name, logo, contact info",
    icon: School,
  },
  {
    key: "publicPage",
    label: "Public Page",
    description: "Listing, gallery, facilities",
    icon: PanelTop,
  },
  {
    key: "academic",
    label: "Academic Settings",
    description: "Terms, grading, structure",
    icon: BookOpen,
  },
  {
    key: "reportCard",
    label: "Report Card",
    description: "Logo, colours, signatories",
    icon: FileText,
  },
  {
    key: "blog",
    label: "School blog",
    description: "News and public updates",
    icon: Newspaper,
  },
  {
    key: "notifications",
    label: "Notifications",
    description: "Alerts and communication",
    icon: Bell,
  },
  {
    key: "security",
    label: "Security",
    description: "Password and access control",
    icon: ShieldCheck,
  },
  {
    key: "billing",
    label: "Billing & Plan",
    description: "Subscription and invoices",
    icon: CreditCard,
  },
  {
    key: "danger",
    label: "Danger Zone",
    description: "Irreversible actions",
    icon: AlertTriangle,
    danger: true,
  },
]

interface SettingsSidebarProps {
  activeTab: SettingsTab
  onTabChange: (tab: SettingsTab) => void
}

export default function SettingsSidebar({
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <aside className="w-full shrink-0 lg:w-64">
      {/* Mobile: horizontal scroll tabs */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2 lg:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? tab.danger
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-blue-600 bg-blue-600 text-white"
                : tab.danger
                  ? "border-red-100 bg-white text-red-500 hover:bg-red-50"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <tab.icon className="size-3.5 shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop: vertical sidebar */}
      <nav className="hidden flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white lg:flex">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-3 border-b border-gray-50 px-4 py-3.5 text-left transition-all last:border-0 ${
              activeTab === tab.key
                ? tab.danger
                  ? "border-l-2 border-l-red-500 bg-red-50 pl-3.5"
                  : "border-l-2 border-l-blue-600 bg-blue-50 pl-3.5"
                : "hover:bg-gray-50/80"
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                activeTab === tab.key
                  ? tab.danger
                    ? "bg-red-100"
                    : "bg-blue-100"
                  : tab.danger
                    ? "bg-red-50"
                    : "bg-gray-100"
              }`}
            >
              <tab.icon
                className={`size-4 ${
                  activeTab === tab.key
                    ? tab.danger
                      ? "text-red-600"
                      : "text-blue-600"
                    : tab.danger
                      ? "text-red-400"
                      : "text-gray-500"
                }`}
              />
            </div>
            <div className="min-w-0">
              <p
                className={`truncate text-sm leading-tight font-semibold ${
                  tab.danger
                    ? activeTab === tab.key
                      ? "text-red-600"
                      : "text-red-500"
                    : activeTab === tab.key
                      ? "text-blue-700"
                      : "text-gray-700"
                }`}
              >
                {tab.label}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {tab.description}
              </p>
            </div>
          </button>
        ))}
      </nav>
    </aside>
  )
}
