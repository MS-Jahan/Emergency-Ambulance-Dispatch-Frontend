find the instructions in ../B7A7 for frontend/remaining parts.
find the instructions in ../ph-l2-b7-asnmnt-6 for backend (already done, may need polishing or adding/removing). ../ph-l2-b7-asnmnt-6-private contains backend rules, though it is irrelevent now.

Make sure to documents everything in the docs folder. Every decisions and plans. The file names should be like <year>-<month>-<day>-file-name.md (no-spaces)
like: 2026-09-21-file-name.md

make sure to commit from time to time and avoid ai agent names in the commit messages or anywhere.

## Next.js version note
This is Next.js 16 (breaking changes vs older versions). `middleware.ts` is now `proxy.ts`. Read `node_modules/next/dist/docs/` before using any Next API you are unsure about.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
