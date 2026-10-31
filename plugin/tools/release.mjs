#!/usr/bin/env node
// Builds a signed EM360 School Connector release (Node 18+, no packages needed).
//
//   node tools/release.mjs --version 0.23.1 --package-url https://<storage>/em360-connector-0.23.1.zip
//
// 1. Creates the release signing key on first use (keep the private key safe and backed up; never commit it).
// 2. Stamps the version into the plugin header and readme, writes the public key into the plugin.
// 3. Zips the plugin as em360-connector/ (tools/ and tests/ excluded), hashes and signs it.
// 4. Prints the "WordPressPluginRelease" settings for the School API. Upload the ZIP to the package URL,
//    apply the settings, and every connected website offers "Update now" (or updates itself if the
//    administrator enabled auto-updates for the plugin).
//
//   node tools/release.mjs --version 0.25.0 --wporg
//
// Builds the WordPress.org directory package instead: the same plugin without the self-updater (no Update URI
// header, no PluginUpdater/PluginRelease classes, no release key), because directory plugins update only through
// WordPress.org. It is not signed and needs no key. Both packages come from the same source and version.
// The student portal is a separate add-on plugin (em360-educational-student-portal).
import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, sign } from "node:crypto"
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { deflateRawSync } from "node:zlib"

const SLUG = "em360-connector"
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, i, all) =>
  value.startsWith("--") ? [...pairs, [value.slice(2), all[i + 1]?.startsWith("--") || all[i + 1] === undefined ? "true" : all[i + 1]]] : pairs, []))
const fail = (message) => { console.error("\n✖ " + message); process.exit(1) }
const wporg = args.wporg === "true"
// The folder both packages unpack to, which is also the WordPress.org slug and the text domain. The EM360
// Student Portal add-on requires the plugin by this folder name ("Requires Plugins").
const WPORG_SLUG = args.slug ?? "em360-educational-management"

// --- version -------------------------------------------------------------------------------------------------
const mainFile = join(root, `${SLUG}.php`), readmeFile = join(root, "readme.txt")
let main = readFileSync(mainFile, "utf8")
const current = main.match(/^ \* Version: ([0-9.]+)$/m)?.[1] ?? fail("Version header not found in em360-connector.php.")
const version = args.version ?? current
if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version)) fail("Use a version like 0.23.1.")
if (version !== current) {
  main = main.replace(/^ \* Version: [0-9.]+$/m, ` * Version: ${version}`).replace(/define\('EM360_CONNECTOR_VERSION', '[0-9.]+'\);/, `define('EM360_CONNECTOR_VERSION', '${version}');`)
  writeFileSync(mainFile, main)
}
let readme = readFileSync(readmeFile, "utf8")
readme = readme.replace(/^Stable tag: .*$/m, `Stable tag: ${version}`)
writeFileSync(readmeFile, readme)
const escaped = version.replace(/\./g, "\\.")
const changelog = args.changelog ?? readme.match(new RegExp(`^= ${escaped} =\\r?\\n([\\s\\S]*?)(?=^= |^== |(?![\\s\\S]))`, "m"))?.[1].trim() ?? ""
if (!changelog) console.warn(`! readme.txt has no "= ${version} =" changelog entry; WordPress will show none.`)

// --- WordPress.org package ------------------------------------------------------------------------------------
// Files left out, and files rewritten on the way into the ZIP (the working copy is never changed).
const updaterFiles = ["src/Infrastructure/WordPress/PluginUpdater.php", "src/Infrastructure/WordPress/PluginReadme.php", "src/Domain/PluginRelease.php", "resources/release-public-key.txt"]
// The self-updater's "View details" artwork; WordPress.org takes it from the SVN assets folder instead.
const omitted = (rel) => updaterFiles.includes(rel) || rel === "assets/images" || rel.startsWith("assets/images/")
const updaterClass = /PluginUpdater|PluginRelease|PluginReadme/
const rewrite = wporg ? {
  [`${SLUG}.php`]: (text) => text.replace(/^ \* Update URI: .*\r?\n/m, "").replace(/^ \* Text Domain: .*$/m, ` * Text Domain: ${WPORG_SLUG}`),
  "vendor/composer/autoload_classmap.php": (text) => text.split("\n").filter((line) => !updaterClass.test(line)).join("\n"),
  "vendor/composer/autoload_static.php": (text) => text.split("\n").filter((line) => !updaterClass.test(line)).join("\n"),
} : {}

