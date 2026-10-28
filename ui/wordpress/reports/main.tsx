import { lazy } from "react"
import { mountModule } from "../module-shell"

// The exact React screens used on the main EM360 site.
const Overview = lazy(() => import("@/pages/Dashboard/Reports/Overview"))
const Reports = lazy(() => import("@/pages/Dashboard/Reports"))

const base = "/dashboard/reports"
const views = [
  ["enrolment", "enrolment"],
  ["staff", "staff"],
  ["academic", "academic"],
  ["financial", "financial"],
  ["attendance", "attendance"],
  ["welfare", "welfare"],
  ["operations", "operations"],
  ["my-dashboard", "mine"],
] as const

mountModule({
  title: "Reports & Analytics",
  menuPaths: [base, ...views.map(([path]) => `${base}/${path}`)],
  routes: [
    { path: "reports", element: <Overview /> },
    ...views.map(([path, view]) => ({
      path: `reports/${path}`,
      element: <Reports key={view} view={view} />,
    })),
  ],
})
