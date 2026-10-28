import { build } from "vite"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
const here = dirname(fileURLToPath(import.meta.url))
await build({
  configFile: false,
  root: here,
  base: "./",
  esbuild: { jsx: "automatic" },
  build: {
    outDir: resolve(
      process.env.EM360_HEALTH_PLUGIN_OUTPUT ||
        resolve(here, "../../../em360-connector/assets/health-v017")
    ),
    emptyOutDir: true,
    target: "es2022",
  },
})
