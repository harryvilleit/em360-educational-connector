import type { Plugin } from "vite"

// The comment at the top of every built WordPress bundle file: where its human-readable source is and how to
// rebuild it (WordPress.org plugin guideline 4: compiled code must link to its public source).
export const sourceBanner =
  "/*! EM360 for WordPress. Compiled file. Human-readable source (GPL-2.0-or-later): " +
  "https://github.com/harryvilleit/em360-educational-connector/tree/main/ui " +
  "Rebuild: cd ui && npm ci && npm run build:wordpress */"

/** Adds the banner after minification, which would otherwise strip it. */
export function sourceBannerPlugin(): Plugin {
  return {
    name: "wordpress-source-banner",
    enforce: "post",
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === "chunk") file.code = sourceBanner + "\n" + file.code
        else if (file.fileName.endsWith(".css") && typeof file.source === "string") file.source = sourceBanner + "\n" + file.source
      }
    },
  }
}
