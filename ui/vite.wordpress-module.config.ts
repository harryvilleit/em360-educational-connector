import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { wordpressOverrides } from "./wordpress/build/overrides"

// Builds a standalone WordPress module frame from the original React pages.
// Usage: vite build --config vite.wordpress-module.config.ts --mode training|learner-support
// Same adapters as the main WordPress bundle, plus the shared module runtime.
const modules: Record<string, string> = {
  training: "training-v018",
  "learner-support": "learner-support-v019",
  voting: "voting-v020",
  reports: "reports-v021",
  safeguarding: "safeguarding-v022",
  "document-designer": "document-designer-v022",
  "student-portal": "student-portal-v024",
  "parent-portal": "parent-portal-v027",
}
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
  "wordpress/runtime.ts": "wordpress/module-runtime.ts",
}

export default defineConfig(({ mode: moduleName }) => {
  if (!modules[moduleName])
    throw new Error(
      "Build with --mode set to one of: " + Object.keys(modules).join(", ")
    )
  return {
    root: path.join(root, "wordpress", moduleName),
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
          const mapped =
            moduleName === "student-portal"
              ? { ...replacements, "wordpress/runtime.ts": "wordpress/student-runtime.ts" }
              : moduleName === "parent-portal"
                ? { ...replacements, "wordpress/runtime.ts": "wordpress/parent-runtime.ts" }
                : replacements
          for (const [original, replacement] of Object.entries(mapped))
            if (
              candidate === path.join(root, original) ||
              candidate + ".ts" === path.join(root, original)
            )
              return path.join(root, replacement)
          return null
        },
      },
      {
        // Sidebars show "/em360-logo.png" from the main site's public folder. A WordPress site has no such file,
        // so the logo is bundled with the module and addressed relative to it.
        name: "wordpress-logo",
        enforce: "pre",
        transform(code, id) {
          if (!id.startsWith(path.join(root, "src")) || !code.includes('"/em360-logo.png"')) return null
          const logo = JSON.stringify(path.join(root, "public", "em360-logo.png"))
          return (
            `import __em360Logo from ${logo};\n` +
            code.replaceAll('src="/em360-logo.png"', "src={__em360Logo}").replaceAll('"/em360-logo.png"', "__em360Logo")
          )
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
        process.env.EM360_PLUGIN_ASSETS ||
          path.join(root, "../em360-connector/assets"),
        modules[moduleName]
      ),
      emptyOutDir: true,
      sourcemap: false,
    },
  }
})
