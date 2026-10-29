import { statSync } from "node:fs"
import path from "node:path"
import type { Plugin } from "vite"

const extensions = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]

/**
 * Resolves imports of src/<file> to wordpress/overrides/<file> when an override exists.
 * Runs after a config's explicit replacements, so those still win.
 */
export function wordpressOverrides(root: string): Plugin {
  const src = path.join(root, "src")
  const overrides = path.join(root, "wordpress", "overrides")
  return {
    name: "wordpress-overrides",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer) return null
      // Vite's "@" alias has usually already turned "@/x" into an absolute src path.
      const candidate = path.isAbsolute(source)
        ? source
        : source.startsWith("@/")
        ? path.join(src, source.slice(2))
        : source.startsWith(".")
          ? path.resolve(path.dirname(importer), source)
          : null
      if (!candidate || !candidate.startsWith(src + path.sep)) return null
      const relative = path.relative(src, candidate)
      for (const ext of extensions) {
        const file = path.join(overrides, relative + ext)
        if (statSync(file, { throwIfNoEntry: false })?.isFile()) return file
      }
      return null
    },
  }
}
