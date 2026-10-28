import { lazy } from "react"
import { mountModule } from "../module-shell"

// The exact React screens used on the main EM360 site.
const Overview = lazy(
  () => import("@/pages/Dashboard/Administration/VotingOverviewPage")
)
const Elections = lazy(
  () => import("@/pages/Dashboard/Administration/VotingManagementpage")
)
const Categories = lazy(
  () => import("@/pages/Dashboard/Administration/ElectionCategoriesPage")
)
const CreateElection = lazy(
  () => import("@/pages/Dashboard/Administration/CreateElectionPage")
)
const ElectionDetails = lazy(
  () => import("@/pages/Dashboard/Administration/ElectionDetailsPage")
)

mountModule({
  title: "Voting",
  // Staff ballots (/dashboard/staff/voting) stay in the Staff frame.
  menuPaths: [
    "/dashboard/voting",
    "/dashboard/voting/elections",
    "/dashboard/voting/categories",
  ],
  routes: [
    { path: "voting", element: <Overview /> },
    { path: "voting/elections", element: <Elections /> },
    { path: "voting/categories", element: <Categories /> },
    { path: "voting/create", element: <CreateElection /> },
    { path: "voting/:electionId", element: <ElectionDetails /> },
  ],
})
