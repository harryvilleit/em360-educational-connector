#!/usr/bin/env node
// Builds every React bundle of the WordPress plugin into ../plugin/assets (or EM360_PLUGIN_ASSETS).
import path from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "vite"
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const assets = path.resolve(process.env.EM360_PLUGIN_ASSETS || path.join(root, "..", "plugin", "assets"))
process.env.EM360_PLUGIN_ASSETS = assets
const folders = {"training":null,"learner-support":null,"voting":null,"reports":null,"safeguarding":null,"document-designer":null,"student-portal":null}
await build({ configFile: path.join(root, "vite.wordpress.config.ts"), build: { outDir: path.join(assets, "user-management-v016"), emptyOutDir: true } })
for (const mode of Object.keys(folders)) await build({ configFile: path.join(root, "vite.wordpress-module.config.ts"), mode })
await build({ configFile: path.join(root, "vite.wordpress-rebuilt.config.ts") })
await build({ configFile: false, root: path.join(root, "wordpress", "health"), base: "./", esbuild: { jsx: "automatic" }, build: { outDir: path.join(assets, "health-v017"), emptyOutDir: true, target: "es2022" } })
console.log("Built the WordPress bundles into " + assets)
