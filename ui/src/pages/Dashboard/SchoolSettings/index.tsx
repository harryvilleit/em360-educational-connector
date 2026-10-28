import { useSearchParams } from "react-router"
import AcademicSettings from "./components/AcademicSettings"
import BillingSettings from "./components/BillingSettings"
import BlogSettings from "./components/BlogSettings"
import DangerZone from "./components/DangerZone"
import NotificationSettings from "./components/NotificationSettings"
import SchoolProfileSettings from "./components/SchoolProfileSettings"
import PublicSchoolProfileSettings from "./components/PublicSchoolProfileSettings"
import ReportCardSettings from "./components/ReportCardSettings"
import SecuritySettings from "./components/SecuritySettings"
import SettingsSidebar, { type SettingsTab } from "./components/SettingsSidebar"

const tabComponents: Record<SettingsTab, React.ReactNode> = {
  profile: <SchoolProfileSettings />,
  publicPage: <PublicSchoolProfileSettings />,
  academic: <AcademicSettings />,
  reportCard: <ReportCardSettings />,
  blog: <BlogSettings />,
  notifications: <NotificationSettings />,
  security: <SecuritySettings />,
  billing: <BillingSettings />,
  danger: <DangerZone />,
}

const VALID_TABS = new Set<SettingsTab>([
  "profile",
  "publicPage",
  "academic",
  "reportCard",
  "blog",
  "notifications",
  "security",
  "billing",
  "danger",
])

function parseTabParam(value: string | null): SettingsTab {
  if (value && VALID_TABS.has(value as SettingsTab)) {
    return value as SettingsTab
  }
  return "profile"
}

export default function SchoolSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = parseTabParam(searchParams.get("tab"))

  const handleTabChange = (tab: SettingsTab) => {
    const next = new URLSearchParams(searchParams)
    if (tab === "profile") next.delete("tab")
    else next.set("tab", tab)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="min-h-screen bg-muted/50 p-4 md:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            School Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your school's configuration and preferences
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <SettingsSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="min-w-0 flex-1">{tabComponents[activeTab]}</div>
      </div>
    </div>
  )
}
