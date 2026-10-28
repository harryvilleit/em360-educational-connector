import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
const root = path.resolve(import.meta.dirname)
const replacements: Record<string, string> = {
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
  root: path.join(root, "wordpress"),
  base: "./",
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
            candidate + ".ts" === path.join(root, original)
          )
            return path.join(root, replacement)
        return null
      },
    },
    react(),
    tailwindcss(),
  ],
  resolve: { alias: { "@": path.join(root, "src") } },
  define: {
    "import.meta.env.VITE_BASE_URL": '""',
    "import.meta.env.VITE_ELEARNING_BASE_URL": '""',
  },
  build: {
    outDir: path.join(root, "../plugin/assets/user-management"),
    emptyOutDir: true,
    manifest: true,
    sourcemap: false,
  },
})
