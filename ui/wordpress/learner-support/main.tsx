import { lazy } from "react"
import { mountModule } from "../module-shell"

// The exact React screens used on the main EM360 site.
const Overview = lazy(() => import("@/pages/Dashboard/LearnerSupport"))
const Cases = lazy(() => import("@/pages/Dashboard/LearnerSupport/CasesPage"))
const Case = lazy(() => import("@/pages/Dashboard/LearnerSupport/CasePage"))
const Settings = lazy(() => import("@/pages/Dashboard/StudentSupportSettings"))

const base = "/dashboard/learner-support"
const modes = [
  "referrals",
  "register",
  "plans",
  "provision",
  "reviews",
  "adjustments",
  "reports",
] as const

mountModule({
  title: "Learner Support",
  // Server-issued menu URLs (AddLearnerSupportFirstRelease + local support settings).
  menuPaths: [base, ...modes.map((m) => `${base}/${m}`), `${base}/settings`],
  routes: [
    { path: "learner-support", element: <Overview /> },
    ...modes.map((mode) => ({
      path: `learner-support/${mode}`,
      element: <Cases key={mode} mode={mode} />,
    })),
    { path: "learner-support/cases/:caseId", element: <Case /> },
    { path: "learner-support/settings", element: <Settings /> },
  ],
})
