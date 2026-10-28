import { lazy } from "react"
import { mountModule } from "../module-shell"

// The exact React screens used on the main EM360 site.
const Overview = lazy(() => import("@/pages/Dashboard/Safeguarding"))
const ReportConcern = lazy(
  () => import("@/pages/Dashboard/Safeguarding/ReportConcernPage")
)
const Cases = lazy(() => import("@/pages/Dashboard/Safeguarding/CasesPage"))
const Actions = lazy(
  () => import("@/pages/Dashboard/Safeguarding/ActionQueuePage")
)
const Access = lazy(() => import("@/pages/Dashboard/Safeguarding/AccessPage"))
const Case = lazy(() => import("@/pages/Dashboard/Safeguarding/CasePage"))
const Settings = lazy(() => import("@/pages/Dashboard/StudentSupportSettings"))

const base = "/dashboard/safeguarding"

mountModule({
  title: "Safeguarding",
  // Server-issued menu URLs (Safeguarding and Pastoral Care module).
  menuPaths: [
    base,
    `${base}/report`,
    `${base}/cases`,
    `${base}/actions`,
    `${base}/referrals`,
    `${base}/safety-plans`,
    `${base}/access`,
    `${base}/settings`,
  ],
  routes: [
    { path: "safeguarding", element: <Overview /> },
    { path: "safeguarding/report", element: <ReportConcern /> },
    { path: "safeguarding/cases", element: <Cases key="cases" /> },
    { path: "safeguarding/actions", element: <Actions /> },
    {
      path: "safeguarding/referrals",
      element: <Cases key="referrals" mode="referrals" />,
    },
    {
      path: "safeguarding/safety-plans",
      element: <Cases key="safety-plans" mode="safety-plans" />,
    },
    { path: "safeguarding/access", element: <Access /> },
    { path: "safeguarding/cases/:caseId", element: <Case /> },
    { path: "safeguarding/settings", element: <Settings /> },
  ],
})
