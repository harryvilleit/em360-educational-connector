# EM360 School Connector for WordPress

Connects a school's WordPress website to [EM360](https://em360s.com), the education management system, so staff and
students can use their school portal on the school's own website.

This repository holds the complete source of the plugin:

| Folder | Contents |
|---|---|
| `plugin/` | The WordPress plugin (PHP, templates and the portal page scripts). |
| `ui/` | The React screens the plugin runs inside the portal pages, and their build setup. |

The React bundles in a plugin release are built from `ui/`. `ui/wordpress-bundles.json` lists the source files that
make up each bundle (644 files in total).

## How it works

* A school connects its website once from **WordPress → EM360**. Staff and students then sign in on EM360 (their
  password never passes through the website) and return to the school's portal page.
* The plugin keeps no school records. Each screen calls the EM360 School API through the plugin's gateway, which forwards
  only the operations listed in `plugin/resources/*-routes.json`. The API re-checks every request: staff by their role and
  menu permissions, students against their own records.
* Staff and student portals are separate pages with separate sessions.

## Build the React bundles

Requires Node.js 20 or later.

```sh
cd ui
npm ci
npm run typecheck
npm run build:wordpress   # writes the bundles into ../plugin/assets/
```

## Package a release

From `plugin/`, after building the bundles: `node tools/release.mjs --version <x.y.z>`. See `plugin/readme.txt`.

## Licence

Copyright (C) 2026 HarryVille Solutions Ltd.

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public
License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later
version. See [LICENSE](LICENSE). Third-party packages keep their own licences: see
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

## Security

Please report security issues privately to info@harryvilleit.co.uk rather than opening a public issue.