// --- signing key ---------------------------------------------------------------------------------------------
let signingKey = null
if (!wporg) {
  const keyFile = resolve(args.key ?? process.env.EM360_RELEASE_KEY ?? join(homedir(), ".em360", `${SLUG}-release-key.pem`))
  if (!existsSync(keyFile)) {
    const { privateKey } = generateKeyPairSync("ed25519")
    mkdirSync(dirname(keyFile), { recursive: true })
    writeFileSync(keyFile, privateKey.export({ format: "pem", type: "pkcs8" }), { mode: 0o600 })
    console.log(`✔ Created the release signing key at ${keyFile}\n  Back it up somewhere safe. Websites only accept packages signed with this key.`)
  }
  const privateKey = createPrivateKey(readFileSync(keyFile))
  if (privateKey.asymmetricKeyType !== "ed25519") fail(`${keyFile} is not an Ed25519 private key.`)
  const publicKey = createPublicKey(privateKey).export({ format: "der", type: "spki" }).subarray(-32).toString("base64")
  const publicFile = join(root, "resources", "release-public-key.txt")
  const shipped = existsSync(publicFile) ? readFileSync(publicFile, "utf8").trim() : ""
  if (shipped && shipped !== publicKey && args["rotate-key"] !== "true")
    fail("resources/release-public-key.txt holds a different key. Installed websites only trust that key: sign with it (--key), or pass --rotate-key with the OLD key's --sign-with to move to this one.")
  writeFileSync(publicFile, publicKey + "\n")
  // When rotating, the package carries the new public key but must be signed with the key the websites trust today.
  signingKey = args["sign-with"] ? createPrivateKey(readFileSync(resolve(args["sign-with"]))) : privateKey
}

