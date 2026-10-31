#!/usr/bin/env node
// Builds every React bundle into ../plugin/assets (or EM360_PLUGIN_ASSETS); the portal add-on bundles go into
// ../student-portal/assets and ../parent-portal/assets (or EM360_STUDENT_PORTAL_ASSETS, EM360_PARENT_PORTAL_ASSETS).
import path from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "vite"
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const assets = path.resolve(process.env.EM360_PLUGIN_ASSETS || path.join(root, "..", "plugin", "assets"))
const studentAssets = path.resolve(process.env.EM360_STUDENT_PORTAL_ASSETS || path.join(root, "..", "student-portal", "assets"))
const parentAssets = path.resolve(process.env.EM360_PARENT_PORTAL_ASSETS || path.join(root, "..", "parent-portal", "assets"))
process.env.EM360_PLUGIN_ASSETS = assets
const folders = {"training":null,"learner-support":null,"voting":null,"reports":null,"safeguarding":null,"document-designer":null,"student-portal":null,"parent-portal":null}
await build({ configFile: path.join(root, "vite.wordpress.config.ts"), build: { outDir: path.join(assets, "user-management-v016"), emptyOutDir: true } })
for (const mode of Object.keys(folders)) {
  process.env.EM360_PLUGIN_ASSETS = mode === "student-portal" ? studentAssets : mode === "parent-portal" ? parentAssets : assets
  await build({ configFile: path.join(root, "vite.wordpress-module.config.ts"), mode })
}
process.env.EM360_PLUGIN_ASSETS = assets
await build({ configFile: path.join(root, "vite.wordpress-rebuilt.config.ts") })
await build({ configFile: false, root: path.join(root, "wordpress", "health"), base: "./", esbuild: { jsx: "automatic" }, build: { outDir: path.join(assets, "health-v017"), emptyOutDir: true, target: "es2022" } })
console.log("Built the WordPress bundles into " + [assets, studentAssets, parentAssets].join(", "))
