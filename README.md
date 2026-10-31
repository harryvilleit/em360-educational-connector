# EM360 School Connector for WordPress

Connects a school's WordPress website to [EM360](https://em360s.com), the education management system, so staff,
students and parents can use their school portal on the school's own website.

This repository holds the complete source of the plugin:

| Folder | Contents |
|---|---|
| `plugin/` | EM360 School Connector, the WordPress plugin (PHP, templates and the portal page scripts). |
| `student-portal/` | EM360 Student Portal, the add-on plugin that adds the student portal page. |
| `parent-portal/` | EM360 Parent Portal, the add-on plugin that adds the parent portal page. |
| `ui/` | The React screens the plugin runs inside the portal pages, and their build setup. |

Most screens are shared with the EM360 website (`ui/src/`). Where the WordPress portal behaves differently, the
WordPress version of a file lives at the same path under `ui/wordpress/overrides/` and replaces it in every WordPress
build (see `ui/wordpress/build/overrides.ts`); other WordPress-only code is in `ui/wordpress/`.

The React bundles in a plugin release are built from `ui/`. `ui/wordpress-bundles.json` lists the source files that
make up each bundle (1239 files in total).

## How it works

* A school connects its website once from **WordPress → EM360**. Staff, students and parents then sign in on EM360 (their
  password never passes through the website) and return to the school's portal page.
* The plugin keeps no school records. Each screen calls the EM360 School API through the plugin's gateway, which forwards
  only the operations listed in `plugin/resources/*-routes.json`. The API re-checks every request: staff by their role and
  menu permissions, students against their own records, parents against their own children's records.
* Staff, student and parent portals are separate pages with separate sessions. The student and parent portals are the
  add-ons in `student-portal/` and `parent-portal/`; they use the connector's school connection, sessions and gateway
  (`plugin/src/Extension/Connector.php`).

## Build the React bundles

Requires Node.js 20 or later.

```sh
cd ui
npm ci
npm run typecheck
npm run build:wordpress   # writes the bundles into ../plugin/assets/, ../student-portal/assets/ and ../parent-portal/assets/
```

## Package a release

After building the bundles:

* EM360 School Connector, from `plugin/`: `node tools/release.mjs --version <x.y.z>` (self-hosted, signed) or add `--wporg` for WordPress.org.
* EM360 Student Portal, from `student-portal/`: `node tools/package.mjs --version <x.y.z>`.
* EM360 Parent Portal, from `parent-portal/`: `node tools/package.mjs --version <x.y.z>`.

## Licence

Copyright (C) 2026 HarryVille Solutions Ltd.

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public
License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later
version. See [LICENSE](LICENSE). Third-party packages keep their own licences: see
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

## Security

Please report security issues privately to info@harryvilleit.co.uk rather than opening a public issue.
