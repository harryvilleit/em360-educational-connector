# WordPress overrides

Files here replace the file at the same path under `src/` in every WordPress build
(for example `overrides/api/guardian.api/index.ts` replaces `src/api/guardian.api/index.ts`).
They hold changes the WordPress gateway needs (school-bound requests, server-side filters,
links that stay inside the portal) without changing the main EM360 site.

Imports inside overrides use `@/…`, which resolves to an override first and then to `src/`.
