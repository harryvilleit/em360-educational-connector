#!/usr/bin/env node
// Packages EM360 Student Portal for upload to WordPress.org or manual installation:
//
//   node tools/package.mjs --version 1.0.1
//
// Sets the version in the plugin header and readme, then writes ../dist/em360-educational-student-portal-<version>.zip.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { deflateRawSync } from "node:zlib"

const SLUG = "em360-educational-student-portal"
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, i, all) =>
  value.startsWith("--") ? [...pairs, [value.slice(2), all[i + 1]?.startsWith("--") || all[i + 1] === undefined ? "true" : all[i + 1]]] : pairs, []))
const fail = (message) => { console.error("\n✖ " + message); process.exit(1) }

const mainFile = join(root, `${SLUG}.php`), readmeFile = join(root, "readme.txt")
let main = readFileSync(mainFile, "utf8")
const current = main.match(/^ \* Version: ([0-9.]+)$/m)?.[1] ?? fail("Version header not found.")
const version = args.version ?? current
if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version)) fail("Use a version like 1.0.1.")
main = main.replace(/^ \* Version: [0-9.]+$/m, ` * Version: ${version}`).replace(/define\('EM360_STUDENT_PORTAL_VERSION', '[0-9.]+'\);/, `define('EM360_STUDENT_PORTAL_VERSION', '${version}');`)
writeFileSync(mainFile, main)
writeFileSync(readmeFile, readFileSync(readmeFile, "utf8").replace(/^Stable tag: .*$/m, `Stable tag: ${version}`))
try { statSync(join(root, "assets", "student-portal-v024", "index.html")) } catch { fail("assets/student-portal-v024 is missing. Build it from the repository's ui/ folder first.") }

const excluded = new Set(["tools", "tests", "node_modules", ".git", ".github", "dist"])
const files = [{ name: `${SLUG}/`, info: statSync(root) }]
const walk = (dir) => {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name), rel = relative(root, full).split(sep).join("/")
    if (excluded.has(rel.split("/")[0]) || name === ".DS_Store" || name === "Thumbs.db") continue
    const info = statSync(full)
    if (info.isDirectory()) { files.push({ name: `${SLUG}/${rel}/`, info }); walk(full) } else files.push({ name: `${SLUG}/${rel}`, info, full, rel })
  }
}
walk(root)
const rewrite = {}

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
const zipPath = join(out, `${SLUG}-${version}.zip`)
writeFileSync(zipPath, zip)
console.log(`\n✔ Built ${zipPath}\n  ${files.filter((f) => f.full).length} files · ${(zip.length / 1048576).toFixed(1)} MB`)
