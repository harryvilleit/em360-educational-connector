import { lazy } from "react"
import { mountModule } from "../module-shell"

// The exact React screens used on the main EM360 site.
const Templates = lazy(
  () => import("@/pages/Dashboard/DocumentDesigner/Templates")
)
const Issued = lazy(
  () => import("@/pages/Dashboard/DocumentDesigner/IssuedDocuments")
)

mountModule({
  title: "Document Designer",
  // Server-issued menu URLs (DocumentAccess in the School API).
  menuPaths: [
    "/dashboard/report-card-designer",
    "/dashboard/certificate-designer",
    "/dashboard/issued-documents",
  ],
  routes: [
    {
      path: "report-card-designer",
      element: <Templates key="reportCard" kind="reportCard" />,
    },
    {
      path: "certificate-designer",
      element: <Templates key="certificate" kind="certificate" />,
    },
    { path: "issued-documents", element: <Issued /> },
  ],
})