// --- package -------------------------------------------------------------------------------------------------
const excluded = new Set(["tools", "tests", "node_modules", ".git", ".github", ".idea", ".vscode", "dist", ".phpunit.cache"])
const files = []
const folder = WPORG_SLUG
const walk = (dir) => {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name), rel = relative(root, full).split(sep).join("/")
    if (excluded.has(rel.split("/")[0]) || name === ".DS_Store" || name === "Thumbs.db" || name.endsWith(".pem")) continue
    if (wporg && omitted(rel)) continue
    const info = statSync(full)
    if (info.isDirectory()) { files.push({ name: `${folder}/${rel}/`, info }); walk(full) } else files.push({ name: `${folder}/${rel}`, info, full, rel })
  }
}
files.push({ name: `${folder}/`, info: statSync(root) })
walk(root)

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
const crc32 = (data) => { let c = 0xffffffff; for (const byte of data) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
const dosTime = (d) => [((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xffff,
  (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff]
const chunks = [], central = []
let offset = 0
for (const entry of files) {
  const name = Buffer.from(entry.name, "utf8")
  const raw = !entry.full ? Buffer.alloc(0) : rewrite[entry.rel] ? Buffer.from(rewrite[entry.rel](readFileSync(entry.full, "utf8")), "utf8") : readFileSync(entry.full)
  const packed = entry.full ? deflateRawSync(raw, { level: 9 }) : raw, method = entry.full ? 8 : 0
  const crc = crc32(raw), [time, date] = dosTime(entry.info.mtime)
  const local = Buffer.alloc(30)
  local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(method, 8)
  local.writeUInt16LE(time, 10); local.writeUInt16LE(date, 12); local.writeUInt32LE(crc, 14)
  local.writeUInt32LE(packed.length, 18); local.writeUInt32LE(raw.length, 22); local.writeUInt16LE(name.length, 26)
  chunks.push(local, name, packed)
  const header = Buffer.alloc(46)
  header.writeUInt32LE(0x02014b50, 0); header.writeUInt16LE(0x0314, 4); header.writeUInt16LE(20, 6); header.writeUInt16LE(0x0800, 8)
  header.writeUInt16LE(method, 10); header.writeUInt16LE(time, 12); header.writeUInt16LE(date, 14); header.writeUInt32LE(crc, 16)
  header.writeUInt32LE(packed.length, 20); header.writeUInt32LE(raw.length, 24); header.writeUInt16LE(name.length, 28)
  header.writeUInt32LE((((entry.full ? 0o100644 : 0o40755) << 16) | (entry.full ? 0 : 0x10)) >>> 0, 38); header.writeUInt32LE(offset, 42)
  central.push(header, name)
  offset += local.length + name.length + packed.length
}
const directory = Buffer.concat(central), end = Buffer.alloc(22)
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10)
end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16)
const zip = Buffer.concat([...chunks, directory, end])

const out = resolve(args.out ?? join(root, "..", "dist"))
mkdirSync(out, { recursive: true })
const zipName = wporg ? `${WPORG_SLUG}-${version}-wordpress-org.zip` : `${SLUG}-${version}.zip`, zipPath = join(out, zipName)
writeFileSync(zipPath, zip)
if (wporg) {
  const leftover = files.filter((f) => f.full && f.rel.endsWith(".php")).find((f) => {
    const text = rewrite[f.rel] ? rewrite[f.rel](readFileSync(f.full, "utf8")) : readFileSync(f.full, "utf8")
    return /^\s*\*\s*Update URI:/m.test(text) || /update_plugins_|upgrader_pre_download|plugins_api/.test(text)
  })
  if (leftover) fail(`${leftover.rel} still contains self-update code; WordPress.org will reject the package.`)
  console.log(`
✔ Built ${zipPath}
  ${files.filter((f) => f.full).length} files · ${(zip.length / 1048576).toFixed(1)} MB · WordPress.org build (no self-updater)

Next: upload it at https://wordpress.org/plugins/developers/add/ (first submission), or after approval commit
its contents to the plugin's SVN trunk and tag ${version}.
`)
  process.exit(0)
}
const sha256 = createHash("sha256").update(zip).digest("hex")
const signature = sign(null, Buffer.from(`${SLUG}\n${version}\n${sha256}`, "utf8"), signingKey).toString("base64")

// --- School API settings -------------------------------------------------------------------------------------
const base = args["package-url"] ?? (process.env.EM360_RELEASE_BASE_URL ? `${process.env.EM360_RELEASE_BASE_URL.replace(/\/$/, "")}/${zipName}` : "")
const release = {
  Version: version, PackageUrl: base || `https://REPLACE-WITH-UPLOAD-LOCATION/${zipName}`, Sha256: sha256, Signature: signature,
  RequiresWordPress: main.match(/^ \* Requires at least: ([0-9.]+)$/m)?.[1] ?? "6.6",
  RequiresPhp: main.match(/^ \* Requires PHP: ([0-9.]+)$/m)?.[1] ?? "8.1",
  TestedUpTo: args.tested ?? readme.match(/^Tested up to: ([0-9.]+)$/m)?.[1] ?? "", ReleasedAtUtc: new Date().toISOString(), Changelog: changelog,
}
writeFileSync(join(out, `${SLUG}-${version}.release.json`), JSON.stringify({ WordPressPluginRelease: release }, null, 2) + "\n")
const azure = Object.entries(release).filter(([k]) => k !== "Changelog").map(([k, v]) => `WordPressPluginRelease__${k}=${JSON.stringify(String(v))}`)
console.log(`
✔ Built ${zipPath}
  ${files.filter((f) => f.full).length} files · ${(zip.length / 1048576).toFixed(1)} MB · sha256 ${sha256}

Next:
  1. Upload ${zipName} to ${base || "an HTTPS location (for example your Azure Storage container)"}.
  2. Apply the settings in ${join(out, `${SLUG}-${version}.release.json`)} to the School API
     (appsettings.json, or Azure App Service › Configuration). With the Azure CLI:

     az webapp config appsettings set -g <resource-group> -n <app-name> --settings ${azure.join(" ")}

     (Changelog is optional: copy it from the JSON file into WordPressPluginRelease__Changelog in the portal.)

  3. Websites see the update within 6 hours, or at once from Dashboard › Updates › Check again.
`)
if (!base) console.warn("! No --package-url given: set PackageUrl to the uploaded ZIP's address before applying the settings.")
