import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { wordpressOverrides } from "./wordpress/build/overrides"
const root = path.resolve(import.meta.dirname)
const replacements: Record<string, string> = {
  "src/pages/Dashboard/Hostel/components/EditRoomForm.tsx":
    "wordpress/hostel/EditRoomForm.tsx",
  "src/pages/Dashboard/StaffManagement/components/ActionsDropdown.tsx":
    "wordpress/staff/ActionsDropdown.tsx",
  "src/hooks/studentPortal/index.tsx": "wordpress/hostel/students.ts",
  "src/hooks/hostel/index.tsx": "wordpress/hostel/hooks.ts",
  "src/pages/Dashboard/Hostel/components/SupervisorTable.tsx":
    "wordpress/hostel/SupervisorTable.tsx",
  "wordpress/runtime.ts": "wordpress/rebuilt/runtime.ts",
  "src/api/hostel.api/index.ts": "wordpress/hostel/api.ts",
  "src/api/schoolLessonNotes.api.ts": "wordpress/lesson-notes/api.ts",
  "src/pages/Dashboard/Hostel/components/AssignmentModal.tsx":
    "wordpress/hostel/AssignmentModal.tsx",
  "src/pages/Dashboard/Hostel/components/BulkModal.tsx":
    "wordpress/hostel/BulkModal.tsx",
  "src/pages/Dashboard/Hostel/components/SupervisorModal.tsx":
    "wordpress/hostel/SupervisorModal.tsx",
  "src/pages/Dashboard/StaffManagement/leave/ApplyLeaveModal.tsx":
    "wordpress/staff/ApplyLeaveModal.tsx",
  "src/store/classNotification.store.ts": "wordpress/class-notifications.ts",
  "src/api/api.ts": "wordpress/api.ts",
  "src/hooks/useFormDraft.ts": "wordpress/form-draft.ts",
  "src/lib/portal-navigation.ts": "wordpress/portal-navigation.ts",
  "src/lib/chat-attachments.ts": "wordpress/chat-attachments.ts",
  "src/store/currentAcademic.store.ts": "wordpress/currentAcademic.store.ts",
  "src/hooks/useSchoolCardBranding.ts": "wordpress/school-branding.ts",
  "src/store/auth.store.ts": "wordpress/auth.store.ts",
  "src/store/product.store.ts": "wordpress/product.store.ts",
  "src/hooks/chat/useChatRealtime.ts": "wordpress/chat-realtime.ts",
}
export default defineConfig({
  root: path.join(root, "wordpress/rebuilt"),
  base: "./",
  envDir: false,
  plugins: [
    {
      name: "wordpress-adapters",
      enforce: "pre",
      async resolveId(source, importer) {
        if (!importer) return null
        const candidate = path.isAbsolute(source)
          ? source
          : source.startsWith("@/")
            ? path.join(root, "src", source.slice(2))
            : source.startsWith(".")
              ? path.resolve(path.dirname(importer), source)
              : null
        if (!candidate) return null
        for (const [original, replacement] of Object.entries(replacements))
          if (
            candidate === path.join(root, original) ||
            [".ts", ".tsx", "/index.ts", "/index.tsx"].some(
              (ext) => candidate + ext === path.join(root, original)
            )
          )
            return path.join(root, replacement)
        return null
      },
    },
    wordpressOverrides(root),
    react(),
    tailwindcss(),
  ],
  resolve: { alias: { "@": path.join(root, "src") } },
  define: {
    "import.meta.env.VITE_BASE_URL": '""',
    "import.meta.env.VITE_ELEARNING_BASE_URL": '""',
  },
  build: {
    outDir: path.join(
      process.env.EM360_PLUGIN_ASSETS || path.join(root, "../em360-connector/assets"),
      "rebuilt-v0172",
    ),
    emptyOutDir: true,
    sourcemap: false,
  },
})
