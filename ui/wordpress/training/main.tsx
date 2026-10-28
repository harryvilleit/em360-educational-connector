import { lazy } from "react"
import { trainingMenus } from "@/api/training.api"
import { mountModule } from "../module-shell"

// The exact React screens used on the main EM360 site.
const Learn = lazy(() => import("@/pages/Dashboard/Training"))
const Courses = lazy(() => import("@/pages/Dashboard/Training/Courses"))
const Assignments = lazy(() => import("@/pages/Dashboard/Training/Assignments"))
const Rules = lazy(() => import("@/pages/Dashboard/Training/Rules"))

mountModule({
  title: "Training & Development",
  menuPaths: Object.values(trainingMenus),
  routes: [
    { path: "training", element: <Learn /> },
    { path: "training-courses", element: <Courses /> },
    { path: "training-assignments", element: <Assignments /> },
    { path: "training-rules", element: <Rules /> },
  ],
})
